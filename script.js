// Configuration
const config = {
  substackRSS: "https://darioprazeres.substack.com/feed",
  devtoUsername: "darioprazeres",
  // Using multiple proxy options for better reliability
  proxyUrls: [
    "https://api.codetabs.com/v1/proxy?quest=",
    "https://corsproxy.io/?",
    "https://api.allorigins.win/raw?url=",
  ],
  devtoAPI: "https://dev.to/api/articles?username=",
};

const LoadCurrentDate = () => {
  var dateElement = document.querySelector("span.date-footer");
  var valueDate = new Date();
  dateElement.textContent = valueDate.getFullYear();
  console.log(valueDate.getFullYear());
};

// Utility Functions
const truncateText = (text, maxLength) => {
  const cleanText = text.replace(/<[^>]*>/g, "");
  return cleanText.length > maxLength
    ? cleanText.substring(0, maxLength) + "..."
    : cleanText;
};

const formatDate = (dateString) => {
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString("en-US", options);
};

const getRandomGradient = () => {
  const gradients = [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
  ];
  return gradients[Math.floor(Math.random() * gradients.length)];
};

const getInitials = (title) => {
  const words = title.split(" ");
  return words.length > 1
    ? words[0][0] + words[1][0]
    : words[0].substring(0, 2);
};

// Create Post Card
const createPostCard = (post) => {
  const card = document.createElement("div");
  card.className = "post-card";

  const gradient = getRandomGradient();
  const initials = getInitials(post.title);

  card.innerHTML = `
        <div class="post-image" style="background: ${gradient}">
            ${initials.toUpperCase()}
        </div>
        <div class="post-content">
            <h3>${post.title}</h3>
            <p>${truncateText(post.description, 120)}</p>
            <a href="${
              post.link
            }" target="_blank" class="read-more">Read More</a>
        </div>
    `;

  return card;
};

// Load Substack Posts with multiple proxy fallback
const loadSubstackPosts = async () => {
  const container = document.getElementById("substackPosts");

  try {
    container.innerHTML = '<div class="loading">Loading posts...</div>';

    let data = null;
    let lastError = null;

    // Try each proxy until one works
    for (const proxyUrl of config.proxyUrls) {
      try {
        const response = await fetch(
          proxyUrl + encodeURIComponent(config.substackRSS),
          {
            method: "GET",
            headers: {
              Accept: "application/xml, text/xml, */*",
            },
          }
        );

        if (response.ok) {
          const text = await response.text();
          data = text;
          break;
        }
      } catch (err) {
        lastError = err;
        console.log(`Proxy ${proxyUrl} failed, trying next...`);
        continue;
      }
    }

    if (!data) {
      throw lastError || new Error("All proxies failed");
    }

    const parser = new DOMParser();
    const xml = parser.parseFromString(data, "text/xml");

    // Check for parsing errors
    const parserError = xml.querySelector("parsererror");
    if (parserError) {
      throw new Error("Failed to parse RSS feed");
    }

    const items = xml.querySelectorAll("item");

    container.innerHTML = "";

    const posts = [];
    items.forEach((item, index) => {
      const post = {
        title: item.querySelector("title")?.textContent || "Untitled",
        link: item.querySelector("link")?.textContent || "#",
        description:
          item.querySelector("description")?.textContent ||
          "No description available",
        date:
          item.querySelector("pubDate")?.textContent ||
          new Date().toISOString(),
      };

      posts.push(post);

      // Create featured post from first article
      if (index === 0) {
        //createFeaturedPost(post);
      } else if (index <= 6) {
        // Display next 6 posts
        container.appendChild(createPostCard(post));
      }
    });

    if (posts.length === 0) {
      container.innerHTML =
        '<div class="loading">No posts available yet. Check back soon!</div>';
    }
  } catch (error) {
    console.error("Error loading Substack posts:", error);
    container.innerHTML = `
            <div class="loading">
                <p>Unable to load posts at the moment.</p>
                <p style="margin-top: 1rem;">
                    <a href="https://darioprazeres.substack.com" target="_blank" class="cta-button" style="font-size: 0.9rem; padding: 0.8rem 1.5rem;">
                        Visit Substack Directly
                    </a>
                </p>
            </div>
        `;
  }
};

// Load Dev.to Posts
const loadDevtoPosts = async () => {
  const container = document.getElementById("devtoPosts");

  try {
    container.innerHTML = '<div class="loading">Loading articles...</div>';

    const response = await fetch(config.devtoAPI + config.devtoUsername, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const posts = await response.json();

    container.innerHTML = "";

    posts.slice(0, 6).forEach((post) => {
      const postData = {
        title: post.title,
        link: post.url,
        description: post.description || post.title,
        date: post.published_at,
      };

      container.appendChild(createPostCard(postData));
    });

    if (posts.length === 0) {
      container.innerHTML = `
                <div class="loading">
                    <p>No articles available yet.</p>
                    <p style="margin-top: 1rem;">
                        <a href="https://dev.to/darioprazeres" target="_blank" class="cta-button" style="font-size: 0.9rem; padding: 0.8rem 1.5rem;">
                            Visit Dev.to Profile
                        </a>
                    </p>
                </div>
            `;
    }
  } catch (error) {
    console.error("Error loading Dev.to posts:", error);
    container.innerHTML = `
            <div class="loading">
                <p>Unable to load articles at the moment.</p>
                <p style="margin-top: 1rem;">
                    <a href="https://dev.to/darioprazeres" target="_blank" class="cta-button" style="font-size: 0.9rem; padding: 0.8rem 1.5rem;">
                        Visit Dev.to Profile
                    </a>
                </p>
            </div>
        `;
  }
};

// Newsletter Form Handler
const handleNewsletterSubmit = (e) => {
  e.preventDefault();

  const emailInput = e.target.querySelector('input[name="email"]');
  const email = emailInput.value.trim();

  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (emailRegex.test(email)) {
    // Open Substack subscription page
    window.open("https://darioprazeres.substack.com", "_blank");

    // Show success message
    const button = e.target.querySelector(".submit-button");
    const originalText = button.textContent;
    button.textContent = "✓ Subscribed!";
    button.style.background = "#10b981";

    setTimeout(() => {
      button.textContent = originalText;
      button.style.background = "";
      emailInput.value = "";
    }, 3000);
  } else {
    alert("Please enter a valid email address");
  }
};

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});

const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");

hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("active");
  navLinks.classList.toggle("active");
});

// Fecha o menu ao clicar em um link
document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => {
    hamburger.classList.remove("active");
    navLinks.classList.remove("active");
  });
});

// Fecha o menu ao clicar fora dele
document.addEventListener("click", (e) => {
  if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
    hamburger.classList.remove("active");
    navLinks.classList.remove("active");
  }
});

// Initialize
window.addEventListener("DOMContentLoaded", () => {
  // Load posts
  loadSubstackPosts();
  loadDevtoPosts();
  LoadCurrentDate();

  // Setup newsletter form
  const newsletterForm = document.getElementById("newsletterForm");
  newsletterForm.addEventListener("submit", handleNewsletterSubmit);

  // Add scroll effect to nav
  let lastScroll = 0;
  const nav = document.querySelector("nav");

  window.addEventListener("scroll", () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > lastScroll && currentScroll > 100) {
      nav.style.transform = "translateY(-100%)";
    } else {
      nav.style.transform = "translateY(0)";
    }

    lastScroll = currentScroll;
  });
});
