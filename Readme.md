# App Title

TODO: Project Description.

Pocketbase admin url:

- [http://localhost:8080/\_/](http://localhost:8080/_/)

Frontend urls:

- [http://localhost:3000](http://localhost:3000)

## Setup

1. Install Docker

2. Run `docker compose up`

3. [First run only]: Check backend container log for pocketbase superuser setup URL.

## Backend

Pocketbase automigrate is off. After changing collections migrate manually:

1. Shell into `backend` container;

2. `cd /pb && ./pocketbase migrate collections`.

## Frontend

Node is served from container, so always run commands from it:

1. Shell into `frontend` container;

2. `cd /app`

3. Execute your commands, e.g. `yarn add some-lib`

## Deploy

TODO.
