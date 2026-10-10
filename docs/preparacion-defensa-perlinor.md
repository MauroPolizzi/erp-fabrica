# Preparación para defensa — PerliNor ERP

> **Cómo leer este material.** Cada afirmación lleva, cuando hace falta, una etiqueta de origen:
>
> | Etiqueta | Significado |
> |---|---|
> | **[DT]** | Está en `documentacion-tecnica.md` |
> | **[MU]** | Está en `manual-usuario.md` |
> | **[CÓDIGO]** | No está en la documentación; lo verifiqué leyendo el código (sin modificarlo) |
> | **[CONOC. ADICIONAL]** | Conocimiento técnico general que la documentación no explica, pero que el tribunal puede pedir |
> | **[INFERENCIA]** | Deducción mía a partir de lo documentado; verificala antes de afirmarla |
>
> Y cada punto se distingue entre **implementado**, **decisión documentada**, **limitación**, **mejora futura** y **recomendación**.

---

## 1. Resumen del proyecto que debo dominar (chuleta)

**Contexto.** Es una PPS de la Tecnicatura Universitaria en Programación (UTN FRT). El cliente es **PerliNor**, una fábrica de materiales para la construcción (mampostería, premoldeados, derivados de cemento y áridos) con **10 empleados en 5 áreas**: Administración, Ventas, Producción, Stock y Finanzas. El sistema se dimensionó para **5 usuarios** (uno por área). [DT]

**Problema.** La información no faltaba: estaba **dispersa** en papel y en planillas de cada área. Eso producía tres consecuencias: **desorden** (no había una versión válida del dato), **esfuerzo administrativo** (transcribir y cotejar a mano) y **dificultad para decidir** (para saber cuánto se vendió había que consolidar planillas). [DT]

**Objetivo.** Centralizar la operación comercial y de inventario en un único sistema web, con datos consistentes e información de gestión por área. Hay 4 objetivos específicos: **unificar, asegurar la consistencia, controlar el acceso y dar visibilidad**. [DT]

**Alcance.** El cliente priorizó **ventas**. El circuito entregado y verificado es: alta de cliente → alta de material → carga de stock → venta → impacto en caja → consulta (indicadores, gráfico y reporte Excel). Además: usuarios, roles en modo consulta, auditoría y recuperación de contraseña. **Quedó fuera:** materias primas y su costo promedio ponderado, producción, proveedores y pagos, y factura electrónica. Estas áreas **están modeladas en la BD (7 entidades) pero no implementadas**. [DT]

**Arquitectura.** Es un **monolito modular en dos procesos**: una SPA **Angular 19** y una API **Node 20 + Express + TypeScript**, con **Prisma** sobre **PostgreSQL 16**. SMTP es opcional y se usa solo para la recuperación de contraseña. No hay colas, caché ni microservicios. El repositorio es un **monorepo con pnpm workspaces**. [DT]

- **Servidor:** middlewares globales (helmet, CORS, compresión, rate limit) → rutas (authenticate, requirePermission, validate con Zod) → controlador (HTTP ↔ dominio) → servicio (reglas, transacciones, auditoría) → Prisma. La regla es que **un servicio nunca llama al servicio de otro módulo**.
- **Cliente:** las capas son `core` / `shared` / `layout` / `features`. Usa componentes standalone, **lazy loading** por área, **signals** con OnPush, 2 interceptores (JWT y errores), guards y una grilla compartida en 6 pantallas. La interfaz se hace con PrimeNG y Tailwind, y los gráficos con Chart.js. [DT + CÓDIGO para los nombres de las bibliotecas]

**Stack verificado en `package.json`** [CÓDIGO]:
- Backend: express, @prisma/client, zod, jsonwebtoken, bcryptjs, helmet, cors, express-rate-limit, compression, decimal.js, exceljs, nodemailer, winston y dayjs. Tests con vitest + supertest.
- Frontend: Angular 19, PrimeNG 17, Tailwind 3, chart.js, decimal.js, file-saver y dayjs. Tests con Karma + Jasmine.
- Infraestructura: docker-compose con postgres:16, adminer y mailpit. CI en `.github/workflows/ci.yml`.

**El núcleo (Cap. VIII).** La venta se registra en **una transacción**: verificar el cliente → verificar la caja → **agregar cantidades por material** → pre-verificación (diagnóstico) → **UPDATE condicional `WHERE stock >= requerido`** (esta es la garantía real contra la concurrencia) → líneas con el **precio congelado** → cálculo con **decimal.js** → venta + movimientos OUT + movimiento de caja + saldo. La **auditoría va fuera de la transacción**. La anulación es el inverso, con un `UPDATE ... WHERE status='CONFIRMED'`.

**Decisiones clave:**
- monolito vs microservicios;
- SPA separada;
- signals vs NgRx;
- ORM tipado;
- JWT sin estado (15 min / 7 días, con secretos distintos);
- permisos resueltos en la BD en cada petición;
- Decimal en lugar de float, con importes como string en el JSON;
- baja lógica;
- stock y saldo desnormalizados;
- precio congelado;
- reversiones con movimiento negativo;
- 422 vs 400;
- reportes con definición / generador / controlador;
- agregación temporal en la app por la zona horaria;
- tests contra una BD real;
- descarte de la cola de trabajos (*"no incorporar infraestructura sin un problema que la justifique"*).

**Limitaciones declaradas:**
- no se puede revocar una sesión: el refresh sigue válido 7 días tras un reset;
- tokens en localStorage (riesgo de XSS);
- política de contraseñas mínima;
- auditoría sin integridad y con posibles pérdidas silenciosas;
- sin IVA;
- la caja refleja lo facturado, no lo cobrado;
- no hay cuenta corriente;
- no se usa DRAFT;
- el CUIT no es único;
- no hay stock mínimo;
- los roles son fijos;
- dependencia de la zona horaria;
- selectores limitados a 200 registros;
- sin despliegue (solo local);
- sin cobertura medida, sin E2E, sin pruebas de carga y sin tests de reportes. [DT]

**Números para recordar:**
- 22 entidades (15 usadas y 7 previstas);
- 40 endpoints;
- 41 permisos (10 módulos × 4 acciones, más `admin.*`);
- 64 tests (38 en el backend y 26 en el frontend);
- 3 migraciones;
- 13 semanas reales contra 16 planificadas;
- 38 commits;
- tope de 20.000 filas en el reporte;
- topes de la serie temporal: 366 días, 120 semanas o 60 meses;
- paginación: 20 por omisión y 100 como máximo;
- rate limit: 1000 cada 15 min en general y 5 cada 15 min en la recuperación;
- enlace de recuperación de 30 min;
- bcrypt con coste 10;
- contraseña de 8 caracteres como mínimo.

---

## 2. Preguntas no técnicas

| # | Dificultad | Pregunta | Qué evalúa |
|---|---|---|---|
| N1 | 🟢 | ¿Qué problema resuelve el sistema? | Comprensión del diagnóstico |
| N2 | 🟢 | ¿Quiénes usan el sistema y qué puede hacer cada uno? | Usuarios, roles |
| N3 | 🟢 | ¿Cuál es el alcance? ¿Qué quedó afuera y por qué? | Delimitación honesta |
| N4 | 🟡 | ¿Cómo demostrás que el sistema cumple sus objetivos? | Trazabilidad objetivo → mecanismo → prueba |
| N5 | 🟡 | ¿Qué metodología seguiste? | Proceso, planificación |
| N6 | 🟡 | ¿Por qué las ventas no tienen IVA ni factura? | Decisiones funcionales acordadas |
| N7 | 🟡 | ¿Qué cambia para el usuario respecto de las planillas? | Valor real para el cliente |
| N8 | 🔴 | ¿Cuál es la principal limitación del sistema hoy? | Autocrítica |
| N9 | 🔴 | Si siguieras el proyecto, ¿por dónde empezarías? | Priorización |
| N10 | 🔴 | ¿Qué harías distinto si empezaras de nuevo? | Madurez, reflexión |

### N1 — ¿Qué problema resuelve el sistema?
- **Qué evalúa:** si entendiste el problema del cliente y no solo "hice un CRUD".
- **Puntos que debes mencionar:**
  - el problema era la dispersión, no la falta de información;
  - las tres consecuencias;
  - el objetivo de volver utilizable la información que la empresa ya producía.
- **Respuesta sugerida:** "PerliNor llevaba todo en papel y en planillas sueltas de cada área. El problema no era que faltara información, sino que estaba repartida: el precio de un material o el stock figuraban en varios lugares y ninguno era el válido. Eso generaba desorden, mucho trabajo manual de cotejo y, sobre todo, que para saber cuánto se vendió en el mes había que consolidar planillas a mano. El sistema centraliza eso en una sola fuente de datos y pone los indicadores a disposición de cada área."
- **Posible repregunta:** "¿Y cómo se refleja ese diagnóstico en el diseño?"
- **Respuesta:** "Cada consecuencia tiene una respuesta concreta. Para la consistencia están la validación en dos capas y las transacciones. Para el control, los roles y la auditoría. Para la visibilidad, el panel de indicadores y el reporte exportable."

### N2 — ¿Quiénes usan el sistema?
- **Puntos:**
  - 5 roles, uno por área;
  - empleado ≠ usuario: 10 empleados y 5 cuentas;
  - el menú se filtra según el rol;
  - Administración usa el comodín `admin.*`.
- **Respuesta sugerida:** "Hay cinco roles que corresponden a las cinco áreas de la empresa. Administración ve todo, incluidos usuarios y auditoría. Ventas gestiona clientes y ventas. Stock gestiona el catálogo y el stock. Producción hoy solo consulta y carga stock, porque su módulo no se implementó. Finanzas consulta lo comercial, ve la caja y descarga reportes. Distingo empleado de usuario: la empresa tiene diez empleados, pero el sistema se dimensionó para cinco cuentas."
- **Repregunta:** "¿Se pueden crear roles nuevos?"
- **Respuesta:** "No. Es la restricción RE-06: los roles se siembran en la carga inicial y la aplicación solo los muestra. La organización tiene cinco áreas estables y una interfaz para administrar permisos no se justificaba. Cambiarlos hoy requiere tocar la base."

### N3 — Alcance
- **Puntos:**
  - la prioridad la definió el cliente (ventas);
  - las 4 áreas excluidas;
  - el modelo de datos ya las contempla (7 entidades);
  - el módulo de empleados existe solo a nivel de servicios, sin interfaz.
- **Respuesta sugerida:** "El cliente definió que lo prioritario era ventas, así que hice el circuito comercial completo de punta a punta, en lugar de siete módulos a medias. Quedaron afuera materias primas, producción, proveedores con sus pagos y la facturación electrónica. No fue algo que se cayó: fue una decisión documentada. Además, esas áreas ya están modeladas en la base, así que agregarlas no exige rediseñar."
- **Repregunta:** "¿No es un ERP incompleto, entonces?"
- **Respuesta:** "Es un ERP en su primera etapa. El circuito que el cliente necesitaba está completo y verificado, y el resto tiene el modelo, los permisos y los prefijos de ruta reservados. Prefiero entregar un circuito que funciona antes que siete módulos sin terminar."

### N4 — ¿Cómo demostrás que cumple los objetivos?
- **Puntos:**
  - los 4 objetivos específicos se mapean a mecanismos y pruebas;
  - el Anexo D es la matriz de trazabilidad (requerimiento → código → prueba → capítulo).
- **Respuesta sugerida:** "Cada objetivo tiene un mecanismo y, en lo posible, una prueba. Para la consistencia hay transacciones y el UPDATE condicional, con tests de reversión total y de concurrencia contra una base real. Para el control de acceso, la verificación de permisos en cada ruta del servidor. Para la unificación, una única base con una única fuente para cada dato. Para la visibilidad, el panel y el reporte. Además armé una matriz de trazabilidad que conecta cada requerimiento con el archivo que lo implementa y la prueba que lo verifica."
- **Repregunta:** "¿Todos los requerimientos tienen prueba automatizada?"
- **Respuesta:** "No, y lo declaro. El reporte Excel, la gestión de usuarios y los rate limits se verificaron a mano. El capítulo XII lista explícitamente lo que no cubren las pruebas."

### N5 — Metodología
- **Puntos:**
  - desarrollo incremental;
  - una auditoría del código antes de cada plan;
  - etapa A (ventas, 4 semanas) y etapa B (reportes, 1 semana);
  - 13 semanas reales contra 16 planificadas;
  - el backend antes que el frontend;
  - git con ramas master y dev, y CI.
