# Music Posters

This website provides a seamless integration with Spotify, allowing you to create stunning, personalized music posters. With just your Spotify login, unlock access to your entire music library and choose from multiple poster creation tools: build custom album grid collages with **Topster Creator**, generate professional compilation posters of your top artists and albums, create beautiful tracklist posters with custom styling, or discover your unique music personality with our **Taste Profile Analyzer**. Plus, explore your complete music statistics through your personalized **Profile Dashboard** and download your creations as high-quality images or PDFs.

Whether you want to showcase your favorite album covers, highlight your top artists, create a collage of your most played tracks, or visualize your taste profile, this website has you covered. With intuitive drag-and-drop interfaces and extensive customization options, you can generate visually stunning posters that reflect your unique music taste in just a few clicks.

So why wait? Login with Spotify now and start creating your own personalized music posters!

## Features

### 🎨 **Topster Creator**

Create custom grid-based album collages in various sizes (3x3, 4x4, 5x5, etc.). Search for any album on Spotify and drag them into your perfect arrangement. Add custom titles and download your topster as an image.

### 📊 **Compilation Posters**

Generate stunning posters of your top artists or albums with:

- **Time Range Options**: Short-term (4 weeks), Medium-term (6 months), or Long-term (12 months)
- **Multiple Poster Sizes**: Letter, Ledger, Medium (18x24"), Concert (24x36"), Movie (27x40")
- **Customizable Layout**: Choose how many items to display
- **Download Options**: Export as PNG image or PDF

### 🎵 **Album Tracklist Posters**

Transform any album into a beautiful tracklist poster with advanced customization:

- Search any album from Spotify's catalog
- **Color Extraction**: Automatically extract colors from album artwork
- **Custom Styling**: Choose gradient backgrounds (linear/radial), solid colors, border styles, and fonts
- **Manual Overrides**: Fine-tune colors, text, and layout to perfection
- Dynamic sizing and overflow handling

### 🧬 **Taste Profile Analyzer**

Discover your unique music personality based on your listening habits:

- AI-powered analysis of your Spotify listening history
- Get categorized into music personality types (e.g., "Eclectic Explorer", "Genre Purist")
- Visual breakdown of your music taste dimensions
- Shareable personality posters

### 👤 **Profile Dashboard**

Comprehensive view of your Spotify statistics:

- **Top Artists**: View your most-listened artists across all time ranges
- **Top Tracks**: See your favorite songs from the past 4 weeks, 6 months, or all-time
- **Top Genres**: Discover which genres dominate your listening
- **Saved Posters**: Access and manage all your previously created posters
- **Account Information**: View your Spotify profile details

### 🏠 **Home Dashboard**

- Scrolling carousel of your top artists
- Visual grid of your top albums
- Real-time currently playing track display
- Quick navigation to all poster creation tools

### 📥 **Export & Share**

- Download posters as high-quality PNG images
- Export as PDF for printing
- Native share functionality for social media
- Save posters to your profile for later access

### 🎧 **Now Playing Widget**

- See what you're currently listening to on Spotify
- Dynamic background colors extracted from album art
- Direct link to play on Spotify

## Tech Stack

### Frontend

- **React** - UI framework with React Router for navigation
- **HTML2Canvas** - Convert posters to downloadable images
- **jsPDF** - Generate PDF exports
- **ColorThief** - Extract dominant colors from album artwork
- **Axios** - HTTP client for API requests
- **React Bootstrap Icons** - UI icons

### Backend

- **Node.js** - Runtime environment
- **Express** - Web server framework
- **MongoDB** - Database for storing user data and saved posters
- **CORS** - Cross-origin resource sharing

### APIs & Authentication

- **Spotify Web API** - Access user's music library and listening data
- **OAuth 2.0** - Secure Spotify authentication

### Deployment

- **Vercel** - Hosting and serverless functions

## Setting up the Project

To set up the project, follow these steps:

1. Clone the repository to your local machine:

```
git clone https://github.com/your-username/your-repo.git
```

2. Navigate to the project directory:

```
cd your-repo
```

3. Install the dependencies:

```
npm install
```

4. Store your Spotify Developer IDs and secrets in an `env.js` file

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Setting up a Free MongoDB Cluster

To set up a free MongoDB cluster for storage and development, follow these steps:

1. Go to the [MongoDB Atlas website](https://www.mongodb.com/cloud/atlas) and sign up for an account (if you don't have one already).

2. Once logged in, click on the "Build a Cluster" button.

3. Select the free tier option and choose a cloud provider and region (for best performance, choose the closest proximity).

4. Configure the cluster settings according to your preferences.

5. Click on the "Create Cluster" button and wait for the cluster to be provisioned.

6. Once the cluster is ready, click on the "Connect" button.

7. Choose the "Connect your application" option.

8. Copy the connection string provided.

## Adding the MongoDB Endpoint to public/server.js

To add the MongoDB endpoint to the `public/server.js` file, follow these steps:

1. Cd into the `public/server.js` file in your code editor.

2. Store your specific project's Mongo URI to be able to access the database in an `.env` file

3. Run `node server.js` to boot up the backend.

Now you have successfully set up the project and added the MongoDB endpoint to the `public/server.js` file.

https://github.com/user-attachments/assets/b08b7f71-b2f1-402a-80a0-3e18c7eb87c1
