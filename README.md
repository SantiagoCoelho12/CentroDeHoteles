# Centro de Hoteles de La Paloma

Versión local con Next.js, React y TypeScript: portada, listado y fichas adaptables a computadora y celular, búsqueda por nombre y filtros de tipo y zona. Los filtros de servicios aparecen cuando existen servicios cargados. Las fichas incluyen galería por tipo y enlaces de contacto cuando hay datos cargados. El mapa, los usuarios y la administración se incorporarán en próximas etapas. No hay despliegue.

## Requisitos

Para publicar esta primera versión de prueba en GitHub Pages, seguir la [guía de publicación](docs/github-pages.md). Incluye configuración de Actions, compilación estática y limitaciones del correo.

- Node.js 20.9 o superior y npm. Comprobar con `node --version` y `npm --version`.
- Una terminal abierta en la carpeta del proyecto.
- Acceso a internet para la primera instalación de dependencias. No se necesitan base de datos, cuentas ni claves externas para esta etapa.

## Ejecutar en desarrollo

En Windows, abrir PowerShell y ejecutar:

```powershell
cd C:\Users\Santiago\Documents\CentroDeHoteles
npm ci
npm run dev
```

`npm ci` instala las versiones del archivo `package-lock.json`. Solo hace falta repetirlo cuando cambien las dependencias o se descargue una copia nueva del proyecto.