- **Respuesta sugerida:** "Trabajé en forma incremental: cada etapa entrega algo verificable. Lo particular es que antes de planificar cada etapa auditaba el código existente para ver qué ya estaba hecho. Eso redujo sistemáticamente el trabajo estimado. Por ejemplo, en reportería descubrí que las bibliotecas ya estaban instaladas y que la cola de trabajos no se usaba, así que la saqué. Hice primero el backend, porque concentra las reglas de negocio, lo probé con una colección de peticiones y recién después construí las pantallas."
- **Repregunta:** "¿Por qué no Scrum o cascada?"
- **Respuesta:** "Cascada me obligaba a definir todo antes de escribir código, con el riesgo de no llegar a entregar ventas. Scrum formal no tiene mucho sentido con un único desarrollador. El enfoque incremental me dejaba entregar primero lo prioritario."

### N6 — Sin IVA ni factura
- **Puntos:**
  - RE-03 fue acordada con el cliente;
  - el campo `tax` existe y se guarda en 0;
  - la entidad Comprobante está modelada;
  - la factura electrónica exige integrarse con el organismo fiscal y homologar.
- **Respuesta sugerida:** "Fue una simplificación acordada con el cliente para validar el circuito comercial sin la complejidad impositiva. El modelo ya tiene el campo de impuesto y la entidad de comprobante, así que agregarlo no cambia la estructura. La facturación electrónica la dejé como prioridad baja porque requiere integración y homologación con el organismo fiscal."
- **Repregunta:** "¿El reporte se rompería si agregás IVA?"
- **Respuesta:** "No, y fue una decisión explícita. El total vendido del reporte suma `sale.total` por venta distinta, no la suma de las líneas. Hoy coinciden porque el impuesto es cero. Si se sumaran líneas, con IVA el total quedaría mal sin dar error."

### N7 — Qué cambia para el usuario
- **Puntos:**
  - el stock se actualiza solo;
  - la caja se alimenta sola;
  - nada se borra;
  - los indicadores se ven sin consolidar a mano. [MU]
- **Respuesta sugerida:** "Tres cosas cambian. Al registrar una venta, el stock se descuenta solo. La caja se alimenta sola con cada venta y cada anulación, sin cargas manuales. Y nada se borra: dar de baja desactiva, así que el historial queda intacto. Además, lo que antes requería consolidar planillas, como las ventas del mes o los principales clientes, ahora está en la pantalla de inicio."

### N8 — Principal limitación
- **Puntos:** distinguir lo funcional de lo técnico y de seguridad, y elegir una con argumento.
- **Respuesta sugerida:** "En seguridad, la más relevante es que no puedo revocar sesiones: como los tokens no se persisten, si alguien cambia su contraseña porque se la robaron, el intruso conserva su token de renovación hasta siete días. En lo funcional, la caja refleja lo facturado y no lo cobrado, porque no hay circuito de cobranzas ni cuenta corriente. Las dos están documentadas, y la primera es la número uno del trabajo futuro."
- **Repregunta:** "¿Por qué no lo resolviste si sabías que existía?"
- **Respuesta:** "Por alcance y prioridad. En el contexto de uso, que son cinco usuarios en una red de la empresa, el riesgo es acotado, y la solución está bien delimitada: una entidad, una migración y cambios en un único módulo. Preferí documentarla con precisión antes que dejarla oculta."

### N9 — ¿Por dónde seguirías?
- **Respuesta sugerida:** "Prioridad alta: persistir los refresh tokens para poder revocarlos, hacer la pantalla de personal (el servicio ya existe) e incorporar el IVA (el modelo ya lo soporta). Después vienen materias primas, que es requisito de producción; luego producción, que cierra el circuito interno; proveedores y pagos, y cobranzas. Lo último sería la factura electrónica, por su complejidad externa."

### N10 — ¿Qué harías distinto? **[RECOMENDACIÓN — opinión tuya, no está documentado]**
- **Respuesta sugerida (adaptala):** "Agregaría antes las pruebas de la capa de reportes y de los módulos maestros, que hoy tienen cobertura indirecta. Haría que el ingreso de stock use el mismo incremento atómico que la venta (ver D1). Persistiría los refresh tokens desde el principio. Y prepararía antes los artefactos de despliegue, para no depender del entorno local."

---

## 3. Preguntas técnicas

| # | Categoría | Dif. | Pregunta | Qué evalúa |
|---|---|---|---|---|
| T1 | Arquitectura | 🟢 | Describí la arquitectura | Visión general |
| T2 | Arquitectura | 🟡 | ¿Por qué monolito modular y no microservicios? | Justificación |
| T3 | Arquitectura | 🟡 | ¿Por qué SPA + API y no renderizado en servidor? | Justificación |
| T4 | Backend | 🟡 | ¿Qué recorrido hace una petición en el servidor? | Capas, responsabilidades |
| T5 | Backend | 🟡 | ¿Cómo validás los datos? | Zod, dos capas |
| T6 | Backend | 🟡 | ¿Cómo manejás los errores? | Manejador centralizado |
| T7 | API | 🟡 | ¿Por qué 422 y no 400 para stock insuficiente? | Semántica HTTP |
| T8 | BD | 🟢 | ¿Cuáles son las entidades principales? | Modelo |
| T9 | BD | 🟡 | ¿Por qué Decimal y por qué los importes viajan como string? | Precisión |
| T10 | BD | 🟡 | ¿Por qué baja lógica? | Integridad histórica |
| T11 | BD | 🔴 | El stock está desnormalizado: ¿por qué y cómo garantizás la consistencia? | Modelado |
| T12 | BD | 🟡 | ¿UUID o autoincremental? | Claves |
| T13 | BD | 🟡 | ¿Cómo versionás el esquema? ¿Qué hace el seed? | Migraciones |
| T14 | Seguridad | 🟢 | ¿Cómo funciona la autenticación? | JWT |
| T15 | Seguridad | 🔴 | ¿Por qué los permisos no van dentro del token? | Trade-off |
| T16 | Seguridad | 🟡 | ¿Cómo funciona la autorización? ¿Por qué en dos capas? | RBAC |
| T17 | Seguridad | 🟡 | ¿Cómo guardás las contraseñas? | Hash |
| T18 | Seguridad | 🔴 | Explicá el diseño de la recuperación de contraseña | Diseño seguro |
| T19 | Seguridad | 🔴 | ¿Por qué localStorage y no cookies HttpOnly? | XSS/CSRF |
| T20 | Seguridad | 🟡 | ¿Cómo te protegés de inyección SQL, XSS y CORS? | Conceptos generales |
| T21 | Frontend | 🟡 | ¿Por qué signals y no NgRx? | Gestión de estado |
| T22 | Frontend | 🟡 | ¿Cómo funciona la renovación automática? | Interceptores |
| T23 | Frontend | 🟡 | ¿Qué hacen el lazy loading y los guards? | Rutas |
| T24 | Frontend | 🟡 | ¿Cómo funciona la grilla compartida? | Reutilización, UX |
| T25 | Reportes | 🔴 | ¿Cómo diseñaste la capa de reportes? | Separación de responsabilidades |
| T26 | Dashboard | 🔴 | ¿Por qué agregás la serie temporal en la app y no en SQL? | Zona horaria |
| T27 | Calidad | 🟡 | ¿Cuál es tu estrategia de pruebas? | Testing |
| T28 | DevOps | 🟡 | ¿Cómo se instala y qué hace la CI? | Infraestructura |
| T29 | Rendimiento | 🟡 | ¿Cómo evitás traer demasiados datos? | Paginación, topes |

### T1 — Arquitectura
- **Puntos:**
  - monolito modular en 2 procesos;
  - HTTP/JSON;
  - una sola BD relacional;
  - SMTP opcional;
  - sin colas ni caché;
  - monorepo con pnpm.
- **Respuesta sugerida:** "Es un monolito modular distribuido en dos procesos. Por un lado, una SPA en Angular 19 que corre en el navegador. Por otro, una API REST en Node con Express y TypeScript, que concentra las reglas de negocio y accede a PostgreSQL mediante Prisma. Se comunican solo por HTTP con JSON. El único componente externo es un servidor SMTP opcional para recuperar contraseñas. No hay colas, caché ni servicios intermedios, y eso es deliberado. Todo está en un monorepo con pnpm workspaces y un único lockfile."
- **Repregunta:** "¿Qué significa 'modular' si es un solo proceso?"
- **Respuesta:** "Que el código está dividido en módulos con límites claros (auth, inventario, comercial, finanzas, reportes, auditoría), todos con la misma estructura de rutas, controlador, servicio y DTO. Un servicio nunca llama al de otro módulo. Eso permitiría extraer un módulo en el futuro sin reescribirlo."

### T2 — ¿Por qué no microservicios?
- **Puntos:**
  - 5 usuarios;
  - la complejidad operativa;
  - la consistencia eventual;
  - **la venta toca stock, ventas y caja de forma atómica: en un monolito es una transacción, en microservicios exigiría compensaciones (sagas)**.
- **Respuesta sugerida:** "Para cinco usuarios, los microservicios solo agregan costo: comunicación por red, despliegue de varios servicios y consistencia eventual. El argumento técnico más fuerte es que la operación crítica, la venta, modifica stock, ventas y caja de forma indivisible. Con una base, eso es una transacción. Con servicios separados necesitaría un protocolo de compensación."
- **Repregunta:** "¿Cómo se llama ese protocolo?" **[CONOC. ADICIONAL]**
- **Respuesta:** "El patrón saga: cada servicio hace su parte y, si algo falla, se ejecutan acciones compensatorias para deshacer lo anterior. Es mucho más complejo que un ROLLBACK."

### T3 — SPA separada
- **Respuesta sugerida:** "La interfaz es muy interactiva: el formulario de venta tiene líneas dinámicas y un total en vivo, y las grillas tienen búsqueda incremental, diálogos y gráficos. Separar el cliente del servidor además deja la API disponible para otros consumidores. Lo que asumí a cambio es gestionar la autenticación con tokens y habilitar CORS en desarrollo."

### T4 — Recorrido de una petición
- **Puntos:**
  - middlewares globales;
  - router (authenticate → requirePermission → validate);
  - controlador (no toca la BD ni maneja errores, hace `next(err)`);
  - servicio (no conoce req/res, abre transacciones y audita);
  - Prisma;
  - manejador de errores al final.
- **Respuesta sugerida:** "La petición pasa primero por los middlewares globales: helmet, CORS, compresión, parseo del JSON y rate limit. Después llega a la ruta del módulo, que aplica tres barreras: autenticación, permiso y validación del esquema con Zod. El controlador traduce HTTP al dominio, llama al servicio y elige el código de respuesta. El servicio aplica las reglas, abre transacciones y registra la auditoría, sin conocer req ni res. Si algo falla, el error va con `next` al manejador centralizado."
- **Repregunta:** "¿Por qué el servicio no debe conocer `req` y `res`?"
- **Respuesta:** "Para poder invocarlo desde otros contextos que no sean HTTP, como un script, una tarea o un test, y para que la lógica de negocio no dependa del framework web."

### T5 — Validación
- **Puntos:**
  - esquemas Zod declarativos;
  - el middleware `validate` **reemplaza** `req.body`/`query` con el dato ya normalizado y convertido;
  - los tipos de los DTO se **derivan** del esquema (`z.infer`);
  - las variables de entorno se validan al arrancar;
  - en el front, la validación es preventiva (UX).
- **Respuesta sugerida:** "Toda entrada se valida con esquemas Zod en un middleware antes de llegar al controlador. No solo verifica: reemplaza el contenido de la petición por el valor ya normalizado. Por ejemplo, una cantidad que llega como texto pasa a número y un UUID inválido se rechaza. Los tipos TypeScript de los DTO se derivan del mismo esquema, así que validación y tipo no pueden divergir. En el frontend también valido, pero eso es usabilidad: la autoridad es el servidor."
- **Repregunta:** "¿Qué pasa si el front manda un precio en la venta?"
- **Respuesta:** "Se ignora. El esquema de la venta solo admite el id del material y la cantidad. El precio lo toma el servidor del material."

