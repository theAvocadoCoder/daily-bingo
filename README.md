# Daily Bingo

## Video Demo

The following image links to the Demo of the live Daily Bingo site

[![Preview of the Daily Bingo App](/public/img/CS50-intro.png)](https://youtu.be/E6q5R9bJCDI)

## Description

A fun little web application that gives you a daily bingo card of random sightings, Daily Bingo allows users connect by sharing custom-made (or app-generated) bingo cards. It is intended as a simple pastime.

**Table of Contents:**

- [Daily Bingo](#daily-bingo)
  - [Video Demo](#video-demo)
  - [Description](#description)
  - [Installation](#installation)
    - [Prerequisites](#prerequisites)
    - [1. Clone the repository](#1-clone-the-repository)
    - [2. Navigate to the project directory](#2-navigate-to-the-project-directory)
    - [3. Install dependencies](#3-install-dependencies)
    - [4. Set environment variables](#4-set-environment-variables)
    - [\[Optional\] 5. Start the development server](#optional-5-start-the-development-server)
  - [Live Site](#live-site)
  - [Usage](#usage)
  - [Features](#features)
  - [Files](#files)
    - [Client-Side Files](#client-side-files)
      - [Landing Page](#landing-page)
      - [Random Card Page](#random-card-page)
      - [Authentication Pages](#authentication-pages)
      - [Dashboard (Daily Card)](#dashboard-daily-card)
      - [New Card Page](#new-card-page)
      - [Cards (List) Page](#cards-list-page)
      - [Card (View) Page](#card-view-page)
      - [Profile Page](#profile-page)
    - [Server-Side Files](#server-side-files)
      - [Cards API Routes](#cards-api-routes)
      - [Users API Routes](#users-api-routes)
      - [Database Files](#database-files)
    - [Config Files](#config-files)
  - [Design Decisions](#design-decisions)
  - [Acknowledgments](#acknowledgments)

## Installation

The project uses MongoDB for database storage, Clerk for identity and access management, and Cloudinary for managing media assets. In order to run the project locally, you will need to create accounts on these platforms.

### Prerequisites

The following are prerequisites for installing and running the project locally:

- [Node (and NPM)](https://nodejs.org/en/download)
- [A MongoDB database](https://www.mongodb.com/resources/products/fundamentals/create-database)
- [A Clerk account](https://clerk.com/docs/quickstarts/setup-clerk)
- [A Cloudinary account](https://cloudinary.com/documentation/node_quickstart)

### 1. Clone the repository
  
```bash
git clone https://github.com/theAvocadoCoder/dailybingo.git
```

### 2. Navigate to the project directory

```bash
cd dailybingo
```

### 3. Install dependencies

```bash
npm install
```

### 4. Set environment variables

Ensure you have followed the set up instructions linked in the [prerequisites section](#prerequisites).

- Create a dotenv file based on the [env template](/.env.example)

  ```bash
  cp ./.env.template ./.env
  ```

- Set the `ATLAS_URI` and `DB_NAME` variables based on the instructions in the MongoDB guide.
- Set the `NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `NUXT_CLERK_SECRET_KEY` variables based on the instructions in the Clerk guide.
- Set the `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` and `CLOUDINARY_URL` variables based on the instructions in the Cloudinary guide.

### [Optional] 5. Start the development server

To start the application, execute:

```bash
npm run dev
```

Then navigate to [http://localhost:3000](http://localhost:3000).

## Live Site

Alternative to running this project locally, you can visit [the live site](https://dailybingo.knwauwa.com).

## Usage

When the application is running locally, or when you are visiting the live site, you may view a randomly generated bingo card. Signing up allows you to save cards, share cards, and create your own.

## Features

Some of the (technical) features of this project:

- Identity and Access Management
- Responsive user interface
- Integration with third-party APIs

## Files

Since Nuxt is opinionated about directory structure, this project follows that guideline, defined [here](https://nuxt.com/docs/guide/directory-structure). This project follows the monolithic architecture pattern and so I will discuss the files in three parts: client-side, server-side, and config.

### Client-Side Files

#### Landing Page

- [`/layouts/default.vue`](/layouts/default.vue): This contains the default template layout for the whole project. It features the top navigation for both mobile and desktop screens, a navigation drawer for large screens, a bottom navigation for small screens, and a slot for the app content.

- [`/pages/index.vue`](/pages/index.vue): This conditionally renders the dashboard (daily card) component or the landing page component.

- [`/components/LandingPage.vue`](/components/LandingPage.vue): This contains an introductory message about the application, with a link to a randomly generated card that can be interacted when not signed in.

#### Random Card Page

- [`/pages/random-card.vue`](/pages/random-card.vue): This page generates a bingo card with random values, stores this card in the browser's local storage and renders it via the Bingo component.

- [`/components/Bingo.vue`](/components/Bingo.vue): This component is used throughout the app to display a bingo card. It takes two properties: the type of the card (i.e., a Daily Bingo card or a user-generated card) and whether the card is saved. It then fetches the card from the browser's storage and renders it in a grid. It has control buttons for resetting the card (setting all cells as unmarked), saving the card, and sharing the card (after it has been saved).

#### Authentication Pages

- [`/pages/sign-in.vue`](/pages/sign-in.vue): This page renders Clerk's sign in component to handle signing in registered users.

- [`/pages/sign-up.vue`](/pages/sign-up.vue): This page renders Clerk's sign up component to handle registering new users.

Both pages redirect to the dashboard once authorization is given.

#### Dashboard (Daily Card)

- [`/pages/index.vue`](/pages/index.vue): As explained in the [landing page section](#landing-page), this conditionally renders the daily card (or dashboard) component or the landing page.

- [`/components/DailyCard.vue`](/components/DailyCard.vue): This is similar to the [random-card](/pages/random-card.vue) page except that it requires the user to be signed in. It displays the Bingo component. It also has a floating button that allows users create a new card (if they are signed in).

#### New Card Page

- [`/pages/cards/new.vue`](/pages/cards/new.vue): This renders a form for creating a new card. The user is prompted to enter a name for the card, as well as the content in the cells. When the card is created, the user is redirected to their cards list page where the new card is highlighted.

#### Cards (List) Page

- [`/pages/cards/index.vue`](/pages/cards/index.vue): This fetches the user's information from the clerk session, fetches the user's cards and then renders them in a list. It features a search bar, the rendered list and a floating button for creating a new card.

- [`/components/ListCard.vue`](/components/ListCard.vue): This component represents a single card in the rendered list of cards. It features buttons to edit the name of the card, share the card (copy its link to clipboard), or delete it.

#### Card (View) Page

- [`/pages/[id].vue`](/pages/[id].vue): This page displays a card, similar to random-card or daily card, but it is generally for user-generated cards, or Daily Bingo cards that users have saved.

#### Profile Page

- [`/pages/profile.vue`](/pages/profile.vue): This page shows the user's profile; their username, display name and profile image. It also allows the user to edit these values.

### Server-Side Files

- [`Server Config`](/server/index.ts)
- `Server Utilities`:
  - [`Build Cell Array`](/server/utils/buildCellArray.ts)
  - [`Get Random Phrases`](/server/utils/getRandomPhrases.ts)

#### Cards API Routes

- [`/api/cards/` (POST)](/server/api/cards/index.post.ts)
- `/api/cards/[id]`
  - [GET](/server/api/cards/[id].get.ts)
  - [PATCH](/server/api/cards/[id].patch.ts)
- [`/api/cards/daily` (GET)](/server/api/cards/daily.ts)
- [`/api/cards/new` (POST)](/server/api/cards/daily.ts)

#### Users API Routes

- [`/api/current-user/` (GET)](/server/api/users/current-user.get.ts)
- `/api/users/[id]`
  - [GET](/server/api/users/[id].get.ts)
  - [PATCH](/server/api/users/[id].patch.ts)
- [`/api/users/picture` (PATCH)](/server/api/users/picture.patch.ts)
- [`/api/register-user` (POST)](/server/api/register-user.ts)

#### Database Files

- [`MongoIO Class`](/server/config/MongoIO.ts)
- [`Connect DB Middleware`](/server//middleware/connect-db.ts)

### Config Files

- [`Nuxt Config File`](/nuxt.config.ts)

## Design Decisions

I chose to go with a monolithic architecture because the scope of this project was (initially) small. As I worked on the project though, that scope grew and is now perhaps big enough for me to consider switching to a microservice architecture. That will be a future endeavour though.

When it came to choosing a framework to use, I wanted to work with something I hadn't worked with before. At the time I started this, I had just been brushing up on my Vue skills so it made sense to me to go with Nuxt.

Getting used to Nuxt was definitely a challenge but it was an interesting one (aren't they all?). Using MongoDB for database storage was a no-brainer because document-oriented databases are always ideal for projects where data structure is highly susceptible to change, such as this one.

Figuring out Identity and Access Management was a challenge for a bit. I initially used Okta, then realized I couldn't get the full experience I wanted with their free plan and also couldn't afford the paid plan. Then, I found Clerk. It was everything I wanted and was something I could actually afford.

Originally, I intended to have a real-time-chat feature. Unfortunately, that proved too complex for me to accomplish before the deadline for submitting this project. I got started using Ably and I intend to continue working on that feature even after I submit this project.

## Acknowledgments

I referenced **many** resources for this project. Most notably the following:

- [CS50’s Introduction to Computer Science](https://cs50.harvard.edu/x/)
- [Nuxt Documentation](https://nuxt.com/docs/getting-started)
- [Vuetify Documentation](https://vuetifyjs.com/)
- [Clerk Documentation](https://clerk.com/docs)
- [MongoDB Documentation](https://mongodb.com/docs/drivers/node/v6.8)
- [Cloudinary Documentation](https://cloudinary.com/documentation/node_quickstart)
- [Ably Documentation](https://ably.com/docs/)
