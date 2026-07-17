# itch.io HTML5 Release

Titans of Mars is a static browser game. Players do not need Git, Node.js, GitHub, or an AI model.

## Package

1. Run `npm install` and `npm run build`.
2. ZIP the contents of `dist/`, not the `dist` directory itself. `index.html` must be at the archive root.
3. Upload the ZIP as an HTML project and select **This file will be played in the browser**.

## Recommended embed settings

- Run in page: **Embed in page**
- Viewport: **1280 x 900**
- Mobile friendly: **On**
- Automatically start: **Off**
- Fullscreen button: **On**
- Scrollbars: **On**
- SharedArrayBuffer support: **Off**

The interface is responsive down to a 390-pixel-wide mobile viewport. Scrollbars must remain enabled because the mission-control layout becomes a vertical command stack on smaller screens.

## Upload text

No installation is required. Press **Run game** and play in your browser. The campaign saves automatically on the current device. Music is optional and can be opened from the music-note button. External links appear only in the Mars Field Guide and soundtrack source notes; the simulation itself runs locally in the browser.

## Updating

Rebuild and replace the existing ZIP. Browser saves are migrated by the game and should remain available after an update on the same itch.io project page.
