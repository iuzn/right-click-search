// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCpfzX2icJ8hj-jjC7NGEzpLSpzJ1PBt3A",
  authDomain: "rightclicksearch.firebaseapp.com",
  projectId: "rightclicksearch",
  storageBucket: "rightclicksearch.firebasestorage.app",
  messagingSenderId: "986877201779",
  appId: "1:986877201779:web:49723c382949d4894bc906",
  measurementId: "G-XXWMPJ91RT",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (only on client side)
let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

export { app, analytics };
