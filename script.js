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

fetch("https://api.github.com/users/alexanderduckworthhu/repos?per_page=100&sort=updated")
  .then((r) => {
    if (!r.ok) throw new Error("GitHub API " + r.status);
    return r.json();
  })
  .then((repos) => {
    const others = repos.filter((r) => !FEATURED.has(r.name) && !r.fork);
    if (others.length === 0) {
      grid.innerHTML = '<p class="repo-loading">No additional public repositories right now.</p>';
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
  .catch(() => {
    grid.innerHTML = '<p class="repo-loading">Could not load repositories — <a href="https://github.com/alexanderduckworthhu?tab=repositories" target="_blank" rel="noopener" style="color: var(--accent)">browse them on GitHub ↗</a></p>';
  });
