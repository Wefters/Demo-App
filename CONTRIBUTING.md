# Contributing to Wefter Demo App

The Demo application is an interactive showcase and test harness for the Wefter mobile framework and all official plugins.

## Code of conduct

Please adhere to the [code of conduct](https://github.com/Wefters/.github/blob/main/CODE_OF_CONDUCT.md).

## Project structure

- `src/views/`: Dedicated test views for each official plugin.
- `src/layout/`: Navigation bar, drawer, and global shell components.
- `wefter.config.json`: Wefter configuration listing linked plugins, build directories, and environment identifiers.

## Development setup

```bash
pnpm install
pnpm dev
```

To test on a connected Android device or emulator:

```bash
npx wefter run android --watch
```

To test on an iOS simulator:

```bash
npx wefter run ios --watch
```

## Adding or updating test views

When adding test coverage for a new plugin or updating an existing one:

1. Create or update the view in `src/views/<PluginName>.vue`.
2. Register the route in `src/router/index.ts`.
3. Add the navigation item in `src/layout/components/Sidebar.vue`.
4. Test all plugin methods interactively to ensure proper error handling and response display.

## Pull requests

Ensure `pnpm build` succeeds before opening a pull request. Keep UI additions clean and responsive across small phone screens and tablets.

## License

[MIT](LICENSE) © 2026 Sandip Ghimire