Abrir [http://localhost:3000](http://localhost:3000) y mantener la terminal abierta. Los cambios de código se reflejan automáticamente; al editar los JSON de alojamientos, recargar la página para comprobar los datos. Para detener el servidor, presionar `Ctrl+C` en su terminal.

Si el puerto está ocupado, detener la otra instancia o elegir otro:

```powershell
npm run dev -- --port 3001
```

En ese caso abrir [http://localhost:3001](http://localhost:3001), o la dirección `Local` que indique la terminal.

### Borradores y variables de entorno

En desarrollo se muestran los establecimientos activos, incluidos los borradores, y un aviso de prueba. En una compilación de producción se excluyen los borradores por defecto.

Para cambiar este comportamiento, copiar `.env.example` a `.env.local` y agregar una de estas líneas sin `#`:

```dotenv
SHOW_DRAFTS=true
```

Usar `true` para incluir borradores también en una compilación local de prueba, o `false` para ocultarlos incluso en desarrollo. Reiniciar el servidor después de cambiar esta configuración. Para producción, volver a compilar: el catálogo se genera durante el build. `.env.local` no se guarda en el repositorio.

## Probar la app manualmente

Con `npm run dev` en ejecución y los datos iniciales, revisar:

| Prueba | Resultado esperado |
| --- | --- |
| Abrir el inicio | Portada de La Paloma, aviso de borrador y cuatro establecimientos, incluido un complejo ficticio de prueba |
| Pulsar «Explorar alojamientos» o «Alojamientos» | La página baja al listado |
| Revisar el orden | Cabañas Tío Con, Complejo de prueba, Hotel La Casona y Hotel La Tuna |
| Buscar `tuna` | Aparece únicamente Hotel La Tuna y el contador indica un alojamiento |
| Buscar `CABANAS` | Aparecen Tío Con y el complejo de prueba; la búsqueda ignora mayúsculas y tildes |
| Buscar un nombre inexistente | Aparece el mensaje sin resultados y se ofrece limpiar filtros |
| Seleccionar el tipo «Cabañas» | Aparecen Tío Con y el complejo de prueba |
| Abrir «Filtros» y elegir zona «Centro» con todos los tipos | Aparece únicamente La Casona |
| Combinar tipo «Cabañas» y zona «Centro» | No hay resultados con los datos iniciales |
| Quitar un filtro aplicado o pulsar «Limpiar filtros» | Se actualizan el listado y el contador; al limpiar todo vuelven los cuatro |
| Revisar las fotos | La Casona y La Tuna tienen fotos de referencia; Tío Con indica fotografía pendiente |
| Pulsar una tarjeta | Abre su ficha en `/alojamientos/identificador` |
| Buscar `tuna`, abrir su ficha y pulsar «Volver a alojamientos» | Recupera búsqueda, filtros y posición del listado en la misma pestaña; también se puede usar Atrás del navegador |
| Revisar la ficha de La Tuna o La Casona | Muestra fotos y datos pendientes, sin selector al tener un solo tipo; La Tuna incluye dos ilustraciones adicionales de prueba |
| Revisar la ficha de Tío Con | Muestra el aviso de fotografías pendientes y su información de cabañas |
| Abrir `/alojamientos/no-existe` | Muestra alojamiento no encontrado |
| Pulsar «Quiénes somos» en el menú o «Conocé el centro» en el inicio | Se abre `/quienes-somos`, con el texto original, la misión y la visión del centro |
| Pulsar «Alojamientos» desde «Quiénes somos» | Vuelve al listado de la página principal |

Los filtros de servicios aparecen únicamente si hay servicios cargados en los datos. El complejo ficticio incluye servicios de prueba; los alojamientos reales todavía no tienen servicios confirmados.

### Galerías y establecimiento mixto de prueba

Al final de cada ficha, «Consultar fechas disponibles» abre un diálogo con tipo de alojamiento (Cualquiera o uno específico), calendario de entrada y salida, opción de fechas flexibles y contadores de adultos, niños y habitaciones. En computadora se ven dos meses; en celular uno con navegación. No se pueden elegir fechas pasadas ni una salida anterior o igual a la entrada. El botón final abre el mismo WhatsApp del contacto con toda la información, sin enviar automáticamente ni confirmar disponibilidad. En el complejo de prueba se puede revisar el enlace; las fichas sin WhatsApp muestran el dato pendiente y no habilitan el envío. Esta función funciona también en GitHub Pages.

- La Tuna tiene su imagen de referencia y dos ilustraciones de prueba, identificadas como imágenes que no representan sus instalaciones. Probar «Anterior», «Siguiente» y las miniaturas.
- Abrir `/alojamientos/complejo-de-prueba`: es un establecimiento ficticio, sin contactos ni ubicación reales, con hotel y cabañas.
- «Todo» muestra cinco imágenes: una general, dos del hotel y dos de cabañas.
- «Hotel» muestra tres imágenes: general, habitación y recepción. «Cabañas» muestra general, exterior e interior de cabaña.
- La piscina compartida se mantiene en ambas selecciones. Cada selección reinicia la galería en la primera foto y cambia la información específica.
- En el listado, combinar «Cabañas» y «Desayuno» no debe devolver el complejo: su desayuno es exclusivo del hotel. «Hotel» y «Desayuno» sí lo incluye.
- Para ocultar el ejemplo, cambiar `active` a `false` en `data/accommodations/complejo-de-prueba.json`. Mantenerlo como borrador; no publicarlo como establecimiento real.

Las cinco ilustraciones propias se guardan en `public/fotos/prueba/` y pueden regenerarse con `node scripts/create-demo-images.mjs`.

### Computadora y celular

En las herramientas de desarrollo del navegador (`F12` o la opción «Inspeccionar»), activar la vista de dispositivos y probar anchos de 320, 390 y 768 píxeles, además de la vista de escritorio de 1280 píxeles:

- Por debajo de 700 px, el listado tiene una columna y el selector de tipo está dentro de «Filtros».
- Desde 700 px, el listado tiene dos columnas y el selector de tipo queda visible junto a la búsqueda.
- Comprobar que textos, fotos y controles no se superpongan ni generen desplazamiento horizontal.
- En celular, abrir «Filtros», seleccionar opciones y pulsar «Ver N alojamientos»: el panel debe cerrarse manteniendo la selección.
- Probar navegación con `Tab`, activación de botones con teclado y foco visible.

Para revisar desde un teléfono real, conectar ambos dispositivos a la misma red y abrir `http://IP-DE-LA-COMPUTADORA:3000`. Consultar la dirección IPv4 de la computadora con `ipconfig`; `localhost` en el teléfono apunta al propio teléfono. La conexión depende de que la red y el firewall permitan el acceso al servidor local.

El bloque de contacto tiene cuatro filas: teléfono, WhatsApp con icono, dirección de correo y botón «Envianos un correo». Este último abre un formulario con nombre, email, teléfono y mensaje. WhatsApp y teléfono se habilitan al cargar datos válidos. Los tres borradores actuales todavía no tienen contactos confirmados; no se usan contactos ficticios. El mapa sigue pendiente.

Para habilitar el envío de correos, configurar Resend y el remitente en `.env.local` según [la guía de envío](docs/envio-de-correos.md). Sin esa configuración o sin email del alojamiento, el formulario informa el problema y no simula éxito. Puede probarse abrir/cerrar el diálogo, la validación de campos requeridos y el aviso de correo pendiente con los borradores actuales.

En establecimientos con varios tipos, la ficha muestra «Todo» y cada tipo disponible. La selección cambia la galería y la información específica; las fotos generales se mantienen. Si se entra desde un filtro de tipo del listado, la ficha abre con ese tipo seleccionado. La clasificación de fotos se prueba automáticamente con datos sintéticos y puede explorarse con el complejo de prueba.

## Comprobaciones técnicas

Ejecutar desde la raíz del proyecto:

```powershell
npm run validate:data
npm test
npm run typecheck
npm run build
```

| Comando | Qué comprueba |
| --- | --- |
| `npm run validate:data` | Estructura de los JSON, referencias a catálogos y existencia de fotos; informa campos pendientes en borradores |
| `npm run typecheck` | Tipos de TypeScript |
| `npm test` | Separación de fotos por tipo, eliminación de duplicados y generación de enlaces de contacto con datos sintéticos |
| `npm run build` | Valida los datos y genera la compilación de producción |
| `npm run validate:publish` | Exige información completa en todos los establecimientos activos |

Con los borradores actuales, `validate:data` debe terminar sin errores y con avisos `PENDIENTE`. `validate:publish` debe fallar hasta completar contactos, direcciones, coordenadas y fotos pendientes. Un registro con `status: "published"` siempre debe estar completo. Las comprobaciones de formato no confirman que un contacto, servicio o ubicación sea verdadero.

Estas comprobaciones no sustituyen la revisión manual del navegador; las pruebas automatizadas actuales cubren lógica de galería y contacto, no toda la interfaz.

## Probar la compilación de producción localmente

Detener el servidor de desarrollo antes de compilar y ejecutar:

```powershell
npm run build
npm run start
```

Abrir [http://localhost:3000](http://localhost:3000). Sin `SHOW_DRAFTS=true`, los borradores quedan excluidos y se muestra el catálogo vacío. Para revisar el diseño con ellos, configurar esa variable en `.env.local` **antes de compilar**. Después de editar código o datos en este modo, detener el servidor, volver a compilar y ejecutar `npm run start` nuevamente.

La versión de prueba lleva `noindex` para evitar su indexación. Revisar esta configuración cuando se prepare la publicación. Las fotos de referencia y sus fuentes están registradas en [la guía de fotos](docs/fotos-referencia.md).

## Guías del proyecto

La documentación complementaria está en `docs/`:

- [Idiomas](docs/idiomas.md): selector ES / EN / PT, traducciones y persistencia de la preferencia.

- [GitHub Pages](docs/github-pages.md): publicar y probar la demo estática con GitHub Actions.

- [Cargar y mantener alojamientos](docs/cargar-alojamientos.md): datos, tipos, servicios, fotografías y traducciones.
- [Fotografías de referencia](docs/fotos-referencia.md): origen de las imágenes y revisión antes de publicar.
- [Contenido institucional](docs/contenido-institucional.md): fuente del texto de «Quiénes somos» y criterio de conservación.
- [Envío de correos](docs/envio-de-correos.md): configuración de Resend y pruebas del formulario de contacto.

## Organización

- `data/accommodations/`: un archivo JSON por establecimiento.
- `data/templates/alojamiento.json`: plantilla, excluida del catálogo.
- `data/catalogs.json`: tipos, servicios, zonas e idiomas.
- `public/fotos/`: imágenes organizadas por establecimiento.
- `src/domain/accommodation.ts`: contrato de datos independiente de la interfaz.
- `docs/cargar-alojamientos.md`: instrucciones para editar contenido.
- `docs/contenido-institucional.md`: origen y criterio de conservación del texto de «Quiénes somos».
- `docs/envio-de-correos.md`: configuración de Resend y pruebas de formularios de contacto.

La guía incluye la clasificación de fotos generales, de hotel y de cabañas, las carpetas recomendadas y el comportamiento previsto de la galería al seleccionar cada tipo.

Los registros iniciales proceden de contenido indexado de la web actual. Son borradores pendientes de revisión. Se incorporaron fotos de referencia de La Casona y La Tuna; faltan confirmar contactos, coordenadas y servicios. Ninguno debe presentarse como información verificada o listo para publicar.

## Criterios acordados para la interfaz

Portada de La Paloma y listado en la misma página; dos columnas en computadora y una en celular; orden alfabético español; mapa inicialmente cerrado y sincronizado con filtros; una tarjeta y un marcador por establecimiento; contacto desde la ficha. Cada establecimiento tiene un WhatsApp y un email y puede ofrecer varios tipos. Los filtros de tipo y servicios deben coincidir en el mismo tipo, sumando sus servicios a los compartidos. Los borradores podrán verse en la vista local de prueba; la futura vista pública mostrará únicamente registros activos y publicados.

El encabezado permite seleccionar ES, EN y PT. Se traducen la interfaz, los contenidos actuales, los formularios, el calendario y los mensajes de WhatsApp; los nombres propios se conservan. La selección se guarda en el navegador y persiste al navegar y recargar. Los textos nuevos pueden tener `es`, `en` y `pt`, con español como respaldo si falta una traducción. Ver [la guía de idiomas](docs/idiomas.md).
