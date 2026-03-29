import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';

// Import the Firebase configuration
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Validate Connection to Firestore
export async function testConnection() {
  try {
    // Attempt to fetch a non-existent document to test connectivity
    // Using getDocFromServer ensures we're testing the actual backend connection
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firestore connection successful.");
    return true;
  } catch (error: any) {
    if (error.message?.includes('the client is offline') || error.code === 'unavailable') {
      console.error("Firestore connection failed: The client is offline or the backend is unreachable. Please check your Firebase configuration.");
      return false;
    }
    // Other errors (like permission denied) still mean we reached the server
    return true;
  }
}

// Don't run immediately on module load to avoid race conditions with network initialization
// Instead, we'll let the first data fetch handle it or call it from the main app component
// testConnection();

export { onAuthStateChanged };
export type { User };
