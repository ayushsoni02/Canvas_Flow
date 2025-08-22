# CanvasFlow 🧠

A real-time collaborative whiteboard app built from scratch with a modern tech stack. Features multi-user drawing via WebSocket, monorepo architecture with Turborepo, and a sleek UI — all without using the Canvas API.

![CanvasFlow Demo](https://img.shields.io/badge/Status-Active-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-blue)
![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black)
![Turborepo](https://img.shields.io/badge/Turborepo-2.4.4-purple)

## ✨ Features

- **Real-time Collaboration** - Multiple users can draw simultaneously on the same canvas
- **WebSocket Communication** - Instant updates across all connected users
- **Multi-tool Drawing** - Support for circles, rectangles, and freehand pencil drawing
- **Room-based Sessions** - Create and join drawing rooms with unique URLs
- **User Authentication** - Secure JWT-based authentication system
- **Modern UI** - Clean, responsive interface built with Tailwind CSS
- **Monorepo Architecture** - Organized with Turborepo for scalable development

## 🏗️ Architecture

CanvasFlow is built as a monorepo using **Turborepo** with the following structure:

### Apps
- **`excelidraw-frontend`** - Next.js 15 frontend with React 19
- **`http-backend`** - Express.js REST API for authentication and data
- **`ws-backend`** - WebSocket server for real-time drawing collaboration
- **`web`** - Additional web interface (chat rooms)

### Packages
- **`@repo/ui`** - Shared UI components (Button, Card, Code)
- **`@repo/db`** - Prisma database client and schema
- **`@repo/common`** - Shared types and utilities
- **`@repo/backend-common`** - Backend utilities and configurations

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library

### Backend
- **Express.js** - HTTP server for REST API
- **WebSocket (ws)** - Real-time bidirectional communication
- **JWT** - JSON Web Tokens for authentication
- **Prisma** - Type-safe database ORM
- **PostgreSQL** - Primary database

### Development
- **Turborepo** - Monorepo build system
- **pnpm** - Fast, disk space efficient package manager
- **ESLint** - Code linting and formatting
- **TypeScript** - Static type checking

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- pnpm >= 9.0.0
- PostgreSQL database

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CanvasFlow
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   Create `.env` files in the following directories:
   
   **Root `.env`:**
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/canvasflow"
   JWT_SECRET="your-super-secret-jwt-key"
   ```

4. **Set up the database**
   ```bash
   cd packages/db
   pnpm prisma generate
   pnpm prisma db push
   ```

5. **Start the development servers**
   ```bash
   # Start all services
   pnpm dev
   
   # Or start individual services
   pnpm dev --filter=excelidraw-frontend
   pnpm dev --filter=http-backend
   pnpm dev --filter=ws-backend
   ```

### Development Scripts

```bash
# Build all packages and apps
pnpm build

# Run linting
pnpm lint

# Format code
pnpm format

# Type checking
pnpm check-types
```

## 📁 Project Structure

```
CanvasFlow/
├── apps/
│   ├── excelidraw-frontend/     # Main drawing app
│   ├── http-backend/           # REST API server
│   ├── ws-backend/             # WebSocket server
│   └── web/                    # Chat interface
├── packages/
│   ├── ui/                     # Shared UI components
│   ├── db/                     # Database schema & client
│   ├── common/                 # Shared types
│   └── backend-common/         # Backend utilities
└── turbo.json                  # Turborepo configuration
```

## 🎨 Drawing Features

CanvasFlow implements a custom drawing engine without relying on the Canvas API:

- **Circle Tool** - Draw perfect circles with click and drag
- **Rectangle Tool** - Create rectangles of any size
- **Pencil Tool** - Freehand drawing with smooth lines
- **Real-time Sync** - All drawing actions are synchronized across users
- **Persistent Storage** - Drawings are saved to the database

## 🔐 Authentication

The app uses JWT-based authentication with secure token verification:

- User registration and login
- Token-based session management
- Secure WebSocket connections
- Role-based room access

## 🌐 API Endpoints

### HTTP Backend (Express)
- `POST /auth/signup` - User registration
- `POST /auth/signin` - User login
- `GET /rooms/:id/shapes` - Get existing shapes for a room

### WebSocket Backend
- `ws://localhost:8080` - Real-time drawing collaboration
- Message types: `join_room`, `leave_room`, `chat`

## 🚀 Deployment

### Production Build
```bash
# Build all applications
pnpm build

# Start production servers
pnpm start
```

### Environment Variables
Ensure all required environment variables are set in production:
- `DATABASE_URL`
- `JWT_SECRET`
- `NODE_ENV=production`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by collaborative drawing tools
- Special thanks to the open-source community

---

**CanvasFlow** - Where creativity meets collaboration! 🎨✨
