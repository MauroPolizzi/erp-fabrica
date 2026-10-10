# Implementación del cliente

Este capítulo describe la aplicación que se ejecuta en el navegador: su organización, el manejo del
estado, los mecanismos transversales y los componentes reutilizables que sostienen la interfaz.

## Organización

La aplicación se compone de **componentes autónomos**, sin módulos declarativos. Cada componente
declara explícitamente sus dependencias, lo que vuelve legible qué necesita cada pantalla y permite
que la carga diferida opere a nivel de componente.

```
src/app/
├── core/        servicios únicos, interceptores, guardas y modelos
├── shared/      componentes, transformadores y utilidades reutilizables
├── layout/      estructura visual de la aplicación autenticada
└── features/    las pantallas, agrupadas por área funcional
```

Las dependencias fluyen en un solo sentido: las funcionalidades dependen de `shared` y de `core`, y
nunca entre sí. Cuando una pantalla necesita datos de otra área —el formulario de venta requiere el
catálogo de clientes y de materiales— los obtiene mediante el servicio de acceso correspondiente,
sin importar componentes ajenos.

### Composición de la aplicación

La raíz monta únicamente tres elementos:

```html
<p-toast position="top-right" />
<app-confirm-dialog />
<router-outlet />
```

Los dos primeros son los anfitriones globales de las notificaciones y de los diálogos de
confirmación. Al montarse una sola vez en la raíz, cualquier pantalla puede emitir una notificación o
solicitar una confirmación sin declarar el componente correspondiente.

La configuración de la aplicación registra el enrutador, el cliente HTTP con sus interceptores y las
animaciones. Incluye además un inicializador que resuelve un problema concreto:

```ts
provideAppInitializer(() => {
  const auth = inject(AuthService);
  if (!auth.accessToken) return;
  return firstValueFrom(auth.loadProfile()).catch(() => undefined);
}),
```

Al recargar la página, los tokens persisten en el almacenamiento local pero el perfil del usuario —y
con él sus permisos— se pierde. El inicializador lo recupera **antes del primer dibujado**, de modo
que el menú se presenta ya filtrado. Sin este mecanismo, el usuario vería por un instante un menú
vacío que luego se completaría.

El manejo del fallo es deliberado: si la recuperación no prospera, la aplicación arranca igualmente y
la guarda de ruta redirige al inicio de sesión. Un error aquí no debe impedir el arranque.

## Estado con señales

El estado se administra con las señales nativas del framework. Un componente típico declara su estado
local como señales y deriva de ellas los valores calculados:

```ts
readonly saving = signal(false);
readonly customers = signal<Customer[]>([]);
readonly products = signal<FinishedProduct[]>([]);

readonly noCustomers = computed(() => this.customersLoaded() && this.customers().length === 0);
```

Los valores derivados se recalculan automáticamente cuando cambia alguna de sus dependencias, y
únicamente entonces.

El estado compartido entre pantallas se reduce a la sesión, que reside en el servicio de
autenticación:

```ts
private readonly _currentUser = signal<AuthUser | null>(null);
readonly currentUser = this._currentUser.asReadonly();
readonly isAuthenticated = computed(() => this._currentUser() !== null);
```

La señal se expone **en modo de sólo lectura**: ningún componente puede modificar el usuario actual.
Únicamente el servicio lo hace, a través de sus propios métodos.

Todos los componentes utilizan la estrategia de detección de cambios optimizada, que las señales
habilitan de forma natural: el framework redibuja cuando una señal leída por la plantilla cambia, sin
recorrer el árbol completo.

### Vista previa de totales en el formulario de venta

El ejemplo más elaborado de estado derivado se encuentra en el registro de una venta, donde el
importe debe actualizarse a medida que el usuario agrega líneas:

```ts
readonly summary = computed(() => {
  const value = this.formValue();
  const map = this.productMap();
  let subtotal = new Decimal(0);
  const lines = (value.items ?? []).map((it) => {
    const product = it?.finishedProductId ? map.get(it.finishedProductId) : undefined;
    const unitPrice = product ? new Decimal(product.salePrice) : new Decimal(0);
    const quantity = new Decimal(Number(it?.quantity) || 0);
    const lineTotal = unitPrice.times(quantity);
    subtotal = subtotal.plus(lineTotal);
    return { unitPrice: unitPrice.toFixed(2), lineTotal: lineTotal.toFixed(2) };
  });
  return { lines, subtotal: subtotal.toFixed(2), total: subtotal.toFixed(2) };
});
```

Dos aclaraciones sobre este cálculo. Utiliza la misma biblioteca de aritmética decimal que el
servidor, de modo que la previsualización coincida con el importe definitivo. Y constituye
**exclusivamente una vista previa**: el importe que se persiste lo calcula el servidor, que es la
única autoridad (Capítulo VIII). El cliente no envía precios ni totales.

## Carga diferida

Cada área funcional se carga la primera vez que el usuario navega a ella:

```ts
{
  path: 'commercial/sales',
  loadChildren: () => import('./features/commercial/sales/sales.routes').then((m) => m.SALES_ROUTES),
},
```

Un usuario del área de Stock, que sólo accede a materiales, nunca descarga el código de ventas,
reportes ni auditoría.

La estructura de rutas separa la zona pública de la protegida:

```
/login, /forgot-password, /reset-password     públicas
'' + authGuard → MainLayout
    ├── /dashboard
    ├── /commercial/customers, /commercial/sales
    ├── /inventory/finished-products
    ├── /finance/sales-cash
    ├── /users, /roles, /audit, /reports
    └── redirección a /dashboard
```

La guarda de sesión se aplica una sola vez, sobre el grupo protegido. Las guardas de permiso se
aplican en cada ruta hija, junto al permiso que declaran como dato asociado.

En el listado de ventas, la ruta de creación se declara **antes** de la ruta paramétrica de detalle;
en caso contrario, esta última capturaría aquélla interpretándola como un identificador.

## Capa de acceso a datos

Un único servicio concentra el acceso HTTP: prefija la dirección base, desenvuelve la estructura de
respuesta y descarta los parámetros vacíos.

```ts
get<T>(path: string, params?: Record<string, string | number | boolean>): Observable<T> {
  return this.http.get<ApiResponse<T>>(`${this.base}${path}`, { params: this.toParams(params) })
                  .pipe(map((res) => res.data));
}
```

El descarte de parámetros vacíos simplifica a quien lo consume: un filtro sin valor sencillamente no
se envía, sin que cada pantalla deba construir el conjunto de parámetros de forma condicional.

Sobre este servicio, cada área declara el suyo, que traduce operaciones de dominio a rutas:

```ts
@Injectable({ providedIn: 'root' })
export class CustomerService {
  private readonly api = inject(ApiService);
  private readonly base = '/commercial/customers';

  list(page: number, limit: number, search?: string) { … }
  create(dto: CustomerInput) { … }
  update(id: string, dto: CustomerInput) { … }
  deactivate(id: string) { … }
}
```

Los componentes consumen estos servicios y **nunca el cliente HTTP directamente**. La consecuencia
práctica es que un cambio en la estructura de respuesta del servidor se absorbe en un único lugar.

### Tipado de importes

Los modelos del cliente declaran los importes **como cadenas de texto**:

```ts
export interface FinishedProduct {
  salePrice: string;     // decimal serializado
  currentStock: string;  // decimal serializado
}
```

Es la contrapartida de la decisión de precisión decimal descrita en el Capítulo V. Los valores se
convierten a número únicamente para previsualizar totales, y se presentan mediante el transformador
de moneda.

## Interceptores

### Sesión

```ts
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const isAuthEndpoint = AUTH_ENDPOINTS.some((url) => req.url.includes(url));
  const token = auth.accessToken;

  const authReq = !isAuthEndpoint && token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && !isAuthEndpoint && auth.refreshToken) {
        return auth.refresh().pipe(
          switchMap((tokens) => next(req.clone({ setHeaders: { Authorization: `Bearer ${tokens.accessToken}` } }))),
          catchError((refreshErr) => { auth.logout(); return throwError(() => refreshErr); }),
        );
      }
      return throwError(() => err);
    }),
  );
};
```

Adjunta la credencial a cada petición y gestiona la renovación de forma transparente: ante una
respuesta de sesión inválida solicita un par de tokens nuevo y **reintenta la petición original una
única vez**. Si la renovación fracasa, cierra la sesión.

Los puntos de acceso públicos de autenticación quedan excluidos. Sin esa exclusión, un intento de
inicio de sesión con credenciales incorrectas dispararía una renovación carente de sentido.

### Errores

```ts
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notify = inject(NotificationService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status !== 401) {
        if (err.error instanceof Blob) {
          err.error.text()
            .then((text) => notify.error(parseErrorText(text) ?? err.message ?? FALLBACK_MESSAGE))
            .catch(() => notify.error(err.message ?? FALLBACK_MESSAGE));
        } else {
          notify.error(err.error?.error ?? err.message ?? FALLBACK_MESSAGE);
        }
      }
      return throwError(() => err);
    }),
  );
};
```

Presenta una notificación ante cualquier error, con el mensaje que el servidor produjo. Gracias a la
uniformidad del contrato de error (Capítulo IV), la extracción del mensaje es idéntica en todos los
casos.

Dos particularidades. Las respuestas de sesión inválida se ignoran, porque las gestiona el
interceptor anterior; notificarlas presentaría un error al usuario justo antes de una renovación
exitosa e invisible. Y el cuerpo del error se examina por si llegara en formato binario, situación
que se produce al fallar la descarga de un reporte: sin ese tratamiento, la notificación resultaría
ininteligible.

La consecuencia de tener este interceptor es que **los componentes no manejan la presentación de
errores**. Su bloque de error se limita a restablecer el estado de la interfaz:

```ts
this.service.create(dto).subscribe({
  next: (sale) => { this.saving.set(false); this.router.navigate(['/commercial/sales', sale.id]); },
  error: () => this.saving.set(false),
});
```

Las pantallas de autenticación constituyen la excepción: presentan además un mensaje en línea, porque
en ellas el error forma parte del flujo y no de una operación en segundo plano.

## Guardas de ruta

```ts
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.accessToken) return true;
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
```

La guarda de sesión conserva la dirección solicitada, de modo que tras autenticarse el usuario
llegue a donde pretendía ir y no a la pantalla inicial.

La guarda de permiso lee el permiso declarado en la ruta y aplica la misma regla que el servidor,
incluido el comodín de administración. Ante la ausencia del permiso redirige a la raíz.

Conforme a lo expuesto en el Capítulo VI, ambas guardas constituyen medidas de usabilidad. La
verificación con valor de seguridad es la del servidor.

## Componentes compartidos

### Grilla de datos

Es la pieza reutilizada de mayor alcance: **seis pantallas** la utilizan. Ofrece paginación en el
servidor, búsqueda con retardo y formateo por tipo de columna.

```ts
constructor() {
  this.search$.pipe(debounceTime(300), takeUntilDestroyed()).subscribe(() => this.emit());
}
```

El retardo de trescientos milisegundos evita una petición por cada pulsación. La cancelación
automática al destruirse el componente previene la fuga de suscripciones.

El aspecto más interesante es el modo que **exige una búsqueda previa**:

```ts
readonly awaitingSearch = computed(
  () => this.searchRequired() && this.search().length < this.minSearchLength(),
);

readonly displayRows = computed<T[]>(() => (this.awaitingSearch() ? [] : this.rows()));
```

En ese modo, la grilla no consulta al servidor hasta contar con al menos dos caracteres. Resuelve un
problema concreto: al ingresar a un listado de clientes, el comportamiento natural sería traer la
primera página del catálogo completo, operación inútil cuando el usuario busca un cliente
determinado.

La derivación de las filas presentadas merece atención. En estado inicial devuelve un conjunto vacío
**sin modificar los datos recibidos**, de modo que al borrar el campo de búsqueda no permanezcan
visibles los resultados anteriores aunque el componente contenedor aún los conserve.

La emisión hacia el contenedor se interrumpe en ese estado, lo que neutraliza la carga inicial que la
tabla dispara automáticamente al montarse.

Tres pantallas exigen búsqueda —clientes, materiales y usuarios— y tres no: ventas, auditoría y caja
presentan el día en curso, porque la operación diaria requiere ver lo del día al ingresar.

### Transformadores de presentación

```ts
@Pipe({ name: 'currencyArs', standalone: true })
export class CurrencyArsPipe implements PipeTransform {
  private static readonly formatter = new Intl.NumberFormat('es-AR', {
    style: 'currency', currency: 'ARS',
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  });
  …
}
```

El formateador se declara como miembro estático: construirlo es costoso y la alternativa implicaría
rehacerlo en cada celda de cada tabla.

Ambos transformadores —moneda y fecha— devuelven un guion ante valores ausentes o inválidos, en lugar
de producir un error o presentar una fecha inválida.

### Diálogo de confirmación

Se monta una única vez en la raíz y se invoca desde cualquier pantalla:

```ts
this.confirm.confirm({
  header: 'Anular venta',
  message: '¿Anular esta venta? Se repondrá el stock de los materiales vendidos.',
  accept: () => { … },
});
```

Toda operación irreversible o de baja lo utiliza. El mensaje describe la consecuencia, no la acción:
la anulación no anuncia que anulará sino que repondrá las existencias.

## Sistema de diseño

Los valores de diseño se definen **una sola vez** como variables de hoja de estilos y se consumen
desde el marco de utilidades:

```css
:root {
  --color-primary-600: #2563eb;
  --color-accent-500:  #f59e0b;
  --color-surface-50:  #f8fafc;
  --color-text-muted:  #64748b;
  --radius-md: 0.5rem;
  --sidebar-width: 16rem;
  --header-height: 3.5rem;
}
```

El color primario se mantiene en la familia del tema de la biblioteca de componentes, de modo que sus
elementos y las utilidades no produzcan combinaciones discordantes.

Estos valores trascienden el cliente: el generador de planillas del servidor reutiliza el azul
primario y el gris del texto secundario para el encabezado de los reportes (Capítulo IX), de modo que
el archivo descargado no desentone con la aplicación que lo produjo.

## Estructura de la aplicación autenticada

La estructura visual se compone de una barra lateral contraíble, una barra superior y el área de
contenido. La barra lateral filtra sus elementos según los permisos del usuario:

```ts
readonly items = computed(() =>
  this.allItems.filter((item) => !item.permission || this.auth.hasPermission(item.permission)),
);
```

El filtrado es una señal derivada del usuario actual, de modo que el menú se recalcula solo al
iniciarse la sesión sin requerir intervención alguna.

La correspondencia entre cada elemento del menú, su ruta y su permiso se presenta en el Anexo B.
