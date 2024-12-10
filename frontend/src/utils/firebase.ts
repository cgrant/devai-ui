import { initializeApp } from "firebase/app";  

// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth, 
         createUserWithEmailAndPassword, 
         signInWithEmailAndPassword, 
         signOut} from "firebase/auth";  
import { getFirestore} from 'firebase/firestore'; 
  
// Your web app's Firebase configuration
const firebaseConfig = {  
	apiKey: import.meta.env.VITE_FIREBASE_API_KEY,  
	authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,  
	projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,  
	storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,  
	messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGE_SENDER_ID,  
	appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase  
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);  
export const db = getFirestore(app);  
 

// Export authentication functions
export const createUser = (email: any, password: any) => createUserWithEmailAndPassword(auth, email, password);
export const signIn = (email: any, password: any) => signInWithEmailAndPassword(auth, email, password);
export const logout = () => signOut(auth);