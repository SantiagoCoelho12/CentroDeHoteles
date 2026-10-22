# Idiomas: ES, EN y PT

Los tres botones del encabezado cambian el idioma sin recargar la página. Español es el valor inicial. La elección se conserva en el navegador mediante `localStorage` y se mantiene al navegar entre páginas o volver a abrir la web. Si el almacenamiento está bloqueado, el selector sigue funcionando durante la sesión de la página.

La implementación funciona en GitHub Pages sin servidor de traducción ni llamadas externas. Los calendarios, días de la semana, países y mensajes de WhatsApp usan el idioma elegido. La etiqueta `lang` del documento se actualiza también. Las rutas son compartidas para los tres idiomas; la demo no genera URLs separadas ni etiquetas SEO multilingües. Los nombres propios y la identidad del centro se conservan.

## Editar textos

- `src/content/es.ts` conserva el contenido institucional y textos base en español.
- `src/content/translations.mjs` contiene filas `[español, inglés, portugués]` para los textos de interfaz.
- `src/content/translate.mjs` realiza la búsqueda y conserva el original cuando falta una traducción.
- `src/components/language-provider.tsx` comparte la selección y el contexto con las pantallas.
- Los datos de alojamiento y catálogos aceptan `es`, `en` y `pt` en cada texto traducible. Por ejemplo: `{ "es": "Hotel familiar", "en": "Family-run hotel", "pt": "Hotel familiar" }`.

Para datos nuevos, completar los tres idiomas. Si falta uno, se busca la traducción del texto español en el diccionario y finalmente se muestra el original. Al cambiar una frase base de interfaz, actualizar también su fila de traducción. No usar traducción automática en tiempo de ejecución.

El contenido institucional en español permanece literal respecto de la fuente original; las versiones inglesa y portuguesa son traducciones del mismo contenido, incluida su referencia histórica a 32 años.

## Probar

Cambiar ES → EN → PT en el inicio, abrir una ficha y recargar: el idioma debe mantenerse. Revisar filtros, servicios, correo, selector de países, calendario, noches y cantidades. Volver a ES debe recuperar los textos originales. Los mensajes de WhatsApp se generan en el idioma elegido, sin enviarlos automáticamente.

Ejecutar `npm test`, `npm run typecheck` y `npm run build:pages`.
