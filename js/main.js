/**
 * DXN Site - Main JavaScript
 * Swiss Grid Design with Mathematical Precision
 */

// Custom Cursor Implementation
const cursor = document.querySelector('.custom-cursor');
const follower = document.querySelector('.cursor-follower');

let mouseX = 0;
let mouseY = 0;
let followerX = 0;
let followerY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;

  cursor.style.left = mouseX + 'px';
  cursor.style.top = mouseY + 'px';
});

function animateFollower() {
  const distX = mouseX - followerX;
  const distY = mouseY - followerY;

  followerX += distX * 0.1;
  followerY += distY * 0.1;

  follower.style.left = followerX + 'px';
  follower.style.top = followerY + 'px';

  requestAnimationFrame(animateFollower);
}

animateFollower();

// Hover effects
const clickables = document.querySelectorAll('a, button, .value-card, .service-card, .industry-card');
clickables.forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.classList.add('hover');
    follower.classList.add('hover');
  });

  el.addEventListener('mouseleave', () => {
    cursor.classList.remove('hover');
    follower.classList.remove('hover');
  });
});

// Hide default cursor
document.body.style.cursor = 'none';
clickables.forEach(el => {
  el.style.cursor = 'none';
});

// Scroll-triggered animations
const observerOptions = {
  threshold: 0.15,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

document.querySelectorAll('.section').forEach(el => {
  observer.observe(el);
});

// Header scroll functionality
(function() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  function updateHeader() {
    const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;

    if (scrollY > 1) {
      if (!header.classList.contains('scrolled')) {
        header.classList.add('scrolled');
      }
    } else {
      if (header.classList.contains('scrolled')) {
        header.classList.remove('scrolled');
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateHeader);
  } else {
    updateHeader();
  }

  window.addEventListener('load', updateHeader);

  let scrollTimer;
  window.addEventListener('scroll', function() {
    if (scrollTimer) {
      window.cancelAnimationFrame(scrollTimer);
    }
    scrollTimer = window.requestAnimationFrame(updateHeader);
  }, { passive: true });

  setTimeout(updateHeader, 100);
})();

// Interactive background for services section
const servicesSection = document.querySelector('#services');
if (servicesSection) {
  servicesSection.addEventListener('mousemove', (e) => {
    const rect = servicesSection.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    servicesSection.style.setProperty('--mouse-x', `${x}%`);
    servicesSection.style.setProperty('--mouse-y', `${y}%`);
  });

  servicesSection.addEventListener('mouseleave', () => {
    servicesSection.style.setProperty('--mouse-x', '50%');
    servicesSection.style.setProperty('--mouse-y', '50%');
  });
}

/**
 * Testimonial Carousel
 * Auto-rotating carousel with manual controls
 */
(function() {
  const carousel = document.querySelector('.testimonial-carousel');
  if (!carousel) return;

  const track = carousel.querySelector('.testimonial-track');
  const slides = Array.from(carousel.querySelectorAll('.testimonial-slide'));
  const prevBtn = carousel.querySelector('.carousel-btn-prev');
  const nextBtn = carousel.querySelector('.carousel-btn-next');
  const indicators = Array.from(carousel.querySelectorAll('.indicator-dot'));

  let currentIndex = 0;
  let autoRotateInterval;
  const autoRotateDelay = 6000; // 6 seconds

  // Update carousel position and active states
  function updateCarousel(index, animate = true) {
    // Ensure index is within bounds
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;

    currentIndex = index;

    // Update slide positions with transform
    const offset = -currentIndex * 100;
    if (animate) {
      track.style.transition = 'transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)';
    } else {
      track.style.transition = 'none';
    }
    track.style.transform = `translateX(${offset}%)`;

    // Update active states
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === currentIndex);
    });

    indicators.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });
  }

  // Navigate to next slide
  function nextSlide() {
    updateCarousel(currentIndex + 1);
  }

  // Navigate to previous slide
  function prevSlide() {
    updateCarousel(currentIndex - 1);
  }

  // Navigate to specific slide
  function goToSlide(index) {
    updateCarousel(index);
  }

  // Start auto-rotation
  function startAutoRotate() {
    stopAutoRotate(); // Clear any existing interval
    autoRotateInterval = setInterval(nextSlide, autoRotateDelay);
  }

  // Stop auto-rotation
  function stopAutoRotate() {
    if (autoRotateInterval) {
      clearInterval(autoRotateInterval);
      autoRotateInterval = null;
    }
  }

  // Event listeners for navigation buttons
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prevSlide();
      stopAutoRotate();
      startAutoRotate(); // Restart timer after manual interaction
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      nextSlide();
      stopAutoRotate();
      startAutoRotate(); // Restart timer after manual interaction
    });
  }

  // Event listeners for indicator dots
  indicators.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      goToSlide(index);
      stopAutoRotate();
      startAutoRotate(); // Restart timer after manual interaction
    });
  });

  // Pause auto-rotation on hover
  carousel.addEventListener('mouseenter', stopAutoRotate);
  carousel.addEventListener('mouseleave', startAutoRotate);

  // Touch/swipe support for mobile
  let touchStartX = 0;
  let touchEndX = 0;

  carousel.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    stopAutoRotate();
  }, { passive: true });

  carousel.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
    startAutoRotate();
  }, { passive: true });

  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swiped left - go to next
        nextSlide();
      } else {
        // Swiped right - go to previous
        prevSlide();
      }
    }
  }

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!carousel.matches(':hover')) return;

    if (e.key === 'ArrowLeft') {
      prevSlide();
      stopAutoRotate();
      startAutoRotate();
    } else if (e.key === 'ArrowRight') {
      nextSlide();
      stopAutoRotate();
      startAutoRotate();
    }
  });

  // Initialize carousel after ensuring DOM is fully laid out
  function initCarousel() {
    // Use requestAnimationFrame to ensure layout is complete
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        updateCarousel(0, false);
        startAutoRotate();
      });
    });
  }

  // Wait for page to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCarousel);
  } else if (document.readyState === 'interactive') {
    // DOM is ready but resources may still be loading
    window.addEventListener('load', initCarousel);
  } else {
    // Document is already fully loaded
    initCarousel();
  }

  // Pause when page is hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAutoRotate();
    } else {
      startAutoRotate();
    }
  });
})();

