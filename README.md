# saramontecatine

Web estática de una sola página para Sara Montecatine Ibarrondo, psicóloga.
Sin dependencias externas ni build: se abre `index.html` en el navegador y ya.

## Qué editar

| Qué | Dónde |
| --- | --- |
| Nombre, subtítulo y descripción | `index.html` (`<h1>`, `<p class="subtitle">`, `<section>`) |
| Correo (ahora `contacto@saramontecatine.com`, inventado) | `index.html`: texto del enlace **y** su `href="mailto:..."` |
| Teléfono (ahora `+34 600 123 456`, inventado) | `index.html`: texto del enlace **y** su `href="tel:..."` |
| Colores, tamaños, márgenes | `estilo.css` |

El número de colegiada de la descripción está como `00000`, para sustituir.

## Estructura

- `index.html` — la página.
- `estilo.css` — los pocos ajustes propios encima de Tufte.
- `tufte.css` + `et-book/` — [Tufte CSS](https://edwardtufte.github.io/tufte-css/) v1.8.0 y la tipografía
  ET Book, copiados al repo (licencia MIT en `LICENSE-tufte-css`). No hace falta tocarlos.

## Publicar

Cualquier hosting estático sirve. Con GitHub Pages basta con activar Pages sobre la rama `main`
en la raíz del repo.
