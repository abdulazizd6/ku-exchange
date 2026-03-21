import { db } from "./firebase-config.js";
import { collection, query, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

async function loadAnnouncements() {
  const container = document.getElementById("announcements-container");
  if (!container) return;

  try {
    const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"), limit(5));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      container.innerHTML = "<p style='color:var(--c-muted);'>No announcements currently.</p>";
      return;
    }

    let html = "";
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const date = data.createdAt ? data.createdAt.toDate().toLocaleDateString() : "Just now";
      html += `
        <div class="card" style="padding: 1.5rem; text-align: left;">
          <div style="font-size: 0.8rem; color: var(--c-muted); margin-bottom: 0.5rem; font-weight: 500; letter-spacing: 0.05em;">
            ${date} &nbsp;·&nbsp; Posted by ${data.author}
          </div>
          <h3 style="margin-bottom: 0.75rem; font-size: 1.3rem;">${data.title}</h3>
          <p style="color: var(--c-text); line-height: 1.6;">${data.content}</p>
        </div>
      `;
    });
    
    // Simple fade in effect
    container.style.opacity = 0;
    container.innerHTML = html;
    setTimeout(() => {
      container.style.transition = "opacity 0.4s ease";
      container.style.opacity = 1;
    }, 50);
    
  } catch (error) {
    console.error("Error loading announcements", error);
    container.innerHTML = "<p style='color:var(--c-muted);'>Failed to load announcements.</p>";
  }
}

window.addEventListener("DOMContentLoaded", loadAnnouncements);
