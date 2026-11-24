<div align="center">

# Rea-Lyn Macompas — Portfolio Website

Personal portfolio site for a BS Information Technology graduate and IT intern.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white)

</div>

---

Single-page site: hero/about, a projects grid, testimonials, and a contact section, with a light/dark theme toggle. No framework, no build step — plain HTML, CSS, and JavaScript.

## Built with

- HTML5, CSS3 (custom properties for theming, CSS Grid/Flexbox layout)
- Vanilla JavaScript (no framework or build step)
- Google Fonts: Fraunces (headings), Manrope (body), Dancing Script (accent)
- Deployed on Vercel

## Files

| File | Purpose |
|---|---|
| `index.html` | markup |
| `home.css` | styles, including the light/dark theme tokens |
| `home.js` | nav/scroll behavior, theme toggle, testimonials, contact form |
| `images/` | site images |

---

## Projects shown on the site

These are the three projects featured in the Works section, with the accurate tech and scope for each — useful as source material when writing resume bullets, so the stack/claims below match what's actually built and deployed.

### Elim Christian Academy Website

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=flat&logo=mysql&logoColor=white)

The official website for a real school: news and events, a school calendar, photo albums, and a staff admin panel with Google sign-in.

- **Context:** built for a real client school (Elim Christian Academy, Inc.), done alongside internship work
- **Code:** [ECA-School-Website](https://github.com/realynmacompas/ECA-School-Website)
- **Live:** [eca-school-website.vercel.app](https://eca-school-website.vercel.app)

### CookingIna Recipe Website

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

A responsive recipe website for traditional Filipino dishes: a browsable menu across five categories with ingredients and steps for 25 recipes, plus pages on Filipino food history and regional cuisine.

- **Stack:** static site, no backend
- **Context:** academic group project (note this when describing it — it wasn't built solo)
- **Code:** [cookingina-recipe-website](https://github.com/realynmacompas/cookingina-recipe-website)
- **Live:** [cookingina-recipe-website.vercel.app](https://cookingina-recipe-website.vercel.app)

### Looc Integrated School LMS

![ASP.NET Core](https://img.shields.io/badge/ASP.NET%20Core-512BD4?style=flat&logo=dotnet&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=flat&logo=mysql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)

A learning management system for a real school (DepEd Looc Integrated School), with separate student and teacher portals: courses, assignments, a gradebook and report card, and a shared calendar.

- **Architecture:** monorepo (`frontend/` + `backend/`); frontend deployed on Vercel, backend deployed on Render as a Docker container (Render has no native .NET runtime, so the API ships with its own Dockerfile)
- **Auth:** Google Sign-In, with the ID token verified server-side (`Google.Apis.Auth`) against existing student/teacher records rather than auto-creating accounts
- **Database:** MySQL, hosted on Aiven
- **Context:** built during the IT internship at Ace Outsourcing Solutions
- **Code:** [looc-lms](https://github.com/realynmacompas/looc-lms)
- **Live:** [looc-lms.vercel.app](https://looc-lms.vercel.app) (backend API: [looc-lms.onrender.com](https://looc-lms.onrender.com) — free tier, so the first request after a period of inactivity can take 30–60 seconds while it spins back up)

---

## Internship context

The LMS and the ECA website were both done during an IT internship at Ace Outsourcing Solutions (Sta. Rosa, Laguna), alongside general IT support work (workstation setup, networking, system assembly) and contributions to the company's internal ACE Business System and the A&A Peanuts e-commerce site.
