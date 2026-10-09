document.getElementById("year").textContent = new Date().getFullYear();

const FEATURED = new Set([
  "where-needs-overlap",
  "multilingual-rag-assistant",
  "icu-mortality-vital-shap",
  "snp-trait-explorer",
  "climate-migration-risk-index",
  "esg-composite-scoring",
  "cnc-machine-health",
  "wild_log",
  "geosolar-ai",
  "Self_Supervised_Anomaly_Detection_for_Wildlife_Conservation_and_Biodiversity_Monitoring",
  "alexanderduckworthhu.github.io",
]);

// Short blurbs when a GitHub repo has no description set.
const REPO_DESCRIPTIONS = {
  "01_next_docker": "Next.js app packaged with Docker for a simple containerized frontend demo.",
  "02_express_docker": "Express API with Docker Compose and SQL init scripts for a containerized backend lab.",
  "03_fullstack_docker": "Docker Compose full-stack demo wiring an API and frontend into one local stack.",
  api01_cameras: "Node/Express cameras API with SQL schema and seed data, deployable on Vercel.",
  clienttaskmanager: "Full-stack client task manager with auth, Docker Compose, and a React frontend.",
  industrialecommerce: "Industrial machines ecommerce demo: Express, Postgres, static storefront, and Jenkins CI.",
};

const REPO_PAGE_SIZE = 6;
const REPO_ROTATE_MS = 30000;

const grid = document.getElementById("repo-grid");
const repoActions = document.getElementById("repo-actions");
const repoToggle = document.getElementById("repo-toggle");

let allRepos = [];
let showAllRepos = false;
let rotateTimer = null;

function i18nLabel(key, fallback) {
  const lang = document.documentElement.lang || "en";
  const simple = document.body.classList.contains("is-simple");
  if (
    simple &&
    typeof I18N_SIMPLE !== "undefined" &&
    I18N_SIMPLE[lang] &&
    I18N_SIMPLE[lang][key]
  ) {
    return I18N_SIMPLE[lang][key];
  }
  if (typeof I18N !== "undefined" && I18N[lang] && I18N[lang][key]) {
    return I18N[lang][key];
  }
  if (
    simple &&
    typeof I18N_SIMPLE !== "undefined" &&
    I18N_SIMPLE.en &&
    I18N_SIMPLE.en[key]
  ) {
    return I18N_SIMPLE.en[key];
  }
  return fallback;
}

function showRepoFallback() {
  if (repoActions) repoActions.hidden = true;
  grid.innerHTML =
    '<p class="repo-loading"><a href="https://github.com/alexanderduckworthhu" target="_blank" rel="noopener" style="color: var(--accent)">' +
    i18nLabel("repo_fallback", "Browse all repositories on GitHub ↗") +
    "</a></p>";
}

