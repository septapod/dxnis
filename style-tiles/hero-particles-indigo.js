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

const heroParticlesIndigo = (p) => {
  let cells = [];
  let cellCount = 300;
  let canvas;
  let heroSection;
  let canvasContainer;
  let isMouseInHero = false;
  let prefersReducedMotion = false;

  // Mouse velocity tracking
  let prevMouseX = 0;
  let prevMouseY = 0;
  let mouseSpeedSmooth = 0;

  // Firefly flash chance — set in setup() based on device
  let flashChance = 0.002;

  // Flash timing constants
  const FLASH_RISE = 6;  // sharper
  const FLASH_HOLD = 3;  // quicker
  const FLASH_FALL = 18;  // quicker fade
  const FLASH_COOLDOWN_MIN = 45;
  const FLASH_COOLDOWN_MAX = 180;

  // Adaptive quality settings
  let targetCellCount = 300;
  let lastFrameTime = 0;
  let fpsHistory = [];
  const FPS_SAMPLE_SIZE = 30;
  const FPS_THRESHOLD_LOW = 28;
  const FPS_CHECK_INTERVAL = 60; // Check every 60 frames
  let framesSinceCheck = 0;
  let qualityReduced = false;

  // Colors — Indigo + Sage palette
  const primaryColor = { r: 99, g: 102, b: 241 };    // indigo
  const dimColor = { r: 60, g: 62, b: 150 };          // dark indigo
  const accentColor = { r: 165, g: 180, b: 252 };     // lavender
  const flashAccent = { r: 232, g: 121, b: 168 };     // magenta (rare flash)

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
      this.baseRadius = p.random(1.0, 1.8);   // smaller, crisper
      this.maxSpeed = p.random(1.8, 3.5);     // slightly faster

      // 20% of particles use lavender accent
      this.colorSet = Math.random() < 0.20 ? 'accent' : 'primary';
      // 10% of flashes use magenta
      this.useMagentaFlash = Math.random() < 0.10;
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

      // Weave orbit: half clockwise, half counterclockwise
      this.orbitDirection = Math.random() < 0.5 ? 1 : -1;

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
      const baseOrbitRadius = 100;

      if (distSq < influenceRadius * influenceRadius && distSq > 4) {
        const dist = p.sqrt(distSq);
        const normalizedDist = dist / influenceRadius;
        const falloff = Math.pow(1 - normalizedDist, 2.5);

        // Radial and tangential directions
        const radialX = dx / dist;
        const radialY = dy / dist;
        const tangentX = -radialY * this.orbitDirection;
        const tangentY = radialX * this.orbitDirection;

        // Weave: oscillate orbit radius so groups physically braid
        const angle = Math.atan2(dy, dx);
        const weaveOffset = Math.sin(angle * 2) * 14 * this.orbitDirection;
        const orbitRadius = baseOrbitRadius + weaveOffset;

        // Attraction strength - softer for organic feel
        let attractionStrength;
        if (dist > orbitRadius) {
          const pullIntensity = Math.pow(1 - (dist - orbitRadius) / (influenceRadius - orbitRadius), 1.5);
          attractionStrength = 0.85 * pullIntensity;  // tighter feedback
        } else {
          attractionStrength = -0.28 * (1 - dist / orbitRadius);
        }

        // Orbit strength - gentler for organic flow
        const orbitStrength = 0.85 * falloff;  // tighter feedback

        // Mouse velocity: slow = strong, fast = weak (Indigo tolerates faster movement)
        const speedFactor = mouseSpeedSmooth < 2 ? 1.0
                          : mouseSpeedSmooth < 10 ? (1.0 - (mouseSpeedSmooth - 2) / 8 * 0.85)
                          : 0.15;
        attractionStrength *= speedFactor;
        orbitStrength *= speedFactor;

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
      let color;
      if (this.useMagentaFlash && this.glowIntensity > 0.5) {
        color = flashAccent;  // magenta spark on flash
      } else if (isDarkMode) {
        color = this.colorSet === 'accent' ? accentColor : primaryColor;
      } else {
        color = this.colorSet === 'accent' ? accentColor : dimColor;
      }

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

      let finalAlpha = baseAlpha * alphaScale;
      let finalRadius = (this.baseRadius * radiusScale) * (1 + this.alignment * 0.5);

      // Weave brightness: over/under modulation when orbiting
      // (stronger contrast for indigo since ADD mode washes out subtlety)
      if (this.alignment > 0.15) {
        const angle = Math.atan2(this.y - p.mouseY, this.x - p.mouseX);
        const cosAngle = Math.cos(angle);
        const isOver = this.orbitDirection === 1 ? cosAngle > 0 : cosAngle < 0;
        const crossingFactor = Math.abs(cosAngle);
        const weaveBrightness = isOver
          ? 1.0 + (1.0 - crossingFactor) * 0.5
          : 0.25 + crossingFactor * 0.75;
        const weaveAmount = Math.min(1, this.alignment * 2);
        finalAlpha *= (1.0 + (weaveBrightness - 1.0) * weaveAmount);
        if (!isOver) finalRadius *= (1.0 - 0.2 * weaveAmount);
      }

      // Single circle with glow from ADD blend mode
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

    heroSection = document.getElementById('home') || document.querySelector('.hero');
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
      cellCount = 120;
      flashChance = 0.012;
    } else if (p.width < 1024) {
      cellCount = 200;
      flashChance = 0.009;
    } else {
      cellCount = 300;
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

    p.background(13, 17, 23);
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
      p.background(13, 17, 23);  // navy #0d1117
    } else {
      p.background(240, 242, 245);  // cool off-white
    }

    // Check mouse position
    isMouseInHero = p.mouseX >= 0 && p.mouseX <= p.width &&
                    p.mouseY >= 0 && p.mouseY <= p.height;

    // Track mouse speed
    const mdx = p.mouseX - prevMouseX;
    const mdy = p.mouseY - prevMouseY;
    const rawSpeed = Math.sqrt(mdx * mdx + mdy * mdy);
    mouseSpeedSmooth = mouseSpeedSmooth * 0.85 + rawSpeed * 0.15;
    prevMouseX = p.mouseX;
    prevMouseY = p.mouseY;

    // Global breathing force (Lissajous drift, slightly faster than Amber)
    const breathX = Math.sin(p.frameCount * 0.0035) * 0.018;
    const breathY = Math.cos(p.frameCount * 0.0025) * 0.012;

    // Blend mode for glow in dark mode
    if (isDarkMode) {
      p.blendMode(p.ADD);
    }

    // Update and draw cells
    for (let cell of cells) {
      cell.applyForce(breathX, breathY);
      cell.update(isMouseInHero, p.mouseX, p.mouseY);
      cell.show(isDarkMode);
    }

    // Connection lines between orbiting particles
    p.blendMode(p.BLEND);  // Lines should use BLEND, not ADD
    let orbiting = [];
    for (let cell of cells) {
      if (cell.alignment > 0.3) orbiting.push(cell);
    }

    if (orbiting.length > 1) {
      p.strokeWeight(0.5);
      let lineCount = 0;
      const maxLines = 30;
      const connDist = 65;
      const connDistSq = connDist * connDist;

      for (let i = 0; i < orbiting.length && lineCount < maxLines; i++) {
        for (let j = i + 1; j < orbiting.length && lineCount < maxLines; j++) {
          const dx = orbiting[i].x - orbiting[j].x;
          const dy = orbiting[i].y - orbiting[j].y;
          const distSq = dx * dx + dy * dy;
          if (distSq < connDistSq) {
            const dist = Math.sqrt(distSq);
            const alpha = (1 - dist / connDist) * 35 * Math.min(orbiting[i].alignment, orbiting[j].alignment);
            p.stroke(99, 102, 241, alpha);
            p.line(orbiting[i].x, orbiting[i].y, orbiting[j].x, orbiting[j].y);
            lineCount++;
          }
        }
      }
      p.noStroke();
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

      let targetCount = p.width < 768 ? 100 : (p.width < 1024 ? 160 : 250);
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
      if (isDarkMode) { p.background(13, 17, 23); } else { p.background(240, 242, 245); }
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
    new p5(heroParticlesIndigo);
  }
});
