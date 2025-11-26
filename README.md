# MySpace

MySpace is a web application, created for Hack Western 12, designed to help users discover and create "third spaces". Third spaces are social environments separate from the two usual social environments of home and the workplace for communities to connect and socialize. It features an interactive map to find events, user profiles, and social networking capabilities.

- **Demo Video:** https://youtu.be/wQ89IZsKpUA?si=nEGSBsapT2OAVIxx
- **DevPost:** https://devpost.com/software/myspace

## Features

- **Interactive Map**: Explore events and locations using a dynamic map interface.
- **User Authentication**: Secure login and registration system.
- **User Profiles**: Customizable profiles to share interests and connect with others.
- **Event Management**: Create and join events.
- **Social Features**: Connect with other users.
- **AI Integration**: Powered by Google GenAI for enhanced features.

## Tech Stack

### Client
- **React**: Frontend library for building user interfaces.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **Mapbox GL**: Interactive maps.
- **Axios**: HTTP client for API requests.

### Server
- **Node.js & Express**: Backend runtime and framework.
- **MongoDB & Mongoose**: Database and object modeling.
- **JWT & Bcrypt**: Authentication and security.
- **Google GenAI**: AI capabilities.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (Local or Atlas connection string)
- Mapbox API Key
- Google GenAI API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/vivekajayjariwala/MySpace.git
   cd MySpace
   ```

2. **Install Server Dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install Client Dependencies**
   ```bash
   cd ../client
   npm install
   ```

### Configuration

#### Server
Create a `.env` file in the `server` directory with the following variables:
```env
MONGOURL=your_mongodb_connection_string
JWT_PRIVATE_KEY=your_jwt_private_key
# Add other necessary env variables here
```

#### Client
Create a `.env` file in the `client` directory (if required) or ensure your Mapbox token is configured.

### Running the Application

1. **Start the Server**
   ```bash
   cd server
   node server.js
   ```
   The server will start on the port defined in your config (default usually 8080 or 3000).

2. **Start the Client**
   ```bash
   cd client
   npm start
   ```
   The application will run at `http://localhost:3000`.

## Project Structure

- `client/`: React frontend application.
- `server/`: Node.js/Express backend application.