function shuffle(list) {
  const copy = list.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildRepoCard(repo) {
  const card = document.createElement("a");
  card.className = "repo-card";
  card.href = repo.html_url;
  card.target = "_blank";
  card.rel = "noopener";

  const title = document.createElement("h4");
  title.textContent = repo.name;

  const desc = document.createElement("p");
  desc.textContent =
    repo.description ||
    REPO_DESCRIPTIONS[repo.name] ||
    "Small coursework or practice project. Open on GitHub for the code.";

  const meta = document.createElement("div");
  meta.className = "repo-meta";
  if (repo.language) {
    const lang = document.createElement("span");
    lang.className = "repo-lang";
    lang.textContent = repo.language;
    meta.appendChild(lang);
  }
  if (repo.stargazers_count > 0) {
    const stars = document.createElement("span");
    stars.textContent = "★ " + repo.stargazers_count;
    meta.appendChild(stars);
  }
  const updated = document.createElement("span");
  updated.textContent =
    "Updated " +
    new Date(repo.pushed_at).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  meta.appendChild(updated);

  card.append(title, desc, meta);
  return card;
}

function updateToggleLabel() {
  if (!repoToggle) return;
  repoToggle.textContent = showAllRepos
    ? i18nLabel("repo_show_less", "Show fewer")
    : i18nLabel("repo_show_all", "Show all");
}

function renderRepos(repos) {
  grid.innerHTML = "";
  repos.forEach((repo) => grid.appendChild(buildRepoCard(repo)));
}

function pickVisibleRepos() {
  if (showAllRepos || allRepos.length <= REPO_PAGE_SIZE) {
    return allRepos;
  }
  return shuffle(allRepos).slice(0, REPO_PAGE_SIZE);
}

function refreshRepos() {
  renderRepos(pickVisibleRepos());
  updateToggleLabel();
}

function stopRotation() {
  if (rotateTimer) {
    clearInterval(rotateTimer);
    rotateTimer = null;
  }
}

function startRotation() {
  stopRotation();
  if (showAllRepos || allRepos.length <= REPO_PAGE_SIZE) return;
  rotateTimer = setInterval(refreshRepos, REPO_ROTATE_MS);
}

function setupRepoSection(repos) {
  allRepos = repos;
  if (repoActions) {
    repoActions.hidden = allRepos.length <= REPO_PAGE_SIZE;
  }
  showAllRepos = false;
  refreshRepos();
  startRotation();

  if (repoToggle && !repoToggle.dataset.bound) {
    repoToggle.dataset.bound = "1";
    repoToggle.addEventListener("click", () => {
      showAllRepos = !showAllRepos;
      refreshRepos();
      if (showAllRepos) stopRotation();
      else startRotation();
    });
  }
}

// Re-label toggle when language changes (i18n.js dispatches this if available).
document.addEventListener("portfolio:langchange", updateToggleLabel);
window.addEventListener("storage", (e) => {
  if (e.key === "preferred-locale") updateToggleLabel();
});

const repoAbort = new AbortController();
const repoTimeout = setTimeout(() => repoAbort.abort(), 4000);

fetch("https://api.github.com/users/alexanderduckworthhu/repos?per_page=100&sort=updated", {
  signal: repoAbort.signal,
})
  .then((r) => {
    if (!r.ok) throw new Error("GitHub API " + r.status);
    return r.json();
  })
  .then((repos) => {
    const others = repos.filter((r) => !FEATURED.has(r.name) && !r.fork);
    if (others.length === 0) {
      showRepoFallback();
      return;
    }
    setupRepoSection(others);
  })
  .catch(showRepoFallback)
  .finally(() => clearTimeout(repoTimeout));

// Staged "Live demo" buttons: visible but inert until real URLs are wired in.
document.querySelectorAll('[data-status="coming-soon"]').forEach((el) => {
  el.addEventListener("click", (e) => e.preventDefault());
});

// Nav active state: highlight the nav link for the section in view.
(function () {
  const navAnchors = new Map();
  document.querySelectorAll('.nav-links a[href^="#"]').forEach((a) => {
    navAnchors.set(a.getAttribute("href").slice(1), a);
  });
  const sections = [...navAnchors.keys()]
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  if (!sections.length || !("IntersectionObserver" in window)) return;

  const entriesById = new Map();
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => entriesById.set(e.target.id, e));
      let activeId = null;
      let bestHeight = 0;
      entriesById.forEach((e, id) => {
        if (!e.isIntersecting) return;
        const viewportShare = e.intersectionRect.height / window.innerHeight;
        if (e.intersectionRatio >= 0.3 || viewportShare >= 0.3) {
          if (e.intersectionRect.height > bestHeight) {
            bestHeight = e.intersectionRect.height;
            activeId = id;
          }
        }
      });
      navAnchors.forEach((a, id) => a.classList.toggle("active", id === activeId));
    },
    { threshold: [0, 0.1, 0.2, 0.3, 0.5, 0.75, 1] }
  );
  sections.forEach((s) => observer.observe(s));
})();
