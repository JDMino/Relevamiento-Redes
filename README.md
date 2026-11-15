# Laboratorio de red del Poder Judicial de Corrientes

Simulador interactivo, estático y sin dependencias, basado en el *Informe de Relevamiento* de la infraestructura de red del Poder Judicial. Cada escena muestra paquetes en vivo para entender cómo reacciona la red ante fallas, congestión y cambios de configuración.

## Estructura

| Archivo | Contenido |
|---|---|
| `index.html` | Estructura de la página, modal de guía y carga de fuentes |
| `styles.css` | Tokens de color (claro/oscuro), componentes, diseño de escritorio y tema de red |
| `app.js` | Motor de simulación, escenas, interfaz, interacción y dibujo en canvas |

## Cómo usarlo

1. Descarga los tres archivos en la misma carpeta.
2. Abre `index.html` en un navegador moderno. No requiere servidor ni instalación.
3. Las fuentes (IBM Plex Sans, JetBrains Mono y Space Grotesk) se cargan desde Google Fonts. Sin conexión se usan fuentes del sistema y todo sigue funcionando.

Todas las animaciones arrancan solas al entrar a cada escena. El botón de pausa las detiene.

## Escenas

- **Red provincial:** 8 localidades hacia el data center por la MPLS, con segundo operador opcional. Al tocar una localidad se abre su **detalle**: edificio principal y dependencias con enlaces de fibra, radioenlace y Starlink (este último pasa por un satélite).
- **SD-WAN:** cuatro salidas a Internet con desvío por pérdida y QoS para la voz.
- **Centro de cableado:** doble fibra, core apilado y switches de acceso.
- **Segmentación:** el firewall permite o bloquea tráfico entre zonas según las reglas del informe.
- **Energía y clima:** paneles solares, red eléctrica, UPS, grupos electrógenos y refrigeración.

## Interacción

- Tocar un nodo o enlace lo corta o repara. Arrastrar un nodo lo reubica.
- Tocar un paquete muestra su camino y cómo termina.
- Panel lateral: parámetros, escenarios de falla, herramientas (caos, ráfaga, velocidad del tiempo, editor) y exportación/importación de escenarios.
- Atajos: `Espacio` pausa · `1`–`5` cambia de escena · `R` reinicia · `Esc` vuelve desde el detalle de una localidad.

## Arquitectura de `app.js`

- **Modelo:** cada escena es una función (`sceneA`, `sceneB`…) que devuelve nodos, enlaces, controles y funciones `spawn`, `tick`, `after`, `status` y `stats`.
- **Motor:** `route()` calcula caminos (Dijkstra sobre enlaces y nodos activos), `launch()` crea paquetes, y `step()` los mueve, aplica pérdida y congestión y mide la utilización de cada enlace.
- **Dibujo:** `draw()` pinta la cuadrícula, enlaces, nodos (`icon()`, `satIcon()`), paquetes, chispas y efectos. `ltype()` y `sbeam()` dibujan los tipos de enlace.
- **Interfaz:** `load()` arma controles y `regroup()` los organiza en secciones plegables.
- **Escenarios de falla:** objeto `SCN`, por clave de escena.

### Agregar una escena

1. Crea una función `sceneX()` con la misma forma que las existentes.
2. Regístrala en el objeto `SC` y, si quieres, agrega botones de falla en `SCN`.
3. Si necesita un destino de tráfico para la ráfaga y los nodos propios, agrégalo en `SINK`.

## Limitaciones

- Los valores de los sliders no se incluyen en los escenarios exportados.
- Solo se pueden borrar los nodos y enlaces creados en el modo editor.
- Las tasas de pérdida y la política de Wi-Fi hacia Internet son parámetros de simulación, no mediciones reales.
