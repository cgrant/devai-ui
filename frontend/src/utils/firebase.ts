import { initializeApp } from "firebase/app";  
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth } from "firebase/auth";  
import { getFirestore} from 'firebase/firestore'; 
  
// Your web app's Firebase configuration
const firebaseConfig = {  
	apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
	authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN, 
	projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,

};

// Initialize Firebase  
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);  
export const db = getFirestore(app);  
 