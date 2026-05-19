# digitale_visitenkarte

Next.js migration baseline for a static-export digital business card app.

## Stack

- Next.js App Router
- React + TypeScript (strict)
- Static export (`output: "export"`)
- `next-themes` for dark/light mode
- `qrcode.react` for QR generation
- native CSS animations for subtle motion

## Run locally

```bash
npm install
npm run dev
```

## Build static output

```bash
npm run build
```

The static site will be generated in `out/`.

## Structure

- `app/` main app shell and page
- `components/` UI components (form, preview, modals, switches)
- `lib/` shared utilities and typed models
- `messages/` local dictionaries (`de`, `en`)
- `data/companies.json` static company source

## Migration notes

- Legacy CRA + monolithic `App.js` is replaced by modular Next.js components.
- Company data is currently local/static for reliable static export.
- vCard + QR generation run fully in the client without backend dependency.
