# Aplicación Backend + Frontend (JWT)

Este repositorio incluye:

- `backend/`: API FastAPI con autenticación JWT.
- `frontend/`: aplicación React con pantalla de login y pantalla de bienvenida.

El frontend consume `POST /auth/token`, guarda el `access_token` en `sessionStorage` y protege la navegación para que solo usuarios autenticados accedan a `/welcome`.

## Estructura

```text
.
├── Compliance-Platform-DESIGN.md
├── backend
│   ├── app
│   │   └── main.py
│   ├── Dockerfile
│   ├── poetry.lock
│   └── pyproject.toml
├── docker-compose.yml
└── frontend
    ├── package.json
    ├── src
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    └── vite.config.js
```

## Requisitos

- Python 3.12+
- Poetry (para backend)
- Node.js 20+ y npm (para frontend)
- Docker y Docker Compose (opcional)

## Backend (FastAPI)

```bash
cd backend
export JWT_SECRET_KEY="reemplaza-esta-clave"
poetry install --no-root
poetry run uvicorn app.main:app --reload
```

API disponible en `http://127.0.0.1:8000`.

Credenciales por defecto:

- usuario: `admin`
- contraseña: `admin123`

## Frontend (React)

En una segunda terminal:

```bash
cd frontend
npm install
npm run dev
```

Aplicación disponible en `http://127.0.0.1:5173`.

### Flujo de uso

1. Abrir `http://127.0.0.1:5173/login`.
2. Iniciar sesión con las credenciales del backend.
3. Tras login exitoso, se redirige a `/welcome`.
4. El token JWT se guarda en sesión (`sessionStorage`).
5. Si no hay sesión activa, `/welcome` redirige automáticamente a `/login`.

## Endpoints backend

### Obtener token

`POST /auth/token`

```json
{
  "username": "admin",
  "password": "admin123"
}
```

### Refrescar token

`POST /auth/refresh`

```json
{
  "refresh_token": "<jwt>"
}
```
