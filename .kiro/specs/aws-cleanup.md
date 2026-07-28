# AWS Resource Cleanup — Spec

## Contexto

Migramos el hosting a Vercel (frontend) + Railway (backend) + Neon (database). Los siguientes recursos de AWS ya no son necesarios y deben eliminarse para evitar costos innecesarios.

## Recursos a Eliminar

### 1. RDS — PostgreSQL Instance (~$15-22/mes)
- **Instance:** `property-historical-db`
- **Region:** us-east-1
- **Pasos:**
  1. Verificar que no hay conexiones activas
  2. Crear snapshot final (por si acaso): `property-historical-final-snapshot`
  3. Eliminar la instancia (sin snapshot final si ya creaste uno manual)
  4. Eliminar subnet group asociado

### 2. ECS — Cluster + Service
- **Cluster:** `property-historical`
- **Service:** `backend`
- **Pasos:**
  1. Actualizar el service a 0 desired tasks
  2. Eliminar el service
  3. Eliminar el cluster
  4. Eliminar task definitions (desregistrar todas las revisiones)

### 3. ECR — Container Registry
- **Repository:** `property-historical-backend`
- **Pasos:**
  1. Eliminar todas las imágenes del repositorio
  2. Eliminar el repositorio

### 4. CloudFront — Distribution
- **Distribution ID:** (verificar en .env.aws o en consola)
- **Pasos:**
  1. Deshabilitar la distribución (cambiar a Disabled)
  2. Esperar a que se propague (~15 min)
  3. Eliminar la distribución

### 5. S3 — Frontend Bucket (hosting estático)
- **Bucket:** (el que se usaba para el frontend SPA, NO el de attachments)
- **Pasos:**
  1. Vaciar el bucket (eliminar todos los objetos)
  2. Eliminar el bucket

### 6. Security Groups (opcional)
- Eliminar security groups creados para ECS y RDS si ya no tienen dependencias

### 7. IAM (revisar)
- Si creaste un IAM user específico para ECS/ECR deploy, eliminarlo
- **Mantener** el IAM user/role que tiene permisos de S3 para attachments (lo usa Railway)

---

## Recursos que se MANTIENEN

| Recurso | Motivo |
|---------|--------|
| S3 bucket `property-historical-attachments-551216219596` | El backend en Railway sigue usando S3 para archivos |
| IAM credentials con acceso S3 | Railway las usa para generar pre-signed URLs |

---

## Costo estimado que se ahorra

| Recurso | Costo mensual |
|---------|---------------|
| RDS (db.t4g.micro) | ~$15-22 |
| ECS Fargate | ~$5-10 |
| CloudFront | ~$0.50-1 |
| S3 frontend | ~$0.10 |
| **Total ahorro** | **~$20-33/mes** |

---

## Orden recomendado de eliminación

1. ECS (service → cluster) — deja de generar costo inmediatamente
2. RDS — el más caro, crear snapshot final primero
3. ECR — solo almacenamiento de imágenes, costo mínimo
4. CloudFront — requiere deshabilitar primero, esperar, luego eliminar
5. S3 frontend bucket — vaciar y eliminar
6. Security groups e IAM innecesario

---

## Verificación post-cleanup

- [ ] `https://property-historical-frontend.vercel.app` sigue funcionando
- [ ] Login funciona (backend en Railway responde)
- [ ] Adjuntos/attachments se pueden subir y descargar (S3 sigue operativo)
- [ ] No hay recursos inesperados generando costo en AWS Billing
