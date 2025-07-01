# Hector-AI

Hector-AI is an Electron application that displays a 3D scene in a desktop window. The project uses [Parcel](https://parceljs.org/) to bundle the files and [Electron](https://www.electronjs.org/) to create the desktop app.

## Building the project

To bundle the JavaScript and HTML files, run:

```bash
npm run build
```

This command uses Parcel to create a `dist` folder containing the production build.

## Running the Electron app

Run the following command to build the web files and launch the Electron window:

```bash
npm start
```

This command first runs `npm run build` to create the `dist` folder and then opens Electron using those files.

## Developing with live reload

During development you can run a server that reloads when files change:

```bash
npm run dev
```

Parcel serves `index.html` and watches for file updates so you can see changes immediately in the browser.