/**
 * Contact Form Handler
 * Handles form submission with Web3Forms API
 */
(function() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const submitButton = form.querySelector('.btn-submit');
  const formMessage = document.getElementById('form-message');

  // Handle form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Disable submit button and show loading state
    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';
    formMessage.className = 'form-message';
    formMessage.textContent = '';

    // Get form data
    const formData = new FormData(form);

    try {
      // Submit to Web3Forms API
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Success
        formMessage.className = 'form-message success';
        formMessage.textContent = 'Thank you! Your message has been sent. I\'ll get back to you soon.';

        // Reset form
        form.reset();

        // Scroll to success message
        formMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        // Error from API
        throw new Error(data.message || 'Something went wrong');
      }
    } catch (error) {
      // Network or other error
      formMessage.className = 'form-message error';
      formMessage.textContent = 'Oops! There was a problem sending your message. Please try again or email me directly at brent@dxn.is';
      console.error('Form submission error:', error);
    } finally {
      // Re-enable submit button
      submitButton.disabled = false;
      submitButton.textContent = 'Send Message';
    }
  });

  // Clear error/success message when user starts typing again
  const inputs = form.querySelectorAll('input, textarea');
  inputs.forEach(input => {
    input.addEventListener('input', () => {
      if (formMessage.classList.contains('error') || formMessage.classList.contains('success')) {
        formMessage.className = 'form-message';
        formMessage.textContent = '';
      }
    });
  });
})();

/**
 * Client Logos Randomization
 * Randomizes logo order on each page load for visual variety
 */