### T6 — Manejo de errores
- **Puntos:**
  - un único manejador al final;
  - la clasificación: validación → 400 con el detalle por campo; AppError → su código; unicidad de la BD → 409; registro inexistente → 404; cualquier otro → 500 genérico, con el detalle en el log;
  - el caso de la respuesta ya iniciada (descarga): delega y corta la conexión;
  - las fábricas de AppError;
  - nunca se filtran detalles internos.
- **Respuesta sugerida:** "Los controladores no manejan errores: los pasan con `next` a un manejador único que los clasifica. Uno de validación da 400 con el detalle por campo. Uno de aplicación sale con el código que declara. Una violación de unicidad de la base da 409. Un registro inexistente da 404. Cualquier otro da un 500 con mensaje genérico, y el detalle queda en el log del servidor, así que no se filtra información interna. Hay un caso especial: si la respuesta ya empezó a enviarse, como en una descarga de Excel, no puedo cambiarla por un JSON de error, así que el manejador delega y corta la conexión. Prefiero eso a entregar un archivo corrupto."
- **Repregunta:** "¿Y en el frontend?"
- **Respuesta:** "Un interceptor de errores muestra un toast con el mensaje del servidor. Como el contrato de error es uniforme, la extracción es siempre igual. Ignora los 401, porque esos los maneja el interceptor de renovación, y si el error llega como Blob (una descarga fallida) lo lee como texto."

### T7 — 422 vs 400
- **Respuesta sugerida:** "El 400 es una petición mal formada o que viola una regla detectable a priori, como un UUID inválido o un cliente dado de baja. El 422 es una petición correcta que el estado actual del sistema impide cumplir. Pedir 20 unidades está bien formulado: lo que pasa es que hoy hay 8. Lo mismo vale para anular una venta que ya no está confirmada."
- **Repregunta:** "¿Y por qué un cliente inactivo es 400 y no 422?" **[INFERENCIA — punto discutible]**
- **Respuesta honesta:** "Es un límite discutible. Lo traté como dato de entrada inválido: el cliente referenciado no es elegible. Se podría argumentar que también es estado del sistema. Lo importante es que el criterio está documentado y es consistente dentro del sistema."

### T8 — Entidades principales
- **Respuesta sugerida:** "Hay 22 entidades, de las que 15 se usan. Las centrales son:
  - Usuario, Rol, Permiso y RolPermiso para el acceso;
  - Categoría, Material y MovimientoDeStock para el inventario;
  - Cliente, Venta y LíneaDeVenta para lo comercial;
  - Caja y MovimientoDeCaja para finanzas;
  - AuditLog y el token de recuperación.

  La venta se relaciona con el cliente, con el usuario que la creó y con sus líneas (con borrado en cascada). Cada línea apunta a un material. Los movimientos de stock y de caja referencian la venta que los originó."
- **Repregunta:** "¿Las 7 restantes?"
- **Respuesta:** "Son materia prima y su movimiento, registro y consumo de producción, proveedor, pago a proveedor y comprobante. Están en el esquema pero ningún código las usa."

### T9 — Decimal
- **Puntos:**
  - float binario: 0,1 + 0,2 ≠ 0,3;
  - columnas Decimal(12,2) para importes y (12,3) para cantidades;
  - decimal.js en el back **y en el front**;
  - los importes viajan como string para no perder precisión al serializar.
- **Respuesta sugerida:** "El punto flotante binario no representa exactamente muchos decimales: 0,1 más 0,2 no da exactamente 0,3. Acumulado en miles de ventas, aparecen diferencias de centavos entre el detalle y el total. Por eso uso columnas decimales en la base y decimal.js en la aplicación. Los importes viajan como string en el JSON, porque convertirlos a número de JavaScript reintroduciría el problema. El front usa la misma biblioteca para la vista previa del total, pero ese cálculo no tiene autoridad: lo que se guarda lo calcula el servidor."

### T10 — Baja lógica
- **Respuesta sugerida:** "Nada se borra físicamente: se marca `isActive = false`. Así se preserva el historial y la integridad referencial. Una venta vieja de un cliente dado de baja se sigue consultando y el reporte histórico sigue siendo correcto. En la API se usa el verbo DELETE, que expresa la intención de dar de baja y no la operación física."
- **Repregunta:** "¿Se puede reactivar?" **[CÓDIGO]**
- **Respuesta:** "Para usuarios sí: el formulario de edición tiene un switch de 'Usuario activo' y el esquema acepta `isActive`. Para clientes y materiales, el esquema de modificación no admite `isActive`, así que hoy no hay reactivación desde la aplicación. El manual indica consultar a la administración, lo que en la práctica significa tocar la base."

### T11 — Stock desnormalizado 🔴
- **Puntos:**
  - `currentStock` podría derivarse sumando los movimientos;
  - se guarda calculado porque consultar la disponibilidad es la operación más frecuente;
  - la consistencia se mantiene actualizando el valor y el movimiento en la misma transacción;
  - pasa lo mismo con el saldo de la caja;
  - el stock no se puede editar por la API de materiales.
- **Respuesta sugerida:** "Sí, el stock y el saldo de la caja son valores desnormalizados. Podría calcularlos sumando movimientos, pero consultar la disponibilidad es lo más frecuente y no quería una agregación en cada consulta. La consistencia la garantizo actualizando siempre el valor y su movimiento dentro de la misma transacción. Además, el stock no se puede modificar directamente: solo con un ingreso, un ajuste o una venta."
- **Repregunta peligrosa:** "¿Siempre? ¿También en el ingreso manual?" → **ver D1: hay un punto débil verificado en el código.**

### T12 — UUID
- **Respuesta sugerida:** "Uso UUID generados por la base. Permiten conocer la clave antes de insertar y no revelan el volumen de operación: con un autoincremental, cualquiera que vea el id 1500 sabe cuántas ventas hubo. El costo es un índice algo más grande, irrelevante en este volumen." (Esa última frase es **[CONOC. ADICIONAL]**.)

### T13 — Migraciones y seed
- **Respuesta sugerida:** "El esquema se versiona con migraciones de Prisma. Hay tres: la inicial con las 22 entidades, la del vendedor de la venta y la de los tokens de recuperación. Son pocas porque modelé todo el alcance desde el principio. El seed es idempotente y no es opcional: crea los 41 permisos, los 5 roles, un usuario por rol, dos categorías y la caja de ventas. Sin la caja, la venta se rechaza con un error explícito."
- **Repregunta:** "¿Por qué `createdById` es nullable?"
- **Respuesta:** "Porque se agregó con una migración posterior y las ventas anteriores no tienen ese dato. La UI muestra un guion y el reporte lo contempla."

### T14 — Autenticación
- **Puntos:**
  - dos JWT: access de 15 min (con id, email y rol) y refresh de 7 días;
  - **secretos distintos**;
  - sin sesiones persistidas;
  - el header `Bearer`;
  - el perfil se obtiene con `/auth/me`.
- **Respuesta sugerida:** "Al hacer login con email y contraseña, el servidor devuelve dos JWT firmados con secretos distintos: uno de acceso de 15 minutos, que acompaña cada petición, y uno de renovación de 7 días, que sirve para pedir un par nuevo sin credenciales. La validez se determina por firma y vencimiento, sin tabla de sesiones. La vigencia corta del de acceso acota el daño si lo interceptan, y el de renovación evita pedir la contraseña cada 15 minutos."
- **Repregunta:** "¿Por qué secretos distintos?"
- **Respuesta:** "Si se filtra el secreto del token de acceso, no permite fabricar tokens de renovación, que son los de vida larga."

### T15 — Permisos en la BD 🔴
- **Respuesta sugerida:** "El middleware verifica la firma y después consulta en la base los permisos del rol. Podría haberlos puesto en el token y ahorrar la consulta, pero entonces un cambio en los permisos de un rol recién se aplicaría cuando venciera el token. Consultando, el cambio rige en la petición siguiente. Con cinco usuarios, el costo de una consulta por petición es irrelevante."
- **Repregunta trampa:** "¿Y si cambio el rol de un usuario o lo doy de baja, también es inmediato?" → **ver D2 [CÓDIGO]: no lo es.**

### T16 — Autorización
- **Puntos:**
  - RBAC: usuario → rol → permisos `módulo.acción` y `admin.*`;
  - cada ruta declara su permiso;
  - **la verificación en el cliente es UX, la del servidor es la de seguridad**;
  - 401 ≠ 403.
- **Respuesta sugerida:** "Es control de acceso basado en roles. Cada usuario tiene un rol, cada rol un conjunto de permisos con formato `módulo.acción`, y Administración tiene el comodín. Cada ruta del servidor declara el permiso que exige, al lado de su definición. En el cliente, los guards y el filtrado del menú usan la misma regla, pero eso es usabilidad: el código del navegador se puede modificar. Si alguien arma la petición a mano, el servidor responde 403."
- **Repregunta:** "¿Diferencia entre 401 y 403 en tu sistema?"
- **Respuesta:** "Un 401 es que no hay sesión válida, y el cliente lo interpreta como orden de renovar el token. Un 403 es que hay sesión pero falta el permiso, y no dispara la renovación."

### T17 — Contraseñas
- **Respuesta sugerida:** "Se guardan con una función de derivación con sal incorporada y coste 10; en el código es `bcryptjs`. Es deliberadamente lenta para encarecer la fuerza bruta si se filtra la base. La contraseña nunca se guarda ni se devuelve: la proyección del servicio de usuarios nunca incluye el hash. La política es de 8 caracteres mínimo, igual en el alta y en el restablecimiento."
- **Repregunta:** "¿Qué es la sal?" **[CONOC. ADICIONAL]**
- **Respuesta:** "Un valor aleatorio por contraseña que se combina antes del hash. Hace que dos contraseñas iguales produzcan hashes distintos e invalida las tablas precalculadas (rainbow tables)."

### T18 — Recuperación de contraseña 🔴
- **Puntos:**
  - token aleatorio de 256 bits generado criptográficamente;
  - **se guarda solo el SHA-256** del token;
  - vigencia de 30 min;
  - uso único mediante un UPDATE condicional `usedAt IS NULL` en una transacción;
  - al consumirse, se borran los demás tokens del usuario (y al pedir uno nuevo también **[CÓDIGO]**, ver §7.2);
  - respuesta invariable (anti-enumeración);
  - el envío de mail nunca lanza una excepción;
  - rate limit de 5 cada 15 min;
  - la auditoría no guarda valores.
- **Respuesta sugerida:** "Es el flujo más cuidado, porque son endpoints públicos que emiten credenciales. Genero un token aleatorio de 256 bits y guardo solo su hash SHA-256: si se filtra la base, no se pueden reconstruir los enlaces. Vence en 30 minutos y es de un solo uso. Lo consumo con un UPDATE condicional dentro de una transacción, así que dos usos simultáneos no pueden pasar. La respuesta a 'olvidé mi contraseña' es siempre la misma, exista o no el email, y el envío de mail nunca propaga errores, porque una respuesta distinta revelaría que la cuenta existe. Además, esos endpoints tienen un rate limit de 5 peticiones cada 15 minutos."
- **Repregunta:** "¿Por qué no un JWT para el reset, sin tabla?"
- **Respuesta:** "Porque un JWT no admite uso único ni revocación: vale hasta que vence. La tabla me da las dos cosas a cambio de una entidad y una migración."
- **Repregunta 2:** "¿Por qué SHA-256 y no bcrypt para el token?" **[CONOC. ADICIONAL]**
- **Respuesta:** "bcrypt es lento a propósito porque las contraseñas tienen poca entropía. El token tiene 256 bits aleatorios: la fuerza bruta es inviable aunque el hash sea rápido. Además, un hash determinístico me permite buscar el token por igualdad."

### T19 — localStorage vs cookies 🔴
- **Respuesta sugerida:** "Los tokens están en localStorage, así que la sesión sobrevive a recargas y cierres de pestaña. La debilidad es que cualquier script de la página puede leerlos: si hubiera una vulnerabilidad XSS, se podrían robar. La alternativa estándar son las cookies HttpOnly, que el JavaScript no puede leer, pero entonces el navegador las envía solo y aparece el riesgo de CSRF, que exige tokens anti-CSRF o SameSite. Elegí el esquema más simple y acoté el riesgo con la vigencia de 15 minutos del token de acceso. Está documentado como limitación."
- **Repregunta:** "Pero el refresh dura 7 días y también está en localStorage."
- **Respuesta honesta:** "Es cierto: si se roba el refresh, la ventana es de siete días, no de quince minutos. Por eso persistir y poder revocar los refresh tokens es la prioridad número uno del trabajo futuro."

