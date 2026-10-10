# Instalación, configuración y ejecución

Este capítulo permite poner el sistema en funcionamiento desde el repositorio. Describe el entorno
local, que es donde el sistema se ejecuta y se demuestra.

## Requisitos

| Componente | Versión | Uso |
|---|---|---|
| Entorno de ejecución de JavaScript | 20.11.0 o superior | Servidor y herramientas |
| Gestor de paquetes con espacios de trabajo | 9.x | Instalación de dependencias |
| Plataforma de contenedores | Cualquier versión reciente | Base de datos, administrador web y servidor de correo |
| Navegador web | Actualizado | Acceso a la aplicación |

No se requiere instalar la base de datos: la provee un contenedor.

## Puesta en marcha

### Obtención del código e instalación

```bash
git clone <repositorio> erp-fabrica
cd erp-fabrica
pnpm install
```

Una única instalación en la raíz resuelve ambos paquetes. El repositorio utiliza espacios de trabajo
con un archivo de bloqueo compartido, de modo que las versiones instaladas son idénticas a las
verificadas en integración continua.

### Infraestructura local

```bash
docker compose up -d
```

Levanta tres servicios:

| Servicio | Puerto | Uso |
|---|---|---|
| Base de datos | 5432 | Persistencia |
| Administrador web de la base | 8080 | Inspección de datos durante el desarrollo |
| Servidor de correo de prueba | 1025 (correo) · 8025 (bandeja web) | Recepción de los mensajes que la aplicación envía |

El servidor de correo de prueba **retiene los mensajes en lugar de entregarlos**. El enlace de
recuperación de contraseña se abre desde su bandeja web, sin que nada salga hacia la red ni alcance
una casilla real. Acepta conexiones sin autenticación.

Para detener los servicios conservando los datos:

```bash
docker compose down
```

### Configuración del servidor

```bash
cp erp-backend/.env.example erp-backend/.env
```

El archivo de ejemplo trae valores operativos para el entorno local. Las variables son:

| Variable | Descripción | Obligatoria |
|---|---|---|
| `NODE_ENV` | Entorno de ejecución | No, por omisión desarrollo |
| `PORT` | Puerto del servidor | No, por omisión 3000 |
| `FRONTEND_URL` | Origen autorizado del cliente | No, por omisión el puerto 4200 local |
| `DATABASE_URL` | Cadena de conexión a la base de datos | **Sí** |
| `JWT_ACCESS_SECRET` | Secreto de firma del token de acceso | **Sí** |
| `JWT_REFRESH_SECRET` | Secreto de firma del token de renovación | **Sí** |
| `DEFAULT_PAGINATION_LIMIT` | Tamaño de página por omisión | No, por omisión 20 |
| `MAX_PAGINATION_LIMIT` | Tamaño de página máximo | No, por omisión 100 |
| `PASSWORD_RESET_TTL_MINUTES` | Vigencia del enlace de recuperación | No, por omisión 30 |
| `SMTP_HOST` | Servidor de correo | No |
| `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` | Parámetros del servidor de correo | No |
| `MAIL_FROM` | Remitente de los mensajes | No |

Tres observaciones importantes:

**La configuración se valida al arrancar.** Si falta una variable obligatoria o el valor no
corresponde al tipo esperado, el proceso informa el detalle y termina, en lugar de iniciar en un
estado inconsistente.

**El archivo de configuración no se versiona.** El repositorio contiene únicamente plantillas. Cada
entorno debe generar sus propios secretos.

**El servidor de correo es opcional.** Sin él, la aplicación funciona y el enlace de recuperación se
escribe en el registro de actividad de la consola, de modo que el circuito puede completarse
copiándolo desde allí.

### Preparación de la base de datos

```bash
pnpm --filter erp-backend exec prisma generate
pnpm --filter erp-backend exec prisma migrate dev
pnpm --filter erp-backend db:seed
```

| Instrucción | Efecto |
|---|---|
| Generación del cliente | Produce el cliente de acceso a datos tipado a partir del esquema |
| Migración | Crea las tablas, relaciones e índices |
| Carga inicial | Siembra permisos, roles, usuarios, categorías y **la caja de ventas** |

