import { auth, db, getUserRole, logOut } from "./auth.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { collection, query, getDocs, updateDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const loadingEl     = document.getElementById("loading");
const contentEl     = document.getElementById("admin-content");
const studentList   = document.getElementById("student-list");
const storyList     = document.getElementById("story-list");

// --- Tabs Logic ---
document.querySelectorAll(".admin-tab").forEach(tab => {
  tab.addEventListener("click", () => {
    // Reset active
    document.querySelectorAll(".admin-tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".tab-pane").forEach(p => p.style.display = "none");
    
    // Set active
    tab.classList.add("active");
    document.getElementById(`tab-${tab.dataset.tab}`).style.display = "block";
  });
});

// --- Auth Guard ---
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  const role = await getUserRole(user.uid);
  if (role !== "admin" && role !== "teacher") {
    // Kick them out to student dashboard if they try to be sneaky
    window.location.href = "dashboard.html";
    return;
  }

  // Load Data
  await loadStudentsAndApps();
  await loadPendingStories();

  loadingEl.style.display = "none";
  contentEl.style.display = "flex";
});

// --- Load Students & Applications ---
async function loadStudentsAndApps() {
  studentList.innerHTML = "<tr><td colspan='4'>Loading students...</td></tr>";
  
  try {
    // 1. Get all students
    const usersSnap = await getDocs(query(collection(db, "users")));
    // 2. Get all applications to map them
    const appsSnap = await getDocs(query(collection(db, "applications")));
    
    const appsMap = {};
    appsSnap.forEach(snap => {
      const data = snap.data();
      appsMap[data.userId] = { id: snap.id, ...data };
    });

    let html = "";
    usersSnap.forEach(snap => {
      const user = snap.data();
      if (user.role === "admin" || user.role === "teacher") return; // Skip other admins
      
      const app = appsMap[user.uid];
      const status = app ? (app.status || "pending") : "Not Started";
      const statusClass = status === "pending" ? "badge-pending" : status === "accepted" ? "badge-accepted" : status === "rejected" ? "badge-rejected" : "";

      html += `
        <tr>
          <td>
            <strong>${user.displayName || "Unknown User"}</strong>
            <br><span style="font-size:0.8rem;color:var(--c-muted)">${user.email}</span>
          </td>
          <td style="color:var(--c-muted)">${user.school || "—"}</td>
          <td>
            <span class="badge ${statusClass}">${status}</span>
          </td>
          <td>
            ${app && status === "pending" ? `
              <button class="btn btn-outline" style="padding:4px 8px;font-size:0.75rem;border-color:#188038;color:#188038" onclick="window.updateAppStatus('${app.id}', 'accepted')">Accept</button>
              <button class="btn btn-outline" style="padding:4px 8px;font-size:0.75rem;border-color:#d93025;color:#d93025;margin-left:4px" onclick="window.updateAppStatus('${app.id}', 'rejected')">Reject</button>
            ` : app ? `
              <span style="font-size:0.8rem;color:var(--c-muted)">Resolved</span>
            ` : `<span style="font-size:0.8rem;color:var(--c-muted)">No action yet.</span>`}
          </td>
        </tr>
      `;
    });

    studentList.innerHTML = html || "<tr><td colspan='4'>No students registered yet.</td></tr>";

  } catch (err) {
    console.error(err);
    studentList.innerHTML = `<tr><td colspan='4' style="color:#d93025">Error loading data: ${err.message}</td></tr>`;
  }
}

// --- Load Stories ---
async function loadPendingStories() {
  storyList.innerHTML = "<tr><td colspan='4'>Loading stories...</td></tr>";
  try {
    const storiesSnap = await getDocs(query(collection(db, "stories")));
    
    let html = "";
    storiesSnap.forEach(snap => {
      const story = snap.data();
      const status = story.status || "pending";
      const statusClass = status === "pending" ? "badge-pending" : status === "accepted" ? "badge-accepted" : "badge-rejected";

      html += `
        <tr>
          <td>
            <strong>${story.authorName || "Unknown"}</strong>
            <br><span style="font-size:0.8rem;color:var(--c-muted)">${story.authorSchool || "—"}</span>
          </td>
          <td>
            <div style="max-height:60px;overflow-y:auto;font-size:0.85rem;color:var(--c-muted);font-style:italic">"${story.text}"</div>
          </td>
          <td><span class="badge ${statusClass}">${status}</span></td>
          <td>
            ${status === "pending" ? `
               <button class="btn btn-outline" style="padding:4px 8px;font-size:0.75rem;border-color:#188038;color:#188038" onclick="window.updateStoryStatus('${snap.id}', 'accepted')">Approve</button>
               <button class="btn btn-outline" style="padding:4px 8px;font-size:0.75rem;border-color:#d93025;color:#d93025;margin-left:4px" onclick="window.updateStoryStatus('${snap.id}', 'rejected')">Reject</button>
            ` : `<span style="font-size:0.8rem;color:var(--c-muted)">Resolved</span>`}
          </td>
        </tr>
      `;
    });
    storyList.innerHTML = html || "<tr><td colspan='4'>No stories submitted yet.</td></tr>";
  } catch (err) {
    console.error(err);
    storyList.innerHTML = `<tr><td colspan='4' style="color:#d93025">Error loading stories: ${err.message}</td></tr>`;
  }
}

// --- Global Action Handlers ---
// Attached to window so inline onclicks in the HTML string can see them
window.updateAppStatus = async (appId, newStatus) => {
  if (!confirm(`Are you sure you want to mark this application as ${newStatus}?`)) return;
  try {
    await updateDoc(doc(db, "applications", appId), { status: newStatus });
    loadStudentsAndApps(); // Refresh table
  } catch (err) {
    alert("Error updating: " + err.message);
  }
};

window.updateStoryStatus = async (storyId, newStatus) => {
  if (!confirm(`Are you sure you want to mark this story as ${newStatus}?`)) return;
  try {
    await updateDoc(doc(db, "stories", storyId), { status: newStatus });
    loadPendingStories(); // Refresh table
  } catch (err) {
    alert("Error updating: " + err.message);
  }
};
