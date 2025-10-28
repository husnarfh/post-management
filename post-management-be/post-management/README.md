# Post Management System

A simple Post Management System built with Hono, Node.js, and PostgreSQL. It provides user authentication and CRUD operations for managing posts with pagination support.

## Features

- User registration and authentication with JWT
- Password hashing with bcryptjs
- User profile management with profile photo upload
- Post creation, reading, updating, and deleting with thumbnail upload
- File upload support (images up to 5MB)
- Pagination support for post listing
- Role-based access control for post management
- PostgreSQL database with raw SQL queries
- Automatic file storage and serving

## Tech Stack

- **Framework**: Hono 4.3.0
- **Runtime**: Node.js with TypeScript
- **Database**: PostgreSQL 18
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **File Upload**: Multer
- **Database Driver**: pg

## Project Structure

```
post-management/
├── src/
│   ├── db/
│   │   ├── connection.ts      # Database connection pool
│   │   └── init.ts            # Database initialization script
│   ├── middleware/
│   │   ├── auth.ts            # JWT authentication middleware
│   │   └── upload.ts          # Multer file upload configuration
│   ├── routes/
│   │   ├── users.ts           # User endpoints with file upload
│   │   └── posts.ts           # Post endpoints with file upload
│   ├── utils/
│   │   ├── hash.ts            # Password hashing utilities
│   │   └── jwt.ts             # JWT token utilities
│   └── index.ts               # Main application file
├── uploads/                   # Uploaded files directory (auto-created)
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## Installation

### 1. Clone or create the project

```bash
cd post-management
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy `.env.example` to `.env` and update with your values:

```bash
cp .env.example .env
```

Edit `.env`:

```
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=post_management
DB_USER=postgres
DB_PASSWORD=postgres

JWT_SECRET=your_super_secret_jwt_key_change_me_in_production
JWT_EXPIRY=7d
```

### 4. Initialize the database

First, create the PostgreSQL database:

```bash
createdb post_management
```

Then run the initialization script:

```bash
npm run db:init
```

### 5. Start the server

```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## API Endpoints

### Health Check

```
GET /
```

Returns API status.

### User Endpoints

#### Create User

**With file upload (multipart/form-data)**

```
POST /api/users
Content-Type: multipart/form-data

Form Data:
- first_name: John
- last_name: Doe
- email: john@example.com
- password: securepassword123
- phone_number: 081234567890
- profile_photo: (image file - jpeg, png, gif, webp)
```

**cURL Example:**

```bash
curl -X POST http://localhost:3000/api/users \
  -F "first_name=John" \
  -F "last_name=Doe" \
  -F "email=john@example.com" \
  -F "password=securepassword123" \
  -F "phone_number=081234567890" \
  -F "profile_photo=@/path/to/photo.jpg"
```

Response: `201 Created`

```json
{
  "id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone_number": "081234567890",
  "profile_photo": "/uploads/1729846200000-123456789-photo.jpg",
  "created_at": "2024-10-27T10:00:00.000Z"
}
```

#### Login

```
POST /api/users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

Response: `200 OK`

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": 1
}
```

#### Update User (Protected)

**With file upload (multipart/form-data)**

```
PUT /api/users/:id
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
- first_name: Jane (optional)
- last_name: Smith (optional)
- phone_number: 082345678901 (optional)
- profile_photo: (image file - jpeg, png, gif, webp) (optional)
```

**cURL Example:**

```bash
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Authorization: Bearer <token>" \
  -F "first_name=Jane" \
  -F "last_name=Smith" \
  -F "phone_number=082345678901" \
  -F "profile_photo=@/path/to/photo2.jpg"
