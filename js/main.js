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
