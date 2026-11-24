# Rea-Lyn Macompas — Portfolio Website

Personal portfolio site for Rea-Lyn Macompas, a 4th-year BS Information Technology student and IT intern. Single-page site built with plain HTML, CSS, and JavaScript (no framework) — hero/about, a projects grid, testimonials, and a contact section, with a light/dark theme toggle.

## Built with

- HTML5, CSS3 (custom properties for theming, CSS Grid/Flexbox layout)
- Vanilla JavaScript (no framework or build step)
- Google Fonts: Fraunces (headings), Manrope (body), Dancing Script (accent)
- Deployed on Vercel

## Files

- `home.html` — markup
- `home.css` — styles, including the light/dark theme tokens
- `home.js` — nav/scroll behavior, theme toggle, testimonials, contact form
- `images/` — site images

## Projects shown on the site

These are the three projects featured in the Works section, with the accurate tech and scope for each — useful as source material when writing resume bullets, so the stack/claims below match what's actually built and deployed.

### Elim Christian Academy Website

The official website for a real school: news and events, a school calendar, photo albums, and a staff admin panel with Google sign-in.

- **Stack:** HTML, CSS, JavaScript (frontend) · Node.js, MySQL (backend) · Google Sign-In
- **Context:** built for a real client school (Elim Christian Academy, Inc.), done alongside internship work
- **Code:** https://github.com/realynmacompas/ECA-School-Website
- **Live:** https://eca-school-website.vercel.app

### CookingIna Recipe Website

A responsive recipe website for traditional Filipino dishes: a browsable menu across five categories with ingredients and steps for 25 recipes, plus pages on Filipino food history and regional cuisine.

- **Stack:** HTML, CSS, JavaScript — static site, no backend
- **Context:** academic group project (note this when describing it — it wasn't built solo)
- **Code:** https://github.com/realynmacompas/cookingina-recipe-website
- **Live:** https://cookingina-recipe-website.vercel.app

### Looc Integrated School LMS

A learning management system for a real school (DepEd Looc Integrated School), with separate student and teacher portals: courses, assignments, a gradebook and report card, and a shared calendar.

- **Stack:** ASP.NET Core Web API backend, vanilla HTML/CSS/JS frontend, MySQL database (hosted on Aiven)
- **Architecture:** monorepo (`frontend/` + `backend/`); frontend deployed on Vercel, backend deployed on Render as a Docker container (Render has no native .NET runtime, so the API ships with its own Dockerfile)
- **Auth:** Google Sign-In, with the ID token verified server-side (`Google.Apis.Auth`) against existing student/teacher records rather than auto-creating accounts
- **Context:** built during the IT internship at Ace Outsourcing Solutions
- **Code:** https://github.com/realynmacompas/looc-lms
- **Live:** https://looc-lms.vercel.app (backend API: https://looc-lms.onrender.com — free tier, so the first request after a period of inactivity can take 30–60 seconds while it spins back up)

## Internship context

The LMS and the ECA website were both done during an IT internship at Ace Outsourcing Solutions (Sta. Rosa, Laguna), alongside general IT support work (workstation setup, networking, system assembly) and contributions to the company's internal ACE Business System and the A&A Peanuts e-commerce site.