```

Response: `200 OK`

```json
{
  "id": 1,
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "john@example.com",
  "phone_number": "082345678901",
  "profile_photo": "/uploads/1729846300000-987654321-photo2.jpg",
  "created_at": "2024-10-27T10:00:00.000Z"
}
```

#### Get User by ID

```
GET /api/users/:id
```

Response: `200 OK`

```json
{
  "id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone_number": "081234567890",
  "profile_photo": "https://example.com/photo.jpg",
  "created_at": "2024-10-27T10:00:00.000Z"
}
```

### Post Endpoints

#### Get All Posts (with Pagination)

```
GET /api/posts?page=1&limit=10
```

Response: `200 OK`

```json
{
  "data": [
    {
      "id": 1,
      "title": "My First Post",
      "text_description": "This is my first post content",
      "thumbnail": "https://example.com/thumb.jpg",
      "created_at": "2024-10-27T10:00:00.000Z",
      "created_by": 1,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

#### Get Post by ID

```
GET /api/posts/:id
```

Response: `200 OK`

```json
{
  "id": 1,
  "title": "My First Post",
  "text_description": "This is my first post content",
  "thumbnail": "https://example.com/thumb.jpg",
  "created_at": "2024-10-27T10:00:00.000Z",
  "created_by": 1,
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com"
}
```

#### Create Post (Protected)

**With file upload (multipart/form-data)**

```
POST /api/posts
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
- title: My First Post
- text_description: This is my first post content
- thumbnail: (image file - jpeg, png, gif, webp) (optional)
```

**cURL Example:**

```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Authorization: Bearer <token>" \
  -F "title=My First Post" \
  -F "text_description=This is my first post content" \
  -F "thumbnail=@/path/to/thumb.jpg"
```

Response: `201 Created`

```json
{
  "id": 1,
  "title": "My First Post",
  "text_description": "This is my first post content",
  "thumbnail": "/uploads/1729846400000-111111111-thumb.jpg",
  "created_at": "2024-10-27T10:00:00.000Z",
  "created_by": 1
}
```

#### Update Post (Protected)

**With file upload (multipart/form-data)**

```
PUT /api/posts/:id
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
- title: Updated Post Title (optional)
- text_description: Updated post content (optional)
- thumbnail: (image file - jpeg, png, gif, webp) (optional)
```

**cURL Example:**

```bash
curl -X PUT http://localhost:3000/api/posts/1 \
  -H "Authorization: Bearer <token>" \
  -F "title=Updated Post Title" \
  -F "text_description=Updated post content" \
  -F "thumbnail=@/path/to/thumb2.jpg"
```

Response: `200 OK`

```json
{
  "id": 1,
  "title": "Updated Post Title",
  "text_description": "Updated post content",
  "thumbnail": "/uploads/1729846500000-222222222-thumb2.jpg",
  "created_at": "2024-10-27T10:00:00.000Z",
  "created_by": 1,
  "updated_at": "2024-10-27T11:00:00.000Z"
}
```

#### Delete Post (Protected)

```
DELETE /api/posts/:id
Authorization: Bearer <token>
```

Response: `200 OK`

```json
{
  "message": "Post deleted successfully"
}
```

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20),
  profile_photo VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INT,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);
```

### Posts Table

```sql
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  text_description TEXT NOT NULL,
  thumbnail VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);
```

## Authentication

All protected endpoints require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

## File Upload Specifications

### Supported Formats
- **JPEG** (image/jpeg)
- **PNG** (image/png)
- **GIF** (image/gif)
- **WebP** (image/webp)

### Limits
- **Max file size**: 5MB per file
- **Storage location**: `./uploads/` directory (auto-created)
- **File naming**: Timestamp + random ID + original filename for uniqueness

### Accessing Uploaded Files

Uploaded files are automatically stored and can be accessed via:

```
http://localhost:3000/uploads/{filename}
```

For example:
```
http://localhost:3000/uploads/1729846200000-123456789-photo.jpg
```

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid/missing token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found (resource doesn't exist)
- `500`: Internal Server Error

## Development

### Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run db:init` - Initialize database tables

## License

MIT
