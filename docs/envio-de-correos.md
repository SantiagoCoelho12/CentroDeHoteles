# Consultas por correo con Resend

## Configurar el envío real

1. Preparar una cuenta en Resend y verificar un dominio de envío siguiendo [su documentación](https://resend.com/docs/dashboard/domains/introduction).
2. Crear una clave de envío y completar en `.env.local` (o en las variables del servidor):

```dotenv
RESEND_API_KEY=re_tu_clave
CONTACT_FROM_EMAIL=Centro de Hoteles <consultas@tu-dominio-verificado.com>
```

3. Cargar el correo confirmado de cada alojamiento en `contact.email` de su JSON.
4. Reiniciar el servidor. En producción, estas variables deben estar disponibles para el servidor que ejecuta Next.js.

La clave permanece en el servidor y nunca lleva prefijo `NEXT_PUBLIC_`. No guardar claves en JSON ni en archivos versionados. No hace falta instalar el SDK: la integración usa la [API oficial de envío](https://resend.com/docs/api-reference/emails/send-email).

## Comportamiento

- El visitante completa nombre, teléfono y mensaje. El alojamiento responde al teléfono indicado; no se solicita correo al visitante.
- El envío sale desde `CONTACT_FROM_EMAIL` y va al `contact.email` del establecimiento. El texto incluye nombre, teléfono, mensaje y tipo seleccionado si corresponde.
- La ficha muestra la dirección del alojamiento; el botón abre el formulario dentro de la web, sin abrir un cliente de correo.
- WhatsApp usa el enlace oficial `wa.me` con el número internacional. Abre el chat en la app cuando el dispositivo lo admite; en computadora puede ofrecer WhatsApp Web. No envía el mensaje automáticamente.
- Sin email del alojamiento o sin configuración del proveedor, se muestra un error claro y no se confirma un envío inexistente.
- El éxito significa que Resend aceptó el correo. No garantiza entrega en la bandeja de entrada; revisar el estado en Resend si hace falta.

## Verificación local

`npm test` prueba destinatario fijo desde el servidor, validación, configuración ausente y errores de proveedor usando respuestas simuladas. No envía correos reales.

En los borradores actuales, abrir «Envianos un correo», completar datos de prueba y enviar debe informar que el email del alojamiento está pendiente. Para una prueba de entrega real, usar un destinatario propio autorizado y la configuración real de Resend; restaurar el dato del alojamiento después de la prueba.

El endpoint limita el tamaño de solicitud, valida los campos, verifica el origen y tiene un campo trampa contra bots. Limita a cinco intentos por minuto y establecimiento en memoria del proceso, y usa claves de idempotencia para reintentos del mismo mensaje. El límite se reinicia con el servidor y no se comparte entre varias instancias; antes de publicar en un entorno distribuido, adaptar esa protección al alojamiento del servidor.
