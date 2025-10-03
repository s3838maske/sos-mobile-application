import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
// const firebaseConfig = {
//   apiKey: "your-api-key",
//   authDomain: "your-project.firebaseapp.com",
//   projectId: "your-project-id",
//   storageBucket: "your-project.appspot.com",
//   messagingSenderId: "123456789",
//   appId: "your-app-id"
// };

const firebaseConfig = {
  apiKey: "AIzaSyDMY-ttnNA8itfLdZqIHebYndI3d0wpZIo",
  authDomain: "woman-safety-sos-app.firebaseapp.com",
  databaseURL: "https://woman-safety-sos-app-default-rtdb.firebaseio.com",
  projectId: "woman-safety-sos-app",
  storageBucket: "woman-safety-sos-app.firebasestorage.app",
  messagingSenderId: "164867930884",
  appId: "1:164867930884:web:d66d65228cbdd1e0796e51",
  measurementId: "G-966V69CER6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
const auth = getAuth(app);

// Initialize Firestore
const db = getFirestore(app);

export { auth, db };
export default app;
