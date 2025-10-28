# Post Management Frontend

A Next.js frontend application for the Post Management system (CRUD).

## Features
- User authentication (login/register)
- Post management interface (List all posts, Add post, edit post, view post, and delete post)
- Modern UI with DaisyUI

## Requirements
- Node.js 20+ 
- npm or yarn
- Backend API running (default: http://localhost:3001)

## Environment Setup
Create a `.env` file with:
```env
NEXT_PUBLIC_LOCAL_API_URL=http://localhost:3001
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
- `/lib` - Hook function and context
- `/public` - Static assets
- `/utils` - Customize function

## Technologies Used
- Next.js 16
- React 19
- Tailwind CSS
- TypeScript
- DaisyUI
- Material Icons

## Contributing
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## License
MIT License
