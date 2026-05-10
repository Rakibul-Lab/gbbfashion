# Task 2-3: NextAuth.js v4 + API Routes

## Agent: Auth & API Agent

## Work Log:

### 1. Installed bcryptjs
- Ran `bun add bcryptjs @types/bcryptjs` (bcryptjs@3.0.3, @types/bcryptjs@3.0.0)

### 2. Created NextAuth Configuration (`/src/lib/auth.ts`)
- CredentialsProvider with email/password
- authorize() validates against db.user with bcrypt.compare
- JWT callback adds id and role to token
- Session callback exposes id and role on session.user
- Custom signIn page: `/?view=login`
- JWT strategy with fallback secret

### 3. Created NextAuth Route Handler (`/src/app/api/auth/[...nextauth]/route.ts`)
- Exports GET and POST handlers from NextAuth(authOptions)

### 4. Created Auth Provider Wrapper (`/src/components/auth-provider.tsx`)
- Client component wrapping children with NextAuth SessionProvider
- Integrated into root layout.tsx

### 5. Created NextAuth Type Declarations (`/src/types/next-auth.d.ts`)
- Augments next-auth Session with id, name, email, role
- Augments next-auth/jwt JWT with id and role

### 6. Updated Signup API (`/src/app/api/auth/signup/route.ts`)
- Previous agent had already created this file with good validation
- Added admin role assignment: email `admin@gbb.com` → role `admin`, otherwise `customer`

### 7. Updated Session API (`/src/app/api/auth/session/route.ts`)
- Replaced stub implementation with `getServerSession(authOptions)` from NextAuth
- Returns actual session user data or null

### 8. Created Reels API Routes
- **GET /api/reels**: List all reels, optional `?active=true` filter, ordered by sortOrder
- **POST /api/reels**: Create new reel with validation (title, productName, price, videoSrc required)
- **GET /api/reels/[id]**: Get single reel by ID, 404 if not found
- **PUT /api/reels/[id]**: Update reel with partial data, 404 check
- **DELETE /api/reels/[id]**: Delete reel by ID, 404 check

### 9. Created Users API (`/src/app/api/users/route.ts`)
- GET: List all users ordered by createdAt desc, excludes password field

### 10. Updated Seed API (`/src/app/api/seed/route.ts`)
- Added user seeding:
  - admin@gbb.com / admin123 (role: admin)
  - customer@test.com / test123 (role: customer)
- Added reel seeding: 5 reels matching existing video files (video-1.mp4 through video-5.mp4)
- Updated product data with new fields:
  - originalPrice: ~2x the price for compare-at display
  - colors: comma-separated color options per product
  - collection: "Prime Bags" or "Prime Shoes" or null
  - hasFlash: boolean for trending/flash delivery categorization
- Proper deletion order respecting foreign key constraints

### 11. Updated Layout (`/src/app/layout.tsx`)
- Wrapped children with AuthProvider component for NextAuth session support

### Quality Checks:
- ESLint: No errors
- Seed API tested: Returns {"message":"Database seeded successfully","products":22,"reels":5,"users":2}
- Reels API tested: Returns all 5 reels with correct data
- Users API tested: Returns 2 users (admin + customer) without passwords
- NextAuth session API tested: Returns {"user":null} for unauthenticated requests

## Stage Summary:
- Complete NextAuth v4 integration with credentials provider, JWT strategy, and custom session callbacks
- 7 API routes created/updated: auth/signup, auth/login, auth/session, auth/[...nextauth], reels, reels/[id], users
- Seed API seeds 22 products (with originalPrice, colors, collection, hasFlash), 5 reels, and 2 users
- AuthProvider wraps the app for client-side session access
- TypeScript type declarations for NextAuth session and JWT with custom fields
