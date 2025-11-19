# Routes

| Route | Description |
|-------|-------------|
| `/` | Informational “About us” page |
| `/login` | Login page |
| `/register` | Account creation page |
| `/forgot-password` | Password recovery page |

---

## General Flow

1. **Home (`/`)**  
   The user lands on the main page, which describes the project and its purpose, and provides access to login and registration.

2. **Authentication**
   - `/login`: Allows users to log in with their email and password.  
   - `/register`: Allows users to create a new user account.

3. **Account Management**
   - `/forgot-password`: Sends a password reset link to the user's email.

4. **User Profile**
   - `/profile`: Displays personal information and configuration options.

---

## Main Technologies

- **React 18 + TypeScript** → Frontend foundation  
- **Vite** → Fast development bundler  
- **SCSS** → Utility-based styling  
- **React Router** → Routing system  

---

## Running the Project

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build
