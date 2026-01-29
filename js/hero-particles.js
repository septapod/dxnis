/**
 * Interactive Hero Background with p5.js
 * Concept: Alignment emerging from chaos - particles flowing organically,
 * then subtly aligning toward mouse/touch interaction.
 *
 * Visual metaphor: bringing order to complexity through attention/focus
 */

const heroParticles = (p) => {
  let particles = [];
  let particleCount = 150;
  let canvas;
  let heroSection;
  let canvasContainer;

  // Brand colors
  const goldColor = [251, 226, 72]; // #FBE248
  const darkAmber = [180, 140, 40]; // Darker for light mode

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = p.random(p.width);
      this.y = p.random(p.height);
      this.noiseOffsetX = p.random(1000);
      this.noiseOffsetY = p.random(1000);
      this.noiseOffsetAngle = p.random(1000);
      this.noiseOffsetLength = p.random(1000);
      this.noiseOffsetOpacity = p.random(1000);
      this.baseAngle = p.random(p.TWO_PI);
      this.length = p.random(8, 20);
      this.opacity = p.random(0.1, 0.3);
    }

    update() {
      // Noise-driven movement
      const noiseScale = 0.002;
      const noiseStrength = 0.5;

      // Update position with noise
      this.x += p.map(p.noise(this.noiseOffsetX), 0, 1, -noiseStrength, noiseStrength);
      this.y += p.map(p.noise(this.noiseOffsetY), 0, 1, -noiseStrength, noiseStrength);

      // Update noise offsets
      this.noiseOffsetX += 0.005;
      this.noiseOffsetY += 0.005;
      this.noiseOffsetAngle += 0.01;
      this.noiseOffsetLength += 0.005;
      this.noiseOffsetOpacity += 0.003;

      // Base angle from noise field
      this.baseAngle = p.noise(this.x * noiseScale, this.y * noiseScale, this.noiseOffsetAngle) * p.TWO_PI * 2;

      // Vary length and opacity with noise
      this.length = p.map(p.noise(this.noiseOffsetLength), 0, 1, 8, 20);
      this.opacity = p.map(p.noise(this.noiseOffsetOpacity), 0, 1, 0.1, 0.3);

      // Wrap around edges
      if (this.x < -20) this.x = p.width + 20;
      if (this.x > p.width + 20) this.x = -20;
      if (this.y < -20) this.y = p.height + 20;
      if (this.y > p.height + 20) this.y = -20;
    }

    getAngle(mouseX, mouseY, isInteracting) {
      if (!isInteracting) {
        return this.baseAngle;
      }

      // Calculate distance to mouse/touch
      const dx = mouseX - this.x;
      const dy = mouseY - this.y;
      const distance = p.sqrt(dx * dx + dy * dy);

      // Influence radius - particles within this range align
      const influenceRadius = 200;

      if (distance < influenceRadius) {
        // Angle toward mouse
        const targetAngle = p.atan2(dy, dx);

        // Influence strength (stronger closer to cursor)
        const influence = p.map(distance, 0, influenceRadius, 1, 0);
        const easedInfluence = influence * influence; // Ease out

        // Lerp between base angle and target angle
        return p.lerp(this.baseAngle, targetAngle, easedInfluence * 0.8);
      }

      return this.baseAngle;
    }

    draw(mouseX, mouseY, isInteracting, isDarkMode) {
      const angle = this.getAngle(mouseX, mouseY, isInteracting);

      // Calculate line endpoints
      const halfLength = this.length / 2;
      const x1 = this.x - p.cos(angle) * halfLength;
      const y1 = this.y - p.sin(angle) * halfLength;
      const x2 = this.x + p.cos(angle) * halfLength;
      const y2 = this.y + p.sin(angle) * halfLength;

      // Set color based on theme
      const color = isDarkMode ? goldColor : darkAmber;
      p.stroke(color[0], color[1], color[2], this.opacity * 255);
      p.strokeWeight(1.5);
      p.line(x1, y1, x2, y2);
    }
  }

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

    // Reduce particle count on mobile for performance
    if (p.width < 768) {
      particleCount = 80;
    } else if (p.width < 1024) {
      particleCount = 120;
    }

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Set frame rate for performance (30fps is sufficient for subtle animation)
    p.frameRate(30);
  };

  p.draw = () => {
    if (!heroSection) return;

    // Check dark mode from document attribute
    const isDarkMode = document.documentElement.getAttribute('data-theme') !== 'light';

    // Clear canvas (transparent background)
    p.clear();

    // Check if mouse is over the hero section
    const isInteracting = p.mouseX >= 0 && p.mouseX <= p.width &&
                          p.mouseY >= 0 && p.mouseY <= p.height;

    // Update and draw particles
    for (let particle of particles) {
      particle.update();
      particle.draw(p.mouseX, p.mouseY, isInteracting, isDarkMode);
    }
  };

  p.windowResized = () => {
    if (heroSection && canvasContainer) {
      const width = heroSection.offsetWidth || window.innerWidth;
      const height = heroSection.offsetHeight || window.innerHeight;
      p.resizeCanvas(width, height);

      // Adjust particle count on resize
      const targetCount = p.width < 768 ? 80 : (p.width < 1024 ? 120 : 150);

      if (particles.length > targetCount) {
        particles = particles.slice(0, targetCount);
      } else {
        while (particles.length < targetCount) {
          particles.push(new Particle());
        }
      }
    }
  };

  // Touch support - p5.js maps touch to mouseX/mouseY automatically
  p.touchStarted = () => {
    return true; // Prevent default to allow page scroll
  };

  p.touchMoved = () => {
    return true; // Prevent default to allow page scroll
  };
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('hero-canvas-container');
  if (container) {
    new p5(heroParticles);
  }
});
