import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyA4u9uY99a8kbKoki8KBbSXxQm6BzE5H8I",
    authDomain: "catalaplay.firebaseapp.com",
    projectId: "catalaplay",
    storageBucket: "catalaplay.firebasestorage.app",
    messagingSenderId: "873831333606",
    appId: "1:873831333606:web:61b898412d8984508b4527",
    measurementId: "G-3HW0GPX8RZ"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export { db };