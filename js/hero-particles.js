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
      this.vx = p.random(-2, 2);
      this.vy = p.random(-2, 2);
      this.baseMaxSpeed = p.random(2, 3.5);
      this.maxSpeed = this.baseMaxSpeed;
      this.life = p.random(150, 300);
      this.age = 0;
      this.alignment = 0; // 0 = chaotic, 1 = fully aligned
    }

    // Chaotic movement - random, conflicting directions
    moveChaoticly() {
      // Brownian motion - random velocity changes
      this.vx += p.random(-0.25, 0.25);
      this.vy += p.random(-0.25, 0.25);

      // Frequent direction changes for visible chaos
      if (p.random() < 0.05) {
        this.vx += p.random(-1, 1);
        this.vy += p.random(-1, 1);
      }
    }

    // Aligned movement - orbit around mouse
    moveAligned(mx, my) {
      const dx = mx - this.x;
      const dy = my - this.y;
      const distSq = dx * dx + dy * dy;
      const influenceRadius = 400;
      const orbitRadius = 35; // Particles orbit at this distance from cursor
      const influenceRadiusSq = influenceRadius * influenceRadius;

      if (distSq < influenceRadiusSq && distSq > 25) {
        const dist = p.sqrt(distSq);
        const normalizedDist = dist / influenceRadius;

        // Smooth falloff - stronger effect closer to cursor
        const falloff = Math.pow(1 - normalizedDist, 1.5);

        // Direction toward mouse (radial)
        const radialX = dx / dist;
        const radialY = dy / dist;

        // Perpendicular direction (tangential) - creates orbit
        const tangentX = -radialY;
        const tangentY = radialX;

        // Attraction strength varies with distance
        // Pull in when far, push out when too close
        let attractionStrength;
        if (dist > orbitRadius) {
          // Outside orbit radius - attract inward more strongly
          attractionStrength = 0.08 * falloff;
        } else {
          // Inside orbit radius - push outward gently
          attractionStrength = -0.03 * (1 - dist / orbitRadius);
        }

        // Tangential (orbit) strength - creates the swirl
        const orbitStrength = 0.06 * falloff;

        // Combined target velocity: orbit + gentle attraction
        const targetVx = tangentX * this.baseMaxSpeed * 2 + radialX * this.baseMaxSpeed * attractionStrength * 10;
        const targetVy = tangentY * this.baseMaxSpeed * 2 + radialY * this.baseMaxSpeed * attractionStrength * 10;

        // Gradually steer toward target direction
        const steerStrength = 0.05 * falloff;
        this.vx = p.lerp(this.vx, targetVx, steerStrength);
        this.vy = p.lerp(this.vy, targetVy, steerStrength);

        // Track alignment level for visual feedback
        this.alignment = p.lerp(this.alignment, falloff, 0.1);

        // Speed boost when aligned
        this.maxSpeed = p.lerp(this.baseMaxSpeed, this.baseMaxSpeed * 2.5, this.alignment);
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

      // Friction (lower = more momentum retained)
      this.vx *= 0.985;
      this.vy *= 0.985;

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
      let baseAlpha = isDarkMode ? 40 : 60;
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
      const baseWeight = 1.0;
      const weight = baseWeight + this.alignment * 0.6;

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
