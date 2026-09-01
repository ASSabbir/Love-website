/* =========================================================
   LOVE LETTER EXPERIENCE — SCRIPT
   Vanilla JS only. No dependencies.
   ========================================================= */

(function () {
  "use strict";

  /* ---------------- State ---------------- */
  const state = {
    currentScreen: "landing",
    currentQuestion: 0,
    noAttempts: 0,
    musicPlaying: false,
    letterStarted: false,
    celebrationStarted: false,
  };

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ---------------- Content ---------------- */

  const NO_BUTTON_MESSAGES = [
    "No",
    "Are you sure?",
    "Really?",
    "Try again",
    "Nice try",
    "You can't escape me",
    "Wrong button, madam",
    "That button doesn't work",
    "I know you love me",
    "Stop trying 😂❤️",
    "NO is not available",
  ];

  const QUESTIONS = [
    {
      text: "Who is the cutest husband in the world?",
      options: ["Atik", "Obviously Atik"],
    },
    {
      text: "If Atik asks for one more hug, what will you do?",
      options: ["Give him a hug", "Give him TWO hugs", "Never let him go"],
    },
    {
      text: "Would you choose Atik again?",
      options: ["Always", "Every lifetime", "Without thinking twice"],
    },
    {
      text: "One last question... Will you stay with Atik through all the crazy adventures ahead? 🌎❤️",
      options: ["Yes", "Forever", "Obviously!"],
    },
  ];

  const LETTER_TEXT = `To my beautiful wife,

If you're reading this, it means you made it through all my silly questions.
I just wanted to create something small, but meaningful, to remind you how special you are to me.

Life isn't always perfect. We have our busy days, our difficult days, and our crazy days.
But through all of them, there's one person I would still choose again and again.

You.

Thank you for being part of my life, for understanding me, supporting me, annoying me sometimes,
and loving me through everything.

I don't know what every tomorrow will look like.
But I know who I want beside me when tomorrow comes.

I choose you.
Today. Tomorrow. And every day after that.

With all my love,
Atik`;

  /* ---------------- Screen management ---------------- */

  const screens = Array.from(document.querySelectorAll(".screen"));

  function showScreen(name) {
    screens.forEach((s) => s.classList.toggle("active", s.dataset.screen === name));
    state.currentScreen = name;
    // Move focus to the new screen's heading for accessibility
    const active = screens.find((s) => s.dataset.screen === name);
    if (active) {
      const heading = active.querySelector("h1, h2");
      if (heading) {
        heading.setAttribute("tabindex", "-1");
        heading.focus({ preventScroll: true });
      }
    }
  }

  /* ---------------- Ambient hearts (background) ---------------- */

  function createHeart(container, opts = {}) {
    const {
      size = 14 + Math.random() * 18,
      left = Math.random() * 100,
      duration = 9 + Math.random() * 8,
      delay = 0,
      color = "var(--rose-500)",
    } = opts;

    const wrap = document.createElement("span");
    wrap.className = "ambient-heart";
    wrap.style.left = left + "%";
    wrap.style.setProperty("--drift-x", (Math.random() * 60 - 30) + "px");
    wrap.style.setProperty("--drift-r", (Math.random() * 40 - 20) + "deg");
    wrap.style.animationDuration = duration + "s";
    wrap.style.animationDelay = delay + "s";

    wrap.innerHTML =
      '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24"><path fill="' +
      color +
      '" d="M12 21s-7.5-4.6-10.2-9.1C.2 9 1.4 5.4 4.7 4.4c2-.6 4 .1 5.3 1.9C11.3 4.5 13.3 3.8 15.3 4.4c3.3 1 4.5 4.6 2.9 7.5C15.5 16.4 12 21 12 21z"/></svg>';

    container.appendChild(wrap);
    return wrap;
  }

  function startAmbientHearts() {
    const container = document.getElementById("ambient-hearts");
    if (!container || prefersReducedMotion) return;

    const count = window.innerWidth < 480 ? 7 : 12;
    for (let i = 0; i < count; i++) {
      createHeart(container, { delay: Math.random() * -14 });
    }
  }

  /* ---------------- SCREEN 1 — Landing ---------------- */

  document.getElementById("btn-open-question").addEventListener("click", () => {
    showScreen("main-question");
  });

  /* ---------------- SCREEN 2 — Main question + escaping NO ---------------- */

  const noBtn = document.getElementById("btn-no");
  const yesBtn = document.getElementById("btn-yes");
  const ynWrapper = document.getElementById("yn-wrapper");

  function moveNoButton() {
    const wrapperRect = ynWrapper.getBoundingClientRect();
    const btnRect = noBtn.getBoundingClientRect();
    const padding = 20;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const minX = padding;
    const maxX = vw - btnRect.width - padding;
    const minY = padding + 60; // keep clear of the music toggle / top safe area
    const maxY = vh - btnRect.height - padding - 40;

    const safeMaxX = Math.max(minX, maxX);
    const safeMaxY = Math.max(minY, maxY);

    const newX = minX + Math.random() * (safeMaxX - minX);
    const newY = minY + Math.random() * (safeMaxY - minY);

    if (!noBtn.classList.contains("escaping")) {
      noBtn.classList.add("escaping");
    }

    noBtn.style.left = newX + "px";
    noBtn.style.top = newY + "px";
    noBtn.style.transform = "rotate(" + (Math.random() * 16 - 8) + "deg)";

    // Update message + attempts
    state.noAttempts++;
    const idx = Math.min(state.noAttempts, NO_BUTTON_MESSAGES.length - 1);
    noBtn.textContent = NO_BUTTON_MESSAGES[idx];
  }

  // Desktop: move away when the pointer gets close (hover-adjacent proximity)
  function handlePointerProximity(e) {
    if (e.pointerType === "touch") return; // handled separately below
    const rect = noBtn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
    if (dist < 90) {
      moveNoButton();
    }
  }

  document.addEventListener("pointermove", (e) => {
    if (state.currentScreen !== "main-question") return;
    handlePointerProximity(e);
  });

  // Any direct interaction attempt (mouse or touch) also triggers escape
  ["pointerdown", "pointerenter", "touchstart", "pointerover"].forEach((evt) => {
    noBtn.addEventListener(
      evt,
      (e) => {
        e.preventDefault();
        moveNoButton();
      },
      { passive: false }
    );
  });

  // Keyboard users: Enter/Space on a focused NO button also "escapes"
  noBtn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      moveNoButton();
      noBtn.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (noBtn.classList.contains("escaping")) {
      // Re-clamp position within viewport on resize/orientation change
      const rect = noBtn.getBoundingClientRect();
      const maxX = window.innerWidth - rect.width - 20;
      const maxY = window.innerHeight - rect.height - 20;
      const clampedX = Math.min(parseFloat(noBtn.style.left) || 0, maxX);
      const clampedY = Math.min(parseFloat(noBtn.style.top) || 0, maxY);
      noBtn.style.left = Math.max(20, clampedX) + "px";
      noBtn.style.top = Math.max(20, clampedY) + "px";
    }
  });

  function resetNoButton() {
    noBtn.classList.remove("escaping");
    noBtn.removeAttribute("style");
    noBtn.textContent = NO_BUTTON_MESSAGES[0];
    state.noAttempts = 0;
  }

  yesBtn.addEventListener("click", () => {
    if (navigator.vibrate) {
      try { navigator.vibrate(30); } catch (_) {}
    }
    spawnHeartBurst(yesBtn);
    showScreen("yes-response");
  });

  document.getElementById("btn-continue-questions").addEventListener("click", () => {
    resetNoButton();
    state.currentQuestion = 0;
    renderQuestion();
    showScreen("questions");
  });

  /* ---------------- SCREEN 3 — Romantic questions ---------------- */

  const questionText = document.getElementById("question-text");
  const questionOptions = document.getElementById("question-options");
  const questionProgress = document.getElementById("question-progress");

  function renderQuestion() {
    const q = QUESTIONS[state.currentQuestion];
    questionProgress.textContent =
      "Question " + (state.currentQuestion + 1) + " of " + QUESTIONS.length;

    questionText.style.animation = "none";
    questionText.offsetHeight; // reflow to restart animation
    questionText.style.animation = "";
    questionText.classList.remove("fade-line");
    void questionText.offsetWidth;
    questionText.classList.add("fade-line");
    questionText.textContent = q.text;

    questionOptions.innerHTML = "";
    q.options.forEach((label, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn btn-primary fade-line";
      btn.style.animationDelay = 80 + i * 70 + "ms";
      btn.textContent = label;
      btn.addEventListener("click", nextQuestion);
      questionOptions.appendChild(btn);
    });
  }

  function nextQuestion() {
    state.currentQuestion++;
    if (state.currentQuestion < QUESTIONS.length) {
      renderQuestion();
    } else {
      showScreen("anticipation");
    }
  }

  /* ---------------- SCREEN 4 — Anticipation ---------------- */

  document.getElementById("btn-open-surprise").addEventListener("click", () => {
    showScreen("letter");
    if (!state.letterStarted) {
      state.letterStarted = true;
      startLetterTypewriter();
    }
  });

  /* ---------------- FINAL SCREEN — Love letter ---------------- */

  const letterBody = document.getElementById("letter-body");
  const oneMoreBtn = document.getElementById("btn-one-more-thing");

  function typeLetter(text, el, onDone) {
    if (prefersReducedMotion) {
      el.textContent = text;
      onDone();
      return;
    }

    el.textContent = "";
    const caret = document.createElement("span");
    caret.className = "caret";
    el.appendChild(caret);

    let i = 0;
    const speed = 18; // ms per character

    function step() {
      if (i < text.length) {
        caret.insertAdjacentText("beforebegin", text[i]);
        i++;
        // Slightly longer pause on line breaks for a natural rhythm
        const delay = text[i - 1] === "\n" ? speed * 6 : speed;
        setTimeout(step, delay);
      } else {
        caret.remove();
        onDone();
      }
    }
    step();
  }

  function startLetterTypewriter() {
    typeLetter(LETTER_TEXT, letterBody, () => {
      oneMoreBtn.hidden = false;
      oneMoreBtn.classList.add("fade-line");
    });
  }

  oneMoreBtn.addEventListener("click", () => {
    showScreen("celebration");
    if (!state.celebrationStarted) {
      state.celebrationStarted = true;
      startCelebration();
    }
  });

  /* ---------------- Heart burst (small, on-demand) ---------------- */

  function spawnHeartBurst(originEl) {
    if (prefersReducedMotion) return;
    const layer = document.getElementById("celebration-layer");
    const rect = originEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const colors = ["#ff6b9a", "#ff3d7f", "#ffb6c9"];

    for (let i = 0; i < 10; i++) {
      const h = document.createElement("span");
      h.className = "burst-heart";
      const angle = (Math.PI * 2 * i) / 10 + Math.random() * 0.4;
      const dist = 60 + Math.random() * 60;
      h.style.setProperty("--bx", Math.cos(angle) * dist + "px");
      h.style.setProperty("--by", Math.sin(angle) * dist + "px");
      h.style.left = cx + "px";
      h.style.top = cy + "px";
      const size = 10 + Math.random() * 10;
      const color = colors[i % colors.length];
      h.innerHTML =
        '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24"><path fill="' +
        color +
        '" d="M12 21s-7.5-4.6-10.2-9.1C.2 9 1.4 5.4 4.7 4.4c2-.6 4 .1 5.3 1.9C11.3 4.5 13.3 3.8 15.3 4.4c3.3 1 4.5 4.6 2.9 7.5C15.5 16.4 12 21 12 21z"/></svg>';
      layer.appendChild(h);
      h.addEventListener("animationend", () => h.remove());
    }
  }

  /* ---------------- Celebration (balloons, confetti, particles) ---------------- */

  function createConfetti(layer, count) {
    const colors = ["#ff6b9a", "#ff3d7f", "#ffb6c9", "#ffffff", "#ffe4ec"];
    for (let i = 0; i < count; i++) {
      const piece = document.createElement("span");
      piece.className = "confetti-piece";
      const left = Math.random() * 100;
      const duration = 3.2 + Math.random() * 2.6;
      const delay = Math.random() * 2.5;
      piece.style.left = left + "%";
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDuration = duration + "s";
      piece.style.animationDelay = delay + "s";
      piece.style.setProperty("--spin", 360 * (Math.random() > 0.5 ? 1 : -1) + "deg");
      layer.appendChild(piece);
      piece.addEventListener("animationend", () => piece.remove());
    }
  }

  function createBalloons(layer, count) {
    const colors = ["#ff6b9a", "#ff3d7f", "#ffb6c9", "#ff8fb3"];
    for (let i = 0; i < count; i++) {
      const wrap = document.createElement("span");
      wrap.className = "balloon-piece";
      const left = 5 + Math.random() * 90;
      const size = 34 + Math.random() * 26;
      const duration = 7 + Math.random() * 4;
      const delay = Math.random() * 3;
      wrap.style.left = left + "%";
      wrap.style.setProperty("--bw", size + "px");
      wrap.style.setProperty("--sway", (Math.random() * 80 - 40) + "px");
      wrap.style.animationDuration = duration + "s";
      wrap.style.animationDelay = delay + "s";

      const body = document.createElement("span");
      body.className = "balloon-body";
      body.style.background = colors[Math.floor(Math.random() * colors.length)];

      const string = document.createElement("span");
      string.className = "balloon-string";

      wrap.appendChild(body);
      wrap.appendChild(string);
      layer.appendChild(wrap);
      wrap.addEventListener("animationend", () => wrap.remove());
    }
  }

  function startCelebration() {
    const layer = document.getElementById("celebration-layer");

    if (prefersReducedMotion) {
      // Minimal, calm celebration for reduced-motion users
      createConfetti(layer, 6);
      return;
    }

    createConfetti(layer, 40);
    createBalloons(layer, 8);

    // A few extra bursts over the next few seconds for a "party" feel
    let bursts = 0;
    const burstInterval = setInterval(() => {
      createConfetti(layer, 16);
      if (Math.random() > 0.5) createBalloons(layer, 3);
      bursts++;
      if (bursts >= 4) clearInterval(burstInterval);
    }, 1400);

    // Occasional gentle heart bursts from the center for lasting sparkle
    let heartBursts = 0;
    const heartInterval = setInterval(() => {
      const cx = window.innerWidth / 2 + (Math.random() * 120 - 60);
      const cy = window.innerHeight / 2 + (Math.random() * 120 - 60);
      spawnHeartBurst({
        getBoundingClientRect: () => ({ left: cx, top: cy, width: 0, height: 0 }),
      });
      heartBursts++;
      if (heartBursts >= 6) clearInterval(heartInterval);
    }, 1800);
  }

  /* ---------------- Music toggle ---------------- */

  const musicBtn = document.getElementById("music-toggle");
  const musicEl = document.getElementById("bg-music");
  const iconNote = musicBtn.querySelector(".icon-note");
  const iconMute = musicBtn.querySelector(".icon-mute");

  function toggleMusic() {
    if (!musicEl) return;
    if (state.musicPlaying) {
      musicEl.pause();
      state.musicPlaying = false;
    } else {
      const playPromise = musicEl.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise
          .then(() => { state.musicPlaying = true; updateMusicIcon(); })
          .catch(() => {
            // Music file missing or blocked — site continues to work fine
            state.musicPlaying = false;
            updateMusicIcon();
          });
        return;
      }
      state.musicPlaying = true;
    }
    updateMusicIcon();
  }

  function updateMusicIcon() {
    iconNote.hidden = state.musicPlaying;
    iconMute.hidden = !state.musicPlaying;
    musicBtn.setAttribute("aria-pressed", String(state.musicPlaying));
    musicBtn.setAttribute(
      "aria-label",
      state.musicPlaying ? "Pause background music" : "Play background music"
    );
  }

  musicBtn.addEventListener("click", toggleMusic);

  /* ---------------- Init ---------------- */

  function init() {
    startAmbientHearts();
    showScreen("landing");
  }

  document.addEventListener("DOMContentLoaded", init);
})();
