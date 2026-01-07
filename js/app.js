// ===============================
// OpenPlayground - Main JavaScript
// ===============================

import { ProjectVisibilityEngine } from "./core/projectVisibilityEngine.js";


/* =====================================================
   GLOBAL ELEMENTS & STATE
===================================================== */
const html = document.documentElement;
const toggleBtn = document.getElementById("toggle-mode-btn");
const themeIcon = document.getElementById("theme-icon");
// ===============================
// Architecture: ProjectVisibilityEngine Integration
// ===============================
// We're introducing a centralized visibility engine to handle project filtering logic.
// Phase 1: Migrate SEARCH functionality to use the engine.
// Phase 2 (future): Migrate category filtering, sorting, and pagination.
// Benefits:
// - Separation of concerns: logic vs. DOM manipulation
// - Reusability: engine can be used across multiple views
// - Testability: pure functions easier to unit test
// - Scalability: complex filters (multi-select, tags, dates) become manageable

import { ProjectVisibilityEngine } from "./core/projectVisibilityEngine.js";

// ===============================
// Theme Toggle
// ===============================

// Elements related to theme toggle (light/dark mode)
const toggleBtn = document.getElementById("toggle-mode-btn");
const themeIcon = document.getElementById("theme-icon");
const html = document.documentElement;

// Load previously saved theme from localStorage or default to light theme
const savedTheme = localStorage.getItem("theme") || "light";
html.setAttribute("data-theme", savedTheme);
updateThemeIcon(savedTheme);

// Toggle between light and dark theme when the user clicks the theme button
toggleBtn.addEventListener("click", () => {
    const newTheme =
        html.getAttribute("data-theme") === "light" ? "dark" : "light";
    html.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    updateThemeIcon(newTheme);

    // Add shake animation
    toggleBtn.classList.add("shake");
    setTimeout(() => toggleBtn.classList.remove("shake"), 500);
});

// Updates the theme icon based on the currently active theme
function updateThemeIcon(theme) {
    if (theme === "dark") {
        themeIcon.className = "ri-moon-fill";
    } else {
        themeIcon.className = "ri-sun-line";
    }
}

// ===============================
// Scroll to Top
// ===============================

// Button used to scroll back to the top of the page
const scrollBtn = document.getElementById("scrollToTopBtn");

// Show or hide the scroll-to-top button based on scroll position
window.addEventListener("scroll", () => {
    scrollBtn.classList.toggle("show", window.scrollY > 300);
});

// Smoothly scroll to the top when the button is clicked
scrollBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});

// ===============================
// Mobile Navbar
// ===============================

// Mobile navigation toggle elements
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");

if (navToggle && navLinks) {
    // Toggle mobile navigation menu and update menu icon
    navToggle.addEventListener("click", () => {
        navLinks.classList.toggle("active");

        // Toggle icon
        const icon = navToggle.querySelector("i");
        if (navLinks.classList.contains("active")) {
            icon.className = "ri-close-line";
        } else {
            icon.className = "ri-menu-3-line";
        }
    });

    // Close mobile menu when a navigation link is clicked
    navLinks.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            navLinks.classList.remove("active");
            navToggle.querySelector("i").className = "ri-menu-3-line";
        });
    });
}

// ===============================
// Projects Logic
// ===============================

// Number of project cards displayed per page
const itemsPerPage = 9;
// Tracks the current page number for pagination
let currentPage = 1;
// Stores the currently selected project category filter
let currentCategory = "all";
// Stores the currently selected sorting option
let currentSort = "default";
// Holds all project data fetched from the projects.json file
let allProjectsData = [];

// ===============================
// Architecture: ProjectVisibilityEngine Instance
// ===============================
// This engine will progressively replace inline filtering logic.
// Currently handles: search query matching
// Future: category filters, sorting, advanced filters
let visibilityEngine = null;

const searchInput = document.getElementById("project-search");
const sortSelect = document.getElementById("project-sort");
const filterBtns = document.querySelectorAll(".filter-btn");

