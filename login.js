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
let pendingLoginEmail = "";

function getUsers() {
  const raw = localStorage.getItem("atlas_users");
  return raw ? JSON.parse(raw) : [];
}

function saveUsers(users) {
  localStorage.setItem("atlas_users", JSON.stringify(users));
}

function goToApp(email) {
  if (email) {
    localStorage.setItem("atlas_current_user", email.toLowerCase());
  }
  localStorage.setItem("atlas_logged", "true");
  const expires = Date.now() + (8 * 60 * 60 * 1000);
  localStorage.setItem("atlas_session_expires", String(expires));
  window.location.href = "index.html";
}

function isStrongPassword(password) {
  return password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password);
}

async function sendLoginCode(email) {
  const response = await fetch("/api/send-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err = data && data.error ? data.error : "send_failed";
    throw new Error(err);
  }
  codeHint.textContent = "Codigo enviado para o email.";
  codeWrap.style.display = "grid";
}

function showForm(view) {
  signupForm.style.display = view === "signup" ? "grid" : "none";
  loginForm.style.display = view === "login" ? "grid" : "none";
  resetForm.style.display = view === "reset" ? "grid" : "none";
  tabSignup.classList.toggle("active", view === "signup");
  tabLogin.classList.toggle("active", view === "login");
  if (view !== "login") {
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
  const users = getUsers();
  if (users.some((u) => u.email === data.email)) {
    signupMsg.textContent = "Email ja cadastrado. Use Entrar.";
    signupMsg.className = "error";
    return;
  }
  users.push({ ...data, verified: true });
  saveUsers(users);
  signupMsg.textContent = "Conta criada. Redirecionando...";
  signupMsg.className = "success";
  setTimeout(() => goToApp(data.email), 400);
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
  const users = getUsers();
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) {
    loginMsg.textContent = "Email ou senha invalidos.";
    loginMsg.className = "error";
    return;
  }
  loginMsg.textContent = "Login ok. Redirecionando...";
  loginMsg.className = "success";
  setTimeout(() => goToApp(email), 300);
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
  resetMsg.textContent = "Redefinicao por email desativada no momento.";
  resetMsg.className = "error";
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
