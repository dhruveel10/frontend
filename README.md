# Frontend - Chat Application

A modern, responsive chat application built with React that provides seamless real-time communication with intelligent session management and a clean, intuitive user interface.

## Live Demo

**[View Live Application](https://frontend-self-sigma-40.vercel.app/)**

The application is hosted on Vercel and ready to use!

## Key Features

### Session Management
- **Redis-powered sessions** with 24-hour validation
- Active chats automatically become inactive after 24 hours
- Inactive chats move to the bottom of the chat list
- Inactive chat data is stored in MySQL for persistence
- Chats can be reactivated and moved back to Redis when accessed

### User Interface
- **Responsive design** - works seamlessly on both mobile and desktop
- **Dark and light mode** toggle for comfortable viewing
- **Sidebar navigation** for easy access to chat history
- **Easy delete functionality** for chat management
- Clean, modern interface built with React

### Cross-Platform Compatibility
- Fully responsive layout adapts to all screen sizes
- Optimized for mobile touch interactions
- Desktop-friendly with keyboard shortcuts and hover states

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/dhruveel10/frontend.git
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory and add:
   ```env
   REACT_APP_API_BASE=http://localhost:your-backend-port
   ```
   
   Replace `your-backend-port` with your actual backend server URL. For production, this should point to your deployed backend service.

4. **Start the development server**
   ```bash
   npm start
   ```
   
   The application will be available at `http://localhost:3000`

### Environment Configuration

The application requires one environment variable:

- `REACT_APP_API_BASE`: The base URL for your backend API
  - **Development**: `http://localhost:3001` (or your backend port)
  - **Production**: Your deployed backend URL

## Architecture Overview

### Session Management Flow
1. New chats are created and stored in Redis with 24-hour TTL
2. Active chats appear at the top of the sidebar
3. After 24 hours, chats automatically expire from Redis
4. Expired chats are moved to MySQL for long-term storage
5. Inactive chats appear at the bottom of the sidebar
6. When an inactive chat is accessed, it's moved back to Redis and becomes active

### Data Storage Strategy
- **Redis**: Active sessions (24-hour lifespan)
- **MySQL**: Inactive/archived chat data
- **Real-time sync**: Seamless transition between active and inactive states

## Built With

- **React** - Frontend framework
- **Redis** - Session management and active chat storage
- **MySQL** - Inactive chat data persistence
- **Vercel** - Hosting and deployment
- **Responsive CSS** - Mobile-first design approach

## Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Main application pages
│   ├── hooks/         # Custom React hooks
│   ├── utils/         # Helper functions
│   └── styles/        # CSS and styling files
├── public/            # Static assets
└── package.json       # Dependencies and scripts
```

## Deployment

The application is automatically deployed to Vercel. Any changes pushed to the main branch will trigger a new deployment.

To deploy your own instance:
1. Fork this repository
2. Connect it to your Vercel account
3. Set the `REACT_APP_API_BASE` environment variable in Vercel
4. Deploy!

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Notes

- This README focuses on the frontend implementation
- Backend documentation will be provided separately
- The application requires a compatible backend service to function properly

## [Backend Repo](https://github.com/dhruveel10/backend)
