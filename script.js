document.addEventListener("DOMContentLoaded", () => {
  initMobileMenu();
  initSmoothScroll();
  initMouseParallax();
  initSectionObserver();
  initMediaGalleries();
  initHorizontalScrollRows();
  initLightboxModal();
  initDynamicGalleryBox();
});

/**
 * Mobile Navigation Handling
 */
function initMobileMenu() {
  const toggle = document.querySelector(".mobile-toggle");
  const menu = document.querySelector(".mobile-menu");

  if (!toggle || !menu) return;

  const toggleMenu = (isOpen) => {
    const active = isOpen ?? !menu.classList.contains("open");
    menu.classList.toggle("open", active);
    toggle.setAttribute("aria-expanded", String(active));
    menu.setAttribute("aria-hidden", String(!active));
  };

  toggle.addEventListener("click", () => toggleMenu());

  menu.addEventListener("click", (e) => {
    if (e.target.closest(".mobile-link")) {
      toggleMenu(false);
    }
  });
}

/**
 * Custom Easing Animation Function for Ultra-Smooth Scrolling
 */
function smoothScrollTo(targetPosition, duration = 1000) {
  const startPosition = window.pageYOffset || document.documentElement.scrollTop;
  const distance = targetPosition - startPosition;
  let startTime = null;

  // Cubic Ease-In-Out timing function for a buttery smooth glide
  function easeInOutCubic(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return (c / 2) * t * t * t + b;
    t -= 2;
    return (c / 2) * (t * t * t + 2) + b;
  }

  function animation(currentTime) {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const run = easeInOutCubic(timeElapsed, startPosition, distance, duration);
    
    window.scrollTo(0, run);

    if (timeElapsed < duration) {
      requestAnimationFrame(animation);
    } else {
      window.scrollTo(0, targetPosition);
    }
  }

  requestAnimationFrame(animation);
}

/**
 * Navigation Smooth Scrolling & Hash Handling
 */
function initSmoothScroll() {
  document.addEventListener("click", (e) => {
    const link = e.target.closest(".desktop-nav a, .mobile-nav a");
    if (!link) return;

    const href = link.getAttribute("href");
    if (!href) return;

    const hashIndex = href.indexOf("#");
    if (hashIndex !== -1) {
      const hash = href.substring(hashIndex);
      if (hash.length > 1) {
        const target = document.querySelector(hash);
        if (target) {
          e.preventDefault();
          const navbar = document.querySelector(".navbar");
          const navHeight = navbar ? navbar.offsetHeight : 60;
          const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;

          // 1000ms duration for a refined, smooth glide
          smoothScrollTo(targetPosition, 1000);
        }
      }
    }
  });
}

/**
 * Mouse Parallax Logic
 */
function initMouseParallax() {
  const hero = document.querySelector(".hero");
  const layers = document.querySelectorAll(".parallax-layer");

  if (!hero || !layers.length) return;

  let ticking = false;
  let mouseX = 0;
  let mouseY = 0;

  const updateParallax = () => {
    const xNorm = mouseX / window.innerWidth - 0.5;
    const yNorm = mouseY / window.innerHeight - 0.5;

    layers.forEach((layer) => {
      const speed = parseFloat(layer.dataset.speed) || 20;
      const moveX = xNorm * speed;
      const moveY = yNorm * speed;
      layer.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
    });

    ticking = false;
  };

  hero.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  });

  hero.addEventListener("mouseleave", () => {
    layers.forEach((layer) => {
      layer.style.transform = "translate3d(0px, 0px, 0)";
    });
  });
}

/**
 * Scroll Observer
 */
function initSectionObserver() {
  const sections = document.querySelectorAll(".full-page-section");
  if (!sections.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("active", entry.isIntersecting);
      });
    },
    { threshold: 0.35 }
  );

  sections.forEach((section) => observer.observe(section));
}

/**
 * In-Page Media Gallery Slider with Auto-Play Cycling
 */
