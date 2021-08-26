# Installation

You **must** use a version of `npm` >= 5.5.1. That version of `npm` comes 
with `node` 9.2.0. If you are using nvm, then run `nvm use 9.2.0` (or higher; 
ver 11.13 works fine too).

(`npm` 5.5.1 / `node` 9.2.0 is known to work; `npm` 3.5.2 / `node` 8.10.0 
is known to fail to install certain required dependencies.
Intermediate versions may or may not work.)

With the appropriate versions of `node`/`npm` in use:

```bash
npm install
```

If you need to start fresh after much messing about, the `reinstall` script
deletes `./node_modules/` and then installs:

```bash
npm run reinstall
```