(function() {
  const logoTrack = document.querySelector('.logo-track');
  if (!logoTrack) return;

  // Define all client logos with sector tags
  // 'fin' = Financial Institutions (Credit Unions, Banks, CDFIs)
  // 'soc' = Social Impact (Nonprofits, Foundations, Civic, Government, Humanitarian)
  const logos = [
    // Financial Institutions (25)
    { src: 'assets/clients/cues_logo.png', alt: 'CUES', sector: 'fin' },
    { src: 'assets/clients/ncuf_logo.png', alt: 'National Credit Union Foundation', sector: 'fin' },
    { src: 'assets/clients/filene_logo.png', alt: 'Filene Research Institute', sector: 'fin' },
    { src: 'assets/clients/americascreditunions_logo.png', alt: 'America\'s Credit Unions', sector: 'fin' },
    { src: 'assets/clients/aboundcu_logo.png', alt: 'Abound Credit Union', sector: 'fin' },
    { src: 'assets/clients/fecu_logo.png', alt: 'First Entertainment Credit Union', sector: 'fin' },
    { src: 'assets/clients/sidneyfcu_logo.png', alt: 'Sidney Federal Credit Union', sector: 'fin' },
    { src: 'assets/clients/langleycu_logo.png', alt: 'Langley Federal Credit Union', sector: 'fin' },
    { src: 'assets/clients/trabian_logo.png', alt: 'Trabian', sector: 'fin' },
    { src: 'assets/clients/central1_logo.png', alt: 'Central 1', sector: 'fin' },
    { src: 'assets/clients/expresscu_logo.png', alt: 'Express Credit Union', sector: 'fin' },
    { src: 'assets/clients/ncua_logo.png', alt: 'NCUA', sector: 'fin' },
    { src: 'assets/clients/afcu_logo.png', alt: 'America First Credit Union', sector: 'fin' },
    { src: 'assets/clients/cofed_logo.png', alt: 'CO-FED Credit Union', sector: 'fin' },
    { src: 'assets/clients/dlfcu_logo.png', alt: 'Digital Federal Credit Union', sector: 'fin' },
    { src: 'assets/clients/wrightpattcu_logo.png', alt: 'Wright-Patt Credit Union', sector: 'fin' },
    { src: 'assets/clients/custudentchoice.png', alt: 'CU Student Choice', sector: 'fin' },
    { src: 'assets/clients/r1cu_logo.png', alt: 'R1 Credit Union', sector: 'fin' },
    { src: 'assets/clients/toplinecu_logo.png', alt: 'Topline Federal Credit Union', sector: 'fin' },
    { src: 'assets/clients/communitere_logo.png', alt: 'CommunitERE', sector: 'fin' },
    { src: 'assets/clients/lendgistics_logo.png', alt: 'Lendgistics', sector: 'fin' },
    { src: 'assets/clients/secunm_logo.png', alt: 'Sandia Laboratory Federal Credit Union', sector: 'fin' },
    { src: 'assets/clients/vantagewestcu_logo.png', alt: 'Vantage West Credit Union', sector: 'fin' },
    { src: 'assets/clients/true_logo.png', alt: 'TRUE Community Credit Union', sector: 'fin' },
    { src: 'assets/clients/brewerycu_logo.png', alt: 'Brewery Credit Union', sector: 'fin' },

    // Social Impact Organizations (11)
    { src: 'assets/clients/un_logo.png', alt: 'United Nations', sector: 'soc' },
    { src: 'assets/clients/thinkery_logo.png', alt: 'Thinkery', sector: 'soc' },
    { src: 'assets/clients/be_logo.png', alt: 'BE', sector: 'soc' },
    { src: 'assets/clients/coopimpactlab_logo.png', alt: 'Co-op Impact Lab', sector: 'soc' },
    { src: 'assets/clients/ocha_logo.png', alt: 'UN OCHA', sector: 'soc' },
    { src: 'assets/clients/readingcoop_logo.png', alt: 'Reading Cooperative', sector: 'soc' },
    { src: 'assets/clients/globalpulse_logo.png', alt: 'UN Global Pulse', sector: 'soc' },
    { src: 'assets/clients/wpe_logo.png', alt: 'Whole Person Economy', sector: 'soc' },
    { src: 'assets/clients/globalinnovationgathering_logo.png', alt: 'Global Innovation Gathering', sector: 'soc' },
    { src: 'assets/clients/moeda_logo.png', alt: 'Moeda', sector: 'soc' },
    { src: 'assets/clients/bfi_logo.png', alt: 'Buckminster Fuller Institute', sector: 'soc' }
  ];

  /**
   * Fisher-Yates shuffle algorithm for true randomization
   * @param {Array} array - Array to shuffle
   * @returns {Array} - Shuffled array
   */
  function shuffleArray(array) {
    const shuffled = [...array]; // Create copy to avoid mutating original
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Stratified shuffle with sector-based distribution
   * Ensures balanced mix of financial and social impact logos
   * Uses 3:1 ratio (3 financial, 1 social impact)
   * @param {Array} logos - Array of logo objects with sector tags
   * @returns {Array} - Distributed array
   */
  function distributedShuffle(logos) {
    // Separate by sector and shuffle each independently
    const fin = shuffleArray(logos.filter(l => l.sector === 'fin'));
    const soc = shuffleArray(logos.filter(l => l.sector === 'soc'));

    // If no social impact logos, just return shuffled financial
    if (soc.length === 0) return fin;

    // Interleave with 3:1 ratio (3 financial, 1 social impact)
    const result = [];
    let fIndex = 0, sIndex = 0;

    while (fIndex < fin.length || sIndex < soc.length) {
      // Add 3 financial logos
      for (let i = 0; i < 3 && fIndex < fin.length; i++) {
        result.push(fin[fIndex++]);
      }

      // Add 1 social impact logo
      if (sIndex < soc.length) {
        result.push(soc[sIndex++]);
      }
    }

    return result;
  }

  /**
   * Generate logo HTML elements
   * @param {Array} logoData - Array of logo objects
   * @returns {string} - HTML string
   */
  function generateLogoHTML(logoData) {
    return logoData.map(logo => `
      <div class="logo-item">
        <img src="${logo.src}" alt="${logo.alt}" height="48">
      </div>
    `).join('');
  }

  // Apply stratified distribution (3:1 fin:soc ratio)
  const distributedLogos = distributedShuffle(logos);

  // Create 3 duplicate sets for seamless infinite loop
  const tripleLogos = [...distributedLogos, ...distributedLogos, ...distributedLogos];

  // Generate and inject HTML
  logoTrack.innerHTML = generateLogoHTML(tripleLogos);

  /**
   * Measure and set pixel-perfect animation
   * Waits for images to load, then calculates exact width of one logo set
   */
  function setupPixelPerfectAnimation() {
    // Wait for layout and images to be ready
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // Get all logo items
        const logoItems = logoTrack.querySelectorAll('.logo-item');

        if (logoItems.length === 0) return;

        // Calculate width of one set (first N logos where N = distributedLogos.length)
        const logosPerSet = distributedLogos.length;

        // Measure actual rendered distance with sub-pixel precision
        // Get bounding rectangle of first logo in first set
        const firstLogoRect = logoItems[0].getBoundingClientRect();
        // Get bounding rectangle of first logo in second set
        const firstLogoNextSetRect = logoItems[logosPerSet].getBoundingClientRect();
        // Calculate exact pixel distance (includes all logos + gaps with sub-pixel precision)
        // Round to 2 decimal places for CSS compatibility
        const setWidth = Math.round((firstLogoNextSetRect.left - firstLogoRect.left) * 100) / 100;

        // Create dynamic keyframe animation with exact pixel measurement
        const styleId = 'marquee-dynamic-animation';
        let styleEl = document.getElementById(styleId);

        if (!styleEl) {
          styleEl = document.createElement('style');
          styleEl.id = styleId;
          document.head.appendChild(styleEl);
        }

        // Generate the animation with exact pixel value
        styleEl.textContent = `
          @keyframes marquee-dynamic {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-${setWidth}px);
            }
          }

          .logo-track {
            animation: marquee-dynamic 60s linear infinite;
          }

          @media (max-width: 1024px) {
            .logo-track {
              animation: marquee-dynamic 48s linear infinite;
            }
          }

          @media (max-width: 768px) {
            .logo-track {
              animation: marquee-dynamic 40s linear infinite;
            }
          }
        `;
      });
    });
  }

  // Wait for all logo images to load before measuring
  const logoImages = logoTrack.querySelectorAll('img');
  const imagePromises = Array.from(logoImages).map(img => {
    if (img.complete) {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      img.addEventListener('load', resolve);
      img.addEventListener('error', resolve); // Resolve even on error to not block
    });
  });

  Promise.all(imagePromises).then(() => {
    setupPixelPerfectAnimation();
  });
})();