function initMediaGalleries() {
  const galleries = document.querySelectorAll(".cs-media");

  galleries.forEach((gallery) => {
    if (
      gallery.classList.contains("newsletters-grid") ||
      gallery.classList.contains("branding-grid")
    ) {
      return;
    }

    const directMedia = gallery.querySelectorAll(":scope > img, :scope > video");
    directMedia.forEach((el) => {
      const wrapper = document.createElement("div");
      wrapper.className = "slide";
      el.parentNode.insertBefore(wrapper, el);
      wrapper.appendChild(el);
    });

    const slides = gallery.querySelectorAll(".slide");
    if (slides.length === 0) return;

    if (!gallery.querySelector(".slide.active")) {
      slides[0].classList.add("active");
    }

    if (slides.length <= 1) return;

    gallery.querySelectorAll(".gallery-arrow, .gallery-dots").forEach((el) => el.remove());

    const prevBtn = document.createElement("button");
    prevBtn.className = "gallery-arrow prev";
    prevBtn.innerHTML = "&#10094;";
    prevBtn.setAttribute("aria-label", "Previous media");

    const nextBtn = document.createElement("button");
    nextBtn.className = "gallery-arrow next";
    nextBtn.innerHTML = "&#10095;";
    nextBtn.setAttribute("aria-label", "Next media");

    const dotsContainer = document.createElement("div");
    dotsContainer.className = "gallery-dots";

    slides.forEach((_, index) => {
      const dot = document.createElement("span");
      dot.className = `dot ${slides[index].classList.contains("active") ? "active" : ""}`;
      dotsContainer.appendChild(dot);
    });

    gallery.appendChild(prevBtn);
    gallery.appendChild(nextBtn);
    gallery.appendChild(dotsContainer);

    let currentIndex = Array.from(slides).findIndex((s) => s.classList.contains("active"));
    if (currentIndex === -1) currentIndex = 0;

    const updateGallery = (newIndex) => {
      slides[currentIndex].classList.remove("active");
      if (dotsContainer.children[currentIndex]) {
        dotsContainer.children[currentIndex].classList.remove("active");
      }

      const currentVideo = slides[currentIndex].querySelector("video");
      if (currentVideo) currentVideo.pause();

      currentIndex = (newIndex + slides.length) % slides.length;

      slides[currentIndex].classList.add("active");
      if (dotsContainer.children[currentIndex]) {
        dotsContainer.children[currentIndex].classList.add("active");
      }

      const newVideo = slides[currentIndex].querySelector("video");
      if (newVideo) newVideo.play().catch(() => {});
    };

    let autoSlideInterval = null;

    const startAutoSlide = () => {
      // NEW: Stop the automatic slider if the page title contains "Megawatt"
      if (document.title.includes("Megawatt")) {
          return; 
      }

      stopAutoSlide();
      autoSlideInterval = setInterval(() => {
        const modal = document.getElementById("image-modal");
        if (!modal || !modal.classList.contains("open")) {
          updateGallery(currentIndex + 1);
        }
      }, 3500);
    };

    const stopAutoSlide = () => {
      if (autoSlideInterval) clearInterval(autoSlideInterval);
    };

    prevBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      updateGallery(currentIndex - 1);
      startAutoSlide();
    });

    nextBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      updateGallery(currentIndex + 1);
      startAutoSlide();
    });

    gallery.addEventListener("mouseenter", stopAutoSlide);
    gallery.addEventListener("mouseleave", startAutoSlide);

    startAutoSlide();
  });
}

/**
 * Horizontal Single Row Scroll Controller
 */
