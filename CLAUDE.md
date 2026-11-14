# Juegos de Lucas — juegos.lucraft.com.mx

Sitio estático de juegos de ocio para Lucas (7 años). Cloudflare Pages publica la carpeta `public/` automáticamente después de cada `git push` a `main` (1 o 2 minutos).

## Estructura

- `public/index.html` — portada con una tarjeta por juego (la más nueva primero).
- `public/<juego>/index.html` — cada juego en su carpeta (minúsculas, sin acentos, con guiones), con una casita `href="../"` para regresar a la portada.
- `public/pokedex/` — Pokédex con 3 modos: 📖 Pokédex (favoritos, evoluciones, debilidades), ❓ ¿Quién es ese Pokémon? (por silueta o por sonido) y 🎵 Música (canción con los cries + batería Básica/Rock/Fiesta e instrumentos de fondo sintetizados: bajo, guitarra, piano, campanitas; volumen). Búsqueda por voz 🎤 (Web Speech API, es-MX) en los tres modos. Usa PokeAPI y sprites/cries de GitHub (necesita internet).
- `public/bloques/` — Aventura de Bloques: decenas (rojo), centenas (amarillo) y unidades (azul) con un compañero Pokémon que habla.
- `public/comun/` — `juegos.js` y `juegos.css` compartidos por memorama y laberinto: los 15 Pokémon favoritos, sonido (cries, voz es-MX, efectos), progreso, récords, ventanas, medallas y confeti. Guarda en `localStorage["lucraft.juegos"]`.
  - Progreso: Pokémon liberados en el laberinto (en el orden `ORDEN`, Pikachu desde el inicio) y la mejor medalla por nivel (15 del laberinto, 3 del memorama).
  - Código de guardado de 10 caracteres (`XXXXX-XXXXX`, sin I/L/O/U, con verificación): lleva liberados y medallas a otro dispositivo; al cargarlo se combina con lo que ya hay. Los récords (top 10 con nombre) se quedan en cada dispositivo.
- `public/memorama/` — Memorama de 3, 6 o 12 pares con los Pokémon que Lucas elige. Cartas holográficas (capas arcoíris, brillitos y reflejo que siguen al dedo/mouse, o a la inclinación del iPad con «📱 Mover cartas»). Cry al voltear, combos, medalla por intentos y récords.
- `public/laberinto/` — Laberinto aleatorio en canvas: 15 niveles de aventura y juego libre (Chico, Mediano, Grande, Gigante, Sorpresa). Pokémon corriendo con sprites animados de PMD Sprite Collab (CC BY-NC 4.0, se cargan desde GitHub; tamaños de cuadro en `SPR`). Se controla deslizando el dedo, tocando o con flechas/WASD. Poké Balls por el camino, llave 🔑 opcional que abre una zona de piedra: adentro se libera el siguiente Pokémon (si ya están todos, Master Ball). Si el laberinto no cabe, la cámara sigue al Pokémon y 🗺️ muestra todo.

## Estilo

- Portada: fondo `#F4F0FF`, tarjetas blancas con borde lila `#B79CF0`, fuente Mali, primera letra del título en rojo `#E1262D`.
- Botones grandes y textos cortos: lo usa un niño de 7 años, sobre todo en iPad.
- Todo en español de México. Nada de datos personales, fotos ni nombres completos.

## Antes de hacer push

1. Probar con Playwright a 1280×720 y 390×844 sirviendo `public/` como raíz: sin errores de consola propios, sin desplazamiento horizontal, enlaces correctos.
2. Commit en `main` con mensaje en español (`Agrega …` / `Mejora …`) y `git push`.
3. Esperar 1–2 minutos y abrir https://juegos.lucraft.com.mx/<juego>/ para confirmar.

No tocar los repositorios `lucraft`, `preescolar` ni `little-bloom-minds` desde aquí.
