// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


// 🔑 Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyD3vgtQ5lDFVzRmQN23ESD2VrHlflDAF-Q",
  authDomain: "goverment-schemes-773bc.firebaseapp.com",
  projectId: "goverment-schemes-773bc",
  storageBucket: "goverment-schemes-773bc.firebasestorage.app",
  messagingSenderId: "247335098973",
  appId: "1:247335098973:web:03caa15464b5438deacbb4",
  measurementId: "G-3GF9SCRZ8L"
};


// 🚀 Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// ========================================
// 📦 FIRESTORE FUNCTIONS
// ========================================


// 🔹 Get all schemes
export async function getAllSchemes() {
  const snapshot = await getDocs(collection(db, "schemes"));

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}


// 🔹 Get schemes by category
export async function getSchemesByCategory(category) {
  const q = query(
    collection(db, "schemes"),
    where("category", "==", category)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}


// 🔹 Get scheme by ID
export async function getSchemeById(id) {
  const docRef = doc(db, "schemes", id);
  const snap = await getDoc(docRef);

  if (snap.exists()) {
    return { id: snap.id, ...snap.data() };
  }

  return null;
}


// 🔹 Get article by schemeId
export async function getArticleBySchemeId(schemeId) {
  const q = query(
    collection(db, "articles"),
    where("schemeId", "==", schemeId)
  );

  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    return {
      id: snapshot.docs[0].id,
      ...snapshot.docs[0].data()
    };
  }

  return null;
}


// 🔹 Get full scheme details
export async function getFullSchemeDetails(schemeId) {
  const scheme = await getSchemeById(schemeId);
  const article = await getArticleBySchemeId(schemeId);

  return { scheme, article };
}