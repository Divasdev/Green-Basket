// DOM Elements
const timerDays = document.querySelector(".timer-days");
const timerHours = document.querySelector(".timer-hours");
const timerMins = document.querySelector(".timer-minutes");
const timerSecs = document.querySelector(".timer-seconds");
const futureDateElement = document.getElementById("promo-timer");
const cartBadge = document.querySelector(".cart-badge");
const addProducts = document.querySelectorAll(".product-addtocart");
const wishlistButtons = document.querySelectorAll(".wishlist-btn");
const searchInput = document.querySelector(".search-input");
const recentDropdown = document.querySelector(".recent-list");

/* =========================================
   1. COUNTDOWN TIMER LOGIC
   ========================================= */
function initTimer() {
  if (!futureDateElement) return; // Guard clause if timer not on page

  const endTime = new Date(futureDateElement.dataset.endsAt).getTime();

  function updateTimer() {
    const now = Date.now();
    const remaining = endTime - now;

    if (remaining <= 0) {
      if (timerDays) timerDays.textContent = "00";
      if (timerHours) timerHours.textContent = "00";
      if (timerMins) timerMins.textContent = "00";
      if (timerSecs) timerSecs.textContent = "00";
      clearInterval(interval);
      return;
    }

    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((remaining / (1000 * 60)) % 60);
    const seconds = Math.floor((remaining / 1000) % 60);

    if (timerDays) timerDays.textContent = String(days).padStart(2, "0");
    if (timerHours) timerHours.textContent = String(hours).padStart(2, "0");
    if (timerMins) timerMins.textContent = String(minutes).padStart(2, "0");
    if (timerSecs) timerSecs.textContent = String(seconds).padStart(2, "0");
  }

  updateTimer(); // Run once immediately
  const interval = setInterval(updateTimer, 1000);
}

/* =========================================
   2. CART LOGIC (LocalStorage)
   ========================================= */
function initCart() {
  // Update badge on load
  updateCartBadge();

  addProducts.forEach((button) => {
    button.addEventListener("click", (e) => {
      const clickedButton = e.currentTarget;
      const productCard = clickedButton.closest(".product-card") || clickedButton.closest(".product-body"); // Fallback for different layouts

      if (!productCard) return;

      const productName = productCard.querySelector(".product-name")?.textContent.trim();
      const productPrice = productCard.querySelector(".product-price")?.textContent.trim();
      const productImage = productCard.querySelector(".product-image")?.src; // Grab image for "Recently Viewed" too

      if (productName && productPrice) {
        const product = {
          name: productName,
          price: productPrice,
          image: productImage || "assets/images/default-product.png"
        };

        // Save to Cart
        addToLocalStorage("cart", product);

        // Update Badge
        updateCartBadge();

        // Visual Feedback
        const originalText = clickedButton.innerHTML;
        clickedButton.textContent = "Added!";
        clickedButton.classList.add("added-feedback");
        setTimeout(() => {
          clickedButton.innerHTML = originalText;
          clickedButton.classList.remove("added-feedback");
        }, 2000);

        // Also add to recently viewed since user showed interest
        addToRecentlyViewed(product);
      }
    });
  });
}

function updateCartBadge() {
  if (!cartBadge) return;
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  cartBadge.textContent = cart.length;
}

/* =========================================
   3. WISHLIST TOGGLE LOGIC
   ========================================= */
function initWishlist() {
  // Load saved wishlist state
  const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

  wishlistButtons.forEach((btn) => {
    const productCard = btn.closest(".product-card");
    const productName = productCard?.querySelector(".product-name")?.textContent.trim();

    // Set initial state
    if (wishlist.some(item => item.name === productName)) {
      btn.classList.add("active");
      // Optional: Change icon source if you have a filled heart icon
      // btn.querySelector("img").src = "assets/images/heart-filled.png";
    }

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const card = btn.closest(".product-card");
      const name = card.querySelector(".product-name")?.textContent.trim();
      const price = card.querySelector(".product-price")?.textContent.trim();
      const image = card.querySelector(".product-image")?.src;

      if (!name) return;

      const item = { name, price, image };

      // Toggle logic
      const currentWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
      const exists = currentWishlist.find(i => i.name === name);

      if (exists) {
        // Remove
        const updatedWishlist = currentWishlist.filter(i => i.name !== name);
        localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
        btn.classList.remove("active");
      } else {
        // Add
        currentWishlist.push(item);
        localStorage.setItem("wishlist", JSON.stringify(currentWishlist));
        btn.classList.add("active");
      }
    });
  });
}

/* =========================================
   4. SEARCH REDIRECTION
   ========================================= */
function initSearch() {
  if (!searchInput) return;

  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const query = searchInput.value.trim();
      if (query) {
        // Redirect to shop page with query parameter
        // In a real app, shop.html would need JS to parse this '?search=' param
        window.location.href = `shop.html?search=${encodeURIComponent(query)}`;
      }
    }
  });
}