function initHorizontalScrollRows() {
  const grids = document.querySelectorAll(".branding-grid");

  grids.forEach((grid) => {
    let wrapper = grid.closest(".horizontal-scroll-wrapper");
    if (!wrapper) {
      wrapper = document.createElement("div");
      wrapper.className = "horizontal-scroll-wrapper";
      grid.parentNode.insertBefore(wrapper, grid);
      wrapper.appendChild(grid);
    }

    wrapper.querySelectorAll(".row-scroll-btn").forEach((el) => el.remove());

    const prevBtn = document.createElement("button");
    prevBtn.className = "row-scroll-btn prev";
    prevBtn.innerHTML = "&#10094;";
    prevBtn.setAttribute("aria-label", "Scroll left");

    const nextBtn = document.createElement("button");
    nextBtn.className = "row-scroll-btn next";
    nextBtn.innerHTML = "&#10095;";
    nextBtn.setAttribute("aria-label", "Scroll right");

    wrapper.appendChild(prevBtn);
    wrapper.appendChild(nextBtn);

    const updateArrowVisibility = () => {
      const hasOverflow = grid.scrollWidth > grid.clientWidth + 5;
      prevBtn.style.display = hasOverflow && grid.scrollLeft > 10 ? "flex" : "none";
      nextBtn.style.display =
        hasOverflow && grid.scrollLeft < grid.scrollWidth - grid.clientWidth - 10
          ? "flex"
          : "none";
    };

    prevBtn.addEventListener("click", () => {
      grid.scrollBy({ left: -450, behavior: "smooth" });
    });

    nextBtn.addEventListener("click", () => {
      grid.scrollBy({ left: 450, behavior: "smooth" });
    });

    grid.addEventListener("scroll", updateArrowVisibility);
    window.addEventListener("resize", updateArrowVisibility);
    setTimeout(updateArrowVisibility, 300);
  });
}

/**
 * Fullscreen Lightbox Modal
 */
let currentModalGallery = null;
let currentModalSlideIndex = 0;

