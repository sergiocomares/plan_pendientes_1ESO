# Matemáticas 1.º ESO · Plan de recuperación

Aplicación educativa estática, sin cuentas ni backend. Para probarla, abre la carpeta con VS Code y usa Live Server sobre `index.html`; la carga de los archivos JSON requiere un servidor web.

## Contenidos editables

- `data/bloques.json`: nombre, orden, color, objetivos e identificador de cada bloque.
- `data/configuracion.json`: nombre del curso, asignatura y textos de cabecera.
- `data/teoria.json`: explicaciones breves y ejemplos. Las expresiones matemáticas usan sintaxis TeX de MathJax.
- `data/videos.json`: vídeos comprobados. Añade `titulo`, `descripcion`, `youtubeId` (ID real de 11 caracteres) y `canal`; la miniatura y el enlace se generan automáticamente.
- `data/ejercicios.json`: niveles, enunciados, soluciones y preguntas de autoevaluación. `correcta` es el índice (empezando por 0) de la respuesta correcta.
- `data/recursos.json`: fichas y actividades propias. Añade la URL pública de GitHub Pages en `url`.
- `data/calendario.json`: semanas orientativas sin fechas.
- `data/documentos.json`: documentación administrativa, separada del estudio.

Los bloques incluidos como ejemplo son Números naturales, Divisibilidad, Números enteros y Fracciones. El resto queda preparado para adaptarse al programa de cada centro. El progreso se guarda en el navegador mediante `localStorage`.

## Añadir otro curso

Copia la aplicación completa dentro de una carpeta como `2eso/`, `3eso/` o `4eso/`. Las rutas a CSS, JavaScript y JSON son relativas, así que funcionarán desde esa ubicación. Cambia `data/configuracion.json` y sustituye los archivos JSON de contenidos; la lógica y los estilos comunes se mantienen iguales.