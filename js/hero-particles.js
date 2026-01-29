/**
 * Organic Cell Particle Animation
 *
 * Concept: Particles represent diverse perspectives as living cells.
 * They wander independently using Perlin noise, breathe/pulse organically,
 * and gently attract toward the cursor while maintaining separation.
 * Visual metaphor for "bringing people together" through organic alignment.
 *
 * Inspired by "The Nature of Code" principles:
 * - Perlin noise for smooth, biological wandering
 * - Flocking behaviors (separation, cohesion)
 * - Sinusoidal breathing/pulsing
 */

const heroParticles = (p) => {
  let cells = [];
  let cellCount = 1200;
  let canvas;
  let heroSection;
  let canvasContainer;
  let isMouseInHero = false;

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

      // Perlin noise offsets - unique to each cell
      this.noiseOffsetX = p.random(1000);
      this.noiseOffsetY = p.random(1000);
      this.noiseOffsetSize = p.random(1000);

      // Cell properties
      this.baseRadius = p.random(0.5, 1.8);
      this.maxSpeed = p.random(1.5, 3);
      this.life = p.random(300, 600);
      this.age = 0;

      // Breathing phase offset so cells don't pulse in sync
      this.breatheOffset = p.random(p.TWO_PI);
      this.breatheSpeed = p.random(0.015, 0.035);

      // Alignment tracking
      this.alignment = 0;
    }

    applyForce(fx, fy) {
      this.ax += fx;
      this.ay += fy;
    }

    // Perlin noise wandering - smooth, organic curves
    wander() {
      const wanderStrength = 0.15;

      // Use Perlin noise to create smooth directional changes
      const angleX = p.noise(this.noiseOffsetX) * p.TWO_PI * 2;
      const angleY = p.noise(this.noiseOffsetY) * p.TWO_PI * 2;

      this.applyForce(
        p.cos(angleX) * wanderStrength,
        p.sin(angleY) * wanderStrength
      );

      // Advance noise offset for next frame
      this.noiseOffsetX += 0.008;
      this.noiseOffsetY += 0.008;
    }

    // Separation - push away from nearby cells
    separate(cells) {
      const desiredSeparation = 25;
      let steerX = 0;
      let steerY = 0;
      let count = 0;

      for (let other of cells) {
        if (other === this) continue;

        const dx = this.x - other.x;
        const dy = this.y - other.y;
        const distSq = dx * dx + dy * dy;

        if (distSq > 0 && distSq < desiredSeparation * desiredSeparation) {
          const dist = p.sqrt(distSq);
          // Normalize and weight by distance (closer = stronger push)
          steerX += (dx / dist) / dist;
          steerY += (dy / dist) / dist;
          count++;
        }
      }

      if (count > 0) {
        const separationStrength = 0.8;
        this.applyForce(steerX * separationStrength, steerY * separationStrength);
      }
    }

    // Attraction to mouse with orbital tendency
    attractToMouse(mx, my) {
      const dx = mx - this.x;
      const dy = my - this.y;
      const distSq = dx * dx + dy * dy;
      const influenceRadius = 600;
      const orbitRadius = 85;

      if (distSq < influenceRadius * influenceRadius && distSq > 4) {
        const dist = p.sqrt(distSq);
        const normalizedDist = dist / influenceRadius;

        // Stronger falloff curve - much more concentrated near cursor
        const falloff = Math.pow(1 - normalizedDist, 2.5);

        // Radial direction (toward mouse)
        const radialX = dx / dist;
        const radialY = dy / dist;

        // Tangential direction (perpendicular, for orbiting)
        const tangentX = -radialY;
        const tangentY = radialX;

        // Strong, immediate attraction for high concentration
        let attractionStrength;
        if (dist > orbitRadius) {
          // Outside orbit - strong pull inward, stronger when closer
          const pullIntensity = Math.pow(1 - (dist - orbitRadius) / (influenceRadius - orbitRadius), 2);
          attractionStrength = 0.6 * pullIntensity;
        } else {
          // Inside orbit - firm push outward to stay outside ring
          attractionStrength = -0.3 * (1 - dist / orbitRadius);
        }

        // Fast, tight orbit spin
        const orbitStrength = 0.45 * falloff;

        // Apply combined force
        this.applyForce(
          radialX * attractionStrength + tangentX * orbitStrength,
          radialY * attractionStrength + tangentY * orbitStrength
        );

        this.alignment = p.lerp(this.alignment, falloff, 0.2);
      } else {
        this.alignment = p.lerp(this.alignment, 0, 0.03);
      }
    }

    update(mouseActive, mx, my, cells) {
      // Apply behaviors
      this.wander();
      this.separate(cells);

      if (mouseActive) {
        this.attractToMouse(mx, my);
      }

      // Apply acceleration to velocity
      this.vx += this.ax;
      this.vy += this.ay;

      // Limit speed
      const speed = p.sqrt(this.vx * this.vx + this.vy * this.vy);
      const currentMaxSpeed = this.maxSpeed + this.alignment * 2.5;
      if (speed > currentMaxSpeed) {
        this.vx = (this.vx / speed) * currentMaxSpeed;
        this.vy = (this.vy / speed) * currentMaxSpeed;
      }

      // Apply velocity to position
      this.x += this.vx;
      this.y += this.vy;

      // Friction
      this.vx *= 0.98;
      this.vy *= 0.98;

      // Reset acceleration
      this.ax = 0;
      this.ay = 0;

      // Age
      this.age++;

      // Edges and lifecycle
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

      // Base alpha with age fade (subtle for readability)
      let baseAlpha = isDarkMode ? 60 : 80;
      const fadeIn = 30;
      const fadeOut = 60;

      if (this.age < fadeIn) {
        baseAlpha = p.map(this.age, 0, fadeIn, 0, baseAlpha);
      } else if (this.age > this.life - fadeOut) {
        baseAlpha = p.map(this.age, this.life - fadeOut, this.life, baseAlpha, 0);
      }

      // Breathing/pulsing effect
      const breathe = p.sin(p.frameCount * this.breatheSpeed + this.breatheOffset);
      const pulseScale = 1 + breathe * 0.25;

      // Size also affected by Perlin noise for organic variation
      const noisyScale = p.noise(this.noiseOffsetSize) * 0.4 + 0.8;
      this.noiseOffsetSize += 0.005;

      const radius = this.baseRadius * pulseScale * noisyScale;

      // Aligned cells are slightly larger and brighter
      const alignmentBoost = 1 + this.alignment * 0.5;
      const finalRadius = radius * alignmentBoost;
      const finalAlpha = Math.min(baseAlpha * (1 + this.alignment * 0.5), isDarkMode ? 100 : 120);

      // Draw cell membrane (outer ring)
      p.noFill();
      p.stroke(color.r, color.g, color.b, finalAlpha * 0.4);
      p.strokeWeight(0.5);
      p.circle(this.x, this.y, finalRadius * 2.4);

      // Draw cell body
      p.noStroke();
      p.fill(color.r, color.g, color.b, finalAlpha * 0.6);
      p.circle(this.x, this.y, finalRadius * 2);

      // Draw nucleus (brighter center)
      p.fill(color.r, color.g, color.b, finalAlpha);
      p.circle(this.x, this.y, finalRadius * 0.8);
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

    // Adjust cell count based on screen size
    if (p.width < 768) {
      cellCount = 400;
    } else if (p.width < 1024) {
      cellCount = 700;
    } else {
      cellCount = 1200;
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

    const isDarkMode = document.documentElement.getAttribute('data-theme') !== 'light';

    // Clear background (no trails)
    if (isDarkMode) {
      p.background(0);
    } else {
      p.background(248);
    }

    // Check mouse position
    isMouseInHero = p.mouseX >= 0 && p.mouseX <= p.width &&
                    p.mouseY >= 0 && p.mouseY <= p.height;

    // Blend mode for glow effect in dark mode
    if (isDarkMode) {
      p.blendMode(p.ADD);
    }

    // Update and draw cells
    for (let cell of cells) {
      cell.update(isMouseInHero, p.mouseX, p.mouseY, cells);
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

      const targetCount = p.width < 768 ? 400 : (p.width < 1024 ? 700 : 1200);

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
  // CLICK EFFECT - Ripple burst
  // ============================================
  p.mousePressed = () => {
    if (!isMouseInHero) return;

    // Push nearby cells away from click
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
    if (p.touches.length > 0) {
      const touch = p.touches[0];
      if (touch.x >= 0 && touch.x <= p.width && touch.y >= 0 && touch.y <= p.height) {
        // Push nearby cells away
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

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('hero-canvas-container');
  if (container) {
    new p5(heroParticles);
  }
});
