# Cargar y mantener alojamientos

## Agregar

1. Copiar `data/templates/alojamiento.json` a `data/accommodations/mi-establecimiento.json`.
2. Usar el mismo identificador en `id` y en el nombre del archivo, sin espacios, tildes ni mayúsculas.
3. Completar los textos en `es`, ubicación y contacto. Mantener `status: "draft"` hasta verificar todo.
4. Dejar en `types` únicamente los tipos que realmente ofrece. Se pueden reordenar, agregar o quitar sin modificar pantallas.
5. Guardar fotos en `public/fotos/mi-establecimiento/`. Cada foto se carga como `{ "src": "/fotos/mi-establecimiento/exterior.jpg", "alt": { "es": "Exterior del establecimiento" } }`. Usar esa estructura en `cover`, `photos` o en las fotos de cada tipo. Usar imágenes propias o autorizadas.
6. Ejecutar `npm run validate:data`.

## Contacto y mapa

`whatsapp` lleva código de país y número, solo dígitos, sin `+`, espacios ni prefijos locales. `email` lleva una dirección de correo. Ambos se cargan una sola vez por establecimiento.

`phone` es el teléfono para llamadas, separado del número de WhatsApp: puede ser distinto. Ejemplo de formato: `"phone": "+598 99 123 456"` (número ilustrativo, no cargar sin verificar). Es opcional y puede quedar en `null`. En la ficha aparece un enlace `tel:` cuando está completo.

El bloque «Contacto» muestra cuatro filas: teléfono, chat de WhatsApp con icono, dirección de correo y botón «Envianos un correo». El botón abre un formulario con nombre, email, teléfono y mensaje. El destinatario se obtiene del `email` de este archivo en el servidor; no se elige desde el navegador. Consultar `docs/envio-de-correos.md` para habilitar Resend.

Las coordenadas tienen la forma `{ "lat": -34.0, "lng": -54.0 }`: estos números son solo un ejemplo de formato, no la ubicación de ningún alojamiento. Confirmar el punto real antes de publicarlo. Mientras falten datos, usar `null`; no inventar valores.

## Servicios y tipos

Usar claves de `data/catalogs.json`. Para agregar un nuevo servicio, zona o tipo, agregar allí una clave estable y su etiqueta en español. Después usar esa clave en los establecimientos.

`sharedServices` contiene únicamente servicios disponibles para todos los tipos. Los servicios exclusivos se guardan en `types[].services`. Si se busca cabañas con desayuno, el desayuno debe estar en los servicios compartidos o en los de las cabañas.

## Clasificar fotos por tipo de alojamiento

Cada foto pertenece a una de estas categorías:

- **General:** fachada, recepción, jardín o piscina compartida. Se carga en `photos` del establecimiento.
- **Hotel:** habitaciones e instalaciones exclusivas del hotel. Se carga en `photos` del tipo con `id: "hotel"`.
- **Cabañas:** interiores y exteriores de las cabañas. Se carga en `photos` del tipo con `id: "cabanas"`.

La asignación en el archivo JSON determina la categoría. El nombre del archivo y su carpeta ayudan a organizarlo, pero no clasifican automáticamente una imagen.

Organización recomendada:

```text
public/fotos/mi-establecimiento/
  generales/
    piscina.jpg
  hotel/
    habitacion.jpg
  cabanas/
    interior.jpg
```

Ejemplo parcial de la información del establecimiento:

```json
{
  "cover": {
    "src": "/fotos/mi-establecimiento/generales/piscina.jpg",
    "alt": { "es": "Piscina compartida del establecimiento" }
  },
  "photos": [
    {
      "src": "/fotos/mi-establecimiento/generales/piscina.jpg",
      "alt": { "es": "Piscina compartida del establecimiento" }
    }
  ],
  "types": [
    {
      "id": "hotel",
      "description": { "es": "Información del hotel" },
      "services": [],
      "photos": [
        {
          "src": "/fotos/mi-establecimiento/hotel/habitacion.jpg",
          "alt": { "es": "Habitación del hotel" }
        }
      ]
    },
    {
      "id": "cabanas",
      "description": { "es": "Información de las cabañas" },
      "services": [],
      "photos": [
        {
          "src": "/fotos/mi-establecimiento/cabanas/interior.jpg",
          "alt": { "es": "Interior de una cabaña" }
        }
      ]
    }
  ]
}
```

`cover` selecciona la imagen principal de la tarjeta; no asigna una categoría ni agrega automáticamente la foto a la galería. Preferir una imagen general representativa y cargarla también en la lista que corresponda si debe verse en la galería. No duplicar una foto compartida en cada tipo: cargarla una sola vez en `photos` general.

### Comportamiento previsto de la ficha

| Selección | Fotos visibles |
| --- | --- |
| Todo | Fotos generales y de todos los tipos, con etiquetas «General», «Hotel», «Cabañas» u otro tipo correspondiente |
| Hotel | Fotos generales y fotos del hotel |
| Cabañas | Fotos generales y fotos de las cabañas |

La galería debe evitar repetir imágenes con la misma ruta. Una foto exclusiva del hotel nunca aparece al seleccionar cabañas. Para nuevos tipos se aplica la misma regla: fotos generales más fotos del tipo seleccionado. Si existe un solo tipo, no se muestra el selector y se ven sus fotos junto a las generales. Si no hay fotos de una categoría, no se sustituyen por imágenes de otro tipo.

Este comportamiento queda acordado para la futura interfaz; todavía no está implementado. En el futuro panel, al cargar una foto se podrá elegir «General» o uno de los tipos del establecimiento, manteniendo esta misma estructura de datos.

## Modificar, ocultar o quitar

Editar el archivo correspondiente. Para ocultarlo sin perder información, cambiar `active` a `false`. Para quitarlo definitivamente del catálogo, retirar su archivo JSON. Al quitar fotos de la ficha, retirar sus entradas en las listas y cambiar `cover` si correspondía.

## Revisar antes de publicar

Confirmar nombre, textos, servicios, contactos, fotos y coordenadas con el establecimiento. Registrar fuentes y observaciones en `sources`. Ejecutar `npm run validate:publish` y corregir pendientes antes de cambiar `status` a `published`. La validación técnica no reemplaza esta revisión.

## Traducciones

Agregar otros idiomas junto a `es`, por ejemplo `{ "es": "Hotel frente al mar", "pt": "Hotel à beira-mar" }`. No duplicar el establecimiento ni sus datos de contacto. Agregar el idioma a `locales` cuando se vaya a habilitar en la interfaz.
