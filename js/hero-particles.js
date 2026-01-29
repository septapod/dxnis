/**
 * Dense Flowing Particle Background with p5.js
 *
 * Visual: Thousands of particles flowing through a Perlin noise field,
 * creating organic, galaxy-like streams with luminous accumulation.
 *
 * Interaction: Mouse creates vortex attractor - particles spiral toward cursor,
 * creating bright concentration rings.
 */

const heroParticles = (p) => {
  let particles = [];
  let flowField;
  let particleCount = 3000;
  let canvas;
  let heroSection;
  let canvasContainer;
  let isMouseInHero = false;

  // Interaction state
  let burstParticles = []; // For click burst effect
  let lastMouseX = 0;
  let lastMouseY = 0;
  let mouseVelocity = 0;

  // Brand colors - optimized for contrast
  const goldColor = { r: 251, g: 226, b: 72 }; // #FBE248 for dark mode
  const darkAmber = { r: 120, g: 90, b: 20 }; // Much darker for light mode visibility

  // Flow field settings
  const flowResolution = 20;
  let cols, rows;
  let zoff = 0;

  // ============================================
  // PARTICLE CLASS
  // ============================================
  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = p.random(p.width);
      this.y = p.random(p.height);
      this.prevX = this.x;
      this.prevY = this.y;
      this.vx = 0;
      this.vy = 0;
      this.baseMaxSpeed = p.random(1.5, 3.5);
      this.maxSpeed = this.baseMaxSpeed;
      this.life = p.random(100, 300);
      this.age = 0;
      this.influenced = 0; // How much affected by cursor (0-1)
    }

    follow() {
      // Get flow angle at current position from noise field
      const col = p.floor(this.x / flowResolution);
      const row = p.floor(this.y / flowResolution);

      // Clamp to bounds
      const safeCol = p.constrain(col, 0, cols - 1);
      const safeRow = p.constrain(row, 0, rows - 1);

      // Sample noise for flow direction
      const xoff = safeCol * 0.1;
      const yoff = safeRow * 0.1;
      const angle = p.noise(xoff, yoff, zoff) * p.TWO_PI * 2;

      // Apply flow force
      const flowForce = 0.3;
      this.vx += p.cos(angle) * flowForce;
      this.vy += p.sin(angle) * flowForce;
    }

    applyAttractor(mx, my, mouseSpeed) {
      // Calculate vector toward mouse
      const dx = mx - this.x;
      const dy = my - this.y;
      const distSq = dx * dx + dy * dy;
      const influenceRadius = 280; // Medium influence area
      const influenceRadiusSq = influenceRadius * influenceRadius;

      if (distSq < influenceRadiusSq && distSq > 25) {
        const dist = p.sqrt(distSq);

        // Normalized direction
        const dirX = dx / dist;
        const dirY = dy / dist;

        // Perpendicular for spiral (rotate 90 degrees)
        const perpX = -dirY;
        const perpY = dirX;

        // Distance-based strength with smooth falloff
        const normalizedDist = dist / influenceRadius;
        const falloff = Math.pow(1 - normalizedDist, 2); // Quadratic falloff

        // Moderate strength - noticeable but not overwhelming
        const baseAttraction = 0.8;
        const baseSpin = 1.2;
        const speedBoost = 1 + mouseSpeed * 0.15; // Subtle speed influence

        // Attraction pulls toward center
        const attractStrength = baseAttraction * falloff * speedBoost;

        // Spin creates orbital motion
        const spinStrength = baseSpin * falloff * (0.4 + normalizedDist * 0.4);

        // Apply forces
        this.vx += dirX * attractStrength + perpX * spinStrength;
        this.vy += dirY * attractStrength + perpY * spinStrength;

        // Slight speed boost near cursor
        this.maxSpeed = p.map(dist, 0, influenceRadius, 4, this.baseMaxSpeed);

        // Mark as influenced (for subtle brightness boost)
        this.influenced = falloff * 0.6; // Reduced influence marker
      } else {
        this.influenced = 0;
        this.maxSpeed = this.baseMaxSpeed;
      }
    }

    update() {
      // Store previous position for trail drawing
      this.prevX = this.x;
      this.prevY = this.y;

      // Limit velocity
      const speed = p.sqrt(this.vx * this.vx + this.vy * this.vy);
      if (speed > this.maxSpeed) {
        this.vx = (this.vx / speed) * this.maxSpeed;
        this.vy = (this.vy / speed) * this.maxSpeed;
      }

      // Apply velocity
      this.x += this.vx;
      this.y += this.vy;

      // Apply friction
      this.vx *= 0.98;
      this.vy *= 0.98;

      // Age particle
      this.age++;

      // Wrap around edges or reset if too old
      this.edges();
    }

    edges() {
      // Wrap horizontally
      if (this.x < 0) {
        this.x = p.width;
        this.prevX = this.x;
      }
      if (this.x > p.width) {
        this.x = 0;
        this.prevX = this.x;
      }

      // Wrap vertically
      if (this.y < 0) {
        this.y = p.height;
        this.prevY = this.y;
      }
      if (this.y > p.height) {
        this.y = 0;
        this.prevY = this.y;
      }

      // Reset if too old
      if (this.age > this.life) {
        this.reset();
      }
    }

    show(isDarkMode) {
      const color = isDarkMode ? goldColor : darkAmber;

      // Calculate alpha based on age (fade in and out)
      const baseMaxAlpha = isDarkMode ? 16 : 38;
      let alpha;
      const fadeIn = 20;
      const fadeOut = 50;

      if (this.age < fadeIn) {
        alpha = p.map(this.age, 0, fadeIn, 0, baseMaxAlpha);
      } else if (this.age > this.life - fadeOut) {
        alpha = p.map(this.age, this.life - fadeOut, this.life, baseMaxAlpha, 0);
      } else {
        alpha = baseMaxAlpha;
      }

      // Subtle brightness boost when influenced by cursor
      const influenceBoost = 1 + this.influenced * 1.2; // Up to 1.7x brighter (subtle)
      alpha = Math.min(alpha * influenceBoost, isDarkMode ? 45 : 70);

      // Subtle stroke weight boost near cursor
      const baseWeight = isDarkMode ? 1 : 1.5;
      const weight = baseWeight + this.influenced * 0.5;

      // Draw trail line from previous to current position
      p.stroke(color.r, color.g, color.b, alpha);
      p.strokeWeight(weight);
      p.line(this.prevX, this.prevY, this.x, this.y);
    }
  }

  // ============================================
  // P5.JS SETUP
  // ============================================
  p.setup = () => {
    heroSection = document.getElementById('home');
    canvasContainer = document.getElementById('hero-canvas-container');

    if (!heroSection || !canvasContainer) {
      console.warn('Hero section or canvas container not found');
      return;
    }

    const width = heroSection.offsetWidth || window.innerWidth;
    const height = heroSection.offsetHeight || window.innerHeight;

    canvas = p.createCanvas(width, height);
    canvas.parent('hero-canvas-container');

    // Calculate flow field dimensions
    cols = p.floor(width / flowResolution) + 1;
    rows = p.floor(height / flowResolution) + 1;

    // Adjust particle count based on screen size
    if (p.width < 768) {
      particleCount = 1500;
    } else if (p.width < 1024) {
      particleCount = 2000;
    } else {
      particleCount = 3000;
    }

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Set initial background
    p.background(0);
  };

  // ============================================
  // P5.JS DRAW LOOP
  // ============================================
  p.draw = () => {
    if (!heroSection) return;

    // Check dark mode
    const isDarkMode = document.documentElement.getAttribute('data-theme') !== 'light';

    // Fade background instead of clearing (creates trails)
    // Lower alpha = longer trails, higher alpha = faster fade
    p.noStroke();
    if (isDarkMode) {
      p.fill(0, 0, 0, 12); // Slower fade for longer, more visible trails
    } else {
      p.fill(248, 248, 248, 18); // Semi-transparent light - match site background
    }
    p.rect(0, 0, p.width, p.height);

    // Update flow field time offset (slowly evolving patterns)
    zoff += 0.002;

    // Check if mouse is in hero section
    isMouseInHero = p.mouseX >= 0 && p.mouseX <= p.width &&
                    p.mouseY >= 0 && p.mouseY <= p.height;

    // Calculate mouse velocity for dynamic interaction
    const mouseDx = p.mouseX - lastMouseX;
    const mouseDy = p.mouseY - lastMouseY;
    const currentMouseSpeed = p.sqrt(mouseDx * mouseDx + mouseDy * mouseDy);
    mouseVelocity = p.lerp(mouseVelocity, currentMouseSpeed, 0.2); // Smooth it
    lastMouseX = p.mouseX;
    lastMouseY = p.mouseY;

    // Set blend mode for additive brightness (dark mode only)
    if (isDarkMode) {
      p.blendMode(p.ADD);
    }

    // Update and draw all particles
    for (let particle of particles) {
      particle.follow();

      if (isMouseInHero) {
        particle.applyAttractor(p.mouseX, p.mouseY, mouseVelocity);
      } else {
        particle.influenced = 0;
        particle.maxSpeed = particle.baseMaxSpeed;
      }

      particle.update();
      particle.show(isDarkMode);
    }

    // Update and draw burst particles (subtle)
    for (let i = burstParticles.length - 1; i >= 0; i--) {
      const bp = burstParticles[i];
      bp.x += bp.vx;
      bp.y += bp.vy;
      bp.vx *= 0.94;
      bp.vy *= 0.94;
      bp.life--;

      if (bp.life <= 0) {
        burstParticles.splice(i, 1);
      } else {
        const alpha = p.map(bp.life, 0, bp.maxLife, 0, isDarkMode ? 35 : 50);
        p.stroke(goldColor.r, goldColor.g, goldColor.b, alpha);
        p.strokeWeight(1.5);
        p.point(bp.x, bp.y);
      }
    }

    // Reset blend mode
    if (isDarkMode) {
      p.blendMode(p.BLEND);
    }
  };

  // ============================================
  // WINDOW RESIZE
  // ============================================
  p.windowResized = () => {
    if (heroSection && canvasContainer) {
      const width = heroSection.offsetWidth || window.innerWidth;
      const height = heroSection.offsetHeight || window.innerHeight;
      p.resizeCanvas(width, height);

      // Recalculate flow field dimensions
      cols = p.floor(width / flowResolution) + 1;
      rows = p.floor(height / flowResolution) + 1;

      // Adjust particle count
      const targetCount = p.width < 768 ? 1500 : (p.width < 1024 ? 2000 : 3000);

      if (particles.length > targetCount) {
        particles = particles.slice(0, targetCount);
      } else {
        while (particles.length < targetCount) {
          particles.push(new Particle());
        }
      }

      // Reset background
      const isDarkMode = document.documentElement.getAttribute('data-theme') !== 'light';
      if (isDarkMode) {
        p.background(0);
      } else {
        p.background(250);
      }
    }
  };

  // ============================================
  // CLICK BURST EFFECT (subtle)
  // ============================================
  p.mousePressed = () => {
    if (!isMouseInHero) return;

    // Create subtle burst of particles from click point
    const burstCount = 20;
    for (let i = 0; i < burstCount; i++) {
      const angle = p.random(p.TWO_PI);
      const speed = p.random(2, 6);
      burstParticles.push({
        x: p.mouseX,
        y: p.mouseY,
        vx: p.cos(angle) * speed,
        vy: p.sin(angle) * speed,
        life: p.random(20, 40),
        maxLife: 40
      });
    }

    // Gentle push to nearby particles
    for (let particle of particles) {
      const dx = particle.x - p.mouseX;
      const dy = particle.y - p.mouseY;
      const distSq = dx * dx + dy * dy;
      const burstRadius = 120;

      if (distSq < burstRadius * burstRadius && distSq > 0) {
        const dist = p.sqrt(distSq);
        const force = p.map(dist, 0, burstRadius, 3, 0);
        particle.vx += (dx / dist) * force;
        particle.vy += (dy / dist) * force;
      }
    }
  };

  // ============================================
  // TOUCH SUPPORT
  // ============================================
  p.touchStarted = () => {
    // Trigger subtle burst on touch
    if (p.touches.length > 0) {
      const touch = p.touches[0];
      if (touch.x >= 0 && touch.x <= p.width && touch.y >= 0 && touch.y <= p.height) {
        // Create subtle burst at touch point
        const burstCount = 15;
        for (let i = 0; i < burstCount; i++) {
          const angle = p.random(p.TWO_PI);
          const speed = p.random(2, 5);
          burstParticles.push({
            x: touch.x,
            y: touch.y,
            vx: p.cos(angle) * speed,
            vy: p.sin(angle) * speed,
            life: p.random(20, 35),
            maxLife: 35
          });
        }
      }
    }
    return true; // Allow page scroll
  };

  p.touchMoved = () => {
    return true; // Allow page scroll
  };
};

// ============================================
// INITIALIZE ON DOM READY
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('hero-canvas-container');
  if (container) {
    new p5(heroParticles);
  }
});
