# Korea-Uzbekistan Exchange Program Website

A 6-page editorial-style website built with vanilla HTML, CSS, and JavaScript. Bold typography, generous whitespace, and a modern feel. Designed for eventual multi-language support (EN / UZ / KO).

## Proposed Changes

### Project Structure

```
korea-uzbekistan exchange program/
├── index.html           ← Home
├── about.html
├── activities.html
├── trip.html
├── alumni.html
├── apply.html
├── css/
│   └── style.css        ← Global design system + page styles
├── js/
│   ├── nav.js           ← Shared nav inject + mobile menu
│   └── i18n.js          ← Language switcher skeleton (EN/UZ/KO)
└── assets/
    └── images/          ← AI-generated hero + section images
```

---

### Pages

#### [NEW] index.html — Home
- Full-screen hero: "Two Cultures. One Bridge." with subtitle and CTA
- Stats bar: 2 Schools · 2 Countries · 3 Languages
- Activity preview cards (3 cards: Letters, Cultural Boxes, Group Activities)
- Dark teaser block at bottom linking to the Trip page

#### [NEW] about.html — About
- Mission statement section
- Two school profile cards (Korea school, Uzbekistan school)
- Timeline or visual of how the program works

#### [NEW] activities.html — Activities
- Three feature sections: Letters, Cultural Boxes, Group Activities
- Each with description, sample photos, and student quotes

#### [NEW] trip.html — Trip
- Photo-forward grid layout
- Trip highlights with captions
- Countdown or dates section

#### [NEW] alumni.html — Alumni
- Testimonial cards with student names, year, and story snippet
- Photo grid of past participants

#### [NEW] apply.html — Apply
- Eligibility info box
- Contact/application form (name, school, grade, message, email)

---

### Shared Components

#### [NEW] css/style.css
- CSS custom properties (colors, fonts, spacing)
- Typography: display font (`Bebas Neue` or `Clash Display`) + body (`Inter`)
- Nav: logo left, links center, "Apply Now" CTA right
- Footer with language switcher buttons
- Utility classes, card styles, section layouts

#### [NEW] js/nav.js
- Injects shared `<nav>` and `<footer>` HTML into every page
- Mobile hamburger menu toggle

#### [NEW] js/i18n.js
- Language switcher skeleton: stores `data-i18n` keys
- Loads EN by default; UZ and KO strings to be filled

---

## Verification Plan

### Manual Verification (Browser)
1. Open `index.html` in Chrome/Edge (double-click or use Live Server)
2. Verify hero displays large bold text and CTA button
3. Click every nav link — confirm it routes to the correct page
4. Check all 6 pages render without broken images or layout issues
5. Resize window to mobile width (~375px) — nav should collapse to hamburger
6. Click "Apply Now" — should navigate to `apply.html`
7. Submit contact form (client-side validation only)
