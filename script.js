document.getElementById("year").textContent = new Date().getFullYear();

const FEATURED = new Set([
  "where-needs-overlap",
  "multilingual-rag-assistant",
  "icu-mortality-vital-shap",
  "climate-migration-risk-index",
  "esg-composite-scoring",
  "cnc-machine-health",
  "wild_log",
  "Self_Supervised_Anomaly_Detection_for_Wildlife_Conservation_and_Biodiversity_Monitoring",
  "alexanderduckworthhu.github.io",
]);

const grid = document.getElementById("repo-grid");

function showRepoFallback() {
  const lang = document.documentElement.lang || "en";
  const label =
    (typeof I18N !== "undefined" && I18N[lang] && I18N[lang].repo_fallback) ||
    "Browse all repositories on GitHub ↗";
  grid.innerHTML =
    '<p class="repo-loading"><a href="https://github.com/alexanderduckworthhu" target="_blank" rel="noopener" style="color: var(--accent)">' +
    label +
    "</a></p>";
}

const repoAbort = new AbortController();
const repoTimeout = setTimeout(() => repoAbort.abort(), 4000);

fetch("https://api.github.com/users/alexanderduckworthhu/repos?per_page=100&sort=updated", { signal: repoAbort.signal })
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
    grid.innerHTML = "";
    for (const repo of others) {
      const card = document.createElement("a");
      card.className = "repo-card";
      card.href = repo.html_url;
      card.target = "_blank";
      card.rel = "noopener";

      const title = document.createElement("h4");
      title.textContent = repo.name;

      const desc = document.createElement("p");
      desc.textContent = repo.description || "View on GitHub for details.";

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
      updated.textContent = "Updated " + new Date(repo.pushed_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
      meta.appendChild(updated);

      card.append(title, desc, meta);
      grid.appendChild(card);
    }
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
        // A section counts as "in view" when 30% of it is visible, or ;
        // for sections taller than the viewport ; when it fills 30% of the screen.
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
