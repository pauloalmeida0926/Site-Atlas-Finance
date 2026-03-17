import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDXLJHJG9iynDvqaIxGYnCVWOY5K1z7AW4",
  authDomain: "atlas-finance-81cfb.firebaseapp.com",
  projectId: "atlas-finance-81cfb",
  storageBucket: "atlas-finance-81cfb.firebasestorage.app",
  messagingSenderId: "722134712380",
  appId: "1:722134712380:web:75b99d461693c7dd584339"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

function setUserState(user) {
  if (user && user.email) {
    localStorage.setItem("atlas_current_user", user.email.toLowerCase());
    if (user.displayName) {
      localStorage.setItem("atlas_current_name", user.displayName);
    }
    localStorage.setItem("atlas_logged", "true");
  }
}

function clearUserState() {
  localStorage.removeItem("atlas_logged");
  localStorage.removeItem("atlas_session_expires");
}

function requireAuth(redirectUrl = "login.html") {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      clearUserState();
      window.location.href = redirectUrl;
      return;
    }
    setUserState(user);
  });
}

async function signOutUser() {
  await signOut(auth);
  clearUserState();
  window.location.href = "login.html";
}

export { auth, requireAuth, signOutUser, setUserState };
