# YouTube Backend Clone

## Overview
This is a backend application that replicates key features of YouTube, such as video upload, streaming, user authentication, and video management. It is built with Node.js and Express.js, and uses MongoDB for data storage and Cloudinary for video hosting.

## Features
- **Video Upload**: Upload videos to Cloudinary.
- **Video Streaming**: Serve videos efficiently to users.
- **User Authentication**: Secure login and registration system.
- **Video Management**: Edit and delete uploaded videos.

## Technologies Used
- **Backend Framework**: Node.js, Express.js
- **Database**: MongoDB
- **Media Storage**: Cloudinary
- **Authentication**: JSON Web Tokens (JWT)

## Setup Instructions

1. Clone the repository and navigate to the project folder.

### Backend Setup
2. Navigate to the `backend` directory and install dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```env
    PORT=8000
    MONGODB_URI=your_mongodb_connection_string
    CORS_ORIGIN=*
    ACCESS_TOKEN_SECRET=access_token_value
    ACCESS_TOKEN_EXPIRY=access_token_exipry_time
    REFRESH_TOKEN_SECRET=refresh_token_value
    REFRESH_TOKEN_EXPIRY=refresh_token_exipry_time

    CLOUDINARY_CLOUD_NAME=your_cloud_name
    CLOUDINARY_API_KEY=your_api_key
    CLOUDINARY_API_SECRET=your_api_secret
   ```
4. Start the server:
   ```bash
   npm start
   ```
   The server will run on `http://localhost:8000`.

-[Model link](https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDkzj)
