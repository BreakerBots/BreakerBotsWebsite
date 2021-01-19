# Breakersite
The website for the BreakerBots Robotics Team. The website in run through Webpack (via npm) with 
PostCSS (for AutoPrefixer), Babel, Pug, and Sass. Hosting is through Google
Cloud (NodeJS12 through Express). Theming is through Bootstrap.

This readme explains how to setup and work on the website.

## Setting Up Locally
- Download and install [Github Desktop](https://desktop.github.com/)
- Sign into Github Desktop
- Navigate to `File > Clone Repository...`
- Select `BreakerBots/Breakersite` (this repo)
- Download and install [NodeJS](https://nodejs.org/en/)
- Open up a command prompt in the repo
  - Go back to Github desktop and press ``Ctrl + ` `` or in the top bar select `Repository > Open in Command Prompt`
- Run `npm install`

If you intend on deploying the website you will also have to download and setup the [Google Cloud SDK Tools](https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe).
- Download the tools and run the installer
- Open up a command prompt in the repo
- Run `gcloud init`
- Type `1` (Re-initialize this configuration [default] with new settings) and press enter
- Select your email
- Select the Breakersite cloud project
- Type `n` (Do you want to configure a default Compute Region and Zone? (Y/n)?) and press enter

## Serving Locally
Serving the website locally will allow you to edit the website very quickly only on your computer. 
All edits inside of `/src` or `server.js` will automatically update so all you need to do is
refresh your browser. Other edits like to `webpack.config.js`, `app.yaml`, etc. will require a full restart with `Ctrl+C` twice.

- Run `npm start`
- Navigate to `localhost:8080`
- Exit with `Ctrl+C` twice

## Deploying
Make sure you followed the tutorial to setup locally including setting up the Google Cloud SDK Tools before attempting to deploy.
- Get permission to deploy from a mentor or equivalent
- Run `gcloud app deploy`
- Make sure everytime to double check you current working directory and selected cloud project say `Breakersite`.
If something doesnt say `Breakersite` type `n` and press enter
- Otherwise type `y` and press enter (the website takes up to a minute to deploy)

## Navigating
- `src/` Most work should be inside here
  - `images/` contains every image on the website
  - `includes/` contains all of the pug files that are used by other pug files. Things like the header and footer
  - `pages/` contains every page on the website. If you add a new page make sure to add it to `server.js` (see below)
  - `resources/` contains all sass (`.scss`) and javascript (`.js`) files, note that these files do not get 
  used directly and compile into `dist/` (see below)
- `server.js` is the javascript that runs locally (when serving) or on the server (when deployed)
- `webpack.config.js` contains all the configuration for Webpack (this shouldn't have to be edited much)
- `dist/` contains all the compiled versions of files inside `resources/` after running `npm run compile`, 
or `npm run deploy`. This folder does not get pushed to github.
- `node_modules/` contains all of these installed node dependences (when you do `npm install`). 
This folder does not get pushed to github.