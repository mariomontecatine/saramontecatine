# saramontecatine

Landing page de una sola página para Sara Montecatine, psicóloga sanitaria.
Estática, sin build ni dependencias: se abre `index.html` y ya.

## Secciones

`01` Portada · `02` Quién soy · `03` Cómo trabajo · `04` En qué puedo ayudarte · `05` Contacto,
con menú hamburguesa lateral para saltar entre ellas.

## Texto que falta por revisar

Son de Sara, tal cual los pasó: **Quién soy**, los cuatro párrafos de **Cómo trabajo**,
la descripción de los tres pasos y los datos de contacto.

Lo que sigue lo he redactado yo de relleno y conviene revisarlo antes de publicar:

- **Cómo trabajo** (`#como-trabajo`): los tres títulos de los pasos, no su texto.
- **En qué puedo ayudarte** (`#ayuda`): los ocho títulos de área y sus descripciones.
  Las de *obsesiones y compulsiones*, *eventos traumáticos* y *autoestima e identidad*
  son las más recientes y las que menos se han mirado.
- El reclamo de portada («Terapia presencial en Sevilla y online») y el titular de
  contacto («¿Damos el primer paso?»).
- El número de colegiada aparece dos veces, en `#quien-soy` y en el pie.

## Estructura

- `index.html` — toda la página.
- `estilo.css` — paleta (variables al principio, en `:root`), tipografía y animaciones.
- `script.js` — menú, desplazamiento lento, apariciones al hacer scroll y parallax.
- `et-book/` — tipografía ET Book, de [Tufte CSS](https://edwardtufte.github.io/tufte-css/)
  (licencia MIT en `LICENSE-et-book`).
- `img/` — imágenes.

### Ajustes rápidos

| Qué | Dónde |
| --- | --- |
| Colores | `estilo.css`, bloque `:root` (`--papel`, `--papel-tono`, `--lavanda`, `--acento`…) |
| Velocidad del scroll | `script.js`, constante `FACTOR` (más bajo = más lento) |
| Intensidad del parallax | atributo `data-parallax` en el HTML (más negativo = más movimiento) |
| Correo | `index.html`: aparece en el menú y en la sección de contacto |

## Imágenes

`img/sara_en_jardin.HEIC` es el original de la foto. La web usa `sara-jardin.jpg` y
`sara-jardin.webp`, generados a 1100 px de ancho. Las ilustraciones tienen su versión
`.webp` junto al `.jpg`. Si cambias una foto, genera las dos versiones o deja solo el `.jpg`
y quita el `<source>` correspondiente en el HTML.

Las tres ilustraciones vienen a unos 500 px de ancho, así que están usadas a tamaño
contenido; si consigues los originales en alta se pueden poner más grandes.

## Accesibilidad y movimiento

El desplazamiento lento solo se activa con ratón. En táctil se deja el nativo, y quien
tenga activado «reducir movimiento» en su sistema ve la web sin animaciones ni parallax.

## Publicar

Cualquier hosting estático sirve. Con GitHub Pages basta con activar Pages sobre la rama
`main` en la raíz del repo.
