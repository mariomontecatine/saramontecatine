# saramontecatine

Landing page de una sola página para Sara Montecatine, psicóloga sanitaria.
Estática, sin build ni dependencias: se abre `index.html` y ya.

## Secciones

`01` Portada · `02` Quién soy · `03` Cómo trabajo · `04` En qué puedo ayudarte · `05` Contacto,
con menú hamburguesa lateral para saltar entre ellas.

## Texto que falta por revisar

El texto de **Quién soy** y los datos de contacto son los tuyos, tal cual me los pasaste.
Lo que sigue lo he redactado yo de relleno y hay que revisarlo antes de publicar:

- **Cómo trabajo**: el titular y los tres pasos (`index.html`, sección `#como-trabajo`).
- **En qué puedo ayudarte**: las seis áreas y sus descripciones (`#ayuda`).
- Los reclamos de portada y de contacto.

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
