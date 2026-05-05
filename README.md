# Foundation

A lightweight personal productivity app for managing daily tasks and habits, built as a progressive web app (PWA) installable on desktop and mobile.

## Features

- **Tasks** — add, complete, and delete tasks scoped to yesterday, today, or tomorrow
- **Habits** — track recurring habits with a daily check-off that resets each day
- **Date tabs** — quickly navigate between Yesterday, Today, Tomorrow, and All tasks
- **PWA support** — installable on iOS and Android via the browser's "Add to Home Screen"
- **Offline-ready** — service worker caches the app for use without a network connection
- **Persistent storage** — all data is saved to `localStorage`; nothing leaves your device

## Tech stack

Vanilla HTML, CSS, and JavaScript — no build tools or dependencies.

## How to run

Open `index.html` in a browser, or serve the directory with any static file server:

```bash
npx serve .
# or
python3 -m http.server
```

For PWA install prompts and the service worker to work, the app must be served over `http://localhost` or `https://`.

## Project structure

```
index.html    — markup and layout
script.js     — all app logic (tasks, habits, storage, navigation)
styles.css    — styling
sw.js         — service worker for offline support
manifest.json — PWA manifest
```
