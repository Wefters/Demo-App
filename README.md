# Wefter demo application

A mobile showcase and integration test application built with Vue 3 and Vite, demonstrating all official Wefter plugins in a live mobile environment.

## Overview

The demo application acts as both a reference implementation and an interactive testing suite for Wefter. It links directly to the local monorepo packages (`@wefterjs/core`, `@wefterjs/cli`, `@wefterjs/devtools`) and all official plugins in `../Plugins`.

Developers can launch the application on an Android device, iOS simulator, or standard web browser to test native bridge communication, review plugin user interfaces, and inspect telemetry through the developer tools overlay.

## Technology stack

- **Framework**: Vue 3 (Composition API with `<script setup>`)
- **Build tool**: Vite 8 with `@vitejs/plugin-vue`
- **Styling**: Tailwind CSS 4
- **State management**: Pinia 4
- **Routing**: Vue Router 5
- **Icons**: Lucide Vue
- **Bridge and plugins**: `@wefterjs/core`, `@wefterjs/devtools`, and all 15 official Wefter plugins

## Plugin test views

The application organizes each plugin test harness into dedicated routes located in `src/views/`:

| View                | Route             | Tested functionality                                                                         |
| ------------------- | ----------------- | -------------------------------------------------------------------------------------------- |
| `App.vue`           | `/app`            | Lifecycle transitions, deep links, back button interception, app info, and process controls. |
| `Biometric.vue`     | `/biometric`      | Availability checks, biometry type detection, and native authentication prompts.             |
| `Browser.vue`       | `/browser`        | Custom Tabs, SFSafariViewController, navigation controls, and OAuth flows.                   |
| `Clipboard.vue`     | `/clipboard`      | Writing text and URLs, reading clipboard contents, and clearing the pasteboard.              |
| `Device.vue`        | `/device`         | Hardware metadata, unique vendor UUID, battery level, and charging state listeners.          |
| `Dialog.vue`        | `/dialog`         | Alert, confirm, prompt dialogs with custom input types, and positioned toasts.               |
| `FlashLight.vue`    | `/flashlight`     | Torch toggle, brightness intensity adjustment, and external state change events.             |
| `Haptics.vue`       | `/haptics`        | Impact styles, notification sequences, selection clicks, and custom vibration patterns.      |
| `Network.vue`       | `/network`        | Real-time connectivity state, connection type detection, and offline handling.               |
| `Scanner.vue`       | `/scanner`        | Camera barcode and QR scanning, gallery image decoding, and camera zoom controls.            |
| `Screen.vue`        | `/screen`         | Window brightness, orientation locking, and screen keep-awake controls.                      |
| `SecureStorage.vue` | `/secure-storage` | Hardware-encrypted key-value storage using Android Keystore and iOS Keychain.                |
| `Share.vue`         | `/share`          | Native system share sheets for text, URLs, and titles.                                       |
| `Storage.vue`       | `/storage`        | Fast unencrypted JSON key-value storage via SharedPreferences and UserDefaults.              |
| `DevTools.vue`      | `/devtools`       | Telemetry inspector, manual event emission, and error boundary diagnostics.                  |

## Running the application

### Development in browser

To run the web interface during development:

```bash
pnpm install
pnpm dev
```

The application will start on `http://localhost:5173`. When running in a standard desktop browser, native bridge calls that require hardware sensors will return unsupported or mock states via `@wefterjs/core` fallbacks.

### Running on Android

Ensure an Android emulator is running or a physical device is connected via USB with USB debugging enabled:

```bash
# Build the web bundle, sync native files, compile, and launch
npx wefter run android --watch
```

The `--watch` flag starts the local dev server and proxies file changes into the native web view for hot reloading.

### Running on iOS

Requires macOS with Xcode 16 or later:

```bash
npx wefter run ios --watch
```

## Configuration

The application is configured through `wefter.config.json` at the root of `Demo-App/`:

- `plugins`: Array listing all 15 active official plugins.
- `pluginsDir`: Path to dependencies directory (`node_modules`).
- `webDir`: Build output directory (`dist`).
- `environments.development.appId`: Application ID (`dev.sandip.wefter.demo`).
- `environments.development.appName`: Application display name (`Wefter Demo`).
- `launchBackground`: Splash and background color (`#111314`).

## License

[MIT](LICENSE) © 2026 Sandip Ghimire