const clearBtn = document.getElementById("clear-filters");
const surpriseBtn = document.getElementById("surprise-btn");

const surpriseBtn = document.getElementById("surprise-btn");
const clearBtn = document.getElementById("clear-filters");

// Reset all filters, search input, and pagination when clear button is clicked
if (clearBtn) {
    clearBtn.addEventListener("click", () => {
        searchInput.value = "";
        sortSelect.value = "default";
        currentCategory = "all";
        currentPage = 1;

        filterBtns.forEach(b => b.classList.remove("active"));
        document.querySelector('[data-filter="all"]').classList.add("active");

        // Architecture: Clear search query in engine
        if (visibilityEngine) {
            visibilityEngine.setSearchQuery("");
        }

        renderProjects();
    });
}


const projectsContainer = document.querySelector(".projects-container");
const paginationContainer = document.getElementById("pagination-controls");
const emptyState = document.getElementById("empty-state");


const scrollBtn = document.getElementById("scrollToTopBtn");
const navbar = document.getElementById("navbar");

const allCards = Array.from(document.querySelectorAll(".card"));

// Updates the project count displayed on category filter buttons
function updateCategoryCounts() {
    const counts = {};

    allCards.forEach(card => {
        const cat = card.dataset.category;
        counts[cat] = (counts[cat] || 0) + 1;
    });

    filterBtns.forEach(btn => {
        const cat = btn.dataset.filter;
        if (cat === "all") {
            btn.innerText = `All (${allCards.length})`;
        } else {
            btn.innerText = `${cat.charAt(0).toUpperCase() + cat.slice(1)} (${counts[cat] || 0})`;
        }
    });
}

// ===============================
// Add GitHub link button to cards
// ===============================


const contributorsGrid = document.getElementById("contributors-grid");

let allProjectsData = [];
let currentPage = 1;
let currentCategory = "all";
let currentSort = "default";
const itemsPerPage = 9;

let visibilityEngine = null;

/* =====================================================
   THEME TOGGLE
===================================================== */
const savedTheme = localStorage.getItem("theme") || "light";
html.setAttribute("data-theme", savedTheme);
updateThemeIcon(savedTheme);


toggleBtn?.addEventListener("click", () => {
  const newTheme = html.getAttribute("data-theme") === "light" ? "dark" : "light";
  html.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
  updateThemeIcon(newTheme);

  toggleBtn.classList.add("shake");
  setTimeout(() => toggleBtn.classList.remove("shake"), 500);
});

// Fetch project data from projects.json and initialize project rendering
async function fetchProjects() {
    try {
        const response = await fetch("./projects.json");
        const data = await response.json();
        allProjectsData = data;

        // Update project count in hero
        const projectCount = document.getElementById("project-count");
        if (projectCount) {
            projectCount.textContent = `${data.length}+`;
        }

        // ===============================
        // Architecture: Initialize ProjectVisibilityEngine
        // ===============================
        // Extract metadata from project data to initialize the engine
        // This creates a clean separation between data model and presentation
        const projectMetadata = data.map(project => ({
            id: project.title, // Using title as unique identifier
            title: project.title,
            category: project.category,
            description: project.description || ""
        }));

        visibilityEngine = new ProjectVisibilityEngine(projectMetadata);

        renderProjects();
    } catch (error) {
        // Display a fallback message if project data fails to load
        console.error("Error loading projects:", error);
        if (projectsContainer) {
            projectsContainer.innerHTML = `
                <div class="empty-state">
                    <h3>Unable to load projects</h3>
                    <p>Please try refreshing the page</p>
                </div>
            `;
        }
    }
}

// ===============================
// Event Listeners
// ===============================

if (searchInput) {
    // Architecture: Search input now updates the visibility engine
    // The engine computes which projects should be visible
    // renderProjects() will read this state and update the DOM accordingly
    searchInput.addEventListener("input", () => {
        if (visibilityEngine) {
            visibilityEngine.setSearchQuery(searchInput.value);
        }
        currentPage = 1;
        renderProjects();
    });
}


