/* =============================================================
   PORTFOLIO SITE — INTERACTIVITY
   Organized into small, independent features. Each one only
   runs if its DOM elements exist, so this file stays safe to
   reuse even if a section is removed later.
============================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* -----------------------------------------------------------
     1. MOBILE NAV TOGGLE
     Clicking the hamburger button opens/closes the nav links
     panel and morphs the icon into an X (handled in CSS via
     the .is-active / .is-open classes).
  ----------------------------------------------------------- */
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('is-open');
      navToggle.classList.toggle('is-active', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close the mobile menu automatically after a link is tapped,
    // so users aren't stuck looking at an open menu after navigating.
    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('is-open');
        navToggle.classList.remove('is-active');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* -----------------------------------------------------------
     1b. THEME TOGGLE (dark / light)
     The site defaults to dark (see :root in home.css). Clicking the
     switch adds/removes data-theme="light" on <html>, which is all the
     CSS needs — the color tokens and the two RGB tints in :root flip
     to their light-mode values automatically, and .site-bg/.dust-canvas
     fade out since the animated fog is designed around the dark
     palette. The choice is remembered in localStorage so it sticks on
     the next visit (a tiny inline script in <head> already applies it
     before first paint, so there's no flash of the wrong theme).
  ----------------------------------------------------------- */
  const themeToggle = document.getElementById('themeToggle');
  const root = document.documentElement;

  const applyThemeLabel = (isLight) => {
    if (!themeToggle) return;
    themeToggle.setAttribute('aria-pressed', String(isLight));
    themeToggle.setAttribute('aria-label', isLight ? 'Switch to dark theme' : 'Switch to light theme');
  };

  if (themeToggle) {
    applyThemeLabel(root.getAttribute('data-theme') === 'light');

    themeToggle.addEventListener('click', () => {
      const isLight = root.getAttribute('data-theme') === 'light';
      if (isLight) {
        root.removeAttribute('data-theme');
      } else {
        root.setAttribute('data-theme', 'light');
      }
      applyThemeLabel(!isLight);
      try {
        localStorage.setItem('theme', isLight ? 'dark' : 'light');
      } catch (e) {
        /* Private browsing / storage disabled — theme still applies for
           this page view, it just won't be remembered next visit. */
      }
    });
  }

  /* -----------------------------------------------------------
     2. ADD-A-REVIEW
     Toggles a small form open/closed. On submit, the review is POSTed
     to a Google Apps Script Web App (same pattern as the contact form
     below), which appends it to a "Reviews" Google Sheet as PENDING.
     It is NOT added to the page here — see REVIEWS_SETUP.md for how
     to create that sheet/script. Nothing shows publicly until you flip
     its "Approved" column to TRUE in the sheet; section 3b below then
     picks it up the next time anyone loads the page.
  ----------------------------------------------------------- */
  const addReviewBtn = document.getElementById('addReviewBtn');
  const reviewForm = document.getElementById('reviewForm');
  const reviewsGrid = document.getElementById('reviewsGrid');
  const reviewStatus = document.getElementById('reviewStatus');

  // Paste the URL you get from deploying REVIEWS_SETUP.md's Apps Script
  // as a Web App. Left as a placeholder, submissions just fail quietly
  // (caught below) instead of breaking the page.
  const REVIEWS_WEBHOOK_URL = 'PASTE_YOUR_REVIEWS_APPS_SCRIPT_URL_HERE';

  if (addReviewBtn && reviewForm && reviewsGrid) {
    addReviewBtn.addEventListener('click', () => {
      const isHidden = reviewForm.hasAttribute('hidden');
      if (isHidden) {
        reviewForm.removeAttribute('hidden');
      } else {
        reviewForm.setAttribute('hidden', '');
      }
      addReviewBtn.setAttribute('aria-expanded', String(isHidden));
    });

    reviewForm.addEventListener('submit', async (event) => {
      event.preventDefault(); // stop the default page reload

      const emailInput = document.getElementById('reviewEmail');

      // Same extra email check as the contact form — catches malformed
      // addresses and known disposable/fake-email domains on top of
      // the browser's own type="email" validation.
      emailInput.setCustomValidity('');
      const emailProblem = getEmailProblem(emailInput.value);
      if (emailProblem) emailInput.setCustomValidity(emailProblem);

      if (!reviewForm.reportValidity()) return;

      const nameInput = document.getElementById('reviewName');
      const roleInput = document.getElementById('reviewRole');
      const topicSelect = document.getElementById('reviewTopic');
      const textInput = document.getElementById('reviewText');
      const ratingInput = reviewForm.querySelector('input[name="rating"]:checked');
      const name = nameInput.value.trim();
      const role = roleInput.value.trim(); // optional — position / company
      const email = emailInput.value.trim();
      const topic = topicSelect.value;
      const text = textInput.value.trim();
      if (!name || !email || !topic || !text) return; // basic guard, inputs are also required in HTML

      if (!ratingInput) {
        if (reviewStatus) {
          reviewStatus.textContent = 'Please choose a star rating.';
          void reviewStatus.offsetWidth;
          reviewStatus.classList.add('is-shown');
        }
        return;
      }
      const rating = Number(ratingInput.value);

      const submitBtn = reviewForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.textContent;

      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
      if (reviewStatus) {
        reviewStatus.textContent = '';
        reviewStatus.classList.remove('is-shown');
      }

      try {
        // mode: 'no-cors' — same reason as the contact form: Apps Script
        // doesn't send CORS headers, so we can't read the response and
        // just treat a resolved fetch as success.
        await fetch(REVIEWS_WEBHOOK_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ name, role, email, topic, text, rating })
        });

        reviewForm.reset();
        reviewForm.setAttribute('hidden', '');
        addReviewBtn.setAttribute('aria-expanded', 'false');

        if (reviewStatus) {
          reviewStatus.textContent = `Thanks, ${name}! Your review has been submitted and will appear here once it's approved.`;
          void reviewStatus.offsetWidth; // retrigger the pop-in animation
          reviewStatus.classList.add('is-shown');
        }
      } catch (error) {
        if (reviewStatus) {
          reviewStatus.textContent = 'Something went wrong. Please try again in a moment.';
          void reviewStatus.offsetWidth;
          reviewStatus.classList.add('is-shown');
        }
        console.error('Review submission error:', error);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
      }
    });
  }

  /* -----------------------------------------------------------
     2b. LOAD APPROVED REVIEWS
     Fetches the reviews you've approved in the Google Sheet and
     appends them after the three sample cards above. Uses JSONP
     (a <script> tag, not fetch) because Apps Script Web Apps don't
     send CORS headers on GET either — JSONP sidesteps that instead
     of needing a proxy. If REVIEWS_WEBHOOK_URL is still the
     placeholder, or the request fails for any reason, this just
     quietly does nothing and the static reviews still show fine.
  ----------------------------------------------------------- */
  if (reviewsGrid && REVIEWS_WEBHOOK_URL && !REVIEWS_WEBHOOK_URL.startsWith('PASTE_')) {
    const callbackName = `onReviewsLoaded_${Date.now()}`;

    window[callbackName] = (reviews) => {
      if (Array.isArray(reviews)) {
        reviews.forEach((review) => {
          if (!review || !review.name || !review.text) return;
          const card = document.createElement('blockquote');
          card.className = 'review-card';

          // Rating is optional — older approved rows from before the
          // Rating column existed won't have one, so the star row is
          // just left out rather than showing a fake/empty rating.
          const rating = Number(review.rating);
          const starsHtml = (rating >= 1 && rating <= 5)
            ? buildStarRating(rating)
            : '';
          const dateHtml = review.timestamp
            ? `<span class="review-card__date">${escapeHtml(formatReviewDate(review.timestamp))}</span>`
            : '<span class="review-card__date"></span>';

          // Role (position/company) and topic are both optional, same
          // reason as rating — older approved rows, or someone who just
          // left the role field blank, won't have one. Mirrors how the
          // three hard-coded sample reviews already read: "Name, Role".
          const namePart = review.role
            ? `${String(review.name)}, ${String(review.role)}`
            : String(review.name);
          const citeText = review.topic
            ? `${namePart} — ${String(review.topic)}`
            : namePart;

          card.innerHTML = `
            <div class="review-card__meta">
              ${dateHtml}
              ${starsHtml}
            </div>
            <p>${escapeHtml(String(review.text))}</p>
            <cite>${escapeHtml(citeText)}</cite>
          `;
          reviewsGrid.appendChild(card);
        });
      }
      delete window[callbackName];
      script.remove();
    };

    const script = document.createElement('script');
    script.src = `${REVIEWS_WEBHOOK_URL}?callback=${callbackName}`;
    script.onerror = () => {
      delete window[callbackName];
      script.remove();
    };
    document.body.appendChild(script);
  }
  /* -----------------------------------------------------------
     3. CONTACT FORM
     Sends name / email / message to a Google Apps Script Web App,
     which appends each submission as a new row in a Google Sheet.
     Uses mode: 'no-cors' because Apps Script doesn't return CORS
     headers — meaning we can't read the response, so a resolved
     fetch is treated as success.
  ----------------------------------------------------------- */
  const contactForm = document.getElementById('contactForm');
  const contactStatus = document.getElementById('contactStatus');

  // Your deployed Apps Script Web App URL
  const SHEET_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbxzTdfdoBGFHNSMmqmOpnAcbmptmlCqLrHnUj50QpbHKm-ouM-9jIxGVTnli813GXnZLQ/exec';

  if (contactForm && contactStatus) {
    contactForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      // Extra email check on top of the browser's own type="email"
      // validation — catches malformed addresses and known
      // disposable/fake-email domains. Clear any previous custom
      // error first, or a fixed email would still show the old one.
      const emailField = document.getElementById('cEmail');
      emailField.setCustomValidity('');
      const emailProblem = getEmailProblem(emailField.value);
      if (emailProblem) emailField.setCustomValidity(emailProblem);

      // Native HTML5 validation (required fields, email format, and
      // the custom check above) runs here; reportValidity() surfaces
      // any errors and stops here if invalid.
      if (!contactForm.reportValidity()) return;

      const name = document.getElementById('cName').value.trim();
      const email = emailField.value.trim();
      const message = document.getElementById('cMessage').value.trim();

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.textContent;

      // Show a "sending" state so the user knows something is happening
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
      contactStatus.textContent = '';
      contactStatus.classList.remove('is-shown');

      try {
        await fetch(SHEET_WEBHOOK_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ name, email, message })
        });

        // With no-cors we can't read the response, so we assume success
        contactStatus.textContent = `Thanks, ${name || 'friend'}! Your message has been sent — I'll get back to you soon.`;
        void contactStatus.offsetWidth; // retrigger the pop-in animation
        contactStatus.classList.add('is-shown');

        contactForm.reset();
      } catch (error) {
        contactStatus.textContent = 'Something went wrong. Please try again or email me directly.';
        void contactStatus.offsetWidth;
        contactStatus.classList.add('is-shown');
        console.error('Contact form error:', error);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
      }
    });
  }
  
  /* -----------------------------------------------------------
     4. FOOTER YEAR
     Keeps the copyright year current without manual edits.
  ----------------------------------------------------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* -----------------------------------------------------------
     5. SCROLL-DRIVEN UI (consolidated)
     Several small pieces of UI all react to scroll position:
     the nav's drop shadow, the chatbot toggle button's visibility,
     the top progress bar's width, and which nav link is
     highlighted as "current" (scrollspy). Rather than attach
     four separate scroll listeners, they're combined into one
     and throttled with requestAnimationFrame so the browser
     never does more layout work per frame than it needs to.
  ----------------------------------------------------------- */
  const nav = document.getElementById('nav');
  const chatbotToggle = document.getElementById('chatbotToggle');
  const progressBar = document.getElementById('progressBar');
  const sideDock = document.getElementById('sideDock');

  // Sections that have a matching nav link, for the scrollspy below.
  const spySections = ['works', 'reviews', 'contact']
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  // Both the top nav links and the side dock icons get highlighted
  // together, so they always agree on which section is "current".
  const spyLinks = [
    ...(navLinks ? Array.from(navLinks.querySelectorAll('.nav__link')) : []),
    ...(sideDock ? Array.from(sideDock.querySelectorAll('.side-dock__link')) : []),
  ];

  let ticking = false;

  const updateOnScroll = () => {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;

    // Nav shadow once scrolled past the very top
    if (nav) {
      nav.style.boxShadow = scrollY > 40
        ? '0 4px 16px rgba(61, 38, 71, 0.08)'
        : 'none';
    }

    // Chat toggle button fades in after scrolling down a bit
    if (chatbotToggle) {
      chatbotToggle.classList.toggle('is-visible', scrollY > 500);
    }

    // Progress bar width as a percentage of total scrollable height
    if (progressBar && docHeight > 0) {
      progressBar.style.width = `${Math.min(100, (scrollY / docHeight) * 100)}%`;
    }

    // Scrollspy: find whichever section's top has crossed roughly the
    // upper third of the viewport, and highlight its matching nav link.
    if (spySections.length && spyLinks.length) {
      let currentId = null;
      for (const section of spySections) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.35) {
          currentId = section.id;
        }
      }
      spyLinks.forEach((link) => {
        link.classList.toggle('is-current', currentId !== null && link.getAttribute('href') === `#${currentId}`);
      });
    }

    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateOnScroll);
      ticking = true;
    }
  }, { passive: true });

  // Run once on load in case the page is opened already scrolled
  // (e.g. returning via browser back/forward with scroll restored).
  updateOnScroll();

  /* -----------------------------------------------------------
     5b. CHATBOT (keyword FAQ, not AI)
     A fixed toggle button opens a small panel with topic buttons
     (Availability, Degree, Skills, Projects, Contact). Clicking a
     topic appends a "you asked" bubble and a canned answer bubble
     from CHATBOT_TOPICS below — plain lookup table, no external API
     or generated text, appropriate for a static portfolio site.
  ----------------------------------------------------------- */
  const chatbotPanel = document.getElementById('chatbotPanel');
  const chatbotClose = document.getElementById('chatbotClose');
  const chatbotMessages = document.getElementById('chatbotMessages');
  const chatbotTopics = document.getElementById('chatbotTopics');

  const CHATBOT_TOPICS = {
    availability: {
      label: 'Availability',
      answer: "Rea-Lyn is currently available for full-time, part-time, and freelance work.",
    },
    degree: {
      label: 'Degree',
      answer: "Rea-Lyn is a 4th-year BS Information Technology student.",
    },
    skills: {
      label: 'Skills',
      answer: "Rea-Lyn works with HTML5, CSS3, JavaScript, PHP, Bootstrap, MySQL, Git & GitHub, Figma, VS Code, and XAMPP — see the Skills & Expertise section for the full list.",
    },
    projects: {
      label: 'Projects',
      answer: "Rea-Lyn has built the Elim Christian Academy Website (a full-stack school site with a Node.js/MySQL backend), the CookingIna Recipe Website, and the Looc Integrated School LMS (an ASP.NET Core/MySQL system with student and teacher portals) — all three are in the Works section above.",
    },
    contact: {
      label: 'Contact',
      answer: "You can reach Rea-Lyn through the Contact section below, or the email/phone/LinkedIn icons under the hero at the top of the page.",
    },
  };

  const openChatbot = () => {
    if (!chatbotPanel || !chatbotToggle) return;
    chatbotPanel.hidden = false;
    chatbotToggle.setAttribute('aria-expanded', 'true');
  };

  const closeChatbot = () => {
    if (!chatbotPanel || !chatbotToggle) return;
    chatbotPanel.hidden = true;
    chatbotToggle.setAttribute('aria-expanded', 'false');
  };

  if (chatbotToggle && chatbotPanel) {
    chatbotToggle.addEventListener('click', () => {
      if (chatbotPanel.hidden) {
        openChatbot();
      } else {
        closeChatbot();
      }
    });
  }

  if (chatbotClose) {
    chatbotClose.addEventListener('click', closeChatbot);
  }

  if (chatbotTopics && chatbotMessages) {
    chatbotTopics.querySelectorAll('.chatbot__topic').forEach((topicBtn) => {
      topicBtn.addEventListener('click', () => {
        const topic = CHATBOT_TOPICS[topicBtn.dataset.topic];
        if (!topic) return;

        chatbotTopics.querySelectorAll('.chatbot__topic').forEach((btn) => {
          btn.classList.toggle('is-active', btn === topicBtn);
        });

        const userBubble = document.createElement('p');
        userBubble.className = 'chatbot__message chatbot__message--user';
        userBubble.textContent = topic.label;

        const botBubble = document.createElement('p');
        botBubble.className = 'chatbot__message chatbot__message--bot';
        botBubble.textContent = topic.answer;

        chatbotMessages.append(userBubble, botBubble);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
      });
    });
  }

  /* -----------------------------------------------------------
     5b. WORK CARD DETAIL MODAL
     Each work card's "View" button opens the same modal, filled
     in from this data object instead of duplicating the modal
     markup once per project. codeUrl/liveUrl are optional — a
     project without a public deploy or repo (yet) just shows the
     description and tags, no dead links.
  ----------------------------------------------------------- */
  const PROJECT_DETAILS = {
    eca: {
      title: 'Elim Christian Academy Website',
      desc: "The official website for Elim Christian Academy, a real school in Trece Martires City, Cavite. Parents and visitors can read about the school's programs, follow news and announcements, check the school calendar, browse photo albums of school events, and use a help desk FAQ chat. Staff sign in with Google at a private admin page to post news, add calendar dates, upload albums, and edit the site's announcement bar, with an option to back up photos to Google Drive and cross-post to the school's Facebook Page. The front end is plain HTML/CSS/JS; the back end is a set of Node.js serverless functions on Vercel backed by a MySQL database.",
      tech: ['HTML', 'CSS', 'JavaScript', 'Node.js', 'MySQL'],
      codeUrl: 'https://github.com/realynmacompas/ECA-School-Website',
      liveUrl: 'https://eca-school-website.vercel.app',
      // Local screenshots from the project's own README/screenshots
      // folder — it's a real client site, not a public demo repo with
      // hosted images like CookingIna, so these ship with the portfolio
      // itself (images/eca-*.jpg) instead of linking out.
      screenshots: [
        'images/eca-home.jpg',
        'images/eca-news.jpg',
        'images/eca-calendar.jpg',
        'images/eca-admin.jpg',
      ],
    },
    cookingina: {
      title: 'CookingIna Recipe Website',
      desc: "A group academic project: a browsable recipe menu across five categories (Vegetable, Chicken, Pork, Beef, Seafood) with ingredients and steps for 25 Filipino dishes, a History page covering Filipino cuisine from the pre-colonial era to today, a Learn More page on regional dishes from Luzon, Visayas, and Mindanao with an embedded map, an About Us page, and a front-end-only Contact page.",
      tech: ['HTML', 'CSS', 'JavaScript'],
      codeUrl: 'https://github.com/realynmacompas/cookingina-recipe-website',
      liveUrl: 'https://cookingina-recipe-website.vercel.app/',
      // Straight from the project's README — real screenshots of the
      // live site, not a stand-in.
      screenshots: [
        'https://github.com/user-attachments/assets/43f791f0-c393-472b-b6b7-0ed64e26b81f',
        'https://github.com/user-attachments/assets/ee6eb9eb-aeb6-4722-bd84-a52a0a5ef097',
        'https://github.com/user-attachments/assets/f212d156-27cb-4ff2-aa6d-9cf8978e8931',
        'https://github.com/user-attachments/assets/a4097eb4-6774-48ff-be09-45e3e388f96f',
      ],
    },
    looc: {
      title: 'Looc Integrated School LMS',
      desc: "A learning management system built for Looc Integrated School, with separate student and teacher portals. Students can check their courses, grades, and report card, submit assignments, and follow a shared calendar of events; teachers manage their courses and materials, grade submissions through a gradebook with auto-computed grade equivalents, and post announcements. Login supports Google sign-in. The front end is plain HTML/CSS/JS; the back end is an ASP.NET Core Web API (.NET) with a MySQL database, deployed as a monorepo — the front end on Vercel and the API on Render.",
      tech: ['HTML', 'CSS', 'JavaScript', 'ASP.NET Core', 'MySQL'],
      codeUrl: 'https://github.com/realynmacompas/looc-lms',
      liveUrl: 'https://looc-lms.vercel.app',
      // Local screenshots from the project's own README/screenshots
      // folder, same approach as the ECA project above.
      screenshots: [
        'images/looc-student-dashboard.jpg',
        'images/looc-teacher-dashboard.jpg',
      ],
    },
  };

  const workModal = document.getElementById('workModal');
  const workModalClose = document.getElementById('workModalClose');
  const workModalTitle = document.getElementById('workModalTitle');
  const workModalDesc = document.getElementById('workModalDesc');
  const workModalTags = document.getElementById('workModalTags');
  const workModalLinks = document.getElementById('workModalLinks');
  const workModalMedia = document.getElementById('workModalMedia');
  const workModalGalleryImg = document.getElementById('workModalGalleryImg');
  const workModalThumbs = document.getElementById('workModalThumbs');
  const workModalGalleryPrev = document.getElementById('workModalGalleryPrev');
  const workModalGalleryNext = document.getElementById('workModalGalleryNext');
  let lastWorkModalTrigger = null;
  let galleryImages = [];
  let galleryIndex = 0;

  const renderGalleryImage = () => {
    if (!galleryImages.length) return;
    workModalGalleryImg.src = galleryImages[galleryIndex];
    workModalGalleryImg.alt = `${workModalTitle.textContent} — screenshot ${galleryIndex + 1} of ${galleryImages.length}`;
    workModalThumbs.querySelectorAll('button').forEach((thumb, i) => {
      thumb.classList.toggle('is-active', i === galleryIndex);
    });
  };

  const showGalleryImage = (index) => {
    galleryIndex = (index + galleryImages.length) % galleryImages.length;
    renderGalleryImage();
  };

  const openWorkModal = (projectId, trigger) => {
    const project = PROJECT_DETAILS[projectId];
    if (!workModal || !project) return;

    lastWorkModalTrigger = trigger || null;

    workModalTitle.textContent = project.title;
    workModalDesc.textContent = project.desc;

    galleryImages = project.screenshots || [];
    galleryIndex = 0;
    if (workModalMedia) {
      workModalMedia.hidden = galleryImages.length === 0;
      workModalThumbs.innerHTML = '';
      galleryImages.forEach((src, i) => {
        const thumb = document.createElement('button');
        thumb.type = 'button';
        thumb.setAttribute('aria-label', `Go to screenshot ${i + 1}`);
        const thumbImg = document.createElement('img');
        thumbImg.src = src;
        thumbImg.alt = '';
        thumbImg.loading = 'lazy';
        thumb.append(thumbImg);
        thumb.addEventListener('click', () => showGalleryImage(i));
        workModalThumbs.append(thumb);
      });
      if (galleryImages.length) renderGalleryImage();
    }

    workModalTags.innerHTML = '';
    project.tech.forEach((tech) => {
      const span = document.createElement('span');
      span.textContent = tech;
      workModalTags.append(span);
    });

    workModalLinks.innerHTML = '';
    if (project.codeUrl) {
      const link = document.createElement('a');
      link.href = project.codeUrl;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = 'View Code';
      workModalLinks.append(link);
    }
    if (project.liveUrl) {
      const link = document.createElement('a');
      link.href = project.liveUrl;
      link.target = '_blank';
      link.rel = 'noopener';
      link.className = 'work-card__btn--primary';
      link.textContent = 'Live Preview ↗';
      workModalLinks.append(link);
    }

    workModal.hidden = false;
    document.body.style.overflow = 'hidden';
    workModalClose.focus();
  };

  const closeWorkModal = () => {
    if (!workModal) return;
    workModal.hidden = true;
    document.body.style.overflow = '';
    if (lastWorkModalTrigger) lastWorkModalTrigger.focus();
  };

  if (workModal) {
    document.querySelectorAll('[data-project-view]').forEach((btn) => {
      btn.addEventListener('click', () => openWorkModal(btn.dataset.projectView, btn));
    });

    if (workModalClose) workModalClose.addEventListener('click', closeWorkModal);

    if (workModalGalleryPrev) workModalGalleryPrev.addEventListener('click', () => showGalleryImage(galleryIndex - 1));
    if (workModalGalleryNext) workModalGalleryNext.addEventListener('click', () => showGalleryImage(galleryIndex + 1));

    // Clicking the dimmed backdrop (not the panel itself) closes it too.
    workModal.addEventListener('click', (event) => {
      if (event.target === workModal) closeWorkModal();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !workModal.hidden) closeWorkModal();
    });
  }

  /* -----------------------------------------------------------
     6. SCROLL-REVEAL ANIMATIONS
     Elements marked with the "reveal" class fade and rise into
     place the first time they scroll into view, via
     IntersectionObserver. This block both hides ("arms") and
     reveals each element, so there's no failure mode where an
     element is hidden by one piece of code but never revealed by
     another — see the comments below.
  ----------------------------------------------------------- */
  const revealEls = document.querySelectorAll('.reveal');

  if (revealEls.length && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target); // animate in once, then leave it alone
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    // Arm (hide) each element right before observing it, so the hidden
    // state and the code that will remove it are always paired — there's
    // no window where an element can be hidden without also being watched.
    revealEls.forEach((el) => {
      el.classList.add('is-armed');
      revealObserver.observe(el);
    });
  }
  // If IntersectionObserver isn't supported at all, elements are simply
  // never armed and stay in their normal, fully-visible state — no
  // separate "fallback reveal" branch needed.

  /* -----------------------------------------------------------
     7. HERO SIGNATURE FLOURISH
     A small decorative line under the name draws itself once on
     load, using the classic stroke-dasharray/stroke-dashoffset
     trick: set the dash pattern to the path's own length (so it
     renders as one solid dash the length of the whole path), offset
     it by that same length (so none of it shows), then animate the
     offset down to 0. Skipped under reduced motion, where the line
     is just shown complete right away.
  ----------------------------------------------------------- */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const flourishPath = document.getElementById('heroFlourishPath');

  if (flourishPath) {
    const length = flourishPath.getTotalLength();
    flourishPath.style.strokeDasharray = length;

    if (prefersReducedMotion) {
      flourishPath.style.strokeDashoffset = 0;
    } else {
      flourishPath.style.strokeDashoffset = length;
      // Starts just after the name has mostly risen in (see
      // .hero__inner's rise-in animation in the CSS), so it reads as
      // "the name arrives, then signs itself" rather than both
      // happening on top of each other.
      setTimeout(() => {
        flourishPath.style.transition = 'stroke-dashoffset 1s cubic-bezier(0.22, 1, 0.36, 1)';
        flourishPath.style.strokeDashoffset = 0;
      }, 350);
    }
  }

  /* -----------------------------------------------------------
     8. ANIMATED BACKGROUND (VANTA.JS FOG)
     Mounts a moving WebGL "fog" effect into #siteBg, recolored to the
     site's own plum/berry palette (see :root in home.css) instead of
     Vanta's default green. three.min.js and vanta.fog.min.js are
     loaded from CDN in home.html, after the page content, so this only
     runs once both are available — if either is blocked (offline, ad
     blocker, slow connection), #siteBg just keeps the plain
     --plum-deep background set in CSS instead of erroring.
     Skipped when the visitor has "reduce motion" turned on, same as
     every other animation on this page.
  ----------------------------------------------------------- */
  const siteBg = document.getElementById('siteBg');
  const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (siteBg && !reduceMotionQuery.matches && window.THREE && window.VANTA && window.VANTA.FOG) {
    window.VANTA.FOG({
      el: siteBg,
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200,
      minWidth: 200,
      scale: 2,
      scaleMobile: 4,
      highlightColor: 0x6f2243, // --berry / --plum (Electric Purple)
      midtoneColor: 0x4e1a30,   // --berry-dark
      lowlightColor: 0x270d18,  // darker still, blending toward the base
      baseColor: 0x0b0c10,      // --plum-deep (Deep Indigo)
      blurFactor: 0.85,
      speed: 1.4,
      zoom: 0.6
    });
  }

  /* -----------------------------------------------------------
     9. DRIFTING DUST PARTICLES
     Small specks that float slowly across #dustCanvas and twinkle,
     layered on top of the Vanta fog for the same depth the reference
     site has. Plain canvas 2D (no WebGL, no extra library) — cheap
     enough to run alongside the fog without competing for GPU time.
     Skipped when the visitor has "reduce motion" turned on.
  ----------------------------------------------------------- */
  const dustCanvas = document.getElementById('dustCanvas');

  if (dustCanvas && !reduceMotionQuery.matches) {
    const ctx = dustCanvas.getContext('2d');
    let dpr = Math.min(window.devicePixelRatio || 1, 2); // cap for perf on hi-dpi screens
    let width = window.innerWidth;
    let height = window.innerHeight;
    let particles = [];

    // Roughly one speck per 9000px² of screen, kept within a sane range
    // so very large or very small viewports don't over/under-populate it.
    const particleCount = () => Math.round(Math.min(120, Math.max(40, (width * height) / 9000)));

    const makeParticle = () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.3 + 0.4,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      baseAlpha: Math.random() * 0.5 + 0.25,
      twinkleSpeed: Math.random() * 0.015 + 0.005,
      twinklePhase: Math.random() * Math.PI * 2
    });

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dustCanvas.width = width * dpr;
      dustCanvas.height = height * dpr;
      dustCanvas.style.width = `${width}px`;
      dustCanvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles = Array.from({ length: particleCount() }, makeParticle);
    };

    let frame = 0;
    const draw = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around the edges instead of despawning, so the same
        // handful of specks just keep drifting through indefinitely.
        if (p.x < -5) p.x = width + 5;
        if (p.x > width + 5) p.x = -5;
        if (p.y < -5) p.y = height + 5;
        if (p.y > height + 5) p.y = -5;

        const twinkle = 0.6 + 0.4 * Math.sin(frame * p.twinkleSpeed + p.twinklePhase);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.baseAlpha * twinkle})`;
        ctx.fill();
      });

      requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    requestAnimationFrame(draw);
  }

  /* -----------------------------------------------------------
     10. COPY EMAIL/PHONE INSTEAD OF NAVIGATING (DESKTOP)
     mailto:/tel: links are genuinely useful on a phone — they open
     the Mail or Phone app. On a desktop/laptop, clicking one either
     does nothing or launches whatever the OS's default mail client
     happens to be, which usually isn't helpful. On devices with a
     real mouse (hover: hover + a fine pointer — i.e. not a touch
     screen), these links no longer navigate; instead, clicking
     copies the address/number to the clipboard and the tooltip
     (see ICON TOOLTIPS in home.css) briefly flips to "Copied!" so
     there's still a way to actually use the value, not just read it.
  ----------------------------------------------------------- */
  const isDesktopPointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (isDesktopPointer) {
    document.querySelectorAll('a[href^="mailto:"], a[href^="tel:"]').forEach((link) => {
      const originalTooltip = link.getAttribute('data-tooltip');
      let resetTimer = null;

      link.addEventListener('click', async (event) => {
        event.preventDefault();

        const rawValue = link.href.startsWith('mailto:')
          ? link.href.slice('mailto:'.length)
          : link.href.slice('tel:'.length);
        const value = decodeURIComponent(rawValue);

        let copied = true;
        try {
          await copyTextToClipboard(value);
        } catch (error) {
          copied = false;
          console.error('Copy to clipboard failed:', error);
        }

        if (originalTooltip) {
          link.setAttribute('data-tooltip', copied ? 'Copied!' : 'Copy failed');
          clearTimeout(resetTimer);
          resetTimer = setTimeout(() => {
            link.setAttribute('data-tooltip', originalTooltip);
          }, 1500);
        }
      });
    });
  }

});

/* -----------------------------------------------------------
   Helper: copy a string to the clipboard. Uses the modern async
   Clipboard API where available (any reasonably current browser,
   over HTTPS or localhost); falls back to the old hidden-textarea
   + execCommand trick otherwise so it still works on an older
   browser or a plain-HTTP deployment.
----------------------------------------------------------- */
async function copyTextToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  const succeeded = document.execCommand('copy');
  textarea.remove();
  if (!succeeded) throw new Error('execCommand copy failed');
}

/* -----------------------------------------------------------
   Helper: catch the two most common kinds of junk in an email
   field — a malformed/typo'd address, and a throwaway address
   from a known disposable-email provider (used specifically to
   dodge forms like this one). This can't confirm the inbox is
   real and owned by whoever typed it; only sending a
   confirmation email could do that. It's a practical filter,
   not a guarantee.

   EMAIL_PATTERN is stricter than the browser's own
   type="email" check: it requires an actual domain with a
   letters-only TLD (so "name@host" with no dot is rejected,
   which the HTML5 spec alone allows).
----------------------------------------------------------- */
const EMAIL_PATTERN = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'mailinator.com', 'mailinator.net', 'guerrillamail.com', 'guerrillamail.info',
  'guerrillamail.biz', 'guerrillamail.de', 'guerrillamailblock.com', 'sharklasers.com',
  'grr.la', 'pokemail.net', '10minutemail.com', '10minutemail.net', '20minutemail.com',
  'temp-mail.org', 'tempmail.com', 'tempmail.net', 'tempmailo.com', 'throwawaymail.com',
  'yopmail.com', 'yopmail.fr', 'yopmail.net', 'trashmail.com', 'trash-mail.com',
  'dispostable.com', 'mailnesia.com', 'getnada.com', 'fakeinbox.com', 'maildrop.cc',
  'mohmal.com', 'moakt.com', 'emailondeck.com', 'mintemail.com', 'mytemp.email',
  'spamgourmet.com', 'discard.email', 'discardmail.com', 'fakemailgenerator.com',
  'inboxbear.com', 'tempinbox.com', 'mailcatch.com', 'mailsac.com', 'crazymailing.com',
  'burnermail.io', 'luxusmail.org', 'nowmymail.com', 'tempr.email', 'rhyta.com'
]);

function getEmailProblem(email) {
  const value = (email || '').trim();
  if (!EMAIL_PATTERN.test(value)) {
    return "That doesn't look like a valid email address.";
  }
  const domain = value.slice(value.lastIndexOf('@') + 1).toLowerCase();
  if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
    return 'Please use a real email address, not a temporary/disposable one.';
  }
  return null;
}

/* -----------------------------------------------------------
   Helper: escape user-entered text before injecting it as
   HTML, so a review with characters like < or > can't break
   the page markup.
----------------------------------------------------------- */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/* -----------------------------------------------------------
   Helper: build the read-only star-rating markup for a review
   card (matches the .star-rating / .star / .is-filled classes
   in home.css). rating is expected to be an integer 1-5.
----------------------------------------------------------- */
function buildStarRating(rating) {
  let stars = '';
  for (let i = 1; i <= 5; i++) {
    stars += `<span class="star${i <= rating ? ' is-filled' : ''}">★</span>`;
  }
  return `<span class="star-rating" aria-label="${rating} out of 5 stars">${stars}</span>`;
}

/* -----------------------------------------------------------
   Helper: turn the sheet's Timestamp value (an ISO date string
   once it comes back through JSON) into "Posted Mon DD, YYYY".
   Falls back to the raw value if it isn't a parseable date.
----------------------------------------------------------- */
function formatReviewDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  const formatted = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  return `Posted ${formatted}`;
}