### T20 — Inyección SQL, XSS, CORS **[mezcla de DT y CONOC. ADICIONAL]**
- **Respuesta sugerida:** "Para inyección SQL, todas las consultas pasan por Prisma, que usa consultas parametrizadas, y además la entrada se valida con Zod. Para XSS, Angular escapa por defecto lo que se interpola en las plantillas; esto es conocimiento del framework, no algo documentado en el informe. La debilidad declarada es el localStorage. Para CORS, el servidor solo acepta el origen del cliente configurado y expone explícitamente los headers `Content-Disposition` y `X-Report-Rows`, que hacen falta para la descarga. Helmet agrega los headers de seguridad."
- **Repregunta:** "¿Y CSRF?"
- **Respuesta:** "Como el token va en el header Authorization y no en una cookie, el navegador no lo adjunta automáticamente a peticiones de otros sitios, así que CSRF no aplica de la forma clásica." **[CONOC. ADICIONAL]**

### T21 — Signals vs NgRx
- **Respuesta sugerida:** "El único estado compartido real es la sesión del usuario y sus permisos. Todo lo demás es estado local de cada pantalla. NgRx, con acciones, reducers y efectos, habría multiplicado el código sin resolver un problema real. Con signals, el estado se declara y los valores derivados con `computed` se recalculan solos. La señal del usuario se expone como solo lectura y únicamente el AuthService la modifica. Además, combinada con OnPush, el framework solo redibuja lo que cambió."
- **Repregunta:** "¿Cuándo usarías NgRx?" **[CONOC. ADICIONAL]**
- **Respuesta:** "Cuando haya mucho estado compartido entre pantallas, con flujos complejos, caché de entidades o necesidad de depurar el historial de acciones."

### T22 — Renovación automática
- **Respuesta sugerida:** "El interceptor JWT adjunta el token a cada petición. Si recibe un 401 y no es un endpoint de autenticación, pide un par nuevo con el refresh token y reintenta la petición original una sola vez. Si la renovación falla, cierra la sesión. El límite de un reintento evita un bucle infinito. Los endpoints de autenticación se excluyen porque un login con credenciales incorrectas da 401 y no tiene sentido renovar."
- **Repregunta:** "¿Qué pasa si 5 peticiones reciben 401 a la vez?" **[INFERENCIA — no documentado]**
- **Respuesta honesta:** "Según el código documentado, cada una dispararía su propio refresh: no hay una cola que comparta una única renovación. Funciona, porque cada refresh devuelve un par válido, pero es ineficiente. Una mejora sería compartir la renovación en curso entre las peticiones."

### T23 — Lazy loading y guards
- **Respuesta sugerida:** "Cada área se carga con `loadChildren` la primera vez que se navega a ella, así que un usuario de Stock nunca descarga el código de ventas o reportes. Hay un `authGuard` sobre el grupo protegido, que guarda el `returnUrl`, y un guard de permiso en cada ruta hija, que lee el permiso declarado en `data`. Además, el `APP_INITIALIZER` recupera el perfil antes del primer render, para que el menú aparezca ya filtrado."

### T24 — Grilla compartida
- **Respuesta sugerida:** "Seis pantallas usan la misma grilla, con paginación en el servidor, búsqueda con debounce de 300 ms y cancelación automática de suscripciones. Tiene un modo de búsqueda obligatoria: en clientes, materiales y usuarios no consulta hasta que hay 2 caracteres, porque traer el catálogo completo no sirve para buscar uno. En ventas, caja y auditoría arranca con el día de hoy."

### T25 — Reportes 🔴
- **Puntos:**
  - 3 piezas: definición (dominio), generador (formato) y controlador (HTTP);
  - un catálogo indexado por clave, con la ruta `/:key/excel`, así que agregar un reporte no toca las rutas;
  - el grano es la línea;
  - el tope de 20.000 filas se verifica con `take: limit + 1`;
  - **todo lo que puede fallar ocurre antes del primer byte**;
  - los headers;
  - la corrección de la zona horaria;
  - el logo es tolerante a su ausencia;
  - el total suma `sale.total` por venta distinta.
- **Respuesta sugerida:** "Separé tres responsabilidades. La definición del reporte sabe qué datos trae y cómo se presentan las columnas. El generador de Excel sabe volcar eso a un archivo, sin saber qué representa. El controlador solo lo entrega por HTTP. Las definiciones se registran en un catálogo por clave, así que agregar un reporte es escribir una definición, sin tocar rutas ni generador. Lo más importante es el orden: valido, consulto y verifico el tope antes de escribir el primer byte, porque una vez enviadas las cabeceras ya no puedo responder con un error. Para el tope de 20.000 filas pido una fila más: si viene, rechazo sin cargar todo en memoria."
- **Repregunta:** "¿Por qué una fila por línea y no por venta?"
- **Respuesta:** "Porque es el grano más fino. Con una tabla dinámica, el usuario arma cualquier corte (por cliente, material, mes o vendedor) sin pedirme otro reporte. Por eso escribo los números como números, con autofiltro y encabezado fijo."

### T26 — Agregación temporal 🔴
- **Respuesta sugerida:** "Las fechas se guardan en UTC, sin zona. Si agrupara por día en SQL, una venta de las 21 de Argentina caería al día siguiente. Por eso traigo las ventas del período y agrupo en la aplicación con la hora del servidor, que es el mismo criterio de los indicadores, y así el total del día del gráfico coincide con el indicador 'ventas de hoy'. Emito también los intervalos vacíos para que el gráfico no simule continuidad, y hay un tope de 366 días, 120 semanas o 60 meses."
- **Repregunta:** "¿Y si escalan los datos?"
- **Respuesta:** "Se reemplaza la consulta por una que convierta la zona en la base, con `AT TIME ZONE`, sin cambiar el contrato de respuesta." (La sintaxis exacta es **[CONOC. ADICIONAL]**; la doc solo dice "convertir la zona horaria en la base".)

### T27 — Pruebas
- **Respuesta sugerida:** "Hay 64 casos automatizados: 38 en el backend y 26 en el frontend, con estrategias distintas. El backend se prueba con integración contra una PostgreSQL real, porque las garantías importantes (atomicidad y concurrencia) son propiedades del motor: un mock devolvería lo que yo le diga y no demostraría nada. El frontend se prueba por componente, con peticiones simuladas, porque no tiene reglas de negocio y el riesgo está en el comportamiento de la interfaz. Las pruebas clave son la reversión total ante stock insuficiente, la concurrencia (dos ventas en paralelo, de las que solo una se confirma) y el ciclo completo de anulación."
- **Repregunta:** "¿Qué cobertura tenés?"
- **Respuesta:** "No publiqué un porcentaje porque no lo medí: la herramienta está instalada, pero no generé el informe. Prefiero describir qué se verifica antes que dar un número no medido. Tampoco hay E2E con navegador, pruebas de carga ni tests del Excel."

### T28 — Instalación y CI
- **Respuesta sugerida:** "`pnpm install` en la raíz, `docker compose up` (Postgres 16, Adminer y Mailpit, que retiene los mails), copiar el `.env`, generar el cliente de Prisma, migrar, correr el seed y levantar back y front. La configuración se valida al arrancar: si falta una variable, el proceso no arranca. La CI tiene dos jobs: el backend levanta una Postgres real, aplica migraciones y seed y corre la suite; el frontend corre los tests en un Chrome headless. Se instala con el lockfile congelado para que las versiones sean idénticas a las locales."
- **Repregunta:** "¿Cómo evitás que los tests borren tu base de desarrollo?"
- **Respuesta:** "El setup de los tests exige un `.env.test` y `NODE_ENV=test`. Si no están, falla antes de tocar nada."

### T29 — Volumen
- **Respuesta sugerida:** "Toda la paginación es en el servidor: 20 por omisión y 100 como máximo. Un `limit` mayor se recorta, no se rechaza, así que nadie puede pedir la tabla entera. El reporte tiene un tope de 20.000 filas y la serie temporal tiene topes de puntos. En las grillas, el debounce evita una petición por tecla."

---

## 4. Preguntas mixtas

| # | Dif. | Pregunta | Área técnica |
|---|---|---|---|
| M1 | 🟡 | El vendedor registra una venta con tres materiales: ¿qué pasa desde que hace clic hasta que ve el detalle? | Flujo completo front-back-BD |
| M2 | 🔴 | Dos vendedores venden al mismo tiempo el último stock de un material | Concurrencia |
| M3 | 🟡 | El usuario carga el mismo material en dos líneas | Agregación previa |
| M4 | 🟡 | Se actualiza la lista de precios: ¿qué pasa con las ventas y reportes anteriores? | Precio congelado |
| M5 | 🟡 | Se anula una venta (y dos personas la anulan a la vez) | Anulación atómica |
| M6 | 🟡 | El usuario confunde Ingreso con Ajuste. ¿Por qué no hay salida manual? | Semántica de movimientos |
| M7 | 🟡 | Un cliente se da de baja: ¿qué pasa con sus ventas, con las nuevas y con las anulaciones? | Baja lógica |
| M8 | 🟡 | Finanzas filtra la caja por semana y el saldo "no coincide" | Saldo desnormalizado |
| M9 | 🟡 | Piden el reporte de dos años | Topes, memoria |
| M10 | 🟡 | El token vence mientras el usuario completa un formulario | Interceptor |
| M11 | 🔴 | Despiden a un empleado y lo das de baja: ¿pierde el acceso al instante? | Autenticación (punto débil) |
| M12 | 🟡 | Un usuario de Stock intenta ver las ventas escribiendo la URL o usando Postman | Autorización en dos capas |
| M13 | 🟡 | Alguien olvidó la contraseña y no hay SMTP configurado | Mail opcional |

### M1 — Una venta de punta a punta
- **Puntos:**
  - formulario reactivo con líneas dinámicas;
  - `computed` para la vista previa con decimal.js;
  - el servicio de ventas hace el POST;
  - el interceptor adjunta el token;
  - helmet, rate limit, authenticate, `commercial.create` y validate con Zod;
  - controlador → `salesService.create` → `$transaction` con los 8 pasos;
  - auditoría fuera de la transacción;
  - 201 `{data}`;
  - el front navega al detalle.
- **Respuesta sugerida:** "En el front, el formulario calcula una vista previa del total con decimal.js mediante una señal computada. Al hacer clic en Registrar, el servicio hace un POST con el cliente, el medio de pago y las líneas (material y cantidad, sin precios), y el interceptor agrega el Bearer. En el servidor se verifica el token y el permiso `commercial.create`, y Zod valida el cuerpo. El servicio abre una transacción, verifica el cliente y la caja, agrega las cantidades por material, descuenta con un UPDATE condicional, arma las líneas con el precio vigente, crea la venta, los movimientos de salida y el ingreso en la caja, y actualiza el saldo. Si todo sale bien, hace commit, registra la auditoría y devuelve 201. El front navega al detalle. Si algo falla, rollback total, y el interceptor muestra el mensaje sin perder el formulario."

### M2 — Concurrencia sobre el último stock 🔴
- **Respuesta sugerida:** "Sea un stock de 100 y dos ventas de 60 a la vez. Si leyera, comparara y después restara, las dos leerían 100, las dos pasarían la verificación y quedaría 40: habría vendido 120 de 100. Es una actualización perdida. Lo resuelvo con un UPDATE que lleva la condición adentro: `SET stock = stock - 60 WHERE id = X AND stock >= 60`. El motor bloquea la fila. La segunda transacción espera, reevalúa la condición con el valor actualizado (40), afecta cero filas y la rechazo con 422 con rollback. Lo verifica un test que lanza dos ventas en paralelo contra una base real."

### M3 — Mismo material en dos líneas
- **Respuesta sugerida:** "Antes de verificar, agrupo las cantidades por material en un Map. Dos líneas de 60 se verifican como 120. Si validara línea por línea, cada una pasaría contra un stock de 100 por separado."

