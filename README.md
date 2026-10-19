# Pip's Midnight Nursery — haX.baby starter

A responsive React + Vite portfolio scaffold for haX.baby's Track 1 (Pip). Includes three showcase projects, an illustrated three-scene origin story, dream-mode toggle, Web Audio chimes with a mute switch, a sparkle cursor trail for fine pointers, a local-only browser visit counter (not a global analytics counter), and a five-click moon Easter egg.

## Run locally

```bash
npm install
npm run dev
```

## Build and deploy

```bash
npm run build
npm run preview
```

The production bundle is generated in `dist/`. Import the repository into Vercel and use the default Vite settings (`npm run build`, output directory `dist`).

## Official character art

This starter loads these official public Pip Creator Asset Pack images from haX.baby:

- https://hax.baby/baby/assets/pip_avatar_cloud.png
- https://hax.baby/baby/assets/pip_lullaby_box.png
- https://hax.baby/baby/assets/pip_dream_lantern.png

For a more robust production deployment, download these files from the official asset page, place them in `public/assets/`, then update the `ASSETS` constants in `src/App.jsx` to use local paths such as `/assets/pip_avatar_cloud.png`. Keep the credits in the footer.

## Credits

- Pip assets: official haX.baby Pip Creator Asset Pack
- Fonts: DM Serif Display and Fredoka from Google Fonts
- Icons: Lucide (`lucide-react`)
- Scroll reveals: Motion for React (`motion`)
- Confetti: `canvas-confetti`
- Chimes: Web Audio API

## Before submitting

- Make at least one public commit during the event window and keep the GitHub repository public.
- Verify all three image assets load in the deployed site; local hosting is preferable if time permits.
- Test the sound toggle, dream mode, moon Easter egg, anchor links, project buttons, and mobile layout on a real phone.
- Check browser console and run `npm run build` before submission.
- Submit the live URL, public repository, short build story, and credits through the official haX.baby workspace.