function updateThemeIcon(theme) {
  themeIcon.className = theme === "dark" ? "ri-moon-fill" : "ri-sun-line";
}

/* =====================================================
   SCROLL TO TOP + NAVBAR SHADOW
===================================================== */
window.addEventListener("scroll", () => {
  scrollBtn?.classList.toggle("show", window.scrollY > 300);
  navbar?.classList.toggle("scrolled", window.scrollY > 50);
});


scrollBtn?.addEventListener("click", () =>
  window.scrollTo({ top: 0, behavior: "smooth" })
);

// Surprise Me Button Logic
if (surpriseBtn) {
    surpriseBtn.addEventListener("click", () => {
        if (allProjectsData.length > 0) {
            const randomIndex = Math.floor(Math.random() * allProjectsData.length);
            const randomProject = allProjectsData[randomIndex];
            // Open project link
            window.open(randomProject.link, "_self");
        }
    });
}

// Render project cards based on search text, category filter, sorting option,
// and pagination state
function renderProjects() {
    if (!projectsContainer) return;

    let filteredProjects = [...allProjectsData];

    // ===============================
    // Architecture: Use ProjectVisibilityEngine for Search Filtering
    // ===============================
    // Instead of inline search logic, we delegate to the engine
    // The engine returns IDs of visible projects based on search query
    // We then filter our data array to match these IDs
    // This enables:
    // 1. Complex search algorithms without cluttering this function
    // 2. Easy A/B testing of different search strategies
    // 3. Consistent search behavior across multiple UI components
    if (visibilityEngine) {
        const visibleProjectIds = visibilityEngine.getVisibleProjects();
        const visibleIdSet = new Set(visibleProjectIds);
        filteredProjects = filteredProjects.filter(project =>
            visibleIdSet.has(project.title)
        );
    }

    // Filter projects based on selected category
    // Note: This will be migrated to the engine in Phase 2
    if (currentCategory !== "all") {
        filteredProjects = filteredProjects.filter(
            (project) => project.category === currentCategory
        );
    }

    // Sort projects according to the selected sorting option
    // Note: This will be migrated to the engine in Phase 2
    switch (currentSort) {
        case "az":
            filteredProjects.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case "za":
            filteredProjects.sort((a, b) => b.title.localeCompare(a.title));
            break;
        case "newest":
            filteredProjects.reverse();
            break;
    }

    // Calculate pagination values and slice project list accordingly
    const totalItems = filteredProjects.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    const paginatedItems = filteredProjects.slice(start, start + itemsPerPage);

    // Display empty state message if no projects match the criteria
    projectsContainer.innerHTML = "";

    if (paginatedItems.length === 0) {
        projectsContainer.innerHTML = `
            <div class="empty-state">
              <div class = "empty-icon">📂</div>
                <h3>No projects found! </h3>
                <p>Try adjusting your search or filter criteria</p>
            </div>
        `;
        renderPagination(0);
        return;
    }

    // Render cards with stagger animation
    paginatedItems.forEach((project, index) => {
        const card = document.createElement("a");
        card.href = project.link;
        card.className = "card";
        card.setAttribute("data-category", project.category);

        // Cover style
        let coverAttr = "";
        if (project.coverClass) {
            coverAttr = `class="card-cover ${project.coverClass}"`;
        } else if (project.coverStyle) {
            coverAttr = `class="card-cover" style="${project.coverStyle}"`;
        } else {
            coverAttr = `class="card-cover"`;
        }

        // Tech stack
        const techStackHtml = project.tech.map((t) => `<span>${t}</span>`).join("");

        // Check if project is bookmarked
        const isBookmarked = window.bookmarksManager && window.bookmarksManager.isBookmarked(project.title);
        const bookmarkClass = isBookmarked ? 'bookmarked' : '';
        const bookmarkIcon = isBookmarked ? 'ri-bookmark-fill' : 'ri-bookmark-line';

        card.innerHTML = `
            <button class="bookmark-btn ${bookmarkClass}" data-project-title="${escapeHtml(project.title)}" aria-label="${isBookmarked ? 'Remove bookmark' : 'Add bookmark'}">
                <i class="${bookmarkIcon}"></i>
            </button>
            <div ${coverAttr}><i class="${project.icon}"></i></div>
            <div class="card-content">
                <div class="card-header-flex">
                    <h3 class="card-heading">${project.title}</h3>
                    <span class="category-tag">${capitalize(
            project.category
        )}</span>
                </div>
                <p class="card-description">${project.description}</p>
                <div class="card-tech">${techStackHtml}</div>
            </div>
        `;

        // Add bookmark button click handler
        const bookmarkBtn = card.querySelector('.bookmark-btn');
        bookmarkBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            handleBookmarkClick(bookmarkBtn, project);
        });

        // Stagger animation
        card.style.opacity = "0";
        card.style.transform = "translateY(20px)";
        projectsContainer.appendChild(card);

        setTimeout(() => {
            card.style.transition = "opacity 0.4s ease, transform 0.4s ease";
            card.style.opacity = "1";
            card.style.transform = "translateY(0)";
        }, index * 50);
    });


