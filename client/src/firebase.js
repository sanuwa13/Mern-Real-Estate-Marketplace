// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration


const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-estate-fc60c.firebaseapp.com",
  projectId: "mern-estate-fc60c",
  storageBucket: "mern-estate-fc60c.firebasestorage.app",
  messagingSenderId: "406907653581",
  appId: "1:406907653581:web:0a2fe220eedd7f04a38884"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
