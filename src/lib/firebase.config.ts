// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/**
 * Firebase configuration object loaded from environment variables.
 * Contains all necessary credentials for Firebase services initialization.
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

/**
 * Initialized Firebase app instance.
 */
const app = initializeApp(firebaseConfig);

/**
 * Firebase Authentication instance for managing user authentication.
 */
export const auth = getAuth(app);

/**
 * Google OAuth provider instance for Google sign-in authentication.
 */
export const googleProvider = new GoogleAuthProvider();

/**
 * GitHub OAuth provider instance for GitHub sign-in authentication.
 * Configured with user:email scope to access user email addresses.
 */
export const githubProvider = new GithubAuthProvider();
githubProvider.addScope('user:email');

/**
 * Firestore database instance for storing and retrieving data.
 */
export const db = getFirestore(app);