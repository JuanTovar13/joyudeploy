// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDbGnW_Js-JFbw92K6GLgFDZQy4VCJSchM",
  authDomain: "joyu-cd0a7.firebaseapp.com",
  projectId: "joyu-cd0a7",
  storageBucket: "joyu-cd0a7.firebasestorage.app",
  messagingSenderId: "210243864404",
  appId: "1:210243864404:web:71df68e995b5f58b262ac1",
  measurementId: "G-Z0LNKG9QNP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const authService = getAuth(app);
