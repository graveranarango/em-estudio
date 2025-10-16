// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBOx_8NdxOOgqEiG7FHjbqWyQrkiaVa_wg",
  authDomain: "em-estudio-865c5.firebaseapp.com",
  projectId: "em-estudio-865c5",
  storageBucket: "em-estudio-865c5.firebasestorage.app",
  messagingSenderId: "322727128507",
  appId: "1:322727128507:web:c07f80d9554b2179a4289e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
export default app;
