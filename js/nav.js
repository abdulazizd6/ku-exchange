/* ===================================================
   Shared Navigation & Footer — nav.js
   =================================================== */

(function () {
  /* ── Inject Nav ─────────────────────────────────── */
  const navHTML = `
  <nav id="nav">
    <div class="nav-inner">
      <a href="index.html" class="nav-logo" aria-label="Korea-Uzbekistan Exchange Program Home">
        <img src="assets/images/logo.jpg" alt="KOR-UZB School Exchange Program Logo" class="nav-logo-img" />
      </a>
      <ul class="nav-links" role="list">
        <li><a href="index.html" data-page="index" data-i18n="nav.home">Home</a></li>
        <li><a href="about.html" data-page="about" data-i18n="nav.about">About</a></li>
        <li><a href="activities.html" data-page="activities" data-i18n="nav.activities">Activities</a></li>
        <li><a href="trip.html" data-page="trip" data-i18n="nav.trip">Trip</a></li>
        <li><a href="alumni.html" data-page="alumni" data-i18n="nav.alumni">Alumni</a></li>
      </ul>
      <a href="apply.html" class="btn btn-primary nav-cta" data-i18n="nav.apply">Apply Now</a>
      <button class="nav-hamburger" id="hamburger" aria-label="Toggle menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </div>
  </nav>
  <div class="nav-drawer" id="navDrawer" role="navigation">
    <a href="index.html" data-page="index" data-i18n="nav.home">Home</a>
    <a href="about.html" data-page="about" data-i18n="nav.about">About</a>
    <a href="activities.html" data-page="activities" data-i18n="nav.activities">Activities</a>
    <a href="trip.html" data-page="trip" data-i18n="nav.trip">Trip</a>
    <a href="alumni.html" data-page="alumni" data-i18n="nav.alumni">Alumni</a>
    <a href="apply.html" class="btn btn-primary" style="text-align:center" data-i18n="nav.apply">Apply Now</a>
  </div>`;

  /* ── Inject Footer ──────────────────────────────── */
  const footerHTML = `
  <footer>
    <div class="container">
      <div class="footer-inner">
        <div class="footer-brand">
          <div class="nav-logo">
            <img src="assets/images/logo.jpg" alt="KOR-UZB School Exchange Program Logo" class="nav-logo-img" />
          </div>
          <p style="margin-top:0.75rem">A student exchange program building bridges between two cultures through letters, shared experiences, and travel.</p>
        </div>
        <nav class="footer-links" aria-label="Footer navigation">
          <a href="index.html">Home</a>
          <a href="about.html">About</a>
          <a href="activities.html">Activities</a>
          <a href="trip.html">Trip</a>
          <a href="alumni.html">Alumni</a>
          <a href="apply.html">Apply</a>
        </nav>
      </div>
      <div class="footer-bottom">
        <p>© 2026 Korea-Uzbekistan Exchange Program. All rights reserved.</p>
        <div class="lang-switcher" aria-label="Language selector">
          <button class="lang-btn active" data-lang="en" onclick="setLang('en')">EN</button>
          <button class="lang-btn" data-lang="uz" onclick="setLang('uz')">UZ</button>
          <button class="lang-btn" data-lang="ko" onclick="setLang('ko')">KO</button>
        </div>
      </div>
    </div>
  </footer>`;

  /* ── Mount ──────────────────────────────────────── */
  document.body.insertAdjacentHTML('afterbegin', navHTML);
  document.body.insertAdjacentHTML('beforeend', footerHTML);

  /* ── Scroll: nav background ─────────────────────── */
  const nav = document.getElementById('nav');
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── Active page link ───────────────────────────── */
  const page = location.pathname.split('/').pop().replace('.html', '') || 'index';
  document.querySelectorAll('[data-page]').forEach(a => {
    if (a.dataset.page === page) a.classList.add('active');
  });

  /* ── Hamburger ──────────────────────────────────── */
  const burger = document.getElementById('hamburger');
  const drawer = document.getElementById('navDrawer');
  burger.addEventListener('click', () => {
    const isOpen = drawer.classList.toggle('open');
    burger.classList.toggle('open', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  /* ── Close drawer on link click ─────────────────── */
  drawer.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      drawer.classList.remove('open');
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  /* ── Hero Ken-Burns ─────────────────────────────── */
  window.addEventListener('load', () => {
    document.querySelector('.hero')?.classList.add('loaded');
  });

  /* ── Scroll reveal ──────────────────────────────── */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // --- Auth State UI update ------------------------------
  function initAuthState() {
    const ctaBtn = document.querySelector('.nav-cta');

    // Try to use the auth module if it exists (only on pages that load it)
    import('./auth.js').then((authModule) => {
      authModule.onAuth((user) => {
        if (user) {
          ctaBtn.innerHTML = `
            <a href="dashboard.html" class="btn btn-primary" style="display:flex;align-items:center;gap:6px">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              Dashboard
            </a>
          `;
        } else {
          ctaBtn.innerHTML = `<a href="login.html" class="btn btn-primary" data-i18n="nav.apply">Log In</a>`;
        }
      });
    }).catch(() => {
      // If auth module isn't loaded (e.g. index.html hasn't imported it), just show Log In or Apply
      ctaBtn.innerHTML = `<a href="login.html" class="btn btn-primary" data-i18n="nav.apply">Log In</a>`;
    });
  }

  // --- Injection Logic ---------------------------------
  function injectLayout() {
    // 1. Inject Navigation
    const header = document.querySelector("header.page-header") || document.querySelector("section.hero");
    if (header) {
      header.insertAdjacentHTML('afterbegin', navHTML);
    } else {
      document.body.insertAdjacentHTML('afterbegin', navHTML);
    }

    if (document.getElementById("footer")) {
      document.getElementById("footer").innerHTML = footerHTML;
    }

    // Set active link properly
    setActiveLink();

    // Check auth state for CTA button
    initAuthState();

    // Initial lang setup for injected html
    if (typeof updateTranslations === "function") {
      updateTranslations();
    }
  }

  // Call the new injection logic instead of the old direct calls
  injectLayout();

})();
