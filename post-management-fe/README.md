# Post Management Frontend

A Next.js frontend application for the Post Management system (CRUD).

## Features
- User authentication (login/register)
- Post management interface
- Responsive design
- Server-side rendering
- Modern UI with DaisyUI

## Requirements
- Node.js 18+ 
- npm or yarn
- Backend API running (default: http://localhost:8000)

## Environment Setup
Create a `.env.local` file with:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Installation
```bash
npm install
# or
yarn install
```

## Development
```bash
npm run dev
# or
yarn dev
```
Open [http://localhost:3000](http://localhost:3000) to view the app.

## Build & Production
```bash
npm run build
npm start
```

## Project Structure
- `/app` - App router pages and layouts
- `/components` - Reusable UI components
- `/lib` - Utility functions, hooks and provider
- `/public` - Static assets
- `/styles` - Global CSS and Tailwind config

## Technologies Used
- Next.js 16
- React 18
- Tailwind CSS
- TypeScript
- DaisyUI

## Contributing
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## License
MIT License