### M4 — Cambio de precios
- **Respuesta sugerida:** "Cada línea copia el precio del material al momento de la venta: no lo referencia. Si hoy cambio la lista, las ventas de ayer conservan su precio y los reportes de meses cerrados dan siempre lo mismo. Además, el precio es autoridad del servidor: el cliente no puede mandarlo."
- **Repregunta:** "¿Y si cambio el nombre del cliente?" **[INFERENCIA, coherente con el MU]**
- **Respuesta:** "Eso sí se refleja en las ventas viejas, porque la venta referencia al cliente y no copia sus datos. Para facturación fiscal habría que congelar también los datos del cliente en el comprobante."

### M5 — Anulación
- **Respuesta sugerida:** "Es el inverso exacto de la venta, en una transacción. Primero, `UPDATE sale SET status = CANCELLED WHERE id = X AND status = CONFIRMED`. Si afecta cero filas, la rechazo con 422. Así, ante dos anulaciones simultáneas, solo una prospera y no se repone el stock dos veces. Después genero un movimiento IN por cada línea, sumo el stock y, por cada movimiento de caja de la venta, creo uno negativo y resto el saldo. No borro el original: queda el ingreso y su reversión, que suman cero. No verifico que el cliente siga activo, porque es una operación correctiva."
- **Repregunta:** "¿Por qué iterás los movimientos de caja y no usás el total de la venta?"
- **Respuesta:** "Porque hay ventas anteriores a la incorporación de la caja que no tienen movimiento. Iterando lo efectivamente registrado, esas se anulan sin tocar el saldo."

### M6 — Ingreso vs Ajuste
- **Respuesta sugerida:** "El Ingreso suma y el Ajuste reemplaza el valor, después de un recuento físico. No hay salida manual: el esquema de Zod rechaza `OUT`, así que toda salida de mercadería tiene una venta detrás. Para roturas, el manual indica hacer un ajuste al valor real con el motivo en la referencia."
- **Repregunta trampa:** "¿Y si se rompió todo el stock y tengo que dejarlo en 0?" **[CÓDIGO — punto débil]**
- **Respuesta honesta:** "Hoy el esquema exige una cantidad mayor que cero también para el ajuste, así que no se puede ajustar a 0 desde la aplicación. Es una limitación que no está documentada. La corrección sería permitir 0 en el caso `ADJUST`."

### M7 — Cliente dado de baja
- **Respuesta sugerida:** "Sus ventas se conservan y siguen siendo consultables y reportables. No aparece en el selector de la venta (el front filtra los activos), y si igual llega su id, el servidor lo rechaza con 400 porque verifica `isActive`. Sí se pueden anular sus ventas, porque la anulación es correctiva."

### M8 — Saldo vs filtro
- **Respuesta sugerida:** "El saldo es el acumulado total, guardado en la caja. El filtro de fechas solo afecta el listado de movimientos. Hay un test específico que verifica que el saldo no cambia al filtrar, porque si se invirtiera mostraría un dato incorrecto con apariencia de correcto."

### M9 — Reporte enorme
- **Respuesta sugerida:** "El Excel se construye en memoria. Para protegerla hay un tope de 20.000 filas. Pido una fila más y, si viene, rechazo con 422 y el mensaje 'Achicá el rango de fechas', antes de generar nada. Si hiciera falta más, la solución sería generar el archivo en streaming o con una cola, que fue justamente lo que se descartó por no tener un problema real que lo justificara."

### M10 — Token vencido a mitad de trabajo
- **Respuesta sugerida:** "Es transparente. La petición de guardar recibe un 401, el interceptor renueva con el refresh, reintenta una vez y el usuario no se entera. Solo si el refresh también venció (más de 7 días) se cierra la sesión."

### M11 — Baja de un empleado 🔴 **[CÓDIGO]**
- **Respuesta honesta sugerida:** "No pierde el acceso al instante. El login y el refresh rechazan a un usuario inactivo, pero el middleware de autenticación, en cada petición, verifica la firma y resuelve los permisos a partir del `roleId` que viaja en el token: no vuelve a consultar si el usuario sigue activo. Entonces, un usuario dado de baja conserva el acceso hasta que vence su token de acceso, como máximo 15 minutos. Pasa lo mismo si le cambio el rol. Es una consecuencia del esquema sin estado. La mejora es simple: en el middleware, consultar el usuario (`isActive` y `roleId` actuales) en lugar del rol del token. Ya hago una consulta por petición, así que cambiaría a un join con el usuario."

### M12 — Stock intenta ver ventas
- **Respuesta sugerida:** "En la interfaz, la opción no aparece en el menú, y si escribe la URL, el guard de permiso lo redirige al inicio. Pero eso es usabilidad. Si usa Postman con su token, el servidor verifica `commercial.read` en esa ruta y responde 403 'Falta el permiso: commercial.read'."

### M13 — Sin SMTP
- **Respuesta sugerida:** "El SMTP es opcional. Si no está configurado, la función de envío registra el mail con el enlace en el log del servidor y devuelve false, sin lanzar errores, y al arrancar en producción sin SMTP se emite una advertencia. En desarrollo se usa Mailpit, que retiene los correos en una bandeja web en el puerto 8025. La respuesta al usuario es siempre la misma."

---

## 5. Preguntas difíciles del tribunal

### D1 — "En el capítulo VIII explicás la actualización perdida. ¿El ingreso manual de stock está protegido de la misma forma?" **[CÓDIGO — PUNTO DÉBIL REAL]**
**Por qué podrían preguntarla:** porque el documento dice que el stock "sólo cambia mediante movimientos o por efecto de una venta" y que la consistencia "se garantiza actualizándolos siempre dentro de la misma transacción". Un docente técnico que lea con atención, o que pida ver el código, puede preguntarlo.

**Lo que hace el código** (`finished-products.service.ts:109-126`):
- lee el stock **fuera de la transacción**;
- calcula `nuevo = actual + cantidad` en la aplicación;
- escribe el **valor absoluto** con `update({ currentStock: newStock })`.

Es exactamente el patrón leer → calcular → escribir que el capítulo VIII describe como defectuoso. Si una venta descuenta stock entre la lectura y la escritura del ingreso, el ingreso pisa ese descuento y el stock queda mayor que el real.

**Cómo responder:** "Sí, y es una buena observación. La venta y la anulación usan incremento y decremento atómicos, pero el ingreso manual lee el stock, suma en la aplicación y escribe el resultado. Bajo concurrencia, una venta simultánea podría perder su descuento. La probabilidad es baja con cinco usuarios, pero es el mismo defecto que el capítulo VIII evita, así que lo reconozco como un error. Para el Ingreso, la corrección es usar `increment`, igual que en la anulación. El Ajuste fija un valor por definición: ahí el criterio de negocio es que el recuento físico manda, aunque convendría bloquear la fila durante la operación."

**Posible repregunta:** "¿Por qué no lo detectaron tus tests?"

**Cómo responder:** "Porque el test de concurrencia cubre venta contra venta, no ingreso contra venta. Sería un test nuevo con la misma técnica: dos peticiones en paralelo sobre la base real."

> ⚠️ **Decisión tuya:** reconócelo si te lo preguntan; no lo menciones tú primero salvo que te pidan limitaciones. Nunca afirmes que "todas las modificaciones de stock son atómicas".

### D2 — "Si doy de baja a un usuario o le cambio el rol, ¿el cambio es inmediato?" **[CÓDIGO]**
**Por qué:** la DT afirma que consultar los permisos en la base da efecto inmediato. Es verdad para cambiar los permisos **de un rol**, pero no para cambiar **el rol de un usuario** ni para desactivarlo, porque `authenticate` usa el `roleId` del token y no verifica `isActive`.

**Cómo responder:** "Cambiar los permisos de un rol es inmediato. Cambiar el rol de un usuario o desactivarlo tarda hasta que vence su token de acceso, como máximo 15 minutos, porque el middleware toma el rol del token y no vuelve a consultar el usuario. El refresh sí rechaza a un usuario inactivo, así que no puede extender la sesión. La mejora es consultar el usuario en el middleware en lugar del rol: el costo es el mismo que hoy, una consulta por petición."

**Repregunta:** "¿15 minutos es aceptable?" → "Para este contexto es un riesgo acotado y comparable con el que asumí al elegir JWT sin estado. Para un despido conflictivo no es ideal, y la corrección es barata."

### D3 — "¿Cómo cerrarías la sesión de un atacante que robó un refresh token?"
**Cómo responder:** "Hoy no puedo: no hay estado de sesión y el refresh vale siete días. Es la limitación de seguridad número uno del trabajo futuro. Lo resolvería guardando los refresh tokens (su hash) en una tabla, rotándolos en cada uso e invalidándolos ante un reset de contraseña o un logout. Incluso se puede detectar la reutilización de un token ya rotado como señal de robo." (La rotación y la detección de reutilización son **[CONOC. ADICIONAL]**; persistir e invalidar sí está en la DT.)

**Repregunta:** "Entonces, ¿el logout qué hace?" **[INFERENCIA]** → "Borra los tokens del navegador. En el servidor, el token sigue siendo válido hasta que vence."

### D4 — "¿Qué pasa si pasan de 5 a 200 usuarios?"
**Cómo responder:**
- "La arquitectura no lo impide: el servidor no guarda estado, así que puedo levantar varias instancias detrás de un balanceador.
- Lo primero que revisaría es la consulta de permisos en cada petición, que se podría cachear con una invalidación corta.
- El Excel en memoria pasaría a streaming o a una cola.
- La agregación temporal en la app pasaría a la base con conversión de zona.
- Los selectores de 200 registros pasarían a búsqueda con autocompletado.
- El rate limit por IP en memoria habría que llevarlo a un almacén compartido si hay varias instancias.

No hay pruebas de carga, así que primero mediría." (Lo del rate limit compartido es **[CONOC. ADICIONAL]**.)

### D5 — "¿Puede haber un interbloqueo (deadlock) entre dos ventas?" **[CONOC. ADICIONAL + INFERENCIA]**
**Por qué:** la venta A descuenta los materiales X y luego Y; la venta B, Y y luego X. Cada una bloquea una fila y espera la otra.

**Cómo responder:** "Es posible en teoría, porque los descuentos se hacen en el orden en que llegan los materiales. PostgreSQL detecta el interbloqueo y aborta una de las transacciones, que hace rollback completo: no hay inconsistencia, pero ese usuario recibe un error. La mitigación estándar es ordenar los materiales por id antes de descontar, para que todas las transacciones bloqueen en el mismo orden. No lo implementé ni lo documenté."

### D6 — "¿Por qué la auditoría va fuera de la transacción si así se puede perder?"
**Cómo responder:** "Hay dos razones documentadas. Si estuviera dentro, un rollback también borraría el asiento. Y decidí que un fallo de auditoría no debe impedir una venta válida. El costo es que, si la escritura de auditoría falla o el proceso cae entre el commit y la auditoría, el asiento se pierde y solo queda en el log. Es una limitación declarada. Si la auditoría tuviera valor legal, iría dentro de la transacción o en un outbox."

### D7 — "¿Su caja refleja la realidad financiera?"
**Cómo responder:** "No exactamente, y lo documenté. Por pedido del cliente, toda venta suma a la caja, incluso con cheque o cuenta corriente. El saldo representa lo facturado, no lo cobrado. Para distinguirlos falta un circuito de cobranzas con cuenta corriente, que está en el trabajo futuro de prioridad media."

### D8 — "¿Cómo sabés que funciona lo que no testeaste?"
**Cómo responder:** "Lo verifiqué manualmente: abrí los Excel generados, probé los rate limits a mano y usé la colección de peticiones que recorre el circuito. Lo declaro en el capítulo XII: no hay cobertura medida, ni E2E, ni pruebas de carga, ni tests del Excel, y los módulos maestros tienen cobertura indirecta, porque comparten el patrón verificado en el circuito. Lo crítico, que es la atomicidad y la concurrencia de la venta, sí está probado contra una base real."

### D9 — "Dicen que Producción solo consulta y carga stock, pero en la matriz tiene `inventory.create` e `inventory.update`. ¿Puede cambiar precios?" **[INCONSISTENCIA EN LA DT]**
**Cómo responder:** "Sí. Con esos permisos, Producción puede crear materiales y modificarlos, precio incluido, aunque no darlos de baja. La descripción del capítulo I es una simplificación. Si el cliente quisiera separar quién fija precios, haría falta un permiso más fino, por ejemplo `inventory.price`, o quitarle `inventory.create/update` a Producción y darle un permiso específico para movimientos."

---

## 6. Cadenas de repreguntas

