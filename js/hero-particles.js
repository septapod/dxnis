/**
 * Chaos to Alignment Particle Animation
 *
 * Concept: Particles represent "diverse perspectives" - chaotic when idle,
 * but aligning and flowing toward the cursor when the mouse is present.
 * Visual metaphor for "bringing people together" and creating alignment.
 */

const heroParticles = (p) => {
  let particles = [];
  let particleCount = 1000;
  let canvas;
  let heroSection;
  let canvasContainer;
  let isMouseInHero = false;

  // Interaction state
  let burstParticles = [];
  let lastMouseX = 0;
  let lastMouseY = 0;

  // Colors
  const cyanColor = { r: 0, g: 220, b: 255 };
  const darkCyan = { r: 0, g: 80, b: 110 };

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
      this.vx = p.random(-1, 1);
      this.vy = p.random(-1, 1);
      this.baseMaxSpeed = p.random(1.5, 2.5);
      this.maxSpeed = this.baseMaxSpeed;
      this.life = p.random(150, 300);
      this.age = 0;
      this.alignment = 0; // 0 = chaotic, 1 = fully aligned
    }

    // Chaotic movement - random, conflicting directions
    moveChaoticly() {
      // Brownian motion - small random velocity changes
      this.vx += p.random(-0.15, 0.15);
      this.vy += p.random(-0.15, 0.15);

      // Occasional larger direction changes for visible chaos
      if (p.random() < 0.02) {
        this.vx += p.random(-0.5, 0.5);
        this.vy += p.random(-0.5, 0.5);
      }
    }

    // Aligned movement - flow toward mouse
    moveAligned(mx, my) {
      const dx = mx - this.x;
      const dy = my - this.y;
      const distSq = dx * dx + dy * dy;
      const influenceRadius = 400;
      const influenceRadiusSq = influenceRadius * influenceRadius;

      if (distSq < influenceRadiusSq && distSq > 100) {
        const dist = p.sqrt(distSq);
        const normalizedDist = dist / influenceRadius;

        // Smooth falloff - stronger alignment closer to cursor
        const falloff = Math.pow(1 - normalizedDist, 1.5);

        // Direction toward mouse
        const dirX = dx / dist;
        const dirY = dy / dist;

        // Alignment force - particles steer toward cursor
        const alignStrength = 0.08 * falloff;

        // Gradually steer toward target direction
        this.vx = p.lerp(this.vx, dirX * this.baseMaxSpeed * 1.5, alignStrength);
        this.vy = p.lerp(this.vy, dirY * this.baseMaxSpeed * 1.5, alignStrength);

        // Track alignment level for visual feedback
        this.alignment = p.lerp(this.alignment, falloff, 0.1);

        // Speed boost when aligned
        this.maxSpeed = p.lerp(this.baseMaxSpeed, this.baseMaxSpeed * 2, this.alignment);
      } else {
        // Outside influence - stay chaotic but slowly decay alignment
        this.moveChaoticly();
        this.alignment = p.lerp(this.alignment, 0, 0.02);
        this.maxSpeed = p.lerp(this.maxSpeed, this.baseMaxSpeed, 0.05);
      }
    }

    update(mouseActive, mx, my) {
      // Store previous position for trail
      this.prevX = this.x;
      this.prevY = this.y;

      // Movement based on state
      if (mouseActive) {
        this.moveAligned(mx, my);
      } else {
        this.moveChaoticly();
        // Decay alignment when mouse leaves
        this.alignment = p.lerp(this.alignment, 0, 0.03);
        this.maxSpeed = p.lerp(this.maxSpeed, this.baseMaxSpeed, 0.05);
      }

      // Limit velocity
      const speed = p.sqrt(this.vx * this.vx + this.vy * this.vy);
      if (speed > this.maxSpeed) {
        this.vx = (this.vx / speed) * this.maxSpeed;
        this.vy = (this.vy / speed) * this.maxSpeed;
      }

      // Apply velocity
      this.x += this.vx;
      this.y += this.vy;

      // Friction
      this.vx *= 0.99;
      this.vy *= 0.99;

      // Age
      this.age++;

      // Edges
      this.edges();
    }

    edges() {
      // Wrap around
      if (this.x < -10) { this.x = p.width + 10; this.prevX = this.x; }
      if (this.x > p.width + 10) { this.x = -10; this.prevX = this.x; }
      if (this.y < -10) { this.y = p.height + 10; this.prevY = this.y; }
      if (this.y > p.height + 10) { this.y = -10; this.prevY = this.y; }

      // Reset if too old
      if (this.age > this.life) {
        this.reset();
      }
    }

    show(isDarkMode) {
      const color = isDarkMode ? cyanColor : darkCyan;

      // Base alpha with age fade
      let baseAlpha = isDarkMode ? 25 : 45;
      const fadeIn = 15;
      const fadeOut = 40;

      if (this.age < fadeIn) {
        baseAlpha = p.map(this.age, 0, fadeIn, 0, baseAlpha);
      } else if (this.age > this.life - fadeOut) {
        baseAlpha = p.map(this.age, this.life - fadeOut, this.life, baseAlpha, 0);
      }

      // Aligned particles are brighter and thicker
      const alignmentBoost = 1 + this.alignment * 2.5;
      const alpha = Math.min(baseAlpha * alignmentBoost, isDarkMode ? 80 : 120);

      // Stroke weight varies with alignment
      const baseWeight = 0.8;
      const weight = baseWeight + this.alignment * 0.8;

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

    // Adjust particle count based on screen size
    if (p.width < 768) {
      particleCount = 500;
    } else if (p.width < 1024) {
      particleCount = 700;
    } else {
      particleCount = 1000;
    }

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    p.background(0);
  };

  // ============================================
  // P5.JS DRAW LOOP
  // ============================================
  p.draw = () => {
    if (!heroSection) return;

    const isDarkMode = document.documentElement.getAttribute('data-theme') !== 'light';

    // Fade background
    p.noStroke();
    if (isDarkMode) {
      p.fill(0, 0, 0, 20);
    } else {
      p.fill(248, 248, 248, 25);
    }
    p.rect(0, 0, p.width, p.height);

    // Check mouse position
    isMouseInHero = p.mouseX >= 0 && p.mouseX <= p.width &&
                    p.mouseY >= 0 && p.mouseY <= p.height;

    // Track mouse
    lastMouseX = p.mouseX;
    lastMouseY = p.mouseY;

    // Blend mode for dark mode
    if (isDarkMode) {
      p.blendMode(p.ADD);
    }

    // Update and draw particles
    for (let particle of particles) {
      particle.update(isMouseInHero, p.mouseX, p.mouseY);
      particle.show(isDarkMode);
    }

    // Burst particles
    for (let i = burstParticles.length - 1; i >= 0; i--) {
      const bp = burstParticles[i];
      bp.x += bp.vx;
      bp.y += bp.vy;
      bp.vx *= 0.95;
      bp.vy *= 0.95;
      bp.life--;

      if (bp.life <= 0) {
        burstParticles.splice(i, 1);
      } else {
        const alpha = p.map(bp.life, 0, bp.maxLife, 0, isDarkMode ? 50 : 70);
        p.stroke(cyanColor.r, cyanColor.g, cyanColor.b, alpha);
        p.strokeWeight(1.5);
        p.point(bp.x, bp.y);
      }
    }

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

      const targetCount = p.width < 768 ? 500 : (p.width < 1024 ? 700 : 1000);

      if (particles.length > targetCount) {
        particles = particles.slice(0, targetCount);
      } else {
        while (particles.length < targetCount) {
          particles.push(new Particle());
        }
      }

      const isDarkMode = document.documentElement.getAttribute('data-theme') !== 'light';
      p.background(isDarkMode ? 0 : 250);
    }
  };

  // ============================================
  // CLICK EFFECT
  // ============================================
  p.mousePressed = () => {
    if (!isMouseInHero) return;

    // Burst effect
    const burstCount = 25;
    for (let i = 0; i < burstCount; i++) {
      const angle = p.random(p.TWO_PI);
      const speed = p.random(2, 5);
      burstParticles.push({
        x: p.mouseX,
        y: p.mouseY,
        vx: p.cos(angle) * speed,
        vy: p.sin(angle) * speed,
        life: p.random(25, 45),
        maxLife: 45
      });
    }
  };

  // ============================================
  // TOUCH SUPPORT
  // ============================================
  p.touchStarted = () => {
    if (p.touches.length > 0) {
      const touch = p.touches[0];
      if (touch.x >= 0 && touch.x <= p.width && touch.y >= 0 && touch.y <= p.height) {
        const burstCount = 20;
        for (let i = 0; i < burstCount; i++) {
          const angle = p.random(p.TWO_PI);
          const speed = p.random(2, 4);
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
    return true;
  };

  p.touchMoved = () => {
    return true;
  };
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('hero-canvas-container');
  if (container) {
    new p5(heroParticles);
  }
});
