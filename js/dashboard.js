import { auth, db, getUserRole, logOut } from "./auth.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { collection, query, where, getDocs, addDoc, serverTimestamp, getDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const loadingEl     = document.getElementById("loading");
const contentEl     = document.getElementById("dashboard-content");
const nameEl        = document.getElementById("user-name");
const emailEl       = document.getElementById("user-email");
const roleBadge     = document.getElementById("user-role-badge");
const adminBanner   = document.getElementById("admin-banner");
const statusBadge   = document.getElementById("app-status-badge");
const statusText    = document.getElementById("app-status-text");
const actionBtnEl   = document.getElementById("app-action-btn");
const logoutBtn     = document.getElementById("btn-logout");

const storyForm     = document.getElementById("story-form");
const storyText     = document.getElementById("story-text");
const storyMsg      = document.getElementById("story-msg");
const btnSubmitStry = document.getElementById("btn-submit-story");

// Auth Listener
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  // Populate basic info
  nameEl.textContent  = user.displayName || "Student";
  emailEl.textContent = user.email;

  // Check Role
  const role = await getUserRole(user.uid);
  if (role === "admin" || role === "teacher") {
    roleBadge.textContent = "Teacher / Admin";
    adminBanner.style.display = "flex";
  } else {
    roleBadge.textContent = "Student";
  }

  // Fetch Application Status
  await checkApplicationStatus(user.uid);

  // Show UI
  loadingEl.style.display = "none";
  contentEl.style.display = "flex";
});

// Fetch Application
async function checkApplicationStatus(uid) {
  try {
    const q = query(collection(db, "applications"), where("userId", "==", uid));
    const snap = await getDocs(q);

    if (snap.empty) {
      statusBadge.textContent = "Not Started";
      statusBadge.style.color = "var(--c-muted)";
      statusText.textContent  = "You haven't submitted an application yet. Head over to the Apply page to get started.";
      actionBtnEl.innerHTML   = `<a href="apply.html" class="btn btn-outline">Start Application</a>`;
      return;
    }

    // Has application
    const appData = snap.docs[0].data();
    const status  = appData.status || "pending"; // pending, accepted, rejected

    if (status === "pending") {
      statusBadge.textContent    = "Under Review";
      statusBadge.style.color    = "#f29900"; // yellow
      statusBadge.style.borderColor = "#fce8b2";
      statusText.textContent     = "Your application has been received and is currently being reviewed by the head teachers. We will notify you once a decision is made.";
      actionBtnEl.innerHTML      = `<button disabled class="btn btn-outline" style="opacity:0.5;cursor:not-allowed">Application Submitted</button>`;
    } else if (status === "accepted") {
      statusBadge.textContent    = "Accepted 🎉";
      statusBadge.style.color    = "#188038"; // green
      statusBadge.style.borderColor = "#ceead6";
      statusText.innerHTML       = "<strong>Congratulations!</strong> You have been accepted into the exchange program cohort. Please check your email for the next steps and packing list.";
      actionBtnEl.innerHTML      = `<button class="btn btn-primary" onclick="alert('Program materials coming soon!')">View Program Guide</button>`;
    } else if (status === "rejected") {
      statusBadge.textContent    = "Not Selected";
      statusBadge.style.color    = "#d93025"; // red
      statusBadge.style.borderColor = "#fad2cf";
      statusText.textContent     = "Thank you for applying. Unfortunately, we could not offer you a spot in this year's cohort. We encourage you to try again next year!";
      actionBtnEl.innerHTML      = "";
    }
  } catch (e) {
    console.error("Error fetching application:", e);
    statusText.textContent = "Could not load application status. Try refreshing the page.";
  }
}

// Story Submission
storyForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  btnSubmitStry.disabled = true;
  btnSubmitStry.textContent = "Submitting...";
  storyMsg.style.display = "none";

  try {
    const user = auth.currentUser;
    // Get full user profile to attach name/school to story easily
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const profile = userDoc.data() || {};

    await addDoc(collection(db, "stories"), {
      userId: user.uid,
      authorName: profile.displayName || user.displayName || user.email,
      authorSchool: profile.school || "Exchange Student",
      text: storyText.value.trim(),
      status: "pending", // must be approved by admin
      createdAt: serverTimestamp()
    });

    storyForm.reset();
    storyMsg.textContent = "Story submitted successfully! It is pending teacher approval.";
    storyMsg.style.color = "#188038";
    storyMsg.style.display = "block";
  } catch (err) {
    console.error(err);
    storyMsg.textContent = "Error submitting story. Maybe Firebase rules blocked it? " + err.message;
    storyMsg.style.color = "#d93025";
    storyMsg.style.display = "block";
  } finally {
    btnSubmitStry.disabled = false;
    btnSubmitStry.textContent = "Submit Story";
  }
});

// Logout
logoutBtn.addEventListener("click", logOut);
