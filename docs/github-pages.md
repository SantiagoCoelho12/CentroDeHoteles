# Publicar la demo en GitHub Pages

Pages debe publicar la exportación estática `out/`, no la raíz del repositorio ni `docs/`.

## Activar el despliegue

1. Subir estos cambios, incluido `.github/workflows/pages.yml`, a la rama `master` del repositorio `SantiagoCoelho12/CentroDeHoteles`.
2. Abrir **Settings → Pages → Build and deployment → Source** y elegir **GitHub Actions**.
3. En **Actions**, abrir **Publicar demo en GitHub Pages**. Se ejecuta con cada push a `master` o manualmente con **Run workflow**.
4. Esperar a que `build` y `deploy` finalicen correctamente y abrir la URL del despliegue.

URL prevista: https://santiagocoelho12.github.io/CentroDeHoteles/. Solo un workflow exitoso confirma la publicación. Si aún se ve el README, revisar el origen y el último workflow.

## Probar la exportación localmente

```powershell
npm ci
npm run build:pages
npm run preview:pages
```

Abrir http://localhost:4174/CentroDeHoteles/. Este preview sirve únicamente los archivos estáticos; detener con `Ctrl+C`.

Comprobar imágenes, navegación, recarga directa de fichas, Hotel/Cabañas desde filtros y scroll del menú. El formulario debe indicar que es una demo sin enviar correos.

## Características de la demo

- Incluye borradores y el complejo ficticio, con aviso de prueba y `noindex`.
- Genera una página por establecimiento activo: los cambios de datos requieren volver a compilar y desplegar.
- Ajusta enlaces e imágenes al prefijo `/CentroDeHoteles` y desactiva la optimización de imágenes que requiere servidor.
- El formulario permite probar diseño y validación, pero no envía ni guarda datos. `/api/contacto` no se exporta. Teléfono y WhatsApp siguen disponibles si tienen números cargados.
- No usa claves de Resend ni las expone en el navegador.

`build:pages` activa `GITHUB_PAGES=true`, `SHOW_DRAFTS=true` y la ruta base. En Actions usa el nombre de `GITHUB_REPOSITORY`; localmente usa `CentroDeHoteles`. `PAGES_BASE_PATH` permite cambiar el prefijo o dejarlo vacío para un dominio raíz. Usar el mismo valor al ejecutar el preview.

En modo Pages, `pageExtensions: ['tsx']` excluye los handlers `route.ts`; las páginas del proyecto usan `page.tsx`. Mantener esa extensión al agregar páginas. La API original se conserva para el modo con servidor.

`npm run dev` y `npm run build` mantienen el modo normal de Next.js, sin prefijo. Para una publicación futura con servidor, Resend funciona según `envio-de-correos.md`. Pages necesita un backend externo si se quiere habilitar envío real.

Referencias: [GitHub Pages con Actions](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site), [exportación estática de Next.js](https://nextjs.org/docs/app/guides/static-exports).