function initLightboxModal() {
  const modal = document.getElementById("image-modal");
  const modalMediaContainer = document.getElementById("modal-media-container");
  const modalCaption = document.getElementById("modal-caption");
  const closeModal = document.querySelector(".modal-close");
  const modalPrev = document.querySelector(".modal-arrow.prev");
  const modalNext = document.querySelector(".modal-arrow.next");

  if (!modal) return;

  document.addEventListener("click", (e) => {
    const clickedAsset = e.target.closest(".cs-media img, .cs-media video");
    if (!clickedAsset) return;

    const gallery = clickedAsset.closest(".cs-media");
    const slides = gallery.querySelectorAll(".slide");

    currentModalGallery = gallery;

    const slide = clickedAsset.closest(".slide");
    if (slide) {
      currentModalSlideIndex = Array.from(slides).indexOf(slide);
    } else {
      currentModalSlideIndex = 0;
    }

    openModal();
  });

  function openModal() {
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
    renderModalContent();
  }

  function renderModalContent() {
    if (!currentModalGallery || !modalMediaContainer) return;

    const slides = currentModalGallery.querySelectorAll(".slide");
    if (!slides.length) return;

    const activeSlide = slides[currentModalSlideIndex];
    const asset = activeSlide.querySelector("img, video");

    modalMediaContainer.innerHTML = "";

    if (asset.tagName.toLowerCase() === "img") {
      const img = document.createElement("img");
      img.src = asset.src;
      img.alt = asset.alt || "Fullscreen view";
      img.className = "modal-content";
      modalMediaContainer.appendChild(img);
    } else if (asset.tagName.toLowerCase() === "video") {
      const video = document.createElement("video");
      video.src = asset.src;
      video.autoplay = true;
      video.loop = true;
      video.muted = false;
      video.playsInline = true;
      video.controls = true;
      video.className = "modal-content";
      modalMediaContainer.appendChild(video);
      video.play().catch(() => {
        video.muted = true;
        video.play();
      });
    }

    const captionText = asset.getAttribute("data-caption") || "";
    if (modalCaption) {
      modalCaption.textContent = captionText;
      modalCaption.style.display = captionText ? "block" : "none";
    }

    const hasMultiple = slides.length > 1;
    if (modalPrev) modalPrev.style.display = hasMultiple ? "flex" : "none";
    if (modalNext) modalNext.style.display = hasMultiple ? "flex" : "none";
  }

  function navigateModal(direction) {
    if (!currentModalGallery) return;
    const slides = currentModalGallery.querySelectorAll(".slide");
    if (slides.length <= 1) return;

    currentModalSlideIndex = (currentModalSlideIndex + direction + slides.length) % slides.length;
    renderModalContent();
  }

  if (modalPrev) {
    modalPrev.addEventListener("click", (e) => {
      e.stopPropagation();
      navigateModal(-1);
    });
  }

  if (modalNext) {
    modalNext.addEventListener("click", (e) => {
      e.stopPropagation();
      navigateModal(1);
    });
  }

  const handleClose = () => {
    modal.classList.remove("open");
    document.body.style.overflow = "";
    if (modalMediaContainer) modalMediaContainer.innerHTML = "";
  };

  modal.addEventListener("click", (e) => {
    if (e.target === modal || e.target === closeModal) {
      handleClose();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (!modal.classList.contains("open")) return;

    if (e.key === "Escape") handleClose();
    if (e.key === "ArrowLeft") navigateModal(-1);
    if (e.key === "ArrowRight") navigateModal(1);
  });
}

/**
 * Dynamically Morph Gallery Box based on Media Orientation (Megawatt Page Only)
 */
function initDynamicGalleryBox() {
  // 1. Only run on the Megawatt page
  if (!document.title.includes("Megawatt")) return;

  // 2. Inject CSS to animate the box reshaping and ensure images cover the new shape perfectly
  const style = document.createElement('style');
  style.innerHTML = `
    .cs-media {
      transition: max-width 0.4s cubic-bezier(0.25, 1, 0.5, 1), height 0.4s cubic-bezier(0.25, 1, 0.5, 1) !important;
      margin: 0 auto;
    }
    .cs-media .slide img, .cs-media .slide video {
      object-fit: cover !important; 
    }
  `;
  document.head.appendChild(style);

  const galleries = document.querySelectorAll('.cs-media');

  galleries.forEach(gallery => {
    // Skip your specialized horizontal grids
    if (gallery.classList.contains('newsletters-grid') || gallery.classList.contains('branding-grid')) return;

    // Function to check the active slide and reshape the box
    const checkActiveSlide = () => {
      const activeSlide = gallery.querySelector('.slide.active');
      if (!activeSlide) return;

      const media = activeSlide.querySelector('img, video');
      if (!media) return;

      const updateShape = () => {
        const isVideo = media.tagName.toLowerCase() === 'video';
        const width = isVideo ? media.videoWidth : media.naturalWidth;
        const height = isVideo ? media.videoHeight : media.naturalHeight;

        // If the image is taller than it is wide (Portrait)
        if (height > width) {
          gallery.style.maxWidth = '360px'; // New Portrait width
          gallery.style.height = '500px';   // New Portrait height
        } else {
          // Default Landscape Shape
          gallery.style.maxWidth = '100%';
          gallery.style.height = '400px';
        }
      };

      // Run immediately if the image is loaded, otherwise wait for it to load
      if (media.complete || (isVideo && media.readyState >= 1)) {
        updateShape();
      } else {
        media.addEventListener('load', updateShape, { once: true });
        media.addEventListener('loadedmetadata', updateShape, { once: true });
      }
    };

    // Run on initial page load
    checkActiveSlide();

    // Set up a watcher: When the slider changes images, check the shape again!
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class' && mutation.target.classList.contains('active')) {
          checkActiveSlide();
        }
      });
    });

    const slides = gallery.querySelectorAll('.slide');
    slides.forEach(slide => observer.observe(slide, { attributes: true }));
  });
}

document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);

  /* ==========================================
     1. PHOTO & POSTER FAN SCATTER ON SCROLL
     ========================================== */
  const scatterTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: 1.2, // Smooth scrub catch-up
      invalidateOnRefresh: true,
    }
  });

  // Left Fan Scatter Physics (Explode outwards to the left/down)
  scatterTimeline.to(".photo-1", { x: -160, y: 90, rotation: -28, opacity: 0, ease: "power1.out" }, 0)
                 .to(".photo-2", { x: -110, y: 50, rotation: -16, opacity: 0, ease: "power1.out" }, 0)
                 .to(".photo-3", { x: -60,  y: 130, rotation: 12,  opacity: 0, ease: "power1.out" }, 0)
                 .to(".photo-4", { x: -180, y: 150, rotation: -22, opacity: 0, ease: "power1.out" }, 0)
                 .to(".photo-5", { x: -30,  y: 170, rotation: 18,  opacity: 0, ease: "power1.out" }, 0);

  // Right Fan Scatter Physics (Explode outwards to the right/down)
  scatterTimeline.to(".poster-1", { x: 90,  y: 120, rotation: -22, opacity: 0, ease: "power1.out" }, 0)
                 .to(".poster-2", { x: 160, y: 70,  rotation: 18,  opacity: 0, ease: "power1.out" }, 0)
                 .to(".poster-3", { x: 220, y: 140, rotation: 30,  opacity: 0, ease: "power1.out" }, 0);


  /* ==========================================
     2. FLOATING BADGE DRIFT & CURSOR REPEL
     ========================================== */
  const icons = document.querySelectorAll(".software-cluster .icon");

  // Continuous ambient floating drift
  icons.forEach((icon, i) => {
    gsap.to(icon, {
      y: `+=${8 + (i % 3) * 4}`,
      x: `+=${(i % 2 === 0 ? 1 : -1) * 6}`,
      rotation: `+=${(i % 2 === 0 ? 3 : -3)}`,
      duration: 2.5 + i * 0.4,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
  });

  // Interactive Cursor Repel on Hover/Proximity
  const cluster = document.querySelector(".software-cluster");

  if (cluster) {
    cluster.addEventListener("mousemove", (e) => {
      const rect = cluster.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      icons.forEach((icon) => {
        const iconX = icon.offsetLeft + icon.offsetWidth / 2;
        const iconY = icon.offsetTop + icon.offsetHeight / 2;

        const deltaX = mouseX - iconX;
        const deltaY = mouseY - iconY;
        const distance = Math.hypot(deltaX, deltaY);
        const maxDistance = 140; // Proximity threshold

        if (distance < maxDistance) {
          const force = (maxDistance - distance) / maxDistance;
          const repelX = -(deltaX / distance) * force * 35;
          const repelY = -(deltaY / distance) * force * 35;

          gsap.to(icon, {
            x: repelX,
            y: repelY,
            scale: 1.15,
            duration: 0.3,
            ease: "power2.out",
            overwrite: "auto"
          });
        }
      });
    });

    cluster.addEventListener("mouseleave", () => {
      icons.forEach((icon) => {
        gsap.to(icon, {
          x: 0,
          y: 0,
          scale: 1,
          duration: 0.6,
          ease: "elastic.out(1, 0.4)",
          overwrite: "auto"
        });
      });
    });
  }
});

/* ==========================================
   3. TYPEWRITER EFFECT & ARROW POP-IN
   ========================================== */
const targetWord = "through";
const typewriterEl = document.getElementById("typewriter-target");
const cursorEl = document.querySelector(".typing-cursor");
const arrowImg = document.querySelector(".typewriter-arrow-img");

if (typewriterEl) {
  // Set initial position and rotation in GSAP
  if (arrowImg) {
    gsap.set(arrowImg, {
      xPercent: -50,
      rotation: 140, // Match your desired East-facing rotation
      opacity: 0,
      y: 0
    });
  }

  const introTimeline = gsap.timeline({ delay: 0.4 });

  // 1. Snappy character typing (0.13s per letter)
  targetWord.split("").forEach((char) => {
    introTimeline.to({}, {
      duration: 0.13,
      onComplete: () => {
        typewriterEl.textContent += char;
      }
    });
  });

  // 2. Hide cursor, then pop in the arrow above
  introTimeline
    .to(cursorEl, { 
      opacity: 0, 
      duration: 0.2, 
      onComplete: () => cursorEl.classList.add("hide") 
    })
    .to(arrowImg, {
      opacity: 1,
      y: 0, // Lands softly above the text
      duration: 0.5,
      ease: "power2.out"
    }, "+=0.1");
}

/* ==========================================
   4. STACKED CARD DEPTH & SCALE SCRUB
   ========================================== */
const sections = gsap.utils.toArray(".full-page-section");

sections.forEach((section, index) => {
  // Apply depth-scaling to every section except the very last one
  if (index < sections.length - 1) {
    gsap.to(section, {
      scale: 0.9,
      opacity: 0.5,
      filter: "blur(2px)",
      ease: "none",
      scrollTrigger: {
        trigger: sections[index + 1],
        start: "top bottom", // Starts when the next section enters from the bottom
        end: "top top",      // Finishes when the next section reaches the top
        scrub: true,
      }
    });
  }
});