### Cadena 1 — Concurrencia en la venta
- **Inicial:** ¿Cómo evitás vender más stock del que hay?
- → **Repregunta:** ¿Por qué no alcanza con verificar y después descontar?
- → **Profunda:** ¿Qué hace exactamente PostgreSQL cuando dos transacciones hacen ese UPDATE sobre la misma fila? ¿Qué nivel de aislamiento usás?
- → **Cierre:** Entonces, ¿para qué está la pre-verificación del paso 4?

**Qué dominar:**
- la actualización perdida, con el ejemplo 100 / 60 / 60;
- el UPDATE condicional con bloqueo de fila: la segunda espera y **reevalúa el WHERE sobre el valor confirmado**;
- el aislamiento: **[CONOC. ADICIONAL]** Prisma usa por omisión el de PostgreSQL, *Read Committed*, y con él la reevaluación funciona; no hace falta *Serializable* (la DT no menciona el nivel);
- el paso 4 es diagnóstico, no garantía: da un mensaje útil con el disponible y el requerido;
- el bloqueo es por fila, así que materiales distintos no se interfieren.

### Cadena 2 — JWT sin estado
- **Inicial:** ¿Por qué JWT?
- → ¿Qué ventaja tiene no guardar sesiones?
- → ¿Y qué perdés?
- → Si tuvieras que revocar, ¿no volvés a tener estado? ¿Para qué JWT entonces?

**Qué dominar:**
- sin tabla, sin limpieza y servidor escalable horizontalmente;
- se pierde la revocación (el reset no cierra sesiones durante 7 días);
- respuesta de cierre: "Solo persistiría el refresh, que se usa cada 15 minutos. El access seguiría siendo sin estado, así que la mayoría de las peticiones no consultaría esa tabla. Es un híbrido."

### Cadena 3 — Permisos resueltos en la BD
- **Inicial:** ¿Dónde se resuelven los permisos?
- → ¿Por qué no van en el token?
- → ¿No es más lento?
- → ¿Y si le cambio el rol a un usuario?

**Qué dominar:** el trade-off documentado (cambio inmediato contra una consulta por petición) y el matiz de D2 (el `roleId` sale del token).

### Cadena 4 — Decimal
- **Inicial:** ¿Qué tipo usás para los importes?
- → ¿Qué problema tiene el float?
- → ¿Por qué los importes viajan como string?
- → ¿Y el front calcula con float?

**Qué dominar:** 0,1 + 0,2; Decimal(12,2) y (12,3); decimal.js en ambos lados; la vista previa del front con decimal.js sin autoridad; el front convierte a número solo para mostrar o previsualizar.

### Cadena 5 — ORM Prisma
- **Inicial:** ¿Por qué un ORM?
- → ¿Qué ventaja concreta tiene sobre SQL a mano?
- → ¿Qué limitación encontraste?
- → ¿El ORM no te impide hacer el UPDATE condicional?

**Qué dominar:**
- los tipos generados desde el esquema: un campo renombrado da error de compilación;
- las migraciones integradas;
- la limitación con las consultas analíticas, que apareció en la agregación temporal;
- el UPDATE condicional se expresa con `updateMany` con condición en el `where` y `decrement`, y devuelve `count`.

### Cadena 6 — Monolito
- **Inicial:** ¿Por qué un monolito?
- → ¿No escala peor?
- → ¿Cómo extraerías un módulo si hiciera falta?
- → ¿Qué módulo extraerías primero?

**Qué dominar:**
- 5 usuarios y la transacción única;
- un servidor sin estado se puede replicar;
- los límites de módulo y la regla de no llamar servicios ajenos;
- **[INFERENCIA]**: reportes es el candidato natural, porque es de solo lectura, pesado y sin transacciones con el resto.

### Cadena 7 — Signals
- **Inicial:** ¿Cómo manejás el estado en Angular?
- → ¿Qué es una signal?
- → ¿Por qué no NgRx?
- → ¿Cómo se entera el menú de que cambió el usuario?

**Qué dominar:** `signal`, `computed`, `asReadonly`, OnPush; el menú es un `computed` que filtra por `hasPermission`; el `APP_INITIALIZER` carga el perfil antes del render.

### Cadena 8 — Reportes
- **Inicial:** ¿Cómo generás el Excel?
- → ¿Qué pasa si falla a la mitad?
- → ¿Cómo evitás quedarte sin memoria?
- → ¿Cómo agregarías un reporte en PDF?

**Qué dominar:**
- las 3 piezas;
- todo lo que puede fallar va antes del primer byte;
- con headers ya enviados, se corta la conexión;
- `take: limit + 1`;
- para PDF, un nuevo generador que consuma la misma estructura, sin tocar las definiciones;
- `pdfkit` está instalado pero sin uso (deuda técnica declarada).

### Cadena 9 — Tests con BD real
- **Inicial:** ¿Cómo testeás el backend?
- → ¿Por qué no mocks?
- → ¿No es lento y frágil?
- → ¿Cómo aislás los tests entre sí?

**Qué dominar:**
- un mock no demuestra el bloqueo;
- el costo asumido;
- las guardas de `.env.test` y `NODE_ENV`;
- datos únicos por ejecución, limpieza en orden de dependencias y archivos en serie;
- supertest sobre `app` sin levantar el puerto, gracias a la separación entre `app.ts` y `server.ts`.

### Cadena 10 — Recuperación de contraseña
- **Inicial:** ¿Cómo funciona el "olvidé mi contraseña"?
- → ¿Por qué guardás el hash del token?
- → ¿Qué pasa si dos pestañas usan el mismo enlace a la vez?
- → ¿Qué pasa si el SMTP falla? ¿El usuario se entera?

**Qué dominar:**
- la filtración de la BD no permite tomar cuentas;
- el UPDATE condicional sobre `usedAt` hace que solo una gane;
- el mail nunca lanza, para no permitir la enumeración;
- la contracara: el usuario no se entera si su mail falló.

### Cadena 11 — Baja lógica
- **Inicial:** ¿Cómo eliminás un cliente?
- → ¿Por qué no lo borrás?
- → ¿No crece la base indefinidamente?
- → ¿El email de un usuario dado de baja se puede reutilizar?

**Qué dominar:**
- la integridad referencial y el historial;
- el volumen es irrelevante en este contexto;
- [MU] "El email ya está registrado" aparece aunque la cuenta esté dada de baja, porque la unicidad es de la columna.

### Cadena 12 — Zona horaria
- **Inicial:** ¿Cómo agrupás las ventas por día?
- → ¿Por qué no con SQL?
- → ¿Qué pasa si el servidor está en otra zona?
- → ¿Y el Excel cómo muestra la hora?

**Qué dominar:**
- UTC sin zona; coherencia entre el gráfico y el indicador;
- el supuesto SU-02 y la limitación de dependencia de la zona del servidor;
- `toExcelWallClock` compensa el offset.

### Cadena 13 — Almacenamiento de tokens
- **Inicial:** ¿Dónde guardás el token?
- → ¿Qué riesgo tiene?
- → ¿Por qué no cookie HttpOnly?
- → ¿Cómo mitigás el XSS hoy?

**Qué dominar:** localStorage; XSS frente a CSRF; la vigencia corta del access; el escapado por defecto de Angular **[CONOC. ADICIONAL]**; sin CSP documentada **[INFERENCIA: helmet aplica headers, pero la doc no detalla CSP]**.

---

## 7. Puntos débiles o defendibles

### 7.1 Tabla de estudio

| Aspecto | Por qué podría cuestionarse | Qué debería preparar |
|---|---|---|
| **Ingreso manual de stock sin atomicidad** [CÓDIGO] | Contradice el argumento del Cap. VIII | D1: reconocerlo y explicar la corrección (`increment`) |
| **Baja o cambio de rol no inmediato (≤15 min)** [CÓDIGO] | La DT habla de "efecto inmediato" | D2: el matiz rol vs permisos del rol |
| **Ajuste no admite 0** [CÓDIGO] | El manual recomienda el Ajuste para roturas | M6: limitación y corrección |
| Sesiones no revocables (7 días) | Seguridad | D3 y la solución con refresh persistido |
| Tokens en localStorage | XSS | T19: el trade-off con CSRF |
| Auditoría fuera de la transacción, que puede perderse, y sin integridad | Trazabilidad | D6, encadenamiento criptográfico y almacenamiento append-only |
| Caja = facturado ≠ cobrado | Funcional y contable | D7 y RE-04 |
| Sin IVA ni factura | Validez fiscal | N6 y RE-03 |
| Rol Producción con permisos de creación y modificación | Inconsistencia DT (Cap. I vs Anexo B) | D9 |
| Panel de inicio visible para todos los roles | Stock y Producción ven montos de ventas y principales clientes [INFERENCIA de la DT: "exige sesión válida pero ningún permiso"] | Decisión deliberada (es la pantalla inicial); se podría filtrar por permiso |
| Posible deadlock con ventas multi-material | Concurrencia | D5: ordenar por id |
| Redondeo por línea vs subtotal [INFERENCIA del código citado en la DT] | `lineTotal` se guarda redondeado a 2 decimales, pero el subtotal suma los valores sin redondear: con cantidades fraccionarias, la suma de las líneas guardadas podría diferir en 1 centavo del total | Explicar que `total` es la autoridad, que el reporte suma `sale.total` y que la mejora es redondear cada línea antes de sumar |
| Sin despliegue ni HTTPS | "¿Dónde corre?" | Solo local; la infraestructura prevista (VPS, proxy inverso con TLS, backups) no se materializó |
| Sin cobertura, sin E2E, sin carga, sin tests de reportes ni de usuarios | Calidad | T27 y D8 |
| Rate limit por IP | Con un proxy inverso, todas las IP podrían verse iguales [CONOC. ADICIONAL: `trust proxy`] | Mencionar si preguntan por el despliegue |
| Selectores de 200 registros | Escalabilidad | Pasar a autocompletado con búsqueda en el servidor |
| Dependencia de la zona del servidor | Despliegue | SU-02 y la conversión en la BD |
| CUIT no único | Duplicados | Decisión del modelo; se podría agregar un índice único parcial |
| DRAFT sin uso | "¿Para qué está?" | Previsto en el modelo; no hay presupuestos ni borradores |
| Stock mínimo inexistente | "Stock más bajo" no es una alerta | Se agregaría un campo `minStock` a Material |
| Roles fijos | Rigidez | RE-06; la organización es estable |
| Deuda técnica: `pdfkit` y `uuid` sin uso, lint sin configuración | Prolijidad | Declarado en la DT; reconocer |
| Logout solo en el cliente [INFERENCIA] | Seguridad | Consecuencia de no tener estado |
| Varios refresh simultáneos [INFERENCIA] | Eficiencia | T22 |
| Reactivación de clientes y materiales | El manual dice "consultá con la administración", pero no hay vía en la app [CÓDIGO] | T10 |

### 7.2 Inconsistencias y omisiones entre documentos (y frente al código)

| # | Dónde | Detalle | Cómo manejarlo |
|---|---|---|---|
| 1 | DT §VI vs MU Cap. 3 | La DT dice que, al **consumir** un token, se borran los demás. El MU dice "solo vale el último". **El código hace las dos cosas**: al **pedir** un enlace nuevo también borra los pendientes (`auth.service.ts:83`) | El MU es correcto y la DT omite un caso. Si te preguntan: "al pedir un enlace nuevo se invalidan los anteriores, y al usar uno se invalidan los que queden" |
| 2 | MU Cap. 11 | "Modificar un usuario: podés cambiar el **nombre** y el **rol**", pero la FAQ dice "Di de baja un usuario por error → editalo y volvé a marcarlo como activo". **El código tiene el switch "Usuario activo"** | Imprecisión del manual: también se puede reactivar |
| 3 | MU Cap. 7 FAQ | "El material no aparece al cargar una venta: puede estar dado de baja, **o tener stock 0**". El formulario de venta **solo filtra `isActive`** [CÓDIGO] | Imprecisión del MU. Un material con stock 0 aparece, y la venta se rechaza con 422 |
| 4 | DT Cap. I vs Anexo B | Producción: "consulta y carga de existencias" frente a los permisos `inventory.create/update` | D9 |
| 5 | DT Anexo B | El catálogo de permisos incluye los módulos `sales` y `employees`, pero la matriz no los lista (las rutas de ventas usan `commercial.*`) | Si preguntan: `sales.*` y `employees.*` existen en el catálogo, solo los concede `admin.*` y no gobiernan rutas expuestas en la UI. **Verifica en el seed qué rol los tiene antes de afirmarlo** |
| 6 | DT §VI ("efecto inmediato") vs código | Inmediato para los permisos del rol, no para el rol del usuario | D2 |
| 7 | DT §V ("se actualizan siempre en la misma transacción") vs código | El ingreso usa una transacción, pero no es atómico frente a la concurrencia | D1 |
| 8 | DT §IX vs MU Cap. 10 | El servidor reporta los **últimos 30 días** si no recibe rango; la pantalla precarga **el mes en curso** | No es contradicción: es el valor por omisión del servidor frente al del cliente. Conviene saberlo |
| 9 | MU Cap. 7 FAQ | "¿Puedo ver el historial de movimientos? Consultá con la administración cómo acceder" | RF-14 está en la API (`GET .../movements`), pero el manual no documenta una pantalla. **Verifica si la UI la muestra** antes de la defensa |
| 10 | MU Cap. 11 Auditoría | La entidad filtrable en la UI se lista como Venta, Cliente, Material y Usuario, pero también se auditan categorías, movimientos y el reset | Menor |

---

## 8. Preguntas sobre decisiones técnicas

| Decisión | ¿Por qué? | Alternativa | Desventaja asumida | ¿Qué cambiarías / qué pasaría si…? |
|---|---|---|---|---|
| Monolito modular | 5 usuarios y la venta atómica | Microservicios | Escalado en bloque | Extraer reportes si crece |
| SPA + API | Interfaz muy interactiva; API reutilizable | SSR o MVC clásico | Tokens y CORS | — |
| Angular 19 + signals | Estado compartido mínimo | NgRx, React | Menos herramientas de depuración del estado | NgRx si crece el estado global |
| Prisma | Tipos desde el esquema y migraciones | SQL a mano, TypeORM, Knex | Poca expresividad analítica | Consultas crudas puntuales |
| PostgreSQL | Transacciones, bloqueo de fila, decimal y JSON para la auditoría [DT: JSON, decimal] | MySQL, NoSQL | — | "¿Por qué no MongoDB?" → la venta es multi-entidad con integridad referencial y transacciones: el modelo relacional encaja **[CONOC. ADICIONAL]** |
| JWT sin estado | Simplicidad, sin almacenamiento | Sesiones en servidor | No se puede revocar | Persistir el refresh |
| Permisos en la BD por petición | Cambios inmediatos | Permisos en el token | Una consulta por petición | Caché con invalidación |
| localStorage | Simplicidad | Cookie HttpOnly | XSS | Cookie + SameSite |
| Decimal y string en JSON | Exactitud | Float, centavos en entero | Conversión en el front | — ("¿Por qué no centavos como entero?" → también válido; Decimal permite 3 decimales en las cantidades y es nativo del motor **[CONOC. ADICIONAL]**) |
| Baja lógica | Historial | Borrado físico | Filtrar los activos en cada consulta | — |
| Stock y saldo desnormalizados | Lectura frecuente | Calcular sumando | Mantener la consistencia | Atomicidad del ingreso (D1) |
| Precio congelado | Historial estable | Referenciar el precio | Datos duplicados | — |
| Reversión con movimiento negativo | Trazabilidad | Borrar el movimiento | Más filas | — |
| Auditoría en JSON y fuera de la transacción | Heterogeneidad; no bloquear el negocio | Tabla por entidad; auditoría dentro | Pérdida silenciosa | Outbox o dentro de la transacción |
| Token de reset en tabla con hash | Uso único y revocación | JWT firmado | Una entidad más | — |
| Zod en el servidor + validación en el front | Una sola fuente de tipo y validación | class-validator, Joi | — | — |
| Reportes por definición | Agregar reportes o formatos sin tocar el transporte | Un endpoint por reporte | Más abstracción para un único reporte | — |
| Agregar en la app | Zona horaria | `date_trunc` en SQL | Trae filas a memoria | Convertir la zona en la BD |
| Cola de trabajos descartada | YAGNI, sin problema real | BullMQ + Redis [CONOC. ADICIONAL: nombre típico] | Excel síncrono con tope | Volver si los reportes crecen |
| Tests contra BD real | Garantías del motor | Mocks | Más lentos, requieren infraestructura | — |
| Monorepo pnpm | Un lockfile, versiones idénticas | Dos repositorios | — | — |
| Docker solo para la infraestructura de desarrollo | Puesta en marcha en minutos | Instalar Postgres local | El backend y el front no están en contenedores | Dockerizar la app para el despliegue |

**Preguntas típicas para practicar con la tabla:** "¿Por qué no usaste X?", "¿Qué desventaja tiene?" y "¿Qué pasaría si lo cambiaras?". Responde siempre en tres tiempos: **criterio** (contexto: 5 usuarios, prioridad en ventas, simplicidad) → **costo asumido** → **cuándo cambiarías de opinión**.

---

## 9. Escenarios hipotéticos

| Escenario | Qué responder |
|---|---|
| **Aumentan mucho los usuarios** | D4. El servidor es sin estado y se replica; revisar la consulta de permisos, el Excel en memoria, la agregación en la app, los selectores de 200 y el rate limit compartido. Primero, medir |
| **La BD deja de responder** | **[INFERENCIA]** Las peticiones fallan: el manejador devuelve un 500 genérico y el detalle queda en el log; las transacciones en curso hacen rollback, así que no quedan ventas a medias. No hay réplica ni backups automatizados documentados: los backups estaban previstos en la infraestructura que no se materializó |
| **Cae el servidor de correo** | No afecta nada más que la recuperación. El envío nunca lanza; la respuesta es la misma; el enlace queda en el log; arranca igual sin SMTP |
| **Falta el logo en el despliegue** | El reporte se genera sin logo y queda una advertencia en el log (la compilación no copia los recursos) |
| **El usuario manda datos inválidos** | Zod da 400 con el detalle por campo; el front ya valida debajo del campo; el formulario conserva lo cargado |
| **El usuario manipula el front para mandar un precio** | Se ignora: el esquema no lo admite y el precio sale del servidor |
| **Hay que agregar IVA** | Cambiar el cálculo en `sales.service` (el campo `tax` existe); el reporte ya suma `sale.total`; el front ajusta la vista previa. No hace falta migración de estructura |
| **Hay que agregar el módulo de producción** | Las entidades, permisos y prefijos de ruta ya existen. Crear el módulo con el patrón de 4 archivos; la producción descontaría materias primas e incrementaría materiales en una transacción, con el mismo patrón condicional |
| **Hay que agregar un reporte nuevo** | Una definición más en el catálogo; ni rutas, ni controlador, ni generador |
| **Hay que exportar a PDF** | Un generador nuevo que consuma la misma estructura resuelta |
| **Hay que desplegar en otro entorno** | Variables de entorno validadas al arrancar; migraciones con `migrate deploy`; copiar los recursos; el front en producción usa una ruta relativa, así que hace falta un proxy inverso con el mismo origen; HTTPS; servidor en la zona horaria de Argentina (SU-02); cambiar las credenciales del seed |
| **Cambia el requisito "toda venta suma a la caja"** | Habría que distinguir los medios de pago: las ventas en cuenta corriente generarían una deuda del cliente y la caja se alimentaría con las cobranzas. Es un módulo nuevo (prioridad media) |
| **Dos personas anulan la misma venta a la vez** | Una gana; la otra recibe 422 "La venta ya no está confirmada" |
| **Se carga un ingreso mientras alguien vende ese material** | **Riesgo real (D1).** Responde con honestidad |
| **Despiden a alguien** | ≤15 min de acceso residual (M11) |
| **Se roba un refresh token** | 7 días de acceso; no revocable (D3) |
| **Una fecha inválida en un filtro** | En los listados se ignora el filtro (`parseDay` devuelve `undefined`); en el reporte y la serie, Zod devuelve 400 con "Formato de fecha esperado" |
| **Se borra la caja de ventas o no se corre el seed** | La venta se rechaza antes de tocar el stock: "No hay una caja de ventas configurada. Ejecutá el seed." |

---

# Simulación de defensa

> Tribunal: **[F]** docente funcional · **[T]** docente técnico · **[A]** docente de arquitectura y desarrollo.
> Responde en voz alta, cronometrándote (máximo 1-2 min por respuesta), **antes** de mirar la guía de corrección.

1. **[F]** Contanos en dos minutos qué es PerliNor ERP y qué problema le resuelve a la empresa.
2. **[F]** ¿Por qué no implementaste producción ni proveedores, si es un ERP?
3. **[A]** Dibujá o describí la arquitectura. ¿Por qué un monolito?
4. **[T]** ¿Qué tecnologías usaste en el backend y en el frontend? Elegí una y justificala.
5. **[F]** Mostranos el flujo de una venta desde el punto de vista del vendedor. ¿Qué pasa si no alcanza el stock?
6. **[T]** Y técnicamente, ¿qué garantiza que no se venda stock que no existe si dos vendedores operan a la vez?
7. **[T]** *(repregunta)* ¿Para qué hacés entonces la verificación previa del stock, si el UPDATE ya lo garantiza?
8. **[A]** ¿Por qué el total de la venta lo calcula el servidor si el front ya lo muestra?
9. **[T]** ¿Cómo almacenás los importes? ¿Por qué no un `number` de JavaScript?
10. **[F]** Si se cambia la lista de precios, ¿qué pasa con las ventas del mes pasado?
11. **[T]** Explicá la autenticación. ¿Qué pasa cuando vence el token mientras el usuario trabaja?
12. **[T]** *(repregunta)* Si un empleado es despedido y lo das de baja, ¿pierde el acceso inmediatamente?
13. **[A]** ¿La verificación de permisos en el frontend es una medida de seguridad?
14. **[T]** ¿Cómo diseñaste la recuperación de contraseña para que sea segura?
15. **[F]** ¿Por qué el saldo de caja no cambia cuando filtro por fechas? ¿Y por qué una anulación deja dos movimientos?
16. **[A]** ¿Cómo agregarías un segundo reporte? ¿Y exportar a PDF?
17. **[T]** ¿Cómo probaste el sistema? ¿Por qué el backend contra una base real?
18. **[A]** ¿Qué pasaría si la empresa crece a 100 usuarios simultáneos?
19. **[T]** El ingreso manual de stock, ¿también está protegido contra la concurrencia como la venta?
20. **[F/A]** ¿Cuál es la principal limitación del sistema y qué harías primero si continuaras?

## Guía de corrección

| # | Conceptos que deberías haber mencionado | Importante | Errores a evitar |
|---|---|---|---|
| 1 | Fábrica de 10 empleados y 5 áreas; dispersión (papel y planillas); 3 consecuencias; fuente única; indicadores | El problema es la **dispersión**, no la falta de datos | Describir pantallas en lugar del problema |
| 2 | Prioridad definida por el cliente; desarrollo incremental; áreas modeladas (7 entidades), permisos y rutas reservados | Que fue una **decisión documentada** | Decir "no me dio el tiempo" sin más |
| 3 | SPA Angular + API Express + Prisma + Postgres; SMTP opcional; capas; venta atómica = una transacción | El argumento de la transacción | Decir "porque es más fácil" sin el argumento técnico |
| 4 | Node 20/Express/TS, Prisma, PostgreSQL 16, Zod, JWT, bcryptjs, decimal.js, exceljs; Angular 19, PrimeNG, Tailwind, Chart.js | Justificar con criterio (tipos, transacciones) | Nombrar tecnologías que no usaste (Redis, NgRx, BullMQ) |
| 5 | Cliente activo → medio de pago → líneas → total en vivo → Registrar → detalle; 422 con el disponible y el requerido; **nada cambia**; el formulario se conserva | "O se hace todo o nada" | Decir que se registra parcialmente |
| 6 | Actualización perdida; `UPDATE … WHERE stock >= x`; bloqueo de fila; reevaluación; `count = 0` → 422 + rollback; test de concurrencia | El ejemplo 100/60/60 | Decir que la transacción **sola** alcanza (sin la condición, dos transacciones read-committed igual pierden la actualización) **[CONOC. ADICIONAL]** |
| 7 | Diagnóstico, no garantía: el mensaje con el material, el disponible y el requerido | Distinguir diagnóstico de garantía | Decir que es redundante o que es "la validación" |
| 8 | El servidor es la autoridad; el cliente no envía precios; la vista previa es solo UX; mismo decimal.js | Desconfiar del cliente | — |
| 9 | Decimal(12,2) / (12,3); decimal.js; string en el JSON; 0,1 + 0,2 | Decir que es un RNF (RNF-04) | Decir "float con redondeo" |
| 10 | Precio congelado en la línea (copia, no referencia); reportes estables | RF-17 | Confundirlo con el nombre del cliente (ese no se congela) |
| 11 | Access 15 min / refresh 7 días, secretos distintos; interceptor 401 → refresh → reintento único → logout | Sin estado de sesión | Decir que hay sesiones en el servidor |
| 12 | **No inmediato**: ≤15 min por el access token; el refresh lo rechaza; el middleware usa el `roleId` del token | Honestidad y la propuesta de corrección | Afirmar que es inmediato |
| 13 | No; es UX; la seguridad es `requirePermission` en el servidor; 403 | La frase "el código del navegador se puede modificar" | Decir que el guard protege |
| 14 | 256 bits; SHA-256 guardado; 30 min; uso único con UPDATE condicional; respuesta invariable; el mail no lanza; rate limit 5/15; nuevo pedido invalida los anteriores | Anti-enumeración | Decir que se guarda el token en claro, o que se usa un JWT |
| 15 | Saldo acumulado desnormalizado; el filtro solo afecta el listado (con test); reversión negativa conserva la trazabilidad (suma cero) | — | Decir que es un bug |
| 16 | `defineReport` + catálogo; sin tocar rutas ni generador; PDF = generador nuevo | RNF-18 | Proponer un endpoint nuevo por reporte |
| 17 | 38 + 26; integración con BD real vs componentes con HTTP simulado; reversión, concurrencia, anulación; guardas `.env.test`; CI; sin cobertura, E2E ni carga | Por qué un mock no prueba la concurrencia | Inventar un porcentaje de cobertura |
| 18 | API sin estado y replicable; puntos a revisar (permisos, Excel, agregación, selectores, rate limit); no hay pruebas de carga | "Primero mediría" | Decir "habría que pasar a microservicios" |
| 19 | **No**: lee-calcula-escribe fuera de la transacción; corrección con `increment`; test nuevo | Reconocer y proponer | Afirmar que sí |
| 20 | Sesiones no revocables (seguridad) / caja facturada ≠ cobrada (funcional); persistir el refresh, personal, IVA | Que esté en el trabajo futuro con prioridad | Decir "no tiene limitaciones" |

---

# Las 15 preguntas que sí o sí debes poder responder

*(Agrupadas por temática. Respuestas orales de 30-60 segundos.)*

## Proyecto

**1. ¿Qué problema resuelve el sistema y para quién?**
"PerliNor es una fábrica de materiales para la construcción con diez empleados en cinco áreas. Trabajaban con papel y planillas separadas por área, y el problema no era la falta de información sino la dispersión: el mismo dato en varios lugares, sin uno válido, mucho trabajo manual de cotejo y, para saber cuánto se vendió en el mes, había que consolidar planillas. El sistema centraliza en una sola base el catálogo, el stock, los clientes, las ventas y la caja, garantiza que los datos sean consistentes, controla qué puede hacer cada área y pone los indicadores a la vista sin trabajo manual."

**2. ¿Cuál es el alcance y por qué quedó así?**
"El cliente definió que la prioridad era ventas, así que construí el circuito comercial completo y verificado: cliente, material, carga de stock, venta, impacto en caja, anulación, indicadores, gráfico y reporte Excel, más usuarios, auditoría y recuperación de contraseña. Materias primas, producción, proveedores y facturación electrónica quedaron fuera por decisión de alcance, pero ya están modeladas en la base, con sus permisos y prefijos de ruta, así que se pueden incorporar sin rediseñar."

## Funcionalidad

**3. ¿Qué pasa cuando se registra una venta?**
"El vendedor elige el cliente, el medio de pago y los materiales con sus cantidades, y ve el total en vivo. Al registrar, el servidor hace todo en una transacción: verifica el cliente y la caja, suma las cantidades por material, descuenta el stock con una actualización condicional, guarda las líneas con el precio vigente congelado, registra los movimientos de salida y el ingreso en la caja. O se hace todo o nada: si no alcanza el stock, responde 422 con el material, el disponible y el requerido, y no cambia nada."

**4. ¿Qué pasa al anular una venta?**
"Es el inverso, también en una transacción. Cambio el estado con un UPDATE condicionado a que esté confirmada, así que, si dos personas anulan a la vez, solo una gana. Repongo el stock con movimientos de ingreso y revierto la caja con un movimiento negativo, sin borrar el original: el historial muestra la venta y su anulación, que suman cero. A partir de ahí no cuenta en indicadores, caja ni reportes, pero sigue visible con estado Anulada."

## Arquitectura

**5. Describí la arquitectura y justificala.**
"Es un monolito modular en dos procesos: una SPA en Angular 19 y una API en Node con Express y TypeScript, que accede a PostgreSQL con Prisma. En el servidor, cada petición pasa por rutas con autenticación, permiso y validación Zod; después un controlador que traduce HTTP, un servicio con las reglas y las transacciones, y el acceso a datos. Elegí un monolito porque son cinco usuarios y porque la venta toca stock, ventas y caja de forma indivisible: en una base es una transacción, mientras que con microservicios necesitaría compensaciones. La modularidad está en el código, para poder extraer módulos en el futuro."

**6. ¿Cómo se comunican el front y el back, y cómo se manejan los errores?**
"Por HTTP y JSON con un contrato uniforme: los éxitos van en `data`, los listados con `meta` de paginación y los errores con `error` y `details`, con códigos semánticos (400 entrada inválida, 401 sin sesión, 403 sin permiso, 409 duplicado, 422 el estado impide la operación). En el servidor, un único manejador clasifica los errores y nunca filtra detalles internos. En el front, un interceptor adjunta el token y renueva la sesión ante un 401, y otro muestra el mensaje del servidor en un aviso, así que los componentes no manejan la presentación de errores."

## Desarrollo

**7. ¿Cómo evitás vender stock que no existe con dos usuarios simultáneos?**
"Si leyera el stock, comparara y después restara, dos ventas podrían leer 100 al mismo tiempo, pasar ambas y quedar en 40 habiendo vendido 120: es una actualización perdida. Por eso la condición viaja dentro del UPDATE: resto solo donde el stock es mayor o igual a lo requerido. La base bloquea la fila, la segunda transacción espera, reevalúa con el valor nuevo, no afecta ninguna fila y la rechazo con rollback. La verificación previa solo sirve para dar un buen mensaje. Lo prueba un test que lanza dos ventas en paralelo contra una base real."

**8. ¿Cómo probaste el sistema?**
"Hay 64 tests automatizados que corren en CI en cada cambio. El backend, con 38, se prueba en integración contra PostgreSQL real, porque la atomicidad y la concurrencia son propiedades del motor y un mock no las demostraría. Ahí están la reversión total, la concurrencia y la anulación completa. El frontend, con 26, se prueba por componente con el HTTP simulado, concentrado en la grilla compartida y los listados. Declaro lo que falta: no medí la cobertura, y no hay E2E, pruebas de carga ni tests del Excel, que verifiqué a mano."

## Base de datos

**9. ¿Cómo es el modelo de datos y qué decisiones de modelado tomaste?**
"Son 22 entidades, 15 en uso y 7 previstas para las áreas futuras. Las convenciones son: UUID como clave, decimal para importes y cantidades, baja lógica con `isActive` y marcas temporales. Hay decisiones clave. El stock y el saldo están desnormalizados, por lectura frecuente, y se actualizan junto con su movimiento. El precio se copia en la línea de venta. Las reversiones son movimientos negativos. La auditoría guarda los valores anterior y posterior en JSON. El esquema se versiona con tres migraciones de Prisma y un seed idempotente que es obligatorio, porque crea la caja de ventas."

**10. ¿Por qué decimal y baja lógica?**
"Decimal, porque el punto flotante binario no representa exactamente los decimales: 0,1 más 0,2 no da 0,3, y en miles de ventas aparecen diferencias de centavos. Por eso uso columnas decimales, decimal.js en la aplicación, y los importes viajan como texto en el JSON. Baja lógica, porque en un sistema comercial no puedo perder historial: un cliente dado de baja sigue apareciendo en sus ventas viejas y los reportes de períodos cerrados siguen siendo correctos."

## Seguridad

**11. ¿Cómo funcionan la autenticación y la autorización?**
"En la autenticación uso dos JWT con secretos distintos: uno de acceso de 15 minutos y uno de renovación de 7 días, sin guardar sesiones. Las contraseñas se guardan con bcrypt y sal, con coste 10. La autorización es por roles: cada usuario tiene un rol, cada rol permisos `módulo.acción`, y cada ruta del servidor declara el permiso que exige. Los permisos se consultan en la base en cada petición, así que un cambio en los permisos de un rol rige enseguida. El front también filtra el menú y las rutas, pero eso es usabilidad: la seguridad real está en el servidor."

**12. ¿Qué limitaciones de seguridad tiene?**
"La principal es que no puedo revocar sesiones: como no persisto tokens, un refresh robado sirve hasta siete días, incluso después de cambiar la contraseña. Por la misma razón, si doy de baja a un usuario o le cambio el rol, conserva el acceso hasta que vence su token de acceso, como máximo 15 minutos. Además, los tokens están en localStorage, que queda expuesto a XSS. La política de contraseñas es solo de longitud mínima. Y la auditoría no tiene protección de integridad y puede perder asientos en silencio. La primera prioridad del trabajo futuro es persistir los refresh tokens para poder revocarlos."

**13. ¿Cómo hiciste segura la recuperación de contraseña?**
"Genero un token aleatorio de 256 bits y guardo solo su hash SHA-256, así que una filtración de la base no permite tomar cuentas. Vence en 30 minutos y es de un solo uso: lo consumo con un UPDATE condicional en una transacción, y pedir un enlace nuevo o usar uno invalida los demás. Para que no se pueda averiguar qué emails existen, la respuesta es siempre la misma y el envío de mail nunca devuelve un error. Además, esos endpoints tienen un límite de 5 peticiones cada 15 minutos."

## Decisiones técnicas

**14. ¿Qué decisión técnica te parece la más importante y qué alternativa descartaste?**
"El descuento condicional de stock dentro de la transacción. La alternativa, verificar y después descontar, funciona en una demo, pero falla con dos usuarios a la vez. Ese es el riesgo que haría que el sistema no coincida con el inventario físico. Otra decisión que muestra el criterio general es que descarté la cola de trabajos para reportes: estaba instalada, pero el reporte se resolvía en la petición, así que la saqué. No incorporo infraestructura sin un problema que la justifique."

**15. ¿Qué cambiarías o mejorarías?**
"Primero, persistir los refresh tokens y verificar el usuario activo en cada petición, para revocar accesos en el momento. Segundo, hacer que el ingreso manual de stock use el mismo incremento atómico que la venta: hoy lee, suma en la aplicación y escribe, lo cual es vulnerable a la concurrencia. Tercero, sumar tests del Excel y de los módulos maestros, y medir la cobertura. En lo funcional seguiría con el IVA, que el modelo ya soporta, y después materias primas, producción y cobranzas, para que la caja distinga lo facturado de lo cobrado."

---

## Antes de entrar: checklist de 10 minutos

- [ ] Los 13 números del resumen (22 / 15 / 7 entidades, 40 endpoints, 41 permisos, 64 tests, 15 min / 7 días, 20.000 filas…).
- [ ] El ejemplo 100 / 60 / 60 de la actualización perdida, dicho de memoria.
- [ ] La diferencia entre 400 y 422, y entre 401 y 403.
- [ ] Las tres debilidades del código que la doc no menciona: **ingreso no atómico**, **baja o rol con ≤15 min de efecto** y **ajuste que no admite 0**.
- [ ] Verificar en la app, si te da tiempo: (a) si hay pantalla para el historial de movimientos de un material; (b) en `prisma/seed.ts`, qué roles tienen `sales.*` y `employees.*`.
- [ ] Frase comodín ante algo que no sabes: *"Eso no lo implementé / no lo medí; lo que sí puedo decir es… y lo abordaría así…"*.
