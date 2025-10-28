# Post Management

Simple Post Management with CRUD (Create, Read, Update, Delete) operations and Authentication using Next JS, Hono JS, and PostgreSQL.

## Features
- User registration and login (JWT-based authentication)
- Create, read, update, delete posts
- Protected endpoints for post creation and modification
- Basic validation and error handling

## Installation
1. Open integrated terminal in VS Code (Ctrl+`) for each directory
2. Install dependencies:
   - npm: `npm install`
   - yarn: `yarn install`
3. Create a `.env` file in the backend project root with at least:
- PORT=3000
- DATABASE_URL=<your_database_connection_string>
- JWT_SECRET=<your_jwt_secret>
4. Create a `.env` file in the frontend project root with at least:
- NEXT_PUBLIC_LOCAL_API_URL=http://localhost:3001

## Running
- Development: `npm run dev` (or the project's dev script)
- Production: `npm start`

## Contributing
- Open an issue to discuss changes
- Create feature branches, run tests, and submit a pull request

## License
Specify a license in LICENSE file (e.g., MIT).

## Notes
Read each README.md in both directory for details.
