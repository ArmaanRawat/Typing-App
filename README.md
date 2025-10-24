# Typing Speed Test App

A full-stack typing speed test application built with Next.js, TypeScript, Prisma, and MongoDB Atlas. Track your typing speed, accuracy, and progress over time.

## 🚀 Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Backend**: Next.js API Routes
- **Database**: MongoDB Atlas (Cloud)
- **ORM**: Prisma
- **Authentication**: NextAuth.js (Credentials Provider)
- **Validation**: Zod
- **Security**: bcrypt (password hashing)

## 📁 Project Structure

```
typing-app/
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── [...nextauth]/
│   │       │   └── route.ts          # NextAuth configuration
│   │       └── register/
│   │           └── route.ts          # User registration endpoint
│   ├── login/
│   │   └── page.tsx                  # Login page (TODO)
│   ├── register/
│   │   └── page.tsx                  # Registration page (TODO)
│   ├── dashboard/
│   │   └── page.tsx                  # User dashboard (TODO)
│   ├── test/
│   │   └── page.tsx                  # Typing test page (TODO)
│   └── layout.tsx                     # Root layout (TODO)
├── lib/
│   ├── prisma.ts                      # Prisma client instance
│   └── auth.ts                        # Auth helper functions
├── prisma/
│   └── schema.prisma                  # Database schema
├── .env                               # Environment variables
├── .gitignore
├── package.json
└── README.md
```

## 📊 Database Schema

### User Model

Stores user account information:

- `id`: Unique MongoDB ObjectId
- `email`: Unique email (login credential)
- `name`: User's display name
- `passwordHash`: bcrypt-hashed password
- `createdAt/updatedAt`: Timestamps

### TestResult Model

Stores each typing test attempt:

- **Metrics**: WPM, raw WPM, accuracy (0-1), backspaces, errors
- **Test Config**: mode (time/chars), duration (15s/30s/60s), target chars (100/200)
- **Content**: source (random/custom), snippetId (optional)

### Auth Models

NextAuth required models:

- `Account`: OAuth providers (future use)
- `Session`: User sessions
- `VerificationToken`: Email verification (future use)

## 🔧 Setup Instructions

### 1. Clone the Repository

```bash
cd /Users/armaanrawat/codes/dev_lopment/typing-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. MongoDB Atlas Setup

1. Create a free cluster at [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a database user:
   - Username: `typingappuser`
   - Password: Generate a secure password
3. Whitelist your IP:
   - Go to **Network Access** → Add `0.0.0.0/0` (for development)
4. Get connection string:
   - Click **Connect** → **Drivers** → Copy the connection string

### 4. Environment Variables

Create `.env` file:

```env
DATABASE_URL="mongodb+srv://typingappuser:<password>@typing-app-cluster.xxxxx.mongodb.net/typing-app?retryWrites=true&w=majority"

# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET="your-generated-secret-here"

NEXTAUTH_URL="http://localhost:3000"
```

Replace:

- `<password>` with your MongoDB user password
- `your-generated-secret-here` with output from `openssl rand -base64 32`

### 5. Prisma Setup

Push schema to MongoDB and generate client:

```bash
npx prisma db push
npx prisma generate
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🔐 Authentication Flow

### Registration

1. User submits email, name, password via `/api/auth/register`
2. API validates input with Zod schema
3. Checks if email already exists
4. Hashes password with bcrypt (10 rounds)
5. Creates user in MongoDB
6. Returns success/error

### Login

1. User submits email + password
2. NextAuth finds user by email
3. Compares password hash with `bcrypt.compare()`
4. If valid → creates JWT session token
5. Token stored in HTTP-only cookie
6. User redirected to dashboard

### Session Management

- **Strategy**: JWT (stateless)
- **Token contains**: userId, email, name
- **Access**: Use `getSession()` in server components
- **Logout**: Clear JWT cookie

## 🎯 Planned Features

### Phase 1 ✅ (Completed)

- [x] MongoDB Atlas + Prisma setup
- [x] User authentication (registration + login)
- [x] Database schema design

### Phase 2 🚧 (In Progress)

- [ ] Login/Register UI pages
- [ ] Dashboard page (show test history)
- [ ] Typing test page
- [ ] API endpoints for saving/fetching test results

### Phase 3 📝 (Planned)

- [ ] Test modes: 15s, 30s, 60s, 100 chars, 200 chars
- [ ] Real-time WPM calculation
- [ ] Metrics: accuracy, backspaces, errors
- [ ] Random text generation
- [ ] Custom text input
- [ ] Pagination for test history
- [ ] All-time best score display

### Phase 4 🎨 (Future)

- [ ] Leaderboard
- [ ] Charts/graphs for progress tracking
- [ ] Dark mode
- [ ] Keyboard sound effects
- [ ] Multiple languages support

## 📦 Dependencies

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@prisma/client": "^6.18.0",
    "next-auth": "^4.24.11",
    "@next-auth/prisma-adapter": "^1.0.7",
    "bcrypt": "^5.1.1",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "prisma": "^6.18.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/bcrypt": "^5.0.0"
  }
}
```

## 🛠️ Useful Commands

```bash
# Development
npm run dev

# Build for production
npm run build
npm start

# Prisma commands
npx prisma db push        # Sync schema to database
npx prisma generate       # Generate Prisma Client
npx prisma studio         # Open database GUI

# View MongoDB data
npx prisma studio
```

## 🔒 Security Best Practices

- ✅ Passwords hashed with bcrypt (never stored plain text)
- ✅ JWT sessions with secure secret
- ✅ Input validation with Zod
- ✅ MongoDB connection string in `.env` (not committed)
- ✅ HTTP-only cookies for session tokens
- ⚠️ Production: Use specific IP whitelist (not 0.0.0.0/0)
- ⚠️ Production: Enable HTTPS, set secure cookie flags

## 📝 API Endpoints

### Authentication

- `POST /api/auth/register` - Create new user account

  ```json
  {
    "email": "user@example.com",
    "name": "John Doe",
    "password": "securepass123"
  }
  ```

- `POST /api/auth/callback/credentials` - Login (handled by NextAuth)
  ```json
  {
    "email": "user@example.com",
    "password": "securepass123"
  }
  ```

### Tests (TODO)

- `POST /api/tests` - Save test result
- `GET /api/scores` - Get paginated test history
- `GET /api/scores/best` - Get all-time best score

## 🐛 Troubleshooting

### Prisma can't find DATABASE_URL

- Ensure `.env` is in project root
- Check `.env` has no syntax errors
- Run `npx prisma db push` again

### MongoDB connection fails

- Verify password in connection string (URL encode special chars)
- Check IP whitelist in MongoDB Atlas
- Ensure cluster is active

### NextAuth errors

- Verify `NEXTAUTH_SECRET` is set in `.env`
- Check `NEXTAUTH_URL` matches your domain
- Clear cookies and try again

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

## 👨‍💻 Author

Armaan Rawat - Learning full-stack development

## 📄 License

MIT License - Feel free to use for learning purposes
