import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, orderBy, query } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDZS_7pGHPN9xarnGUZea-XR46BbTFux04",
    authDomain: "fir-353e6.firebaseapp.com",
    databaseURL: "https://fir-353e6-default-rtdb.firebaseio.com",
    projectId: "fir-353e6",
    storageBucket: "fir-353e6.firebasestorage.app",
    messagingSenderId: "892493326689",
    appId: "1:892493326689:web:db69aebe62f5e8e4edbd20",
    measurementId: "G-F0F5K84766"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export { collection, addDoc, getDocs, orderBy, query };
