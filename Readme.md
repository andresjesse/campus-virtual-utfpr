# Campus Virtual V2

## 🇧🇷️ Português (PT-BR)

## Sumário

- [Introdução](#introdução)
- [Detalhes Técnicos](#detalhes-técnicos)
- [Rodando a aplicação](#rodando-a-aplicação)

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

## 🇺🇸️ English (EN-US)

## Summary

- [Introduction](#introduction)
- [Technical Details](#technical-details)
- [Running the Application](#running-the-application)

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