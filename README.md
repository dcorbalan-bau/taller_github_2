# JWT Demo API con FastAPI

Este repositorio incluye una aplicación Web API en Python/FastAPI dentro de la carpeta `/backend` que implementa autenticación JWT con:

- generación de token para el usuario `admin` con contraseña `admin123`
- expiración del access token en `300` segundos
- endpoint para refrescar el token
- configuración con Poetry
- despliegue con Docker y Docker Compose

## Estructura

```text
.
├── backend
│   ├── app
│   │   └── main.py
│   ├── Dockerfile
│   ├── poetry.lock
│   └── pyproject.toml
└── docker-compose.yml
```

## Requisitos

- Python 3.12+
- Poetry
- Docker y Docker Compose (opcional)

## Ejecución local con Poetry

```bash
cd backend
export JWT_SECRET_KEY="reemplaza-esta-clave"
poetry install --no-root
poetry run uvicorn app.main:app --reload
```

La API quedará disponible en `http://127.0.0.1:8000`.

## Endpoints

### 1. Obtener token

`POST /auth/token`

Body:

```json
{
  "username": "admin",
  "password": "admin123"
}
```

Respuesta esperada:

```json
{
  "access_token": "<jwt>",
  "refresh_token": "<jwt>",
  "token_type": "bearer",
  "expires_in": 300
}
```

### 2. Refrescar token

`POST /auth/refresh`

Body:

```json
{
  "refresh_token": "<jwt>"
}
```

## Uso con Docker

Construcción y arranque:

```bash
export JWT_SECRET_KEY="reemplaza-esta-clave"
docker compose up --build
```

La API quedará expuesta en `http://localhost:8000`.

## Variables de entorno

- `JWT_SECRET_KEY`: clave obligatoria usada para firmar los JWT
- `JWT_REFRESH_EXPIRE_SECONDS`: duración del refresh token en segundos (por defecto `3600`)

## Documentación interactiva

FastAPI expone automáticamente:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
