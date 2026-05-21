import {
  getSchemesByCategory,
  getFullSchemeDetails,
} from "./firebase.js";

import {
  requireAuth,
} from "./auth.js";




// ===============================
// 🔥 LOADER
// ===============================
const loader = document.getElementById("loader");

export function startLoader(text = "Loading...") {
  if (!loader) return;

  const textEl = loader.querySelector("p");
  if (textEl) textEl.textContent = text;

  loader.classList.add("active");
}

export function stopLoader() {
  if (!loader) return;
  loader.classList.remove("active");
}

// global access (optional)
window.startLoader = startLoader;
window.stopLoader = stopLoader;


// ===============================
// 📂 SIDEBAR
// ===============================
const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");

if (menuBtn && sidebar) {
  menuBtn.addEventListener("click", () => {
    sidebar.classList.toggle("active");
  });
}


// ===============================
// 🏠 NAV / PAGE RENDER SYSTEM
// ===============================
let schemesContainer;
let articleContainer;

document.addEventListener("DOMContentLoaded", () => {
  schemesContainer = document.getElementById("schemes-list");
  articleContainer = document.getElementById("articles");

  render("home");
});

window.render = render;

export function render(page) {
  const home = document.getElementById("home");

  if (home) home.classList.add("hidden");
  if (schemesContainer) schemesContainer.classList.add("hidden");
  if (articleContainer) articleContainer.classList.add("hidden");

  if (page === "home" && home) {
    home.classList.remove("hidden");
  }

  if (page === "schemes" && schemesContainer) {
    schemesContainer.classList.remove("hidden");
  }

  if (page === "articles" && articleContainer) {
    articleContainer.classList.remove("hidden");
  }
}


// ===============================
// 📌 CATEGORY CLICK HANDLER
// ===============================
document.querySelectorAll(".card").forEach(card => {
  card.addEventListener("click", () => {
    const category = card.getAttribute("data-category");

    render("schemes");
    renderSchemes(category);

    // click animation
    card.style.transform = "scale(0.95)";
    setTimeout(() => {
      card.style.transform = "scale(1)";
    }, 150);
  });
});


// ===============================
// 📦 SCHEMES LIST
// ===============================
export async function renderSchemes(category) {
  if (!schemesContainer) return;

  schemesContainer.innerHTML = "";
  startLoader("Loading schemes...");

  try {
    const schemes = await getSchemesByCategory(category);
    stopLoader();

    if (!schemes || schemes.length === 0) {
      schemesContainer.innerHTML = "<p>No schemes found</p>";
      return;
    }

    schemes.forEach(scheme => {
      const card = document.createElement("div");
      card.className = "scheme-card";

      card.innerHTML = `
        <h3>${scheme.name}</h3>
        <p>${scheme.short_desc || "No description available"}</p>
      `;

      card.addEventListener("click", () => {
       
       
       requireAuth(() => {
       renderSchemeDetails(scheme.id);
       render("articles");
       });
        
      });

      schemesContainer.appendChild(card);
    });

  } catch (error) {
    console.error("Render Schemes Error:", error);
    schemesContainer.innerHTML = "<p>Error loading schemes</p>";
    stopLoader();
  }
}


// ===============================
// 📄 SCHEME DETAILS PAGE
// ===============================
export async function renderSchemeDetails(id) {
  if (!articleContainer) return;

  articleContainer.innerHTML = "";
  startLoader("Loading details...");

  try {
    const data = await getFullSchemeDetails(id);
    stopLoader();

    if (!data || !data.article) {
      articleContainer.innerHTML = "<p>No details found</p>";
      return;
    }

    const { article } = data;

    articleContainer.innerHTML = `
      <div class="article-page">

        <button class="back-btn" onclick="render('schemes')">
          ⬅ Back
        </button>

        <h1 class="article-title">${article.title}</h1>

        <div class="article-content">
          ${formatText(article.content)}
        </div>

        ${renderList("Benefits", article.benefits)}
        ${renderList("Eligibility", article.eligibility)}
        ${renderList("Documents", article.documents)}

        <div class="section">
          <h2>How to Apply</h2>
          <p>${article.howToApply || "N/A"}</p>
        </div>

        <div class="section">
          <h2>Official Link</h2>
          <a href="${article.officialLink}" target="_blank">
            Visit Official Website
          </a>
        </div>

      </div>
    `;

    window.scrollTo(0, 0);

  } catch (err) {
    console.error("Detail Error:", err);
    articleContainer.innerHTML = "<p>Error loading details</p>";
    stopLoader();
  }
}


// ===============================
// 🧠 HELPERS
// ===============================
function formatText(text) {
  if (!text) return "";

  return text
    .split("\n")
    .map(line => `<p>${line}</p>`)
    .join("");
}

function renderList(title, items) {
  if (!items || items.length === 0) return "";

  return `
    <div class="section">
      <h2>${title}</h2>
      <ul>
        ${items.map(i => `<li>${i}</li>`).join("")}
      </ul>
    </div>
  `;
}


