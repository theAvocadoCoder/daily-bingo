# Daily Bingo

## Video Demo

![Preview of the Daily Bingo App]()

## Description

A fun little webapp that gives you a daily bingo card of random sightings, Daily Bingo allows users connect by sharing custom-made (or app-generated) bingo cards. It is intended as a simple pastime, and includes a group chat feature.

## Directory Structure

### Assets

This folder contains static files for the webapp, such as stylesheets and SVGs.

### Components

#### Bingo.vue

#### ConfirmDialog.vue

#### Loading.vue

### Dist

This folder contains the built webapp and its associated files.

### Interfaces

This folder contains typescript interfaces used to model the data stored in the database, as well as the MongoIO class. The interfaces are:

- Card
- Cell
- Entry
- Group
- MongoInterface
- User

### Layouts

#### Chat.vue

#### Default.vue

### Pages

#### auth/signin.vue

#### auth/signout.vue

#### auth/signup.vue

#### cards/[id].vue

#### cards/index.vue

#### cards/new.vue

#### groups/[id]/details.vue

#### groups/[id]/index.vue

#### groups/index.vue

#### groups/new.vue

#### daily-card.vue

#### index.vue

#### profile.vue

### Plugins

#### ably.client.ts

#### locally.ts

#### toaster.client.ts

### Public

This folder contains publically available static files. Unlike those found in the [`assets`](#assets) folder, these files can be accessed from the browser when the site is live.

### Server

Files in this folder are related to the server side of the webapp.

#### api/auth

#### api/cards

#### api/groups

#### api/users

#### api/ably-token.ts

#### api/update-group-history.ts

#### config/MongoIO.ts

#### utils/buildCellArray.ts

#### utils/getRandomPhrases.ts

#### index.ts

#### tsconfig.json

### Stores

### /.gitignore

### /app.vue

### /error.vue

### /nuxt.config.ts

### /package-lock.json

### /package.json

### /tailwind.config.js

### /tsconfig.json
