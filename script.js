const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".site-nav");

const closeMenu = () => {
  menuToggle?.setAttribute("aria-expanded", "false");
  navigation?.classList.remove("is-open");
  document.body.classList.remove("menu-open");
};

menuToggle?.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  navigation.classList.toggle("is-open", !isOpen);
  document.body.classList.toggle("menu-open", !isOpen);
});

navigation?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
window.addEventListener("resize", () => {
  if (window.innerWidth > 760) closeMenu();
});

const updateHeader = () => header?.classList.toggle("is-scrolled", window.scrollY > 24);
updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

const reveals = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  reveals.forEach((item) => revealObserver.observe(item));
} else {
  reveals.forEach((item) => item.classList.add("is-visible"));
}

const formatTime = (seconds) => {
  if (!Number.isFinite(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
};

const players = [...document.querySelectorAll("[data-audio-player]")];
players.forEach((player) => {
  const audio = player.querySelector("audio");
  const button = player.querySelector(".play-button");
  const progress = player.querySelector('input[type="range"]');
  const currentTime = player.querySelector(".current-time");
  const duration = player.querySelector(".duration");

  const setPlayingState = (playing) => {
    player.classList.toggle("is-playing", playing);
    button.setAttribute("aria-label", `${playing ? "Pause" : "Play"} ${player.querySelector(".sample-meta p").textContent.toLowerCase()} sample`);
  };

  button.addEventListener("click", async () => {
    if (audio.paused) {
      players.forEach((otherPlayer) => {
        const otherAudio = otherPlayer.querySelector("audio");
        if (otherAudio !== audio) {
          otherAudio.pause();
          otherPlayer.classList.remove("is-playing");
        }
      });
      try {
        await audio.play();
        setPlayingState(true);
      } catch {
        button.setAttribute("aria-label", "Audio file not yet available");
        player.classList.add("audio-missing");
      }
    } else {
      audio.pause();
      setPlayingState(false);
    }
  });

  audio.addEventListener("loadedmetadata", () => {
    duration.textContent = formatTime(audio.duration);
  });
  audio.addEventListener("timeupdate", () => {
    const percentage = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
    progress.value = percentage;
    progress.style.setProperty("--progress", `${percentage}%`);
    currentTime.textContent = formatTime(audio.currentTime);
  });
  audio.addEventListener("ended", () => setPlayingState(false));
  audio.addEventListener("pause", () => setPlayingState(false));
  progress.addEventListener("input", () => {
    if (audio.duration) audio.currentTime = (progress.value / 100) * audio.duration;
    progress.style.setProperty("--progress", `${progress.value}%`);
  });
});

const filterButtons = document.querySelectorAll("[data-filter]");
const projects = document.querySelectorAll("[data-category]");
filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    const filter = button.dataset.filter;
    projects.forEach((project) => {
      project.classList.toggle("is-hidden", filter !== "all" && project.dataset.category !== filter);
    });
  });
});

const contactForm = document.querySelector(".contact-form");
contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const status = contactForm.querySelector(".form-status");
  if (!contactForm.checkValidity()) {
    status.textContent = "Please complete the required fields.";
    contactForm.reportValidity();
    return;
  }

  const data = new FormData(contactForm);
  const subject = encodeURIComponent(`New ${data.get("project")} enquiry from ${data.get("name")}`);
  const body = encodeURIComponent(`Name: ${data.get("name")}\nEmail: ${data.get("email")}\nProject: ${data.get("project")}\n\n${data.get("message")}`);
  status.textContent = "Opening your email app…";
  window.location.href = `mailto:hello@mrsmnarration.co.uk?subject=${subject}&body=${body}`;
});

document.querySelector("[data-year]").textContent = new Date().getFullYear();