/* =====================================================
   FETCH PROJECTS
===================================================== */
async function fetchProjects() {
  try {
    const res = await fetch("./projects.json");
    const data = await res.json();
    allProjectsData = data;

    const metadata = data.map(p => ({
      id: p.title,
      title: p.title,
      category: p.category,
      description: p.description || ""
    }));

    visibilityEngine = new ProjectVisibilityEngine(metadata);
    renderProjects();
  } catch (err) {
    console.error("Failed to load projects:", err);
    projectsContainer.innerHTML = `<p>Unable to load projects.</p>`;
  }
}

/* =====================================================
   RENDER PROJECTS
===================================================== */
function renderProjects() {
  if (!projectsContainer) return;

  let filtered = [...allProjectsData];

  // Search via engine
  if (visibilityEngine) {
    const visibleIds = new Set(visibilityEngine.getVisibleProjects());
    filtered = filtered.filter(p => visibleIds.has(p.title));
  }

  // Category filter
  if (currentCategory !== "all") {
    filtered = filtered.filter(p => p.category === currentCategory);
  }

  // Sorting
  if (currentSort === "az") filtered.sort((a, b) => a.title.localeCompare(b.title));
  if (currentSort === "za") filtered.sort((a, b) => b.title.localeCompare(a.title));
  if (currentSort === "newest") filtered.reverse();

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const paginated = filtered.slice(start, start + itemsPerPage);

  projectsContainer.innerHTML = "";

  if (paginated.length === 0) {
    emptyState.style.display = "block";
    renderPagination(0);
    return;
  } else {
    emptyState.style.display = "none";
  }

  paginated.forEach(project => {
    const card = document.createElement("a");
    card.href = project.link;
    card.className = "card";
    card.dataset.category = project.category;

    card.innerHTML = `
      <div class="card-cover"><i class="${project.icon}"></i></div>
      <div class="card-content">
        <h3 class="card-heading">${escapeHtml(project.title)}</h3>
        <p class="card-description">${escapeHtml(project.description)}</p>
        <div class="card-tech">
          ${(project.tech || []).map(t => `<span>${t}</span>`).join("")}
        </div>
      </div>
    `;

    projectsContainer.appendChild(card);
  });

  renderPagination(totalPages);
}


/* =====================================================
   PAGINATION
===================================================== */

// Escape HTML to prevent XSS
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Handle bookmark button click
function handleBookmarkClick(btn, project) {
    if (!window.bookmarksManager) return;
    
    const isNowBookmarked = window.bookmarksManager.toggleBookmark(project);
    const icon = btn.querySelector('i');
    
    // Update button state
    btn.classList.toggle('bookmarked', isNowBookmarked);
    icon.className = isNowBookmarked ? 'ri-bookmark-fill' : 'ri-bookmark-line';
    btn.setAttribute('aria-label', isNowBookmarked ? 'Remove bookmark' : 'Add bookmark');
    
    // Add animation
    btn.classList.add('animate');
    setTimeout(() => btn.classList.remove('animate'), 300);
    
    // Show toast notification
    showBookmarkToast(isNowBookmarked ? 'Added to bookmarks' : 'Removed from bookmarks');
}

