# PersonalAI

A full stack AI application that provides a secure platform for interacting with customized LLM. Built with React and Express.

## Deployment URL's:
- Backend:   https://personal-ai-server.vercel.app
- Frontend:  https://personal-ai-client.vercel.app

## Project Overview

PersonalAI is a comprehensive AI platform that allows users to register, authenticate, and interact with AI models through a secure API. The application features user management, file uploads, and AI response generation capabilities.

## 🖥️ Client (Frontend) [Link](https://github.com/sambhukalaga27/personal-ai-client)

### Technology Stack
- **React** - UI framework
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API calls
- **React Hot Toast** - Toast notifications

### Features
- User authentication and registration
- Responsive user interface
- Real-time notifications
- File upload capabilities
- AI interaction interface

### Development Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 🔧 Server (Backend)

### Technology Stack
- **Node.js** with **Express** - Web framework
- **MongoDB** with **Mongoose** - Database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload handling
- **Google GenAI** - AI model integration
- **CORS** - Cross-origin resource sharing

### Features
- Secure user authentication with JWT
- File upload and processing
- AI response generation
- User profile management
- Health monitoring
- Error handling middleware

### Development Scripts
```bash
npm run dev      # Start development server with nodemon
```

## 🛣️ API Routes Reference

### Base URL
```
http://localhost:PORT/api/v1
```

### Health Check
- **GET** `/healthcheck/` - Check API health status

### User Management Routes
#### Public Routes
- **POST** `/user/register` - Register new user (with file upload)
- **POST** `/user/login` - User login
- **POST** `/user/renewAccessToken` - Refresh access token
- **POST** `/user/logout` - User logout

#### Protected Routes (Require Authentication)
- **PUT** `/user/edit` - Edit user profile (with file upload)
- **DELETE** `/user/delete` - Delete user account

### AI/LLM Routes
#### Protected Routes (Require Authentication)
- **POST** `/llm/generateAIResponse` - Generate AI response

### Root Endpoint
- **GET** `/` - API information and developer details

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Protected routes require a valid JWT token in the request headers or cookies.

### Authentication Flow
1. Register or login to receive JWT tokens
2. Include access token in subsequent requests
3. Use refresh token to renew expired access tokens

## 📁 File Upload

The application supports file uploads through Multer middleware with Cloudinary integration for cloud storage. File uploads are available on:
- User registration
- User profile editing

## 🌐 Environment Variables

### Server (.env)
```env
PORT=9999
DB_NAME=CustomAI
MONGODB_SRV=mongodb://localhost:27017
CORS_ORIGIN=http://localhost:5173
ACCESS_TOKEN_SECRET=custom_ai_access_secret
ACCESS_TOKEN_EXPIRY=18m
REFRESH_TOKEN_SECRET=custom_ai_refresh_secret
REFRESH_TOKEN_EXPIRY=10d
NODE_ENV=development
GOOGLE_GENAI_MODEL=gemini-2.5-flash-lite
GOOGLE_GENAI_API_KEY=your_google_genai_api_key
```

### Client (.env)
```env
VITE_API_BASE_URL=http://localhost:PORT
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd CustomAI
```

2. **Setup Server**
```bash
cd server
npm install
cp .env.example .env  # Optional: Configure your environment variables
npm run dev
```

3. **Setup Client**
```bash
cd client
npm install
cp .env.example .env  # Optional: Configure your environment variables
npm run dev
```

4. **Access the application loacally**
- Frontend: http://localhost:5173
- Backend API: http://localhost:9999

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS configuration
- Request rate limiting
- Input validation and sanitization
- Secure file upload handling

## 📝 License

ISC License

## 👨‍💻 Developer

**Sai Sambhu Prasad Kalaga**
- GitHub: [sambhukalaga27](https://github.com/sambhukalaga27)
- LinkedIn [Sai Sambhu Prasad Kalaga](https://www.linkedin.com/in/sai-sambhu-prasad-kalaga/)

## 🤝 Interested in Contributing?

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📞 Support

For any questions, please reach out through the GitHub or LinkedIn.
