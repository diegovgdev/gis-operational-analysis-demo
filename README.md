# GIS Operational Analysis Demo

Simulación GIS interactiva de portafolio. Permite analizar un punto (por coordenadas, clic en el mapa o ubicación de ejemplo) y obtener buffers de 1/3/5 km, bases cercanas con distancia y rumbo, fuentes de agua, torres y zonas intersectadas.

> **DEMO · DATOS FICTICIOS.** Todas las bases, fuentes, torres, zonas y rutas son inventadas y no corresponden a ninguna ubicación, institución ni sistema real. Es una aplicación autónoma y nueva.

## Stack

React · TypeScript · Vite · MapLibre GL JS · GeoJSON · Turf.js · Vitest · ESLint · GitHub Pages

Requiere **Node.js 22.13 o superior**.

## Uso

```bash
npm install
npm run dev      # servidor de desarrollo
npm run lint     # ESLint
npm test         # Vitest
npm run build    # build estático en dist/
```

## Estructura

- `src/lib/geo.ts` – utilidades geoespaciales puras (validación, GMS, distancia, rumbo, cardinal, selección, intersección).
- `src/lib/analysis.ts` – orquesta el análisis y construye los overlays del mapa.
- `src/data/` – capas GeoJSON ficticias (12 bases, 15 fuentes, 8 torres, 6 zonas, 5 rutas).
- `src/components/` – interfaz (mapa, formulario, capas, paneles de resultados).

## Mapa base y atribución

Estilo público de [OpenFreeMap](https://openfreemap.org) (sin token ni clave). La atribución *OpenFreeMap © OpenMapTiles, Data from OpenStreetMap* se mantiene visible en el mapa. No se usan servicios que exijan credenciales ni archivos `.env`.

## Despliegue

El workflow `.github/workflows/deploy.yml` ejecuta lint, pruebas y build, y publica `dist/` en GitHub Pages en cada push a `main`. Para activarlo: *Settings → Pages → Source: GitHub Actions*. El build usa `base: './'`, por lo que funciona en cualquier subruta.
