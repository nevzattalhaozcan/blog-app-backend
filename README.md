# Blog App Backend

## Overview

The Blog App Backend is a Node.js application that provides a RESTful API for managing a blog platform. It allows users to register, log in, create, read, update, and delete blog posts. The backend also supports user management, including updating user information and changing passwords.

## Features

- **User Authentication**: Register and log in users with JWT-based authentication.
- **User Management**: Retrieve, update, and delete user information.
- **Blog Posts**: Create, read, update, and delete blog posts.
- **Authorization**: Ensure that users can only modify their own posts and information.

## Technologies Used

- **Node.js**: JavaScript runtime for building the backend.
- **Express.js**: Web framework for handling HTTP requests and routing.
- **MongoDB**: NoSQL database for storing user and post data.
- **Mongoose**: ODM library for MongoDB.
- **JWT**: JSON Web Tokens for secure authentication.

## Getting Started

### Prerequisites

- Node.js and npm installed on your machine.
- MongoDB instance running locally or in the cloud.

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/blog-app-backend.git
   ```
2. Navigate to the project directory:
   ```sh
   cd blog-app-backend
   ```
3. Install dependencies:
   ```sh
   npm install
   ```

### Configuration

1. Create a `.env` file in the root directory and add the following environment variables:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/blog-app
   JWT_SECRET=your_jwt_secret
   ```

### Running the Application

1. Start the server:
   ```sh
   npm start
   ```
2. The API will be available at `http://localhost:3000`.

## API Endpoints

- **Users**
  - `POST /users/register`: Register a new user.
  - `POST /users/login`: Log in a user.
  - `GET /users/:id`: Get a user by ID.
  - `PUT /users/:id`: Update a user by ID.
  - `DELETE /users/:id`: Delete a user by ID.
  - `PATCH /users/:id`: Update user password.

- **Posts**
  - `GET /posts`: Get all posts.
  - `GET /posts/:id`: Get a post by ID.
  - `POST /posts`: Create a new post.
  - `PUT /posts/:id`: Update a post by ID.
  - `DELETE /posts/:id`: Delete a post by ID.
