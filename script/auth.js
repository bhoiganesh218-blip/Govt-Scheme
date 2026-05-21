// ===============================
// 🔥 FIREBASE IMPORTS
// ===============================
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


// ===============================
// 🔥 INIT
// ===============================
const auth = getAuth();
const db = getFirestore();
const provider = new GoogleAuthProvider();

let currentUser = null;
let authReady = false;


// ===============================
// 🎯 DOM ELEMENTS
// ===============================
let modal, loginTab, signupTab;
let loginForm, signupForm;
let loginBtn, signupBtn, googleBtn, closeBtn;


// ===============================
// 🚀 INIT DOM
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  modal = document.getElementById("authModal");

  loginTab = document.getElementById("loginTab");
  signupTab = document.getElementById("signupTab");

  loginForm = document.getElementById("loginForm");
  signupForm = document.getElementById("signupForm");

  loginBtn = document.getElementById("loginBtn");
  signupBtn = document.getElementById("signupBtn");
  googleBtn = document.getElementById("googleBtn");
  closeBtn = document.getElementById("closeAuth");

  bindEvents();
});


// ===============================
// 🔁 AUTH STATE (MASTER SOURCE)
// ===============================
onAuthStateChanged(auth, (user) => {
  currentUser = user || null;
  authReady = true;

  updateProfileUI(user);
});


// ===============================
// 🔐 AUTH GUARD
// ===============================
export function requireAuth(callback) {
  if (currentUser) {
    callback(currentUser);
  } else {
    openAuth();
  }
}


// ===============================
// 🔓 MODAL CONTROL
// ===============================
export function openAuth() {
  modal?.classList.remove("hidden");
}

export function closeAuth() {
  modal?.classList.add("hidden");
}


// ===============================
// ⚡ LOADER WRAPPER
// ===============================
function runWithLoader(fn, text = "Loading...") {
  startLoader(text);
  return fn().finally(() => stopLoader());
}


// ===============================
// 🔑 LOGIN
// ===============================
async function login(email, password) {
  await signInWithEmailAndPassword(auth, email, password);
  closeAuth();
}


// ===============================
// 🆕 SIGNUP
// ===============================
async function signup(name, email, password) {
  const res = await createUserWithEmailAndPassword(auth, email, password);

  await setDoc(doc(db, "users", res.user.uid), {
    uid: res.user.uid,
    name,
    email,
    provider: "email",
    createdAt: Date.now(),
  });

  closeAuth();
}


// ===============================
// 🔥 GOOGLE LOGIN
// ===============================
async function googleLogin() {
  const res = await signInWithPopup(auth, provider);

  await setDoc(doc(db, "users", res.user.uid), {
    uid: res.user.uid,
    name: res.user.displayName,
    email: res.user.email,
    provider: "google",
    createdAt: Date.now(),
  });

  closeAuth();
}


// ===============================
// 🎯 EVENTS
// ===============================
function bindEvents() {

  closeBtn?.addEventListener("click", closeAuth);

  // LOGIN
  loginBtn?.addEventListener("click", async () => {
    const email = loginForm.querySelector("input[type='email']").value;
    const pass = loginForm.querySelector("input[type='password']").value;

    try {
      await runWithLoader(() => login(email, pass), "Logging in...");
    } catch (err) {
      alert(err.message);
    }
  });

  // SIGNUP
  signupBtn?.addEventListener("click", async () => {
    const inputs = signupForm.querySelectorAll("input");

    const name = inputs[0].value;
    const email = inputs[1].value;
    const pass = inputs[2].value;

    try {
      await runWithLoader(() => signup(name, email, pass), "Creating account...");
    } catch (err) {
      alert(err.message);
    }
  });

  // GOOGLE
  googleBtn?.addEventListener("click", async () => {
    try {
      await runWithLoader(() => googleLogin(), "Connecting Google...");
    } catch (err) {
      alert(err.message);
    }
  });

  // TAB SWITCH
  loginTab?.addEventListener("click", () => {
    loginTab.classList.add("active");
    signupTab.classList.remove("active");

    loginForm.classList.add("active");
    signupForm.classList.remove("active");
  });

  signupTab?.addEventListener("click", () => {
    signupTab.classList.add("active");
    loginTab.classList.remove("active");

    signupForm.classList.add("active");
    loginForm.classList.remove("active");
  });
}


// ===============================
// 📦 PROFILE (LOGGED USER)
// ===============================
export async function renderProfilePage(user) {
  const container = document.getElementById("ProfilePage");
  if (!container) return;

  const snap = await getDoc(doc(db, "users", user.uid));
  const data = snap.exists() ? snap.data() : {};

  container.innerHTML = `
    <div class="profile-wrapper">

      <div class="profile-card">

        <div class="profile-avatar">👤</div>

        <h2>Welcome, ${data.name || user.email} 👋</h2>

        <p class="profile-email">${data.email || ""}</p>

        <p class="profile-msg">
          Premium Govt Schemes Access 🚀
        </p>

        <button id="logoutBtn" class="logout-btn">
          🚪 Logout
        </button>

      </div>
    </div>

    <div id="logoutModal" class="logout-modal hidden">
      <div class="logout-box">
        <h3>Logout confirmation?</h3>

        <div class="logout-actions">
          <button id="confirmLogout">Yes</button>
          <button id="cancelLogout">No</button>
        </div>
      </div>
    </div>
  `;

  attachProfileEvents();
}


// ===============================
// 🔐 GUEST PROFILE (IMPORTANT FIX)
// ===============================
export function renderGuestProfile() {
  const container = document.getElementById("ProfilePage");
  if (!container) return;

  container.innerHTML = `
    <div class="profile-wrapper">

      <div class="profile-card">

        <div class="profile-avatar">🔒</div>

        <h2>Please Sign In</h2>

        <p class="profile-msg">
          Login required to access profile & premium schemes.
        </p>

        <button id="openAuthBtn" class="logout-btn">
          Login / Sign Up
        </button>

      </div>
    </div>
  `;

  document.getElementById("openAuthBtn")
    ?.addEventListener("click", openAuth);
}


// ===============================
// 🔐 OPEN PROFILE (SAFE)
// ===============================
export function openProfile() {

  if (currentUser) {
    renderProfilePage(currentUser);
    return;
  }

  const unsub = onAuthStateChanged(auth, (user) => {
    if (user) renderProfilePage(user);
    else openAuth();

    unsub();
  });
}


// ===============================
// 🚪 PROFILE EVENTS
// ===============================
function attachProfileEvents() {

  const logoutBtn = document.getElementById("logoutBtn");
  const modal = document.getElementById("logoutModal");

  const confirm = document.getElementById("confirmLogout");
  const cancel = document.getElementById("cancelLogout");

  logoutBtn?.addEventListener("click", () => {
    modal?.classList.remove("hidden");
  });

  cancel?.addEventListener("click", () => {
    modal?.classList.add("hidden");
  });

  confirm?.addEventListener("click", async () => {
    await signOut(auth);

    modal?.classList.add("hidden");
  });
}


function updateProfileUI(user) {
  const container = document.getElementById("ProfilePage");
  if (!container) return;

  if (user) {
    renderProfilePage(user);
  } else {
    renderGuestProfile();
  }
}