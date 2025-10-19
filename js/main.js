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
