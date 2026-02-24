/**
 * Organic Cell Particle Animation (Performance Optimized)
 *
 * Particles represent diverse perspectives as living cells.
 * They follow a shared flow field for coherent streaming motion,
 * leave fading trails, and attract toward the cursor in a flowing orbit.
 *
 * Optimizations:
 * - Removed O(n²) separation check
 * - Single circle per particle
 * - Respects prefers-reduced-motion
 * - Adaptive quality: auto-reduces particles if FPS drops below 28
 */

const heroParticles = (p) => {
  let cells = [];
  let cellCount = 500;
  let canvas;
  let heroSection;
  let canvasContainer;
  let isMouseInHero = false;
  let prefersReducedMotion = false;

  // Firefly flash chance — set in setup() based on device
  let flashChance = 0.002;

  // Flash timing constants
  const FLASH_RISE = 8;
  const FLASH_HOLD = 4;
  const FLASH_FALL = 24;
  const FLASH_COOLDOWN_MIN = 45;
  const FLASH_COOLDOWN_MAX = 180;

  // Adaptive quality settings
  let targetCellCount = 500;
  let lastFrameTime = 0;
  let fpsHistory = [];
  const FPS_SAMPLE_SIZE = 30;
  const FPS_THRESHOLD_LOW = 28;
  const FPS_CHECK_INTERVAL = 60; // Check every 60 frames
  let framesSinceCheck = 0;
  let qualityReduced = false;

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
      this.vx = p.random(-0.3, 0.3);
      this.vy = p.random(-0.3, 0.3);
      this.ax = 0;
      this.ay = 0;

      // Cell properties
      this.baseRadius = p.random(1.2, 2);
      this.maxSpeed = p.random(1.5, 3.0);
      this.life = p.random(300, 600);
      this.age = 0;

      // Firefly glow state machine
      this.glowState = 'idle';
      this.glowTimer = 0;
      this.glowIntensity = 0;
      this.flashPeak = 1.0;
      this.flashCooldown = Math.floor(Math.random() * FLASH_COOLDOWN_MAX);

      // Alignment tracking
      this.alignment = 0;

      // Per-particle brightness variation — 70% dim-to-mid, 30% noticeably bright
      this.baseBrightness = Math.random() < 0.7
        ? p.random(0.55, 0.75)
        : p.random(0.75, 1.0);

      // Per-particle noise seeds — large range so particles sample independent noise regions
      this.noiseOffsetX = p.random(1000);
      this.noiseOffsetY = p.random(1000);
    }

    applyForce(fx, fy) {
      this.ax += fx;
      this.ay += fy;
    }

    // Per-particle wandering — each particle walks through its own region of noise space
    wander() {
      const timeShift = p.frameCount * 0.003;
      const angle = p.noise(this.noiseOffsetX + timeShift, this.noiseOffsetY + timeShift) * p.TWO_PI * 2;
      this.applyForce(p.cos(angle) * 0.14, p.sin(angle) * 0.14);
    }

    // Attraction to mouse with orbital tendency
    attractToMouse(mx, my) {
      const dx = mx - this.x;
      const dy = my - this.y;
      const distSq = dx * dx + dy * dy;
      const influenceRadius = 600;
      const orbitRadius = 110;

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
          attractionStrength = 0.65 * pullIntensity;
        } else {
          attractionStrength = -0.28 * (1 - dist / orbitRadius);
        }

        // Orbit strength - gentler for organic flow
        const orbitStrength = 0.65 * falloff;

        this.applyForce(
          radialX * attractionStrength + tangentX * orbitStrength,
          radialY * attractionStrength + tangentY * orbitStrength
        );

        this.alignment = p.lerp(this.alignment, falloff, 0.2);
      } else {
        this.alignment = p.lerp(this.alignment, 0, 0.03);
      }
    }

    updateGlow() {
      if (this.glowState === 'idle') {
        if (this.flashCooldown > 0) {
          this.flashCooldown--;
        } else if (Math.random() < flashChance) {
          this.glowState = 'rising';
          this.glowTimer = FLASH_RISE;
          this.glowIntensity = 0;
          this.flashPeak = Math.random() < 0.6 ? 1.0 : 0.55;
        }
      } else if (this.glowState === 'rising') {
        this.glowTimer--;
        this.glowIntensity = (1 - this.glowTimer / FLASH_RISE) * this.flashPeak;
        if (this.glowTimer <= 0) {
          this.glowState = 'hold';
          this.glowTimer = FLASH_HOLD;
          this.glowIntensity = this.flashPeak;
        }
      } else if (this.glowState === 'hold') {
        this.glowTimer--;
        if (this.glowTimer <= 0) {
          this.glowState = 'falling';
          this.glowTimer = FLASH_FALL;
        }
      } else if (this.glowState === 'falling') {
        this.glowTimer--;
        this.glowIntensity = (this.glowTimer / FLASH_FALL) * this.flashPeak;
        if (this.glowTimer <= 0) {
          this.glowState = 'idle';
          this.glowIntensity = 0;
          this.flashCooldown = Math.floor(
            FLASH_COOLDOWN_MIN + Math.random() * (FLASH_COOLDOWN_MAX - FLASH_COOLDOWN_MIN)
          );
        }
      }
    }

    update(mouseActive, mx, my) {
      this.updateGlow();
      this.wander();

      if (mouseActive) {
        this.attractToMouse(mx, my);
      }

      // Apply acceleration
      this.vx += this.ax;
      this.vy += this.ay;

      // Limit speed
      const speed = p.sqrt(this.vx * this.vx + this.vy * this.vy);
      const currentMaxSpeed = this.maxSpeed + this.alignment * 0.5;
      if (speed > currentMaxSpeed) {
        this.vx = (this.vx / speed) * currentMaxSpeed;
        this.vy = (this.vy / speed) * currentMaxSpeed;
      }

      // Apply velocity
      this.x += this.vx;
      this.y += this.vy;

      // Friction
      this.vx *= 0.97;
      this.vy *= 0.97;

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

      // Firefly glow — ambient presence always visible, flashes pop on top
      const IDLE_ALPHA_SCALE = 1.2;
      const FLASH_ALPHA_SCALE = 3.5;
      const FLASH_RADIUS_SCALE = 1.8;

      const idleAlpha = IDLE_ALPHA_SCALE * this.baseBrightness;
      const alphaScale = idleAlpha + (FLASH_ALPHA_SCALE - idleAlpha) * this.glowIntensity;
      const radiusScale = 1 + (FLASH_RADIUS_SCALE - 1) * this.glowIntensity;

      const finalAlpha = baseAlpha * alphaScale;
      const finalRadius = (this.baseRadius * radiusScale) * (1 + this.alignment * 0.5);

      // Single circle with slight glow from blend mode
      p.noStroke();
      p.fill(color.r, color.g, color.b, finalAlpha);
      p.circle(this.x, this.y, finalRadius * 2);
    }
  }

  // ============================================
  // ADAPTIVE QUALITY SYSTEM
  // ============================================
  function checkAdaptiveQuality() {
    const currentTime = performance.now();

    if (lastFrameTime > 0) {
      const deltaTime = currentTime - lastFrameTime;
      const currentFps = 1000 / deltaTime;

      fpsHistory.push(currentFps);
      if (fpsHistory.length > FPS_SAMPLE_SIZE) {
        fpsHistory.shift();
      }
    }
    lastFrameTime = currentTime;

    framesSinceCheck++;

    // Only evaluate quality periodically
    if (framesSinceCheck >= FPS_CHECK_INTERVAL && fpsHistory.length >= FPS_SAMPLE_SIZE) {
      framesSinceCheck = 0;

      const avgFps = fpsHistory.reduce((a, b) => a + b, 0) / fpsHistory.length;

      // If FPS is consistently low, reduce particles
      if (avgFps < FPS_THRESHOLD_LOW && !qualityReduced) {
        const reduceBy = Math.floor(cells.length * 0.3);
        cells.splice(0, reduceBy);
        qualityReduced = true;
        console.log(`Adaptive quality: Reduced to ${cells.length} particles (avg FPS: ${avgFps.toFixed(1)})`);
      }
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
      cellCount = 200;
      flashChance = 0.012;
    } else if (p.width < 1024) {
      cellCount = 350;
      flashChance = 0.009;
    } else {
      cellCount = 500;
      flashChance = 0.006;
    }

    // If reduced motion, use minimal particles
    if (prefersReducedMotion) {
      cellCount = Math.floor(cellCount * 0.3);
    }

    // Store target for adaptive quality reference
    targetCellCount = cellCount;

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

    // Monitor performance and adapt quality
    checkAdaptiveQuality();

    const isDarkMode = document.documentElement.getAttribute('data-theme') !== 'light';

    // Clear canvas each frame — no motion trails
    p.blendMode(p.BLEND);
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

      let targetCount = p.width < 768 ? 150 : (p.width < 1024 ? 250 : 400);
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
      p.background(isDarkMode ? 0 : 248);
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
        const force = (1 - dist / burstRadius) * 2;
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
            const force = (1 - dist / burstRadius) * 2;
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
