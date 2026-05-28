# Extra tile assets

Additional tile assets for the pixel RPG map. These are kept separate from the current hand-built map tiles so they can be reviewed and adapted before being wired into `engine.js`.

## Folders

- `atlases/`: Larger source sheets and tile atlases.
- `atlases/isometric-stone-soup/`: Selected 64x32 isometric CC0 floor/wall sheets.
- `objects/kenney-isometric/`: Selected pseudo-3D isometric props and dungeon pieces.
- `cc-by-sa/denzi-isometric/`: DENZI tiles. These require CC-BY-SA 3.0 attribution/share-alike handling if shipped.
- `preview-contact-sheet.png`: Quick visual overview of representative assets.

## Sources

- Kenney, "Isometric Miniature Dungeon" - CC0. Source: https://opengameart.org/content/isometric-dungeon-tiles-60
- pixel32, "Pixel dungeon ISO tileset" - CC0. Source: https://opengameart.org/content/pixel-dungeon-iso-tileset
- hawkbirdtree, "32x32 Isometric Tileset Version 0_1" - CC0. Source: https://opengameart.org/content/32x32-isometric-tileset-version-01
- Dungeon Crawl Stone Soup / Project Utumno, "Dungeon Crawl 32x32 tiles" - CC0. Source: https://opengameart.org/content/dungeon-crawl-32x32-tiles
- Screaming Brain Studios, "Isometric Stone Soup" - CC0. Source: https://opengameart.org/content/isometric-stone-soup
- DENZI, "DENZI's 32x32 isometric tilesets" - CC-BY-SA 3.0. Source: https://opengameart.org/content/denzis-32x32-isometric-tilesets

## Notes

- Pokemon-owned art was not downloaded or copied. These are open/free assets with a similar top-down JRPG or isometric pixel feel.
- Original downloads and full extracted packs are excluded from the app repository.
- The current game does not load these automatically yet. Copy/adapt selected tiles into the main `assets/map/tiles/` set or add new keys to `WORLD_TILE_ASSETS` when a map pass is ready.
