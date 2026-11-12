# Juegos de Lucas — juegos.lucraft.com.mx

Sitio estático de juegos de ocio para Lucas (7 años). Cloudflare Pages publica la carpeta `public/` automáticamente después de cada `git push` a `main` (1 o 2 minutos).

## Estructura

- `public/index.html` — portada con una tarjeta por juego (la más nueva primero).
- `public/<juego>/index.html` — cada juego en su carpeta (minúsculas, sin acentos, con guiones), con una casita `href="../"` para regresar a la portada.
- `public/pokedex/` — Pokédex con 3 modos: 📖 Pokédex (favoritos, evoluciones, debilidades), ❓ ¿Quién es ese Pokémon? y 🎵 Música (canción con los cries, Web Audio). Usa PokeAPI y sprites/cries de GitHub (necesita internet).

## Estilo

- Portada: fondo `#F4F0FF`, tarjetas blancas con borde lila `#B79CF0`, fuente Mali, primera letra del título en rojo `#E1262D`.
- Botones grandes y textos cortos: lo usa un niño de 7 años, sobre todo en iPad.
- Todo en español de México. Nada de datos personales, fotos ni nombres completos.

## Antes de hacer push

1. Probar con Playwright a 1280×720 y 390×844 sirviendo `public/` como raíz: sin errores de consola propios, sin desplazamiento horizontal, enlaces correctos.
2. Commit en `main` con mensaje en español (`Agrega …` / `Mejora …`) y `git push`.
3. Esperar 1–2 minutos y abrir https://juegos.lucraft.com.mx/<juego>/ para confirmar.

No tocar los repositorios `lucraft`, `preescolar` ni `little-bloom-minds` desde aquí.
