# Nertz Night

A Nertz scorekeeper built with React, TypeScript, and Vinext.

## Features

- Editable players and configurable winning score
- Automatic round scoring: cards out minus cards left in the Nertz pile
- Standings, round history, undo, and new-game reset
- Automatic game saving in this browser on this device
- Responsive card-table design

## Local development

Requires Node.js 22.13 or newer.

```sh
npm ci
npm run dev
```

Open the local URL printed by the development server.

## Validation

```sh
npm run build
npx tsc --noEmit
```

The build script includes a Cloudflare Worker entrypoint wrapper for the existing Sites hosting setup. GitHub stores the source; pushing to GitHub alone does not publish the app. Game scores stay in browser storage and are not synced through GitHub.

## GitHub Pages

The GitHub Actions workflow builds and publishes https://timsansone.github.io/nertz-night/ on pushes to main. Run `npm run build:pages` to build the static site locally. It shares the scorekeeper component and styles with the local app.
