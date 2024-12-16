// Import the functions you need from the SDKs you need
import app from "firebase/compat/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import 'firebase/compat/auth';
import 'firebase/compat/database';
import 'firebase/compat/firestore';


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCYBBvjMdtG_yC63zgfBrJ8NHDpE6ylLac",
  authDomain: "whatsappclone-88fea.firebaseapp.com",
  databaseURL: "https://whatsappclone-88fea-default-rtdb.firebaseio.com",
  projectId: "whatsappclone-88fea",
  storageBucket: "whatsappclone-88fea.firebasestorage.app",
  messagingSenderId: "262425689769",
  appId: "1:262425689769:web:5bf6c59d4d6390d71433b8",
  measurementId: "G-B7857E7KDL"
};
// Initialize Firebase
const firebase = app.initializeApp(firebaseConfig);
export default firebase;