/* =========================================
   5. RECENTLY VIEWED LOGIC
   ========================================= */
function initRecentlyViewed() {
  renderRecentlyViewed();

  // Add click listeners to product images to track views
  const productImages = document.querySelectorAll(".product-image");
  productImages.forEach(img => {
    img.addEventListener("click", (e) => {
      const card = img.closest(".product-card");
      if (card) {
        const product = {
          name: card.querySelector(".product-name")?.textContent.trim(),
          price: card.querySelector(".product-price")?.textContent.trim(),
          image: img.src
        };
        addToRecentlyViewed(product);
      }
    });
  });
}

function addToRecentlyViewed(product) {
  let recent = JSON.parse(localStorage.getItem("recentlyViewed")) || [];

  // Remove duplicates (move to top)
  recent = recent.filter(p => p.name !== product.name);

  // Add new to start
  recent.unshift(product);

  // Limit to 5 items
  if (recent.length > 5) recent.pop();

  localStorage.setItem("recentlyViewed", JSON.stringify(recent));
  renderRecentlyViewed();
}

function renderRecentlyViewed() {
  if (!recentDropdown) return;

  const recent = JSON.parse(localStorage.getItem("recentlyViewed")) || [];

  if (recent.length === 0) {
    recentDropdown.innerHTML = '<li style="padding:10px; font-size:13px; color:#666;">No recent items</li>';
    return;
  }

  recentDropdown.innerHTML = recent.map(item => `
    <li class="recent-item">
       <img src="${item.image}" alt="${item.name}" class="recent-thumb">
       <div class="recent-meta">
          <strong>${item.name}</strong>
          <span class="price">${item.price}</span>
       </div>
    </li>
  `).join("");
}

/* =========================================
   HELPER FUNCTIONS
   ========================================= */
function addToLocalStorage(key, data) {
  const current = JSON.parse(localStorage.getItem(key)) || [];
  current.push(data);
  localStorage.setItem(key, JSON.stringify(current));
}

// Initialize all features
document.addEventListener("DOMContentLoaded", () => {
  initTimer();
  initCart();
  initWishlist();
  initSearch();
  initRecentlyViewed();
  initTestimonials();
  initRatingPopup();

  // Back to Top Logic
  const backToTopBtn = document.getElementById("backToTop");
  if (backToTopBtn) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 300) {
        backToTopBtn.classList.add("show");
      } else {
        backToTopBtn.classList.remove("show");
      }
    });
    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  }
});

/* =========================================
   6. TESTIMONIALS AUTO-PLAY
   ========================================= */
function initTestimonials() {
  const avatars = document.querySelectorAll(".avatar-img");
  const testimonials = [
    {
      text: "“I love browsing the fresh vegetables section! The layout is so clean and easy to navigate on my phone. The 20% discount on first order was a sweet bonus.”",
      name: "Sarah Jenkins",
      role: "Verified Buyer"
    },
    {
      text: "“The weekly deals are a lifesaver. I check the homepage every Monday. Delivery is super fast, and the fruits are always fresh.”",
      name: "Michael Chen",
      role: "Loyal Customer"
    },
    {
      text: "“Finally a grocery app that doesn't feel cluttered. Found my favorite organic milk in seconds. The wishlist feature is super handy!”",
      name: "Emma Watson",
      role: "Health Enthusiast"
    }
  ];

  const textEl = document.querySelector(".testimonial-text");
  const nameEl = document.querySelector(".author-name");
  const roleEl = document.querySelector(".author-role");

  if (!textEl || !nameEl) return;

  let currentIndex = 0;

  // Auto-rotate every 5 seconds
  setInterval(() => {
    currentIndex = (currentIndex + 1) % testimonials.length;
    updateTestimonial(currentIndex);
  }, 5000);

  function updateTestimonial(index) {
    // Fade out
    textEl.style.opacity = 0;
    nameEl.style.opacity = 0;

    setTimeout(() => {
      const t = testimonials[index];
      textEl.textContent = t.text;
      nameEl.textContent = t.name;
      if (roleEl) roleEl.textContent = t.role;

      // Update avatars (simple visual shift simulation)
      avatars.forEach(img => img.classList.remove("avatar-center"));
      avatars[2].classList.add("avatar-center"); // Keep center valid

      // Fade in
      textEl.style.opacity = 1;
      nameEl.style.opacity = 1;
    }, 300);
  }
}




/* =========================================
   7. Dynamic Product Render LOGIC
   ========================================= */


 async function renderProduct(){
   const grid = document.getElementById("productGrid")
   if(!grid) return
   
   try{
     const response = await fetch("assets/data/products.json")
     const products = await response.json()
      
     if (!response.ok){
      throw new Error(`HTTP error! Status :${response.status}`)
     }
     console.log(products);
      
    } catch (error){
      console.log("products not fetched", error)
    }
 
  }   

  renderProduct()






