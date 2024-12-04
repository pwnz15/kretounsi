# DarTaleb API

A robust Node.js backend for student housing platform built with Fastify and TypeScript.

## 🚀 Features

- **Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (Student/Owner)
  - Password hashing with bcrypt

- **Property Management**
  - CRUD operations for properties
  - Advanced search with filters
  - Geospatial queries
  - Image upload with Cloudinary

- **Chat System**
  - Real-time messaging with Socket.IO
  - Conversation management
  - Message read status
  - Typing indicators

- **Notifications**
  - Real-time notifications
  - Multiple notification types
  - Read/unread status

- **Performance**
  - In-memory caching with Node-Cache
  - Database indexing
  - Rate limiting
  - Response compression

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Fastify
- **Database**: MongoDB with Mongoose
- **Real-time**: Socket.IO
- **File Storage**: Cloudinary
- **Caching**: Node-Cache
- **Validation**: Zod
- **Testing**: Vitest
- **Documentation**: Swagger/OpenAPI

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/dartaleb-api.git

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run database migrations
npm run seed

# Start development server
npm run dev

🔧 Environment Variables
PORT=3000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
📚 API Documentation
API documentation is available at /documentation when running the server.

🚀 Deployment

# Build for production
npm run build

# Start production server
npm start


