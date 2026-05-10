# Task 4: Auth UI Components + Store Update

## Work Completed

### 1. Updated Store (`/src/lib/store.ts`)
- Added `'login'` and `'signup'` to the `ViewType` union
- Added `UserInfo` interface (`{ id, name, email, role }`)
- Added `user: UserInfo | null` state field (default: `null`)
- Added `setUser` action to set/clear user
- Added `isAuthenticated` derived getter (returns `!!user`)
- All existing state and actions preserved

### 2. Created Login Form (`/src/components/auth/login-form.tsx`)
- GBB Fashion brand logo at top (clickable to home)
- "Welcome Back" heading with description
- Email input with Mail icon
- Password input with Lock icon + show/hide toggle (Eye/EyeOff)
- "Forgot password?" link
- "Sign In" button (black bg, white text, loading spinner)
- Error message display with rose-50 styling
- "Don't have an account? Sign Up" link → `setView('signup')`
- "Back to shopping" link → `setView('home')`
- On submit: POST to `/api/auth/login`, stores user in Zustand, navigates based on role
- Framer-motion staggered entrance animations
- Responsive design with centered card on gradient background

### 3. Created Signup Form (`/src/components/auth/signup-form.tsx`)
- GBB Fashion brand logo at top
- "Create Account" heading with description
- Full Name input with User icon
- Email input with Mail icon
- Phone input (optional) with Phone icon
- Password input with show/hide toggle
- Confirm Password input with show/hide toggle
- "Create Account" button (black bg, white text, loading spinner)
- Validation: required fields, email format, password ≥6 chars, passwords match
- Error message display
- "Already have an account? Sign In" link → `setView('login')`
- On submit: POST to `/api/auth/signup`, then auto-login via `/api/auth/login`
- Framer-motion staggered entrance animations

### 4. Created AuthGuard (`/src/components/auth-guard.tsx`)
- Wraps the app in `page.tsx`
- Protected views (checkout, admin): redirects to login if not authenticated
- Guest-only views (login, signup): redirects away if authenticated
- Admin users redirected to admin view, customers to home
- Configurable via props

### 5. Created API Routes
- `/api/auth/signup/route.ts` - POST handler for registration (bcryptjs hashing, validation)
- `/api/auth/login/route.ts` - POST handler for login (bcryptjs verification)
- `/api/auth/session/route.ts` - Session check endpoint

### 6. Updated Page (`/src/app/page.tsx`)
- Added `LoginForm` and `SignupForm` imports
- Added `AuthGuard` import and wrapper around Header + main + Footer
- Added `case 'login'` and `case 'signup'` to ViewRenderer

### 7. Updated Header (`/src/components/header.tsx`)
- Desktop User icon: now navigates to login (unauthenticated) or account (authenticated)
- Mobile Account button: shows "Sign In" text when unauthenticated, "Account" when authenticated
- Both use `useStore.getState().user` to check auth state

### Dependencies
- Installed `bcryptjs` and `@types/bcryptjs` for password hashing

### Lint & Testing
- ESLint: No errors
- Dev server compiles successfully
- API endpoints tested and working:
  - POST /api/auth/signup → creates user, returns user info
  - POST /api/auth/login → verifies credentials, returns user info
  - Seeded users: admin@gbb.com/admin123, customer@test.com/test123
