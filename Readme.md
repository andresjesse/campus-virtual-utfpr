# Campus Virtual V2

## 🇧🇷️ Português (PT-BR)

## Sumário

- [Introdução](#introdução)
- [Detalhes Técnicos](#detalhes-técnicos)
- [Rodando a aplicação](#rodando-a-aplicação)
- [Deploy (produção)](#deploy-produção)

## Introdução
Este projeto materializa a reformulação e evolução estrutural do Campus Virtual V1 
([código](https://github.com/andresjesse/prototipo-campus-virtual) e [site](https://campus.gp.utfpr.edu.br/)). A ideia
nasceu a partir da necessidade de dinamizar a interação e facilitar a manutenção do sistema, sendo levada para frente como
um projeto de TCC (atualmente em andamento).

## Detalhes Técnicos
A _stack_ principal conta com:
- React
- PocketBase
- WebGL
- Three.js

Para testes e controle de qualidade de código:
- ESlint
- Jest
- React Testing Library
- Playwright

## Levantando a aplicação

> [!NOTE]
> Os comandos utilizados levam em consideração um SO baseado em Linux.

> [!TIP]
> O processo está explicado com mais detalhes na Wiki, seção "Começando."

### Preenchendo o arquivo `.env`

Uma cópia do arquivo `.env` está localizada dentro do diretório `/frontend`. Para criar uma cópia para o seu projeto, execute (dentro da pasta mencionada e):
```
cp .env.example .env
```

Em seguida, altere os dados conforme necessidade.

### Alterando configurações operacionais e de estilo (opcional)

As configurações operacionais e de estilo da aplicação se encontram em `src/config/branding.ts`. Para alterá-las, basta modificar os dados dentro deste arquivo. Esse arquivo reúne tanto elementos que ditam características visuais (como paletas de cores) como variáveis operacionais, como o _namespace_ do local storage.

## Subindo a aplicação

Para iniciar a aplicação, basta utilizar o `docker compose` para levantar os contêineres:

````bash
docker compose up
````

A partir disso, é possível acessar:

O sistema:

- [http://localhost:3000](http://localhost:3000)

O painel administrativo do PocketBase:

- [http://localhost:8080/\_/](http://localhost:8080/_/)

### Migrations

As _snapshots_ do banco de dados são aplicados automaticamente assim que o sistema é iniciado.
Caso isto não ocorra, entre no contêiner do backend, navegue até a pasta `/pb` e execute o 
seguinte comando:

```bash
./pocketbase migrate up
```

## Deploy (produção)

Em produção roda **um único contêiner**: o PocketBase serve a API (`/api`), o painel
administrativo (`/_/`) e o build do frontend (pasta `pb_public`, com _fallback_ para o
`index.html` nas rotas do React Router). O nginx do servidor apenas repassa as requisições.

```
Proxy UTFPR (HTTPS) ──► nginx do servidor :80 ──► 127.0.0.1:8090 ──► contêiner campus-virtual
                                                                       └─ /srv/campus-virtual/data/pb_data
```

Arquivos envolvidos: [`deploy/Dockerfile`](deploy/Dockerfile),
[`docker-compose.prod.yml`](docker-compose.prod.yml), [`deploy/deploy.sh`](deploy/deploy.sh) e
[`frontend/.env.production`](frontend/.env.production).

> [!WARNING]
> Tudo que está em `frontend/.env.production` (variáveis `VITE_*`) vai para o JavaScript público.
> Nunca coloque segredos nesse arquivo.

### Estrutura no servidor

```
/srv/campus-virtual/
├── README.txt            ← resumo do que é cada pasta
├── repo/                 ← clone deste repositório (branch production). Pode ser apagado e clonado de novo
├── data/                 ← ⚠ banco de dados e uploads. NÃO APAGAR
│   ├── DO_NOT_DELETE.txt
│   └── pb_data/
└── backups/              ← backups criados pelo deploy.sh (os 10 mais recentes)
```

### Pré-requisitos

- Docker com o plugin `docker compose`, e o usuário de deploy no grupo `docker`.
- nginx (já configurado para o domínio, atrás do proxy da universidade).
- Memória: o build do frontend chega a ~1,2 GB. Em servidores com pouca RAM, mantenha swap ativo.

### Primeira instalação

1. Criar a estrutura de pastas e clonar o repositório:

   ```bash
   sudo mkdir -p /srv/campus-virtual && sudo chown "$USER": /srv/campus-virtual
   cd /srv/campus-virtual
   mkdir -p data/pb_data backups
   echo "Banco de dados e uploads do Campus Virtual (PocketBase). NAO APAGAR. Backups em ../backups" > data/DO_NOT_DELETE.txt
   cat > README.txt <<'EOF'
   Campus Virtual - https://campus.gp.utfpr.edu.br
     repo/     clone do git (branch production). Descartavel.
     data/     banco de dados e uploads. NAO APAGAR.
     backups/  backups automaticos do deploy.
   Deploy/atualizacao: cd /srv/campus-virtual/repo && ./deploy/deploy.sh
   Documentacao: secao "Deploy" do Readme.md do repositorio.
   EOF
   git clone -b production https://github.com/andresjesse/campus-virtual-utfpr.git repo
   ```

2. Subir a aplicação:

   ```bash
   cd /srv/campus-virtual/repo && ./deploy/deploy.sh
   ```

3. Criar a conta de superusuário (uma por pessoa; as demais podem ser criadas pelo painel):

   ```bash
   docker exec -it campus-virtual /pb/pocketbase superuser upsert EMAIL SENHA --dir=/pb/pb_data
   ```

4. Configurar o nginx. A configuração fica no próprio servidor (não é lida do repositório, para que
   um `git pull` não altere o nginx sem revisão). Crie `/etc/nginx/sites-available/campus-virtual`
   **antes** de criar o link em `sites-enabled`:

   ```nginx
   server {
       listen 80;
       listen [::]:80;
       server_name campus.gp.utfpr.edu.br;

       access_log /var/log/nginx/campus.access.log;
       error_log  /var/log/nginx/campus.error.log;

       # IP real do cliente. 200.134.18.118 é o proxy reverso da universidade
       # (gpvm009.gp.utfpr.edu.br), onde o TLS termina. Atualize se o proxy mudar.
       set_real_ip_from 200.134.18.118;
       real_ip_header   X-Forwarded-For;
       real_ip_recursive on;

       client_max_body_size 20M;   # arquivos GLB das meshes chegam a 16 MB

       location ~ /\.(?!well-known) { deny all; }

       location / {
           proxy_pass http://127.0.0.1:8090;
           proxy_http_version 1.1;
           proxy_set_header Connection "";
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_buffering off;          # realtime (SSE) do PocketBase
           proxy_read_timeout 360s;
       }
   }
   ```

   Não reaproveite blocos de cache de estáticos (`location ~* \.(css|js|png...)$`) de configurações
   antigas: eles têm prioridade sobre o `location /` e quebram os assets e os arquivos do PocketBase
   (o cache já é tratado pelo hook `backend/pb_hooks/static_cache_headers.pb.js`).

   Ative o site (desativando o anterior do mesmo domínio) e recarregue:

   ```bash
   ls -l /etc/nginx/sites-enabled/                 # identifique o site antigo
   sudo rm /etc/nginx/sites-enabled/<site-antigo>  # remove só o link; o arquivo continua em sites-available
   sudo ln -s /etc/nginx/sites-available/campus-virtual /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   ```

5. No painel (`https://campus.gp.utfpr.edu.br/_/`), em **Settings**:
   - **Application**: URL `https://campus.gp.utfpr.edu.br`.
   - **Trusted proxy**: cabeçalho `X-Real-IP` (sem isso, todos os acessos aparecem com o mesmo IP).
   - **Rate limits**: ativar.
   - **MFA** (quando houver SMTP): configurar o e-mail em _Mail settings_ e ativar MFA na coleção `_superusers`.

### Atualizando

```bash
cd /srv/campus-virtual/repo && ./deploy/deploy.sh
```

O script se recusa a rodar com alterações locais ou fora do branch `production`. Em seguida:
atualiza o código → gera a imagem nova (o site continua no ar) → para o contêiner → faz backup
de `data/pb_data` → sobe a nova versão (migrations pendentes são aplicadas na inicialização) →
aguarda o _health check_. Se o backup falhar, a versão anterior é religada automaticamente.

Comandos úteis: `docker logs -f campus-virtual` (logs) e `docker ps` (estado do contêiner).

### Rollback

Voltar o código para uma versão anterior:

```bash
cd /srv/campus-virtual/repo
git log --oneline -10                  # escolha o commit
git checkout <commit>
./deploy/deploy.sh --no-pull
git checkout production                # ao corrigir, volte ao branch antes do próximo deploy
```

Se a versão com problema aplicou migrations, restaure também os dados (antes do `deploy.sh --no-pull`):

```bash
cd /srv/campus-virtual
docker stop campus-virtual
mv data/pb_data "data/pb_data.broken-$(date +%Y%m%d-%H%M%S)"
tar -xzf backups/<arquivo>.tar.gz -C data
```

### Backups fora do servidor

Os backups ficam no mesmo disco do servidor: protegem contra deploys com problema e erros
humanos, mas não contra a perda do servidor. Copie-os periodicamente para outra máquina:

```bash
rsync -av <usuario>@<servidor>:/srv/campus-virtual/backups/ ~/backups/campus-virtual/
```

### Testando a imagem de produção localmente

```bash
mkdir -p /tmp/campus-pb-data
CAMPUS_UID=$(id -u) CAMPUS_GID=$(id -g) CAMPUS_DATA_DIR=/tmp/campus-pb-data docker compose -f docker-compose.prod.yml up --build
```

A aplicação fica em [http://localhost:8090](http://localhost:8090) e o painel em
[http://localhost:8090/\_/](http://localhost:8090/_/).

## 🇺🇸️ English (EN-US)

## Summary

- [Introduction](#introduction)
- [Technical Details](#technical-details)
- [Running the Application](#running-the-application)
- [Deploy (production)](#deploy-production)

## Introduction
This project brings to life the structural redesign and evolution of the Virtual Campus V1 
([source code](https://github.com/andresjesse/prototipo-campus-virtual) and [live site](https://campus.gp.utfpr.edu.br/)).
The idea was born out of the need to make user interactions more dynamic and simplify system maintenance. It is 
currently being driven forward as an ongoing _Trabalho de Conclusão de Curso_ (TCC).

## Technical Details
The core tech stack includes:
- React
- PocketBase
- WebGL
- Three.js

For testing and code quality control:
- ESLint
- Jest
- React Testing Library
- Playwright

## Setting Up the Application

> [!NOTE]
> The commands used assume a Linux-based operating system.

> [!TIP]
> The process is explained in more detail in the Wiki, "Getting Started" section.

### Filling in the `.env` file

A copy of the `.env` file is located inside the `/frontend` directory. To create a copy for your project, run (inside the aforementioned directory):
```
cp .env.example .env
```

Then, change the data as needed.

### Changing operational and style settings (optional)

The application's operational and style settings are located in `src/config/branding.ts`. To change them, simply modify the data inside this file. This file brings together both elements that dictate visual characteristics (such as color palettes) and operational variables, such as the local storage namespace.

## Starting the Application
To spin up the application, simply use `docker compose` to launch the containers:

```bash
docker compose up
```

Once running, you can access:

The application:
- [http://localhost:3000](http://localhost:3000)

The PocketBase Admin Dashboard:
- [http://localhost:8080/_/](http://localhost:8080/_/)

### Migrations

Database snapshots are automatically applied when the system starts. If they fail to run, log into the backend container, navigate to the `/pb` directory, and execute the following command:

```bash
./pocketbase migrate up
```

## Deploy (production)

Production runs **a single container**: PocketBase serves the API (`/api`), the admin dashboard
(`/_/`) and the frontend build (`pb_public`, falling back to `index.html` for React Router routes).
The server's nginx only forwards requests.

```
UTFPR proxy (HTTPS) ──► server nginx :80 ──► 127.0.0.1:8090 ──► campus-virtual container
                                                                 └─ /srv/campus-virtual/data/pb_data
```

Related files: [`deploy/Dockerfile`](deploy/Dockerfile),
[`docker-compose.prod.yml`](docker-compose.prod.yml), [`deploy/deploy.sh`](deploy/deploy.sh) and
[`frontend/.env.production`](frontend/.env.production).

> [!WARNING]
> Everything in `frontend/.env.production` (`VITE_*` variables) ends up in the public JavaScript
> bundle. Never put secrets in that file.

### Server layout

```
/srv/campus-virtual/
├── README.txt            ← what each folder is
├── repo/                 ← clone of this repository (production branch). Safe to delete and re-clone
├── data/                 ← ⚠ database and uploads. DO NOT DELETE
│   ├── DO_NOT_DELETE.txt
│   └── pb_data/
└── backups/              ← backups created by deploy.sh (latest 10)
```

### Requirements

- Docker with the `docker compose` plugin, and the deploy user in the `docker` group.
- nginx (already set up for the domain, behind the university proxy).
- Memory: the frontend build peaks at ~1.2 GB. On low-RAM servers, keep swap enabled.

### First install

1. Create the folder layout (same commands as the Portuguese section, step 1) and clone:
   `git clone -b production https://github.com/andresjesse/campus-virtual-utfpr.git /srv/campus-virtual/repo`.
2. Start the application: `cd /srv/campus-virtual/repo && ./deploy/deploy.sh`.
3. Create a superuser (one per person; others can be created from the dashboard):
   `docker exec -it campus-virtual /pb/pocketbase superuser upsert EMAIL PASSWORD --dir=/pb/pb_data`.
4. Configure nginx with the server block from the Portuguese section, step 4, saved as
   `/etc/nginx/sites-available/campus-virtual` (create it **before** linking it into
   `sites-enabled`). It lives on the server rather than being read from the repository, so a
   `git pull` never changes nginx without review. Do not reuse static-file caching blocks from older configs
   (`location ~* \.(css|js|png...)$`): they take precedence over `location /` and break assets and
   PocketBase files. Disable the previous site for the same domain, link the new one into
   `sites-enabled`, then run `sudo nginx -t && sudo systemctl reload nginx`.
5. In the dashboard **Settings**: Application URL `https://campus.gp.utfpr.edu.br`; trusted proxy
   header `X-Real-IP`; enable rate limits; once SMTP is available, configure mail and enable MFA
   on the `_superusers` collection.

### Updating

```bash
cd /srv/campus-virtual/repo && ./deploy/deploy.sh
```

The script refuses to run with local changes or outside the `production` branch. It then pulls →
builds the new image (the site stays up) → stops the container → backs up `data/pb_data` → starts
the new version (pending migrations run on start) → waits for the health check. If the backup
fails, the previous version is started again.

### Rollback

```bash
cd /srv/campus-virtual/repo
git checkout <commit>
./deploy/deploy.sh --no-pull
git checkout production                # go back to the branch before the next regular deploy
```

If the faulty version applied migrations, restore the data first: `docker stop campus-virtual`,
move `data/pb_data` aside and extract the chosen backup with `tar -xzf backups/<file>.tar.gz -C data`.

### Off-server backups

Backups live on the server's own disk. Copy them elsewhere periodically:
`rsync -av <user>@<server>:/srv/campus-virtual/backups/ ~/backups/campus-virtual/`.

### Testing the production image locally

```bash
mkdir -p /tmp/campus-pb-data
CAMPUS_UID=$(id -u) CAMPUS_GID=$(id -g) CAMPUS_DATA_DIR=/tmp/campus-pb-data docker compose -f docker-compose.prod.yml up --build
```

The app runs at [http://localhost:8090](http://localhost:8090) and the dashboard at
[http://localhost:8090/\_/](http://localhost:8090/_/).