# Glosario canónico — PerliNor ERP

> **Documento normativo de vocabulario.** Fija el término único que debe usarse para cada concepto
> en la documentación técnica y en el manual de usuario.
> Cierra los riesgos **R-14**, **R-15** y **R-16** de `GUIA_MAESTRA_DOCUMENTACION.md`.
> Versión 1.0 — 13/09/2026.

---

## 1. Propósito

El sistema nombra varios conceptos de tres maneras distintas: como los nombra el negocio, como los
nombra el código y como los muestra la interfaz. Por ejemplo, lo que el usuario ve como
**«Material»** se llama `FinishedProduct` en la base de datos, viaja por la URL
`/inventory/finished-products` y aparece como «producto terminado» en la documentación previa.

Sin una convención fijada de antemano, esa dispersión se filtra a los documentos finales y el
lector termina creyendo que se trata de entidades distintas.

### Reglas de uso

| Documento | Registro obligatorio | Excepción |
|---|---|---|
| **Manual de usuario** | **Columna «Interfaz»**, siempre | Ninguna. El manual jamás usa un término que no esté en pantalla |
| **Documentación técnica** | **Columna «Dominio»** en la prosa | Usa la columna «Código» al citar una clase, tabla, campo o endpoint, siempre en `formato monoespaciado` |
| **Ambos** | Al nombrar por primera vez un concepto con más de un registro, se declara la equivalencia una sola vez | — |

---

## 2. Tabla canónica

### 2.1 Inventario

| Dominio *(doc. técnica)* | Código | Interfaz *(manual)* | Definición |
|---|---|---|---|
| **Material** | `FinishedProduct` · `/inventory/finished-products` | **Material** | Producto elaborado por la fábrica y disponible para la venta. Es la única clase de producto que el sistema gestiona |
| **Categoría** | `Category` · `CategoryType.FINISHED_PRODUCT` | **Categoría** | Agrupación de materiales para su clasificación |
| **Código de material** | `sku` | **SKU** | Identificador único e irrepetible de cada material |
| **Unidad de medida** | `unit` | **Unidad** | Unidad en que se cuenta el material: unidad, bolsa, m³ |
| **Precio de venta** | `salePrice` | **Precio** | Precio vigente del material. Es el que la venta congela al registrarse |
| **Existencia** | `currentStock` | **Stock** | Cantidad disponible del material |
| **Movimiento de existencias** | `FinishedProductMovement` | **Movimiento de stock** | Registro de toda variación de existencias, con su origen |
| **Ingreso de existencias** | `MovementType.IN` | **Ingreso** | Movimiento que **suma** al stock actual |
| **Ajuste de existencias** | `MovementType.ADJUST` | **Ajuste** | Movimiento que **reemplaza** el stock por el valor indicado |
| **Egreso de existencias** | `MovementType.OUT` | *(no se carga a mano)* | Movimiento que resta stock. Lo genera exclusivamente el registro de una venta |

### 2.2 Comercial

| Dominio | Código | Interfaz | Definición |
|---|---|---|---|
| **Cliente** | `Customer` | **Cliente** | Persona o empresa que compra materiales |
| **Identificación tributaria** | `taxId` | **CUIT/Doc** | CUIT o documento del cliente. El sistema **no** exige que sea único |
| **Venta** | `Sale` | **Venta** | Operación de entrega de materiales a un cliente a cambio de un pago |
| **Línea de venta** | `SaleDetail` | **Línea** / **Detalle** | Cada material vendido dentro de una venta, con su cantidad y precio |
| **Medio de pago** | `PaymentMethod` | **Medio de pago** | Forma de pago: efectivo, transferencia, tarjeta, cheque o cuenta corriente |
| **Estado de la venta** | `SaleStatus` | **Estado** | Situación de la venta: confirmada o anulada |
| **Venta confirmada** | `SaleStatus.CONFIRMED` | **Confirmada** | Venta vigente. Descontó stock y sumó a la caja |
| **Venta anulada** | `SaleStatus.CANCELLED` | **Anulada** | Venta revertida. Repuso el stock y descontó de la caja |
| **Anulación** | `salesService.cancel()` | **Anular** | Operación que revierte una venta confirmada |
| **Responsable de la venta** | `Sale.createdBy` | **Vendedor** | Usuario que registró la venta |
| **Subtotal** | `subtotal` | **Subtotal** | Suma de las líneas antes de impuestos |
| **Impuesto** | `tax` | **IVA** | Impuesto de la venta. **En el alcance entregado es siempre 0** |
| **Total** | `total` | **Total** | Importe final de la venta |

### 2.3 Finanzas

