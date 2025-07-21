// lib/firebase.js
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyB-iUuhr0L-ECeMIZlMyLoMvxYBv5c_Hvo",
  authDomain: "izogrand.firebaseapp.com",
  projectId: "izogrand",
  storageBucket: "izogrand.firebasestorage.app",
  messagingSenderId: "340755434598",
  appId: "1:340755434598:web:ce8ef9606bcdb5eb02f1a7",
  measurementId: "G-36DXS1V328"
};
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

export default db