// Show toast notification
function showBookmarkToast(message) {
    // Remove existing toast
    const existingToast = document.querySelector('.bookmark-toast');
    if (existingToast) existingToast.remove();
    
    // Create toast
    const toast = document.createElement('div');
    toast.className = 'bookmark-toast';
    toast.innerHTML = `
        <i class="ri-bookmark-fill"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Hide and remove toast
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// ===============================
// Pagination
// ===============================


function renderPagination(totalPages) {
  paginationContainer.innerHTML = "";
  if (totalPages <= 1) return;

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.classList.toggle("active", i === currentPage);
    btn.onclick = () => {
      currentPage = i;
      renderProjects();
      scrollToProjects();
    };
    paginationContainer.appendChild(btn);
  }
}

function scrollToProjects() {
  document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
}


/* =====================================================
   FILTER / SEARCH / SORT EVENTS
===================================================== */
searchInput?.addEventListener("input", () => {
  visibilityEngine?.setSearchQuery(searchInput.value);
  currentPage = 1;
  renderProjects();
});

// ===============================
// Init
// ===============================

updateCategoryCounts();


sortSelect?.addEventListener("change", () => {
  currentSort = sortSelect.value;
  currentPage = 1;
  renderProjects();
});

filterBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    filterBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentCategory = btn.dataset.filter;
    currentPage = 1;
    renderProjects();
  });
});

clearBtn?.addEventListener("click", () => {
  searchInput.value = "";
  sortSelect.value = "default";
  currentCategory = "all";
  currentPage = 1;
  visibilityEngine?.setSearchQuery("");
  renderProjects();
});

surpriseBtn?.addEventListener("click", () => {
  if (!allProjectsData.length) return;
  const random = allProjectsData[Math.floor(Math.random() * allProjectsData.length)];
  window.location.href = random.link;
});

/* =====================================================
   CONTRIBUTORS
===================================================== */
async function fetchContributors() {

  if (!contributorsGrid) return;
  try {
    const res = await fetch(
      "https://api.github.com/repos/YadavAkhileshh/OpenPlayground/contributors"
    );
    const contributors = await res.json();

    contributorsGrid.innerHTML = "";
    contributors.forEach(c => {
      const card = document.createElement("a");
      card.href = c.html_url;
      card.target = "_blank";
      card.className = "contributor-card";
      card.innerHTML = `
        <img src="${c.avatar_url}" alt="${c.login}" loading="lazy">
        <span>${c.login}</span>
      `;
      contributorsGrid.appendChild(card);
    });
  } catch (err) {
    console.error("Failed to fetch contributors:", err);
  }

    if (!contributorsGrid) return;

    try {
        const response = await fetch(
            "https://api.github.com/repos/YadavAkhileshh/OpenPlayground/contributors"
        );

        if (!response.ok) {
            throw new Error("Failed to fetch contributors");
        }

        const contributors = await response.json();

        // Update contributor count in hero
        const contributorCount = document.getElementById("contributor-count");
        if (contributorCount) {
            contributorCount.textContent = `${contributors.length}+`;
        }

        contributorsGrid.innerHTML = "";

        contributors.forEach((contributor, index) => {
            const card = document.createElement("div");
            card.className = "contributor-card";

            // Determine if this is a developer (>50 contributions)
            const isDeveloper = contributor.contributions > 50;
            const badgeHTML = isDeveloper
                ? `<span class="contributor-badge developer-badge"><i class="ri-code-s-slash-line"></i> Developer</span>`
                : '';

            card.innerHTML = `
                <img src="${contributor.avatar_url}" alt="${contributor.login}" class="contributor-avatar" loading="lazy">
                <div class="contributor-info">
                    <h3 class="contributor-name">${contributor.login}</h3>
                    <div class="contributor-stats">
                        <span class="contributor-contributions">
                            <i class="ri-git-commit-line"></i> ${contributor.contributions} contributions
                        </span>
                        ${badgeHTML}
                    </div>
                </div>
                <a href="${contributor.html_url}" target="_blank" rel="noopener noreferrer" class="contributor-github-link" aria-label="View ${contributor.login} on GitHub">
                    <i class="ri-github-fill"></i>
                </a>
            `;

            // Stagger animation
            card.style.opacity = "0";
            card.style.transform = "translateY(20px)";
            contributorsGrid.appendChild(card);

            setTimeout(() => {
                card.style.transition = "opacity 0.4s ease, transform 0.4s ease";
                card.style.opacity = "1";
                card.style.transform = "translateY(0)";
            }, index * 30);
        });
    } catch (error) {
        // Show fallback message if contributors cannot be loaded
        console.error("Error fetching contributors:", error);
        contributorsGrid.innerHTML = `
            <div class="loading-msg">
                Unable to load contributors. 
                <a href="https://github.com/YadavAkhileshh/OpenPlayground/graphs/contributors" 
                   target="_blank" 
                   style="color: var(--primary-500); text-decoration: underline;">
                   View on GitHub
                </a>
            </div>
        `;
    }

}

/* =====================================================
   UTILS
===================================================== */
function escapeHtml(str = "") {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/* =====================================================
   INIT
===================================================== */
document.addEventListener("DOMContentLoaded", () => {
  fetchProjects();
  fetchContributors();
});



// ===============================
// Initialize
// ===============================

// Wait for all components to be loaded before initializing
// The components.js dispatches a 'componentLoaded' event when each component is loaded
let componentsLoaded = 0;
const totalComponents = 6; // header, hero, projects, contribute, footer, chatbot

document.addEventListener('componentLoaded', (e) => {
    componentsLoaded++;
    console.log(`✅ Component loaded: ${e.detail.component} (${componentsLoaded}/${totalComponents})`);

    // Once all components are loaded, initialize the app
    if (componentsLoaded === totalComponents) {
        console.log('🎉 All components loaded! Initializing app...');
        initializeApp();
    }
});

// Also add a fallback timeout in case event doesn't fire
setTimeout(() => {
    if (componentsLoaded < totalComponents) {
        console.log('⏰ Timeout reached, initializing app anyway...');
        initializeApp();
    }
}, 3000);

function initializeApp() {
    // Initialize project data
    fetchProjects();

    console.log('🚀 OpenPlayground app initialized!');
}

// Console message

console.log(
  "%c🚀 Want to contribute? https://github.com/YadavAkhileshh/OpenPlayground",
  "color:#6366f1;font-size:14px;font-weight:bold"
);



feat / your - feature
// ================= CATEGORY FILTERING FOR PROJECTS =================
document.addEventListener("DOMContentLoaded", () => {
    const filterButtons = document.querySelectorAll(".filter-btn");
    const projectCards = document.querySelectorAll(".projects-container .card");
    const emptyState = document.getElementById("empty-state");

    filterButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            // Active button UI
            filterButtons.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");

            const selectedCategory = btn.dataset.filter;
            let visibleCount = 0;

            projectCards.forEach((card) => {
                const cardCategory = card.dataset.category;

                if (
                    selectedCategory === "all" ||
                    cardCategory === selectedCategory
                ) {
                    card.style.display = "block";
                    visibleCount++;
                } else {
                    card.style.display = "none";
                }
            });

            // Empty state handling
            if (emptyState) {
                emptyState.style.display = visibleCount === 0 ? "block" : "none";
            }
        });
    });
});


// --- 1. Navbar Scroll Logic ---
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// --- 2. Fade Up Animation Trigger ---
document.addEventListener('DOMContentLoaded', () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-up').forEach(el => {
        observer.observe(el);
    });
});

