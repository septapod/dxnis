const heroParticlesAmber = (p) => {
  let cells = [];
  let cellCount = 200;
  let canvas;
  let isMouseInHero = false;
  let prefersReducedMotion = false;
  let flashChance = 0.006;
  let prevMouseX = -1;
  let prevMouseY = -1;
  let mouseSpeedSmooth = 0;
  let mouseInitialized = false;

  const FLASH_RISE = 10;
  const FLASH_HOLD = 6;
  const FLASH_FALL = 30;
  const FLASH_COOLDOWN_MIN = 45;
  const FLASH_COOLDOWN_MAX = 180;

  const primaryColor = { r: 212, g: 160, b: 66 };
  const dimColor = { r: 140, g: 105, b: 45 };
  const accentColor = { r: 196, g: 93, b: 62 };

  class Cell {
    constructor() { this.reset(); }

    reset() {
      this.x = p.random(p.width);
      this.y = p.random(p.height);
      this.vx = p.random(-0.3, 0.3);
      this.vy = p.random(-0.3, 0.3);
      this.ax = 0;
      this.ay = 0;
      this.baseRadius = p.random(1.8, 3.0);
      this.maxSpeed = p.random(1.5, 3.0);
      this.colorSet = Math.random() < 0.25 ? 'accent' : 'primary';
      this.life = p.random(300, 600);
      this.age = 0;
      this.glowState = 'idle';
      this.glowTimer = 0;
      this.glowIntensity = 0;
      this.flashPeak = 1.0;
      this.flashCooldown = Math.floor(Math.random() * FLASH_COOLDOWN_MAX);
      this.alignment = 0;
      this.orbitDirection = Math.random() < 0.5 ? 1 : -1;
      this.baseBrightness = Math.random() < 0.7 ? p.random(0.55, 0.75) : p.random(0.75, 1.0);
      this.noiseOffsetX = p.random(1000);
      this.noiseOffsetY = p.random(1000);
    }

    applyForce(fx, fy) { this.ax += fx; this.ay += fy; }

    wander() {
      const timeShift = p.frameCount * 0.003;
      const angle = p.noise(this.noiseOffsetX + timeShift, this.noiseOffsetY + timeShift) * p.TWO_PI * 2;
      this.applyForce(p.cos(angle) * 0.14, p.sin(angle) * 0.14);
    }

    attractToMouse(mx, my) {
      const dx = mx - this.x;
      const dy = my - this.y;
      const distSq = dx * dx + dy * dy;
      const influenceRadius = 600;
      const baseOrbitRadius = 110;

      if (distSq < influenceRadius * influenceRadius && distSq > 4) {
        const dist = p.sqrt(distSq);
        const normalizedDist = dist / influenceRadius;
        const falloff = Math.pow(1 - normalizedDist, 2.5);

        const radialX = dx / dist;
        const radialY = dy / dist;
        const tangentX = -radialY * this.orbitDirection;
        const tangentY = radialX * this.orbitDirection;

        const angle = Math.atan2(dy, dx);
        const weaveOffset = Math.sin(angle * 2) * 30 * this.orbitDirection;
        const orbitRadius = baseOrbitRadius + weaveOffset;

        let attractionStrength;
        if (dist > orbitRadius) {
          const pullIntensity = Math.pow(1 - (dist - orbitRadius) / (influenceRadius - orbitRadius), 1.5);
          attractionStrength = 0.65 * pullIntensity;
        } else {
          attractionStrength = -0.28 * (1 - dist / orbitRadius);
        }

        let orbitStrength = 0.65 * falloff;

        // Mouse velocity: only dampen at very high speeds
        if (mouseSpeedSmooth > 12) {
          const speedDamp = 0.4;
          attractionStrength *= speedDamp;
          orbitStrength *= speedDamp;
        }

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
        if (this.flashCooldown > 0) { this.flashCooldown--; }
        else if (Math.random() < flashChance) {
          this.glowState = 'rising'; this.glowTimer = FLASH_RISE;
          this.glowIntensity = 0; this.flashPeak = Math.random() < 0.6 ? 1.0 : 0.55;
        }
      } else if (this.glowState === 'rising') {
        this.glowTimer--;
        this.glowIntensity = (1 - this.glowTimer / FLASH_RISE) * this.flashPeak;
        if (this.glowTimer <= 0) { this.glowState = 'hold'; this.glowTimer = FLASH_HOLD; this.glowIntensity = this.flashPeak; }
      } else if (this.glowState === 'hold') {
        this.glowTimer--;
        if (this.glowTimer <= 0) { this.glowState = 'falling'; this.glowTimer = FLASH_FALL; }
      } else if (this.glowState === 'falling') {
        this.glowTimer--;
        this.glowIntensity = (this.glowTimer / FLASH_FALL) * this.flashPeak;
        if (this.glowTimer <= 0) {
          this.glowState = 'idle'; this.glowIntensity = 0;
          this.flashCooldown = Math.floor(FLASH_COOLDOWN_MIN + Math.random() * (FLASH_COOLDOWN_MAX - FLASH_COOLDOWN_MIN));
        }
      }
    }

    update(mouseActive, mx, my) {
      this.updateGlow();
      this.wander();
      if (mouseActive) this.attractToMouse(mx, my);
      this.vx += this.ax; this.vy += this.ay;
      const speed = p.sqrt(this.vx * this.vx + this.vy * this.vy);
      const currentMaxSpeed = this.maxSpeed + this.alignment * 0.5;
      if (speed > currentMaxSpeed) { this.vx = (this.vx / speed) * currentMaxSpeed; this.vy = (this.vy / speed) * currentMaxSpeed; }
      this.x += this.vx; this.y += this.vy;
      this.vx *= 0.97; this.vy *= 0.97;
      this.ax = 0; this.ay = 0;
      this.age++;
      if (this.x < -20) this.x = p.width + 20;
      if (this.x > p.width + 20) this.x = -20;
      if (this.y < -20) this.y = p.height + 20;
      if (this.y > p.height + 20) this.y = -20;
      if (this.age > this.life) this.reset();
    }

    show() {
      const color = this.colorSet === 'accent' ? accentColor : primaryColor;
      let baseAlpha = 140;
      if (this.age < 30) baseAlpha = p.map(this.age, 0, 30, 0, baseAlpha);
      else if (this.age > this.life - 60) baseAlpha = p.map(this.age, this.life - 60, this.life, baseAlpha, 0);

      const idleAlpha = 1.2 * this.baseBrightness;
      const alphaScale = idleAlpha + (3.5 - idleAlpha) * this.glowIntensity;
      const radiusScale = 1 + (1.8 - 1) * this.glowIntensity;

      let finalAlpha = baseAlpha * alphaScale;
      let finalRadius = (this.baseRadius * radiusScale) * (1 + this.alignment * 0.5);

      if (this.alignment > 0.15) {
        const angle = Math.atan2(this.y - p.mouseY, this.x - p.mouseX);
        const cosAngle = Math.cos(angle);
        const isOver = this.orbitDirection === 1 ? cosAngle > 0 : cosAngle < 0;
        const crossingFactor = Math.abs(cosAngle);
        const weaveBrightness = isOver ? 1.0 + (1.0 - crossingFactor) * 0.3 : 0.35 + crossingFactor * 0.65;
        const weaveAmount = Math.min(1, this.alignment * 2);
        finalAlpha *= (1.0 + (weaveBrightness - 1.0) * weaveAmount);
        if (!isOver) finalRadius *= (1.0 - 0.15 * weaveAmount);
      }

      p.noStroke();
      p.fill(color.r, color.g, color.b, finalAlpha);
      p.circle(this.x, this.y, finalRadius * 2);
    }
  }

  p.setup = () => {
    prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const container = document.getElementById('hero-canvas-container');
    if (!container) return;
    canvas = p.createCanvas(container.offsetWidth, container.offsetHeight);
    canvas.parent('hero-canvas-container');

    if (p.width < 768) { cellCount = 120; flashChance = 0.012; }
    else if (p.width < 1024) { cellCount = 200; flashChance = 0.009; }
    else { cellCount = 300; flashChance = 0.006; }

    if (prefersReducedMotion) cellCount = Math.floor(cellCount * 0.3);
    for (let i = 0; i < cellCount; i++) cells.push(new Cell());
    
    p.background(20, 20, 23);
  };

  p.draw = () => {
    p.blendMode(p.BLEND);
    p.background(20, 20, 23);

    isMouseInHero = p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height;

    // Initialize prev mouse on first real mouse movement to avoid speed spike
    if (!mouseInitialized && (p.mouseX !== 0 || p.mouseY !== 0)) {
      prevMouseX = p.mouseX;
      prevMouseY = p.mouseY;
      mouseInitialized = true;
    }
    if (mouseInitialized) {
      const mdx = p.mouseX - prevMouseX;
      const mdy = p.mouseY - prevMouseY;
      mouseSpeedSmooth = mouseSpeedSmooth * 0.85 + Math.sqrt(mdx*mdx + mdy*mdy) * 0.15;
      prevMouseX = p.mouseX; prevMouseY = p.mouseY;
    }

    const breathX = Math.sin(p.frameCount * 0.003) * 0.06;
    const breathY = Math.cos(p.frameCount * 0.002) * 0.04;

    for (let cell of cells) {
      cell.applyForce(breathX, breathY);
      cell.update(isMouseInHero, p.mouseX, p.mouseY);
      cell.show();
    }

    // Connection lines between orbiting particles
    let orbiting = [];
    for (let cell of cells) { if (cell.alignment > 0.15) orbiting.push(cell); }
    if (orbiting.length > 1) {
      p.strokeWeight(1);
      let lc = 0;
      const maxConn = 25;
      const connR = 110;
      const connRSq = connR * connR;
      for (let i = 0; i < orbiting.length && lc < maxConn; i++) {
        for (let j = i+1; j < orbiting.length && lc < maxConn; j++) {
          const dx = orbiting[i].x - orbiting[j].x;
          const dy = orbiting[i].y - orbiting[j].y;
          const dSq = dx*dx + dy*dy;
          if (dSq < connRSq) {
            const d = Math.sqrt(dSq);
            const a = (1 - d/connR) * 60 * Math.min(orbiting[i].alignment, orbiting[j].alignment);
            p.stroke(212, 160, 66, a);
            p.line(orbiting[i].x, orbiting[i].y, orbiting[j].x, orbiting[j].y);
            lc++;
          }
        }
      }
      p.noStroke();
    }
  };

  p.windowResized = () => {
    const container = document.getElementById('hero-canvas-container');
    if (container) {
      p.resizeCanvas(container.offsetWidth, container.offsetHeight);
      let target = p.width < 768 ? 70 : (p.width < 1024 ? 120 : 180);
      if (prefersReducedMotion) target = Math.floor(target * 0.3);
      if (cells.length > target) cells = cells.slice(0, target);
      else while (cells.length < target) cells.push(new Cell());
      p.background(20, 20, 23);
    }
  };

  p.mousePressed = () => {
    if (!isMouseInHero || prefersReducedMotion) return;
    for (let cell of cells) {
      const dx = cell.x - p.mouseX; const dy = cell.y - p.mouseY;
      const dSq = dx*dx + dy*dy;
      if (dSq < 22500 && dSq > 0) {
        const d = p.sqrt(dSq); const f = (1 - d/150) * 2;
        cell.vx += (dx/d)*f; cell.vy += (dy/d)*f;
      }
    }
  };
};

new p5(heroParticlesAmber);