La carga inicial **no es opcional**. Además de los permisos y roles sin los cuales nadie podría
acceder, crea la caja de ventas, cuya ausencia impide registrar operaciones: el sistema rechaza la
venta con un mensaje explícito (Capítulo VIII).

El procedimiento es idempotente y puede repetirse sin duplicar registros.

Crea una cuenta por rol. **Las credenciales iniciales deben modificarse antes de cualquier uso que
exceda la demostración local.**

### Ejecución

En dos terminales separadas:

```bash
pnpm --filter erp-backend dev      # servidor en el puerto 3000
pnpm --filter erp-frontend start   # cliente en el puerto 4200
```

Ambos se ejecutan en modo de recarga automática ante cambios en el código.

| Servicio | Dirección |
|---|---|
| Aplicación | `http://localhost:4200` |
| Interfaz de programación | `http://localhost:3000/api` |
| Verificación de estado | `http://localhost:3000/health` |
| Administrador de la base | `http://localhost:8080` |
| Bandeja de correo | `http://localhost:8025` |

### Verificación

```bash
curl http://localhost:3000/health
# {"status":"ok"}
```

A continuación, acceder a la aplicación e iniciar sesión con una de las cuentas creadas por la carga
inicial. Un inicio de sesión satisfactorio que presenta el panel con su menú confirma que los tres
componentes —cliente, servidor y base de datos— se comunican correctamente.

## Entorno de pruebas

La suite de pruebas exige una base de datos **dedicada**, distinta de la de desarrollo.

```bash
cp erp-backend/.env.test.example erp-backend/.env.test
```

La plantilla apunta a una base separada dentro del mismo motor. Debe crearse previamente.

```bash
pnpm --filter erp-backend db:test:setup   # migra y siembra la base de pruebas
pnpm --filter erp-backend test            # suite del servidor
pnpm --filter erp-frontend test           # suite del cliente
```

La suite del servidor verifica la presencia del archivo de configuración de pruebas y que el entorno
corresponda, y falla de inmediato en caso contrario. Es una protección deliberada: las pruebas crean
y eliminan registros, y una ejecución distraída contra la base de desarrollo destruiría el trabajo en
curso (Capítulo XII).

La suite del cliente no requiere infraestructura alguna.

## Compilación

```bash
pnpm --filter erp-backend build     # produce dist/
pnpm --filter erp-frontend build    # produce dist/erp-frontend
```

> **Advertencia sobre los recursos del servidor.** La compilación del servidor emite **únicamente
> código**: no copia archivos que no sean código fuente. El logotipo que incorpora la planilla de
> reportes reside fuera del directorio de salida.
>
> Al desplegar el resultado de la compilación **es necesario copiar el directorio de recursos junto
> a él**. Si se omite, los reportes se generan igualmente pero sin logotipo, dejando una advertencia
> en el registro de actividad. La descarga no falla (Capítulo IX).

La compilación del cliente sustituye el archivo de configuración por el de producción, que utiliza
una ruta relativa para alcanzar la interfaz de programación. Esto supone que el cliente y el servidor
se publican **bajo el mismo origen**, lo que requiere un intermediario inverso. El sistema se
presenta en entorno local, donde esa condición no se aplica.

## Operación

### Apagado

El servidor atiende las señales de interrupción y terminación: deja de aceptar conexiones nuevas,
aguarda la finalización de las peticiones en curso, cierra la conexión con la base y finaliza.

Una interrupción abrupta durante una operación transaccional dejaría la conexión sin liberar.

### Registro de actividad

El servidor emite por consola. En desarrollo, con formato legible y detalle amplio; en producción,
con formato estructurado y detalle acotado.

### Modificaciones del esquema

Toda modificación del esquema de datos requiere una migración:

```bash
pnpm --filter erp-backend exec prisma migrate dev --name descripcion_del_cambio
```

Las migraciones se versionan y se aplican en orden. La herramienta determina el estado de cualquier
entorno y aplica únicamente lo pendiente.

### Inspección de datos

El administrador web de la base, disponible en el puerto 8080, permite consultar y modificar datos
durante el desarrollo. Las credenciales de acceso son las definidas en la configuración de los
contenedores.

Alternativamente, el explorador de datos del mapeador ofrece una vista navegable del modelo:

```bash
pnpm --filter erp-backend exec prisma studio
```
