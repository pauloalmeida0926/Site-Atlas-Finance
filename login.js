import { auth, setUserState } from "./auth.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

const signupForm = document.getElementById("signup-form");
const loginForm = document.getElementById("login-form");
const resetForm = document.getElementById("reset-form");
const signupMsg = document.getElementById("signup-msg");
const loginMsg = document.getElementById("login-msg");
const resetMsg = document.getElementById("reset-msg");
const tabSignup = document.getElementById("tab-signup");
const tabLogin = document.getElementById("tab-login");
const forgotBtn = document.getElementById("forgot-btn");
const resetBack = document.getElementById("reset-back");
const loginEmailInput = document.getElementById("login-email");
const loginPasswordInput = document.getElementById("login-password");
const codeWrap = document.getElementById("code-wrap");
const loginCodeInput = document.getElementById("login-code");
const codeHint = document.getElementById("code-hint");
const codeVerify = document.getElementById("code-verify");
const codeResend = document.getElementById("code-resend");
let pendingLoginEmail = "";

function goToApp(email) {
  if (email) {
    localStorage.setItem("atlas_current_user", email.toLowerCase());
  }
  window.location.href = "index.html";
}

function isStrongPassword(password) {
  return password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password);
}

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function saveLoginCode(email) {
  const code = generateCode();
  localStorage.setItem(`atlas_login_code_${email}`, code);
  localStorage.setItem(`atlas_login_code_ts_${email}`, String(Date.now()));
  codeHint.textContent = `Codigo enviado (simulado): ${code}`;
  codeWrap.style.display = "grid";
}

function isCodeValid(email, input) {
  const stored = localStorage.getItem(`atlas_login_code_${email}`) || "";
  const ts = Number(localStorage.getItem(`atlas_login_code_ts_${email}`) || "0");
  const expired = ts && (Date.now() - ts) > (10 * 60 * 1000);
  if (expired) return { ok: false, msg: "Codigo expirado. Reenvie." };
  if (!stored || stored !== input) return { ok: false, msg: "Codigo invalido." };
  return { ok: true, msg: "" };
}

function clearLoginCode(email) {
  localStorage.removeItem(`atlas_login_code_${email}`);
  localStorage.removeItem(`atlas_login_code_ts_${email}`);
}

function showForm(view) {
  signupForm.style.display = view === "signup" ? "grid" : "none";
  loginForm.style.display = view === "login" ? "grid" : "none";
  resetForm.style.display = view === "reset" ? "grid" : "none";
  tabSignup.classList.toggle("active", view === "signup");
  tabLogin.classList.toggle("active", view === "login");
  if (view !== "login") {
    codeWrap.style.display = "none";
    pendingLoginEmail = "";
  }
}

function syncFromHash() {
  const view = location.hash === "#login" ? "login" : "signup";
  showForm(view);
}

tabSignup.addEventListener("click", (event) => {
  event.preventDefault();
  showForm("signup");
  location.hash = "signup";
});

tabLogin.addEventListener("click", (event) => {
  event.preventDefault();
  showForm("login");
  location.hash = "login";
});

signupForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = {
    name: signupForm.name.value.trim(),
    email: signupForm.email.value.trim().toLowerCase(),
    password: signupForm.password.value.trim()
  };
  if (!data.name || !data.email || !data.password) {
    signupMsg.textContent = "Preencha todos os campos.";
    signupMsg.className = "error";
    return;
  }
  if (!isStrongPassword(data.password)) {
    signupMsg.textContent = "Senha fraca. Use 8+ caracteres, maiuscula, minuscula e numero.";
    signupMsg.className = "error";
    return;
  }
  createUserWithEmailAndPassword(auth, data.email, data.password)
    .then(async (cred) => {
      await updateProfile(cred.user, { displayName: data.name });
      setUserState(cred.user);
      signupMsg.textContent = "Conta criada. Redirecionando...";
      signupMsg.className = "success";
      setTimeout(() => goToApp(data.email), 400);
    })
    .catch((err) => {
      if (err && err.code === "auth/email-already-in-use") {
        signupMsg.textContent = "Email ja cadastrado. Use Entrar.";
      } else {
        signupMsg.textContent = "Erro ao criar conta. Tente novamente.";
      }
      signupMsg.className = "error";
    });
});

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const email = loginEmailInput ? loginEmailInput.value.trim().toLowerCase() : "";
  const password = loginPasswordInput ? loginPasswordInput.value.trim() : "";
  if (!email || !password) {
    loginMsg.textContent = "Preencha email e senha.";
    loginMsg.className = "error";
    return;
  }
  if (pendingLoginEmail && pendingLoginEmail === email) {
    loginMsg.textContent = "Digite o codigo para concluir o login.";
    loginMsg.className = "error";
    return;
  }
  signInWithEmailAndPassword(auth, email, password)
    .then((cred) => {
      setUserState(cred.user);
      pendingLoginEmail = email;
      loginMsg.textContent = "Codigo de verificacao enviado. Digite para entrar.";
      loginMsg.className = "success";
      saveLoginCode(email);
    })
    .catch(() => {
      loginMsg.textContent = "Email ou senha invalidos.";
      loginMsg.className = "error";
    });
});

forgotBtn.addEventListener("click", () => {
  showForm("reset");
});

resetBack.addEventListener("click", () => {
  showForm("login");
  location.hash = "login";
});

resetForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const email = resetForm["reset-email"].value.trim().toLowerCase();
  const newPassword = resetForm["reset-password"].value.trim();
  if (!email || !newPassword) {
    resetMsg.textContent = "Preencha todos os campos.";
    resetMsg.className = "error";
    return;
  }
  if (!isStrongPassword(newPassword)) {
    resetMsg.textContent = "Senha fraca. Use 8+ caracteres, maiuscula, minuscula e numero.";
    resetMsg.className = "error";
    return;
  }
  sendPasswordResetEmail(auth, email)
    .then(() => {
      resetMsg.textContent = "Email de redefinicao enviado. Verifique sua caixa de entrada.";
      resetMsg.className = "success";
    })
    .catch(() => {
      resetMsg.textContent = "Nao foi possivel enviar o email.";
      resetMsg.className = "error";
    });
});

codeVerify.addEventListener("click", () => {
  const email = pendingLoginEmail;
  const code = loginCodeInput.value.trim();
  if (!email) {
    loginMsg.textContent = "Inicie o login para receber o codigo.";
    loginMsg.className = "error";
    return;
  }
  if (!code) {
    loginMsg.textContent = "Digite o codigo.";
    loginMsg.className = "error";
    return;
  }
  const check = isCodeValid(email, code);
  if (!check.ok) {
    loginMsg.textContent = check.msg;
    loginMsg.className = "error";
    return;
  }
  clearLoginCode(email);
  loginMsg.textContent = "Login ok. Redirecionando...";
  loginMsg.className = "success";
  setTimeout(() => goToApp(email), 300);
});

codeResend.addEventListener("click", () => {
  const email = pendingLoginEmail;
  if (!email) {
    loginMsg.textContent = "Inicie o login para reenviar o codigo.";
    loginMsg.className = "error";
    return;
  }
  saveLoginCode(email);
  loginMsg.textContent = "Novo codigo enviado.";
  loginMsg.className = "success";
});

document.addEventListener("click", (event) => {
  const btn = event.target.closest("[data-toggle]");
  if (!btn) return;
  const targetId = btn.getAttribute("data-toggle");
  const input = document.getElementById(targetId);
  if (!input) return;
  input.type = input.type === "password" ? "text" : "password";
  btn.textContent = input.type === "password" ? "Ver" : "Ocultar";
});

const clickDebug = document.getElementById("click-debug");
if (clickDebug) clickDebug.textContent = "JS ativo. Clique para testar.";

document.addEventListener("pointerdown", () => {
  const el = document.getElementById("click-debug");
  if (el) el.textContent = "Clique detectado";
});

window.addEventListener("hashchange", syncFromHash);
syncFromHash();