| Dominio | Código | Interfaz | Definición |
|---|---|---|---|
| **Caja de ventas** | `CashRegister` con `type = SALES` · `/finance/sales-cash` | **Caja de ventas** | Registro del dinero ingresado por ventas. Es única y el sistema la alimenta automáticamente |
| **Movimiento de caja** | `CashMovement` | **Movimiento** | Entrada o salida de dinero en la caja. Positivo: ingreso por venta. Negativo: reversión por anulación |
| **Saldo** | `balance` | **Saldo** | Importe acumulado de la caja. **No depende del filtro de fechas del listado** |

### 2.4 Acceso y seguridad

| Dominio | Código | Interfaz | Definición |
|---|---|---|---|
| **Usuario** | `User` | **Usuario** | Cuenta con la que una persona accede al sistema |
| **Rol** | `Role` | **Rol** | Función dentro de la empresa que determina qué puede hacer un usuario. Hay cinco: Administración, Ventas, Producción, Stock y Finanzas |
| **Permiso** | `Permission.code`, formato `modulo.accion` | **Permiso** | Autorización puntual para una acción sobre un módulo |
| **Permiso de administración** | `admin.*` | — | Comodín que concede todos los permisos. Solo lo tiene el rol Administración |
| **Sesión** | *access token* + *refresh token* | **Sesión** | Período durante el cual el usuario permanece identificado |
| **Enlace de recuperación** | `PasswordResetToken` | **Enlace de recuperación** | Enlace de un solo uso, enviado por correo, que permite definir una contraseña nueva. Vence a los 30 minutos |

### 2.5 Trazabilidad

| Dominio | Código | Interfaz | Definición |
|---|---|---|---|
| **Auditoría** | `AuditLog` · `/audit` | **Auditoría** | Registro cronológico de las operaciones críticas del sistema |
| **Asiento de auditoría** | Un registro de `AuditLog` | **Registro** | Cada anotación individual de la auditoría |
| **Creación** | `action = 'CREATE'` | **Creación** | Alta de un registro |
| **Modificación** | `action = 'UPDATE'` | **Modificación** | Cambio sobre un registro existente |
| **Baja** | `action = 'DELETE'` | **Baja** | Desactivación de un registro |
| **Baja lógica** | `isActive = false` · método `deactivate()` · verbo HTTP `DELETE` | **Dar de baja** | Desactivación que **conserva** el registro y su historial. El sistema **nunca** borra datos |

### 2.6 Información de gestión

| Dominio | Código | Interfaz | Definición |
|---|---|---|---|
| **Panel de inicio** | `/dashboard` | **Inicio** | Pantalla posterior al ingreso, con los indicadores de gestión |
| **Indicador** | — | **Indicador** | Métrica del panel de inicio: ventas del mes, ventas de hoy, materiales y clientes activos |
| **Evolución de ventas** | `/dashboard/sales-series` | **Evolución de ventas** | Gráfico de ventas confirmadas por día, semana o mes |
| **Reporte** | `ReportDefinition` · `/reports` | **Reporte** | Archivo de planilla de cálculo con información exportable |
| **Ventas por período** | `sales-by-period` | **Ventas por período** | Único reporte disponible: una fila por línea de venta confirmada |

---

## 3. Términos prohibidos

### 3.1 En ambos documentos

| ❌ No usar | ✅ Usar | Motivo |
|---|---|---|
| «producto terminado», «PT» | **Material** | La interfaz nunca lo llama así. Sugiere una distinción con «materia prima» que el alcance entregado no gestiona |
| «finished product» | **Material** | Término en inglés del código, no del dominio |
| «eliminar», «borrar», «suprimir» | **Dar de baja** | El sistema no borra datos. Usar esos verbos describe mal el comportamiento y alarma al usuario |
| «cancelar una venta» | **Anular una venta** | «Cancelar» se confunde con abandonar un formulario en curso |
| «artículo», «producto», «ítem» *(como sinónimo de material)* | **Material** | Introduce un cuarto nombre para lo mismo. «Ítem» solo es válido dentro de una venta, como sinónimo de línea |
| «caja» a secas | **Caja de ventas** | El modelo prevé una segunda caja, de pagos, no implementada. El nombre completo evita la ambigüedad |

### 3.2 Solo en el manual de usuario

Ninguno de estos términos debe aparecer: *endpoint, API, REST, JWT, token* (salvo «enlace de
recuperación»), *transacción, rollback, backend, frontend, base de datos, tabla, entidad, schema,
Prisma, Angular, permiso RBAC, interceptor, componente, servicio, hash, bcrypt, SKU único a nivel
de base*.

> Si un concepto técnico resulta imprescindible para que el usuario entienda un comportamiento, se
> explica por su **efecto observable**, no por su mecanismo.
> Ejemplo — en lugar de *«la venta se ejecuta en una transacción con rollback»*:
> **«si algo falla, la venta no se registra y el stock queda como estaba»**.

---

## 4. Distinciones que se prestan a confusión

Cada una de estas debe explicarse **una sola vez** y en el lugar indicado.

| Par | Distinción | Dónde se explica |
|---|---|---|
| **Empleado** ≠ **Usuario** | La empresa tiene 10 empleados; el sistema tiene 5 usuarios, uno por rol. No toda persona de la empresa tiene cuenta | Manual, cap. 11 · Técnica, cap. 1 |
| **Ingreso** ≠ **Ajuste** | Ingreso **suma** al stock; Ajuste lo **reemplaza**. Confundirlos altera el inventario en silencio | **Manual, cap. 7, con ejemplo numérico y recuadro destacado** |
| **Dar de baja** ≠ **Anular** | La baja desactiva una ficha (cliente, material, usuario); la anulación revierte una venta y sus efectos | Manual, cap. 6 y cap. 8 |
| **Saldo** ≠ **suma de los movimientos listados** | El saldo es acumulado total; el filtro de fechas afecta solo a la lista | **Manual, cap. 9, obligatorio** |
| **Venta confirmada** ≠ **venta anulada** | Solo las confirmadas computan en indicadores, caja y reportes | Manual, caps. 5, 8, 9 y 10 |
| **Precio del material** ≠ **precio de la venta** | La venta congela el precio vigente al registrarse; un cambio posterior no altera ventas ya hechas | Manual, cap. 8 · Técnica, cap. 8 |
| **Rol** ≠ **Permiso** | El rol agrupa permisos. Los roles son fijos y no se editan desde la aplicación | Manual, cap. 11 |

---

## 5. Convenciones de escritura

### 5.1 Registro lingüístico

| Documento | Registro | Fundamento |
|---|---|---|
| **Documentación técnica** | Español formal, **impersonal** («se valida», «el servicio resuelve»). Sin voseo en la prosa | Registro académico esperable en un informe IEEE |
| **Manual de usuario** | Español rioplatense, **voseo**, dirigido al lector («ingresá», «vas a ver») | B-06: coherencia con la interfaz, que usa voseo |
| **Citas de la interfaz** | **Textuales**, entre comillas, en ambos documentos | Un mensaje citado debe coincidir carácter por carácter con el que ve el usuario |

> **[Nota]** Esta es mi lectura de B-06: el sistema es rioplatense, y el manual —que le habla al
> usuario— debe serlo también; la documentación técnica mantiene el registro impersonal propio del
> género, sin que eso la vuelva neutra ni ajena. Si preferís voseo también en la técnica, se ajusta
> en un pasada.

### 5.2 Formatos

| Elemento | Convención | Ejemplo |
|---|---|---|
| Moneda | Símbolo, punto de miles, coma decimal, dos decimales | `$ 1.234.567,89` |
| Cantidad | Coma decimal, hasta tres decimales | `1.250,500` |
| Fecha | `DD/MM/AAAA` | `26/09/2026` |
| Fecha y hora | `DD/MM/AAAA HH:MM` | `26/09/2026 14:30` |
| Rango | «del … al …» | «del 01/09/2026 al 13/09/2026» |
| Nombre de pantalla | **Negrita**, tal como figura en el menú | **Caja de ventas** |
| Botón o campo | **Negrita**, con su texto literal | **Registrar** |
| Mensaje del sistema | Entre comillas, textual | «Venta anulada. Stock repuesto.» |
| Identificador de código | Monoespaciado | `sales.service.ts`, `currentStock` |
| Ruta de archivo | Monoespaciado, relativa a la raíz del repositorio | `erp-backend/src/app.ts` |

### 5.3 Numeración de figuras y tablas (IEEE)

| Elemento | Formato | Ubicación del epígrafe |
|---|---|---|
| Figura | `Fig. 1.` seguido del texto | **Debajo** de la figura |
| Tabla | `TABLA I` (romanos) y título en versales | **Encima** de la tabla |
| Referencia en el texto | «…como muestra la Fig. 3» · «…en la Tabla II» | — |

---

## 6. Nombres propios

| Forma correcta | Formas incorrectas frecuentes |
|---|---|
| **PerliNor** | Perlinor · PERLINOR · Perli Nor |
| **PerliNor ERP** *(nombre del sistema)* | ERP Fábrica · erp-fabrica *(esos son nombres del repositorio, no del producto)* |
| **Universidad Tecnológica Nacional — Facultad Regional Tucumán** | UTN FRT *(aceptable solo tras la primera mención completa)* |
| **Práctica Profesional Supervisada (PPS)** | Práctica profesional · PPS *(sin desarrollar en la primera mención)* |

> **[Pendiente de confirmar]** El nombre comercial del sistema. La interfaz y los reportes usan
> **«ERP PerliNor»** (`MAIL_FROM`, `workbook.creator`), mientras que el repositorio se llama
> `erp-fabrica` y el README lo titula «PerliNor ERP». Hay que elegir uno para la portada y
> sostenerlo en ambos documentos. **Recomiendo «PerliNor ERP»**, que es el del README y el más
> legible como nombre de producto.
