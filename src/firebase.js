// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBQb8sz5oZVmmk9tOf49CbtAzaHLxwzIJw",
  authDomain: "em-estudio.firebaseapp.com",
  databaseURL: "https://em-estudio-default-rtdb.firebaseio.com",
  projectId: "em-estudio",
  storageBucket: "em-estudio.firebasestorage.app",
  messagingSenderId: "642931774003",
  appId: "1:642931774003:web:b1970320faf53bd7874946"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
export default app;
