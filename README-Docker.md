# Vallmere - Guía de Despliegue con Docker y Kubernetes

Esta guía te ayudará a dockerizar y desplegar la aplicación Vallmere en Minikube.

## Arquitectura

La aplicación está compuesta por:
- **Frontend**: Angular 19 servido con Nginx
- **Backend**: NestJS con TypeORM
- **Base de datos**: PostgreSQL 15

## Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

1. **Docker Desktop** - [Descargar aquí](https://www.docker.com/products/docker-desktop/)
2. **Minikube** - [Descargar aquí](https://minikube.sigs.k8s.io/docs/start/)
3. **kubectl** - [Descargar aquí](https://kubernetes.io/docs/tasks/tools/)

## Configuración Inicial

### 1. Iniciar Minikube

```powershell
# Iniciar Minikube con configuración adecuada
minikube start --driver=docker --memory=4096 --cpus=2

# Verificar que Minikube está funcionando
minikube status
```

### 2. Habilitar addons necesarios

```powershell
# Habilitar ingress y dashboard
minikube addons enable ingress
minikube addons enable dashboard
```

## Despliegue con Docker Compose (Desarrollo Local)

Para desarrollo local, puedes usar Docker Compose:

```powershell
# Construir e iniciar todos los servicios
docker-compose up --build

# Para ejecutar en segundo plano
docker-compose up -d --build

# Para detener los servicios
docker-compose down

# Para limpiar volúmenes (elimina datos de la BD)
docker-compose down -v
```

La aplicación estará disponible en:
- Frontend: http://localhost
- Backend: http://localhost:3000
- PostgreSQL: localhost:5432

## Despliegue en Minikube

### 1. Construir las imágenes Docker

```powershell
# Ejecutar el script de construcción
.\build-images.ps1
```

Este script:
- Configura el entorno Docker de Minikube
- Construye las imágenes del frontend y backend
- Las etiqueta para uso local en Minikube

### 2. Desplegar en Kubernetes

```powershell
# Ejecutar el script de despliegue
.\deploy-k8s.ps1
```

Este script:
- Crea el namespace `vallmere`
- Despliega PostgreSQL con almacenamiento persistente
- Despliega el backend de NestJS
- Despliega el frontend de Angular
- Muestra la URL de acceso

### 3. Acceder a la aplicación

```powershell
# Obtener la URL del frontend
minikube service frontend-service -n vallmere --url

# O abrir directamente en el navegador
minikube service frontend-service -n vallmere
```

## Comandos Útiles

### Monitoreo y debugging

```powershell
# Ver todos los pods
kubectl get pods -n vallmere

# Ver logs de un pod específico
kubectl logs -f deployment/backend-deployment -n vallmere
kubectl logs -f deployment/frontend-deployment -n vallmere
kubectl logs -f deployment/postgres-deployment -n vallmere

# Descripción detallada de un deployment
kubectl describe deployment backend-deployment -n vallmere

# Acceder al shell de un pod
kubectl exec -it deployment/backend-deployment -n vallmere -- /bin/sh

# Ver servicios
kubectl get services -n vallmere

# Ver persistent volumes
kubectl get pv,pvc -n vallmere
```

### Escalado

```powershell
# Escalar el backend
kubectl scale deployment backend-deployment --replicas=3 -n vallmere

# Escalar el frontend
kubectl scale deployment frontend-deployment --replicas=3 -n vallmere
```

### Dashboard de Kubernetes

```powershell
# Abrir el dashboard de Kubernetes
minikube dashboard
```

## Estructura de archivos

```
vallmere/
├── backend/
│   ├── Dockerfile
│   └── .dockerignore
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── .dockerignore
├── k8s/
│   ├── namespace.yaml
│   ├── postgres-secret.yaml
│   ├── postgres-pv.yaml
│   ├── postgres-deployment.yaml
│   ├── backend-configmap.yaml
│   ├── backend-deployment.yaml
│   └── frontend-deployment.yaml
├── docker-compose.yml
├── init-db.sql
├── build-images.ps1
├── deploy-k8s.ps1
└── cleanup.ps1
```

## Configuración de la Base de Datos

Las credenciales por defecto son:
- **Database**: vallmere_db
- **Username**: vallmere_user
- **Password**: vallmere_password

Para cambiar estas credenciales:
1. Modifica el archivo `k8s/postgres-secret.yaml` (recuerda usar base64)
2. Actualiza el archivo `init-db.sql`

```powershell
# Para generar valores base64
[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes("tu_nuevo_valor"))
```

## Limpieza

Para eliminar completamente el despliegue:

```powershell
# Ejecutar script de limpieza
.\cleanup.ps1

# O manualmente
kubectl delete namespace vallmere
```

## Troubleshooting

### Problemas comunes

1. **Imágenes no encontradas**: Asegúrate de que el entorno Docker esté configurado para Minikube
   ```powershell
   minikube docker-env --shell powershell | Invoke-Expression
   ```

2. **Pods en estado Pending**: Verifica que Minikube tenga suficientes recursos
   ```powershell
   kubectl describe pod <pod-name> -n vallmere
   ```

3. **Base de datos no conecta**: Verifica que PostgreSQL esté ejecutándose
   ```powershell
   kubectl logs deployment/postgres-deployment -n vallmere
   ```

4. **Frontend no carga**: Verifica que el backend esté funcionando
   ```powershell
   kubectl port-forward service/backend-service 3000:3000 -n vallmere
   ```

### Logs y debugging

```powershell
# Ver logs en tiempo real
kubectl logs -f deployment/backend-deployment -n vallmere
kubectl logs -f deployment/frontend-deployment -n vallmere

# Acceder a un contenedor
kubectl exec -it deployment/backend-deployment -n vallmere -- /bin/sh

# Port forwarding para debugging
kubectl port-forward service/backend-service 3000:3000 -n vallmere
kubectl port-forward service/postgres-service 5432:5432 -n vallmere
```

## Notas de Seguridad

En un entorno de producción, considera:
- Cambiar las credenciales por defecto
- Usar certificados TLS
- Configurar network policies
- Implementar RBAC
- Usar un gestor de secretos como Vault

## Próximos pasos

- Configurar CI/CD con GitHub Actions
- Implementar monitoring con Prometheus y Grafana
- Configurar ingress controller para dominios personalizados
- Implementar backup automático de la base de datos 