// Theme Toggle Implementation
(function() {
  const themeToggle = document.querySelector('.theme-toggle');
  const sunIcon = document.querySelector('.theme-icon-sun');
  const moonIcon = document.querySelector('.theme-icon-moon');
  const html = document.documentElement;

  // Get saved theme from localStorage or default to 'dark'
  const getSavedTheme = () => {
    const saved = localStorage.getItem('theme-preference');
    if (saved) return saved;

    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'dark'; // Default to dark
  };

  // Set theme
  const setTheme = (theme) => {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('theme-preference', theme);
    updateIcons(theme);
  };

  // Update icon visibility
  const updateIcons = (theme) => {
    if (theme === 'dark') {
      sunIcon.style.display = 'block';
      moonIcon.style.display = 'none';
    } else {
      sunIcon.style.display = 'none';
      moonIcon.style.display = 'block';
    }
  };

  // Initialize theme
  const initialTheme = getSavedTheme();
  setTheme(initialTheme);

  // Toggle theme on button click
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = html.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
    });
  }

  // Listen for system theme changes
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      const newTheme = e.matches ? 'dark' : 'light';
      setTheme(newTheme);
    });
  }
})();

// Newsletter form handler
const newsletterForm = document.getElementById('newsletterForm');
if (newsletterForm) {
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('newsletter-email').value;
    // Open Beehiiv subscribe page with email pre-filled
    window.open(`https://ai4fis.beehiiv.com/subscribe?email=${encodeURIComponent(email)}`, '_blank');
  });
}
