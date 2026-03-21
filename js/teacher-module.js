import { db } from "./firebase-config.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const teacherPasswords = {
  "uzbek_teacher_chust": "Teacher (Uzbekistan)",
  "korean_teacher_gyeongsan": "Teacher (Korea)"
};

let currentAuthor = null;

// Inject Modal HTML directly into the page
const modalHTML = `
<div id="teacher-modal-overlay" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); z-index:9999; justify-content:center; align-items:center; backdrop-filter:blur(6px);">
  <div class="teacher-container" style="background:var(--c-surface); padding:2.5rem; border-radius:var(--radius-lg); width:90%; max-width:420px; box-shadow:0 20px 40px rgba(0,0,0,0.4); position:relative;">
    <button id="close-teacher-modal" style="position:absolute; top:1rem; right:1.5rem; background:none; border:none; font-size:1.8rem; cursor:pointer; color:var(--c-muted); transition: color 0.2s;">&times;</button>
    <div style="text-align: center; margin-bottom: 2rem;">
      <h2 class="display d3" style="font-size:1.8rem; margin:0;">Teacher Portal</h2>
      <p style="color:var(--c-muted); margin-top:0.4rem; font-size:0.9rem;">Post to the Homepage</p>
    </div>

    <!-- Login Section -->
    <div id="t-login-section">
      <div class="form-group" style="margin-bottom:1.5rem;">
        <label for="t-password" style="display:block; margin-bottom:0.6rem; font-weight:600; font-size:0.9rem;">Enter Master Password</label>
        <div style="position:relative; display:flex; align-items:center;">
          <input type="password" id="t-password" class="form-control" style="width:100%; padding:0.8rem; padding-right:60px; border:1px solid var(--c-border); border-radius:var(--radius-sm); font-size:1rem;" placeholder="••••••••" />
          <button id="t-toggle-pw" type="button" style="position:absolute; right:12px; background:none; border:none; cursor:pointer; color:var(--c-primary); font-size:0.85rem; font-weight:600;">SHOW</button>
        </div>
      </div>
      <button id="t-login-btn" class="btn btn-primary" style="width: 100%; padding: 0.8rem; font-size:1rem;">Access Portal</button>
    </div>

    <!-- Post Section -->
    <div id="t-post-section" style="display: none;">
      <div style="background: rgba(0, 155, 119, 0.1); padding: 0.8rem; border-radius: var(--radius-sm); margin-bottom: 1.5rem; color: #007a5e; font-size: 0.9rem; text-align:center;">
        Logged in as: <strong id="t-author-display"></strong>
      </div>
      <form id="t-post-form">
        <div class="form-group" style="margin-bottom:1rem;">
          <label for="t-ann-title" style="display:block; margin-bottom:0.4rem; font-weight:600; font-size:0.9rem;">Title</label>
          <input type="text" id="t-ann-title" class="form-control" style="width:100%; padding:0.7rem; border:1px solid var(--c-border); border-radius:var(--radius-sm);" required />
        </div>
        <div class="form-group" style="margin-bottom:1.5rem;">
          <label for="t-ann-content" style="display:block; margin-bottom:0.4rem; font-weight:600; font-size:0.9rem;">Message</label>
          <textarea id="t-ann-content" class="form-control" rows="4" style="width:100%; padding:0.7rem; border:1px solid var(--c-border); border-radius:var(--radius-sm);" required></textarea>
        </div>
        <button type="submit" id="t-submit-btn" class="btn btn-primary" style="width: 100%; padding:0.8rem; font-size:1rem;">Post Announcement</button>
      </form>
    </div>
  </div>
</div>
`;

document.body.insertAdjacentHTML('beforeend', modalHTML);

const modal = document.getElementById("teacher-modal-overlay");
const loginSec = document.getElementById("t-login-section");
const postSec = document.getElementById("t-post-section");

// ── Easter Egg Logic ──────────────────────────────
let typedStr = "";
window.addEventListener("keydown", (e) => {
  // Only register basic single letters to avoid errors
  if (e.key && e.key.length === 1) {
    typedStr += e.key.toLowerCase();
    if (typedStr.length > 7) {
      typedStr = typedStr.slice(typedStr.length - 7);
    }
    // If they finish typing "teacher"
    if (typedStr === "teacher") {
      modal.style.display = "flex";
      typedStr = ""; // reset for next time
      setTimeout(() => document.getElementById("t-password").focus(), 100);
    }
  }
});

// ── UI Interactions ────────────────────────────────
document.getElementById("close-teacher-modal").addEventListener("click", () => {
    modal.style.display = "none";
});

// Close when clicking outside the box
modal.addEventListener("click", (e) => {
  if (e.target === modal) modal.style.display = "none";
});

// Show/Hide password toggle function
const pwInput = document.getElementById("t-password");
document.getElementById("t-toggle-pw").addEventListener("click", (e) => {
  if (pwInput.type === "password") {
    pwInput.type = "text";
    e.target.textContent = "HIDE";
  } else {
    pwInput.type = "password";
    e.target.textContent = "SHOW";
  }
});

// ── Authentication ─────────────────────────────────
document.getElementById("t-login-btn").addEventListener("click", () => {
  const pw = pwInput.value;
  if (teacherPasswords[pw]) {
    currentAuthor = teacherPasswords[pw];
    loginSec.style.display = "none";
    postSec.style.display = "block";
    document.getElementById("t-author-display").textContent = currentAuthor;
  } else {
    alert("Incorrect password. Please verify and try again.");
    pwInput.value = "";
    pwInput.focus();
  }
});

pwInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") document.getElementById("t-login-btn").click();
});

// ── Post Logic ────────────────────────────────────
document.getElementById("t-post-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = document.getElementById("t-ann-title").value;
  const content = document.getElementById("t-ann-content").value;
  const btn = document.getElementById("t-submit-btn");
  
  if (!currentAuthor) return;
  btn.disabled = true;
  btn.textContent = "Posting to database...";

  try {
    await addDoc(collection(db, "announcements"), {
      title,
      content,
      author: currentAuthor,
      createdAt: serverTimestamp()
    });
    alert("Success! Your announcement is now live on the homepage.");
    document.getElementById("t-post-form").reset();
    modal.style.display = "none";
    
    // Automatically reload the page if they are on index so they see the announcement instantly
    if (window.location.pathname.includes("index.html") || window.location.pathname === "/") {
      window.location.reload();
    }
  } catch (error) {
    console.error("Firebase Error:", error);
    alert("Error posting announcement! Make sure Firestore Database is active.");
  } finally {
    btn.disabled = false;
    btn.textContent = "Post Announcement";
  }
});
