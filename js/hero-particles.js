/**
 * Organic Cell Particle Animation (Performance Optimized)
 *
 * Particles represent diverse perspectives as living cells.
 * They wander using Perlin noise, breathe/pulse organically,
 * and attract toward the cursor in a flowing orbit.
 *
 * Optimizations:
 * - Removed O(n²) separation check
 * - Single circle per particle
 * - Reduced particle count
 * - Respects prefers-reduced-motion
 */

const heroParticles = (p) => {
  let cells = [];
  let cellCount = 600;
  let canvas;
  let heroSection;
  let canvasContainer;
  let isMouseInHero = false;
  let prefersReducedMotion = false;

  // Colors
  const cyanColor = { r: 0, g: 220, b: 255 };
  const darkCyan = { r: 0, g: 100, b: 140 };

  // ============================================
  // CELL CLASS
  // ============================================
  class Cell {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = p.random(p.width);
      this.y = p.random(p.height);
      this.vx = p.random(-0.5, 0.5);
      this.vy = p.random(-0.5, 0.5);
      this.ax = 0;
      this.ay = 0;

      // Perlin noise offset - unique to each cell
      this.noiseOffset = p.random(1000);

      // Cell properties
      this.baseRadius = p.random(1.2, 2.8);
      this.maxSpeed = p.random(1.5, 3);
      this.life = p.random(300, 600);
      this.age = 0;

      // Breathing phase offset
      this.breatheOffset = p.random(p.TWO_PI);
      this.breatheSpeed = p.random(0.02, 0.04);

      // Alignment tracking
      this.alignment = 0;
    }

    applyForce(fx, fy) {
      this.ax += fx;
      this.ay += fy;
    }

    // Perlin noise wandering
    wander() {
      const angle = p.noise(this.noiseOffset) * p.TWO_PI * 2;
      this.applyForce(p.cos(angle) * 0.12, p.sin(angle) * 0.12);
      this.noiseOffset += 0.008;
    }

    // Attraction to mouse with orbital tendency
    attractToMouse(mx, my) {
      const dx = mx - this.x;
      const dy = my - this.y;
      const distSq = dx * dx + dy * dy;
      const influenceRadius = 600;
      const orbitRadius = 120;

      if (distSq < influenceRadius * influenceRadius && distSq > 4) {
        const dist = p.sqrt(distSq);
        const normalizedDist = dist / influenceRadius;
        const falloff = Math.pow(1 - normalizedDist, 2.5);

        // Radial and tangential directions
        const radialX = dx / dist;
        const radialY = dy / dist;
        const tangentX = -radialY;
        const tangentY = radialX;

        // Attraction strength - softer for organic feel
        let attractionStrength;
        if (dist > orbitRadius) {
          const pullIntensity = Math.pow(1 - (dist - orbitRadius) / (influenceRadius - orbitRadius), 1.5);
          attractionStrength = 0.35 * pullIntensity;
        } else {
          attractionStrength = -0.15 * (1 - dist / orbitRadius);
        }

        // Orbit strength - gentler for organic flow
        const orbitStrength = 0.3 * falloff;

        this.applyForce(
          radialX * attractionStrength + tangentX * orbitStrength,
          radialY * attractionStrength + tangentY * orbitStrength
        );

        this.alignment = p.lerp(this.alignment, falloff, 0.2);
      } else {
        this.alignment = p.lerp(this.alignment, 0, 0.03);
      }
    }

    update(mouseActive, mx, my) {
      this.wander();

      if (mouseActive) {
        this.attractToMouse(mx, my);
      }

      // Apply acceleration
      this.vx += this.ax;
      this.vy += this.ay;

      // Limit speed
      const speed = p.sqrt(this.vx * this.vx + this.vy * this.vy);
      const currentMaxSpeed = this.maxSpeed + this.alignment * 2.5;
      if (speed > currentMaxSpeed) {
        this.vx = (this.vx / speed) * currentMaxSpeed;
        this.vy = (this.vy / speed) * currentMaxSpeed;
      }

      // Apply velocity
      this.x += this.vx;
      this.y += this.vy;

      // Friction
      this.vx *= 0.98;
      this.vy *= 0.98;

      // Reset acceleration
      this.ax = 0;
      this.ay = 0;

      this.age++;
      this.edges();
    }

    edges() {
      const margin = 20;
      if (this.x < -margin) { this.x = p.width + margin; }
      if (this.x > p.width + margin) { this.x = -margin; }
      if (this.y < -margin) { this.y = p.height + margin; }
      if (this.y > p.height + margin) { this.y = -margin; }

      if (this.age > this.life) {
        this.reset();
      }
    }

    show(isDarkMode) {
      const color = isDarkMode ? cyanColor : darkCyan;

      // Base alpha with age fade
      let baseAlpha = isDarkMode ? 95 : 110;
      const fadeIn = 30;
      const fadeOut = 60;

      if (this.age < fadeIn) {
        baseAlpha = p.map(this.age, 0, fadeIn, 0, baseAlpha);
      } else if (this.age > this.life - fadeOut) {
        baseAlpha = p.map(this.age, this.life - fadeOut, this.life, baseAlpha, 0);
      }

      // Breathing effect
      const breathe = p.sin(p.frameCount * this.breatheSpeed + this.breatheOffset);
      const pulseScale = 1 + breathe * 0.25;

      const radius = this.baseRadius * pulseScale;
      const alignmentBoost = 1 + this.alignment * 0.5;
      const finalRadius = radius * alignmentBoost;
      const finalAlpha = Math.min(baseAlpha * (1 + this.alignment * 0.5), isDarkMode ? 145 : 160);

      // Single circle with slight glow from blend mode
      p.noStroke();
      p.fill(color.r, color.g, color.b, finalAlpha);
      p.circle(this.x, this.y, finalRadius * 2);
    }
  }

  // ============================================
  // P5.JS SETUP
  // ============================================
  p.setup = () => {
    // Check for reduced motion preference
    prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

    // Adjust cell count based on screen size
    if (p.width < 768) {
      cellCount = 250;
    } else if (p.width < 1024) {
      cellCount = 400;
    } else {
      cellCount = 600;
    }

    // If reduced motion, use minimal particles
    if (prefersReducedMotion) {
      cellCount = Math.floor(cellCount * 0.3);
    }

    // Initialize cells
    for (let i = 0; i < cellCount; i++) {
      cells.push(new Cell());
    }

    p.background(0);
  };

  // ============================================
  // P5.JS DRAW LOOP
  // ============================================
  p.draw = () => {
    if (!heroSection) return;

    // Skip animation frames if reduced motion
    if (prefersReducedMotion && p.frameCount % 3 !== 0) {
      return;
    }

    const isDarkMode = document.documentElement.getAttribute('data-theme') !== 'light';

    // Clear background
    if (isDarkMode) {
      p.background(0);
    } else {
      p.background(248);
    }

    // Check mouse position
    isMouseInHero = p.mouseX >= 0 && p.mouseX <= p.width &&
                    p.mouseY >= 0 && p.mouseY <= p.height;

    // Blend mode for glow in dark mode
    if (isDarkMode) {
      p.blendMode(p.ADD);
    }

    // Update and draw cells
    for (let cell of cells) {
      cell.update(isMouseInHero, p.mouseX, p.mouseY);
      cell.show(isDarkMode);
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

      let targetCount = p.width < 768 ? 250 : (p.width < 1024 ? 400 : 600);
      if (prefersReducedMotion) {
        targetCount = Math.floor(targetCount * 0.3);
      }

      if (cells.length > targetCount) {
        cells = cells.slice(0, targetCount);
      } else {
        while (cells.length < targetCount) {
          cells.push(new Cell());
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
    if (!isMouseInHero || prefersReducedMotion) return;

    for (let cell of cells) {
      const dx = cell.x - p.mouseX;
      const dy = cell.y - p.mouseY;
      const distSq = dx * dx + dy * dy;
      const burstRadius = 150;

      if (distSq < burstRadius * burstRadius && distSq > 0) {
        const dist = p.sqrt(distSq);
        const force = (1 - dist / burstRadius) * 3;
        cell.vx += (dx / dist) * force;
        cell.vy += (dy / dist) * force;
      }
    }
  };

  // ============================================
  // TOUCH SUPPORT
  // ============================================
  p.touchStarted = () => {
    if (p.touches.length > 0 && !prefersReducedMotion) {
      const touch = p.touches[0];
      if (touch.x >= 0 && touch.x <= p.width && touch.y >= 0 && touch.y <= p.height) {
        for (let cell of cells) {
          const dx = cell.x - touch.x;
          const dy = cell.y - touch.y;
          const distSq = dx * dx + dy * dy;
          const burstRadius = 120;

          if (distSq < burstRadius * burstRadius && distSq > 0) {
            const dist = p.sqrt(distSq);
            const force = (1 - dist / burstRadius) * 2.5;
            cell.vx += (dx / dist) * force;
            cell.vy += (dy / dist) * force;
          }
        }
      }
    }
    return true;
  };

  p.touchMoved = () => {
    return true;
  };
};

// Initialize only if container exists
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('hero-canvas-container');
  if (container) {
    new p5(heroParticles);
  }
});
