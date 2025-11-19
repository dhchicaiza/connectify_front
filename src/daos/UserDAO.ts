import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    updateDoc,
    serverTimestamp,
} from "firebase/firestore";

import type {
    CollectionReference,
    Timestamp,
} from "firebase/firestore";

import { db } from "../lib/firebase.config"; 

/**
 * Shape of the user documents stored in Firestore.
 */
export interface User {
    displayName?: string | null;
    email?: string | null;
    photoURL?: string | null;
    createdAt?: Timestamp | null;
    updatedAt?: Timestamp | null;
}

export type UserCreate = Omit<User, "id" | "createdAt" | "updatedAt">;
export type UserUpdate = Partial<Omit<User, "id" | "createdAt">>;

/**
 * Lightweight data-access object to interact with the Firestore `users` collection.
 */
class UserDAO {
    private collectionRef: CollectionReference;

    /**
     * Creates a data-access object scoped to the `users` collection.
     */
    constructor() {
        this.collectionRef = collection(db, "users");
    }

    /**
     * Retrieves a user document by its ID.
     */
    async getUserById(id: string): Promise<
        | { success: true; data: User }
        | { success: false; data: null; error?: string }
    > {
        try {
            const snap = await getDoc(doc(this.collectionRef, id));
            if (!snap.exists()) {
                return { success: false, data: null };
            }
            return { success: true, data: snap.data() };
        } catch (err: any) {
            console.error("Error getting document:", err);
            return { success: false, data: null, error: err?.message };
        }
    }

    /**
     * Persists a new user document.
     */
    async createUser(userData: UserCreate): Promise<
        | { success: true; id: string }
        | { success: false; error: string }
    > {
        try {
            const docRef = await addDoc(this.collectionRef, {
                ...userData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            } as User);
            console.log("Document written with ID:", docRef.id);
            return { success: true, id: docRef.id };
        } catch (err: any) {
            console.error("Error adding document:", err);
            return { success: false, error: err?.message ?? "Unknown error" };
        }
    }

    /**
     * Partially updates an existing user document.
     */
    async updateUser(id: string, userData: UserUpdate): Promise<
        | { success: true }
        | { success: false; error: string }
    > {
        try {
            const userRef = doc(this.collectionRef, id);
            await updateDoc(userRef, {
                ...userData,
                updatedAt: serverTimestamp(),
            } as Partial<User>);
            console.log("Document successfully updated!");
            return { success: true };
        } catch (err: any) {
            console.error("Error updating document:", err);
            return { success: false, error: err?.message ?? "Unknown error" };
        }
    }

    /**
     * Deletes a user document from Firestore.
     */
    async deleteUser(id: string): Promise<
        | { success: true }
        | { success: false; error: string }
    > {
        try {
            await deleteDoc(doc(this.collectionRef, id));
            console.log("Document successfully deleted!");
            return { success: true };
        } catch (err: any) {
            console.error("Error removing document:", err);
            return { success: false, error: err?.message ?? "Unknown error" };
        }
    }
}

export default new UserDAO();