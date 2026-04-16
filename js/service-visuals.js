/**
 * Service visuals — scroll position directly controls visual state.
 *
 * No physics simulation. No triggers. Scroll at 50% = the 50% frame.
 * Scroll back = animation reverses. The scroll IS the timeline.
 */

(function () {
  function isDarkMode() {
    return document.documentElement.getAttribute('data-theme') !== 'light';
  }

  function gold() { return isDarkMode() ? [251, 226, 72] : [201, 181, 10]; }
  function coral() { return isDarkMode() ? [207, 90, 90] : [184, 69, 69]; }
  function teal() { return isDarkMode() ? [82, 144, 153] : [45, 90, 102]; }

  function isMobile() { return window.innerWidth < 768; }

  // Track scroll changes so sketches skip redraws when idle
  var _lastProgress = [-1, -1, -1];

  function getProgress(panelIndex) {
    if (isMobile()) {
      // Stacked layout: scroll-driven by the panel's own viewport position
      var panel = document.querySelectorAll('.service-panel')[panelIndex];
      if (!panel) return 0;
      var rect = panel.getBoundingClientRect();
      var viewH = window.innerHeight;
      var center = rect.top + rect.height * 0.5;
      var p = 1 - (center / viewH);
      return Math.max(0, Math.min(1, p * 1.6));
    }
    const state = window.__serviceScrollState;
    if (!state) return 0;
    if (state.activeIndex > panelIndex) return 1;
    if (state.activeIndex < panelIndex) return 0;
    return Math.max(0, Math.min(1, state.progress));
  }

  function manageVisibility(container, sketchFn, panelIndex) {
    if (!container) return;
    let instance = null;
    let isActive = false;

    // Mobile path: per-container intersection, no dependency on pin state
    if (isMobile()) {
      var mobileObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting && !instance) {
            instance = sketchFn(container, panelIndex);
          } else if (!e.isIntersecting && instance) {
            instance.remove();
            instance = null;
            container.querySelectorAll('canvas').forEach(function (c) { c.remove(); });
          }
        });
      }, { threshold: 0.1 });
      mobileObserver.observe(container);
      return;
    }

    function checkActive() {
      var state = window.__serviceScrollState;
      var shouldRun = state && state.activeIndex === panelIndex;
      if (shouldRun && !instance) {
        instance = sketchFn(container, panelIndex);
      } else if (!shouldRun && instance) {
        instance.remove();
        instance = null;
        container.querySelectorAll('canvas').forEach(c => c.remove());
      }
    }

    // Check on scroll which panel is active
    var sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        isActive = e.isIntersecting;
        if (isActive) {
          checkActive();
        } else if (instance) {
          instance.remove();
          instance = null;
          container.querySelectorAll('canvas').forEach(c => c.remove());
        }
      });
    }, { threshold: 0.01 });

    // Observe the services section, not the individual panel
    var section = document.querySelector('.services-pinned');
    if (section) sectionObserver.observe(section);

    // Re-check when scroll state changes
    window.addEventListener('scroll', function () {
      if (isActive) checkActive();
    }, { passive: true });
  }

  // ========== 1. ALIGNMENT NETWORK ==========
  // progress 0: nodes at scattered positions, faint dashed connections
  // progress 1: nodes at circle positions, solid connections, center visible
  // Every frame is a pure lerp. No physics.
  function alignmentNetwork(container, panelIndex) {
    return new p5(function (p) {
      let NODE_COUNT;
      let startPositions = [];
      let targetPositions = [];
      let sizes = [];
      let w, h;

      p.setup = function () {
        w = container.offsetWidth;
        h = container.offsetHeight;
        p.createCanvas(w, h).style('display', 'block');
        p.frameRate(30);
        NODE_COUNT = w < 600 ? 9 : 14;

        for (let i = 0; i < NODE_COUNT; i++) {
          startPositions.push({
            x: p.random(w * 0.08, w * 0.92),
            y: p.random(h * 0.08, h * 0.92)
          });
          let angle = (p.TWO_PI / NODE_COUNT) * i;
          let gridR = p.min(w, h) * 0.32;
          targetPositions.push({
            x: w / 2 + p.cos(angle) * gridR,
            y: h / 2 + p.sin(angle) * gridR
          });
          sizes.push(p.random(5, 10));
        }
      };

      p.draw = function () {
        let prog = getProgress(panelIndex);
        // Skip redraw if scroll position hasn't changed
        if (Math.abs(prog - _lastProgress[panelIndex]) < 0.001) return;
        _lastProgress[panelIndex] = prog;

        p.clear();
        // Ease the progress for smoother visual
        let t = prog * prog * (3 - 2 * prog); // smoothstep

        // Compute current positions
        let positions = [];
        for (let i = 0; i < NODE_COUNT; i++) {
          positions.push({
            x: p.lerp(startPositions[i].x, targetPositions[i].x, t),
            y: p.lerp(startPositions[i].y, targetPositions[i].y, t)
          });
        }

        // Connections
        let tc = teal();
        for (let i = 0; i < NODE_COUNT; i++) {
          for (let j = i + 1; j < NODE_COUNT; j++) {
            let d = p.dist(positions[i].x, positions[i].y, positions[j].x, positions[j].y);
            let maxD = p.lerp(80, 260, t);
            if (d < maxD) {
              let alpha = p.map(d, 0, maxD, 200, 0) * (0.08 + t * 0.92);
              p.stroke(tc[0], tc[1], tc[2], alpha);
              p.strokeWeight(p.lerp(0.4, 2.2, t));
              if (t < 0.4) {
                p.drawingContext.setLineDash([3, 5]);
              } else {
                p.drawingContext.setLineDash([]);
              }
              p.line(positions[i].x, positions[i].y, positions[j].x, positions[j].y);
            }
          }
        }
        p.drawingContext.setLineDash([]);

        // Nodes
        p.noStroke();
        let gc = gold();
        for (let i = 0; i < NODE_COUNT; i++) {
          let size = sizes[i] * p.lerp(1, 1.6, t);
          let alpha = p.lerp(80, 255, t);
          p.fill(gc[0], gc[1], gc[2], alpha);
          p.ellipse(positions[i].x, positions[i].y, size * 2);
          if (t > 0.4) {
            p.fill(gc[0], gc[1], gc[2], 25 * t);
            p.ellipse(positions[i].x, positions[i].y, size * 4);
          }
        }

        // Center facilitator
        if (t > 0.1) {
          let cs = p.lerp(0, 22, t);
          p.fill(gc[0], gc[1], gc[2], p.lerp(0, 255, t));
          p.ellipse(w / 2, h / 2, cs);
          p.fill(gc[0], gc[1], gc[2], p.lerp(0, 45, t));
          p.ellipse(w / 2, h / 2, cs * 3);
        }
      };

      p.windowResized = function () {
        w = container.offsetWidth; h = container.offsetHeight;
        p.resizeCanvas(w, h);
        NODE_COUNT = w < 600 ? 9 : 14;
        let gridR = p.min(w, h) * 0.32;
        for (let i = 0; i < NODE_COUNT; i++) {
          let angle = (p.TWO_PI / NODE_COUNT) * i;
          targetPositions[i] = { x: w / 2 + p.cos(angle) * gridR, y: h / 2 + p.sin(angle) * gridR };
        }
      };
    }, container);
  }

  // ========== 2. RADIAL PULSE ==========
  // progress 0: center dot only, nodes invisible
  // progress 0-0.4: inner ring fades in, expands to position
  // progress 0.3-0.7: outer ring fades in, expands to position
  // progress 0.5-1.0: connections form between nodes, full brightness
  function radialPulse(container, panelIndex) {
    return new p5(function (p) {
      let w, h;
      let innerNodes = [];
      let outerNodes = [];

      p.setup = function () {
        w = container.offsetWidth;
        h = container.offsetHeight;
        p.createCanvas(w, h).style('display', 'block');
        p.frameRate(30);
        let cx = w / 2, cy = h / 2;
        let isMobile = w < 600;
        let innerCount = isMobile ? 5 : 6;
        let outerCount = isMobile ? 7 : 10;

        for (let i = 0; i < innerCount; i++) {
          let angle = (p.TWO_PI / innerCount) * i + p.random(-0.12, 0.12);
          let r = p.min(w, h) * (isMobile ? 0.18 : 0.15);
          innerNodes.push({
            angle: angle, radius: r,
            x: cx + p.cos(angle) * r,
            y: cy + p.sin(angle) * r,
            size: p.random(isMobile ? 6 : 5, isMobile ? 8 : 7)
          });
        }
        for (let i = 0; i < outerCount; i++) {
          let angle = (p.TWO_PI / outerCount) * i + p.random(-0.08, 0.08);
          let r = p.min(w, h) * (isMobile ? 0.36 : 0.32);
          outerNodes.push({
            angle: angle, radius: r,
            x: cx + p.cos(angle) * r,
            y: cy + p.sin(angle) * r,
            size: p.random(isMobile ? 5 : 4, isMobile ? 7 : 6)
          });
        }
      };

      p.draw = function () {
        let prog = getProgress(panelIndex);
        // Skip redraw if scroll position hasn't changed
        if (Math.abs(prog - _lastProgress[panelIndex]) < 0.001) return;
        _lastProgress[panelIndex] = prog;

        p.clear();
        let cx = w / 2, cy = h / 2;
        let cc = coral();
        let gc = gold();

        // Inner ring visibility: 0 at prog=0, full at prog=0.4
        let innerT = p.constrain(p.map(prog, 0, 0.4, 0, 1), 0, 1);
        // Outer ring visibility: 0 at prog=0.2, full at prog=0.7
        let outerT = p.constrain(p.map(prog, 0.2, 0.7, 0, 1), 0, 1);
        // Connections: 0 at prog=0.5, full at prog=1
        let connT = p.constrain(p.map(prog, 0.5, 1, 0, 1), 0, 1);

        // Ring guides
        p.noFill();
        p.strokeWeight(0.7);
        p.stroke(cc[0], cc[1], cc[2], 25 * innerT);
        p.ellipse(cx, cy, p.min(w, h) * 0.3);
        p.stroke(cc[0], cc[1], cc[2], 25 * outerT);
        p.ellipse(cx, cy, p.min(w, h) * 0.64);

        // Ripple rings: multiple rings emanate outward as you scroll (radar-like)
        let maxR = p.min(w, h) * 0.42;
        let rippleCount = 4;
        p.noFill();
        for (let i = 0; i < rippleCount; i++) {
          let rippleStart = i * 0.2;
          let rippleT = p.constrain(p.map(prog, rippleStart, rippleStart + 0.5, 0, 1), 0, 1);
          if (rippleT > 0) {
            let r = p.lerp(8, maxR, rippleT);
            let alpha = p.map(rippleT, 0, 1, 150, 0);
            p.stroke(cc[0], cc[1], cc[2], alpha);
            p.strokeWeight(p.lerp(3, 0.8, rippleT));
            p.ellipse(cx, cy, r * 2);
          }
        }

        // All nodes for connection drawing
        let allNodes = [];

        // Inner ring nodes: expand from center
        p.noStroke();
        for (let node of innerNodes) {
          let r = node.radius * innerT;
          let nx = cx + p.cos(node.angle) * r;
          let ny = cy + p.sin(node.angle) * r;
          let alpha = p.lerp(0, 220, innerT);
          let s = node.size * p.lerp(0.3, 1, innerT);
          p.fill(gc[0], gc[1], gc[2], alpha);
          p.ellipse(nx, ny, s * 2);
          if (innerT > 0.5) {
            p.fill(gc[0], gc[1], gc[2], innerT * 25);
            p.ellipse(nx, ny, s * 3.5);
          }
          allNodes.push({ x: nx, y: ny, t: innerT });
        }

        // Outer ring nodes: expand from center
        for (let node of outerNodes) {
          let r = node.radius * outerT;
          let nx = cx + p.cos(node.angle) * r;
          let ny = cy + p.sin(node.angle) * r;
          let alpha = p.lerp(0, 200, outerT);
          let s = node.size * p.lerp(0.3, 1, outerT);
          p.fill(gc[0], gc[1], gc[2], alpha);
          p.ellipse(nx, ny, s * 2);
          if (outerT > 0.5) {
            p.fill(gc[0], gc[1], gc[2], outerT * 20);
            p.ellipse(nx, ny, s * 3.5);
          }
          allNodes.push({ x: nx, y: ny, t: outerT });
        }

        // Connections between nearby nodes (fade in with connT)
        if (connT > 0) {
          p.strokeWeight(1.4);
          for (let i = 0; i < allNodes.length; i++) {
            for (let j = i + 1; j < allNodes.length; j++) {
              let d = p.dist(allNodes[i].x, allNodes[i].y, allNodes[j].x, allNodes[j].y);
              if (d < p.min(w, h) * 0.22 && d > 10) {
                let alpha = p.map(d, 10, p.min(w, h) * 0.22, 180, 0) * connT;
                p.stroke(gc[0], gc[1], gc[2], alpha);
                p.line(allNodes[i].x, allNodes[i].y, allNodes[j].x, allNodes[j].y);
              }
            }
          }
        }

        // Center catalyst: always visible, grows with scroll
        let centerSize = p.lerp(10, 20, prog);
        p.noStroke();
        p.fill(cc[0], cc[1], cc[2], p.lerp(120, 240, prog));
        p.ellipse(cx, cy, centerSize);
        p.fill(cc[0], cc[1], cc[2], p.lerp(15, 40, prog));
        p.ellipse(cx, cy, centerSize * 2.5);
      };

      p.windowResized = function () {
        w = container.offsetWidth; h = container.offsetHeight;
        p.resizeCanvas(w, h);
      };
    }, container);
  }

  // ========== 3. GRAVITATIONAL PAIR ==========
  // Orbit angle uses frameCount for rotation, but radius, brightness,
  // connection strength all controlled by scroll.
  // progress 0: wide orbit, dim nodes, faint connection
  // progress 1: tight orbit, bright nodes, strong connection, visible trail
  function gravitationalPair(container, panelIndex) {
    return new p5(function (p) {
      let w, h;
      let trail = [];
      const TRAIL_LEN = 60;

      p.setup = function () {
        w = container.offsetWidth;
        h = container.offsetHeight;
        p.createCanvas(w, h).style('display', 'block');
        p.frameRate(30);
      };

      p.draw = function () {
        let prog = getProgress(panelIndex);
        // Skip redraw if scroll position hasn't changed
        if (Math.abs(prog - _lastProgress[panelIndex]) < 0.001) return;
        _lastProgress[panelIndex] = prog;

        p.clear();
        let cx = w / 2, cy = h / 2;
        let tc = teal();

        // Orbit: wider range, bolder presence
        let orbitRadius = p.lerp(p.min(w, h) * 0.35, p.min(w, h) * 0.1, prog);
        let angle = prog * p.TWO_PI * 3;

        let ax = cx + p.cos(angle) * orbitRadius;
        let ay = cy + p.sin(angle) * orbitRadius;
        let bx = cx + p.cos(angle + p.PI) * orbitRadius;
        let by = cy + p.sin(angle + p.PI) * orbitRadius;

        // Trail (longer, thicker, more visible)
        trail.push({ ax, ay, bx, by });
        if (trail.length > TRAIL_LEN) trail.shift();

        let trailVis = p.lerp(0.2, 1, prog);
        for (let i = 0; i < trail.length; i++) {
          let alpha = p.map(i, 0, trail.length, 0, 60) * trailVis;
          p.stroke(tc[0], tc[1], tc[2], alpha);
          p.strokeWeight(p.lerp(0.4, 1.2, prog));
          p.line(trail[i].ax, trail[i].ay, trail[i].bx, trail[i].by);
        }

        // Multiple orbit path rings (echoes of the orbit at different stages)
        p.noFill();
        for (let r = 0; r < 3; r++) {
          let ringR = p.lerp(p.min(w, h) * 0.35, p.min(w, h) * 0.1, p.constrain(prog - r * 0.15, 0, 1));
          let ringAlpha = p.lerp(4, 15, prog) * (1 - r * 0.3);
          p.stroke(tc[0], tc[1], tc[2], ringAlpha);
          p.strokeWeight(0.4);
          p.ellipse(cx, cy, ringR * 2);
        }

        // Connection line (thicker)
        let dist = orbitRadius * 2;
        let connAlpha = p.lerp(40, 220, prog);
        p.stroke(tc[0], tc[1], tc[2], connAlpha);
        p.strokeWeight(p.lerp(0.8, 3.5, prog));
        p.line(ax, ay, bx, by);

        // Midpoint energy (larger)
        p.noStroke();
        let midSize = p.lerp(5, 22, prog);
        p.fill(tc[0], tc[1], tc[2], p.lerp(15, 60, prog));
        p.ellipse(cx, cy, midSize);
        p.fill(tc[0], tc[1], tc[2], p.lerp(5, 20, prog));
        p.ellipse(cx, cy, midSize * 2.5);

        // Nodes (bigger, bolder halos)
        let nodeSize = p.lerp(16, 30, prog);
        let haloSize = p.lerp(35, 80, prog);

        // Node A
        p.fill(tc[0], tc[1], tc[2], p.lerp(6, 30, prog));
        p.ellipse(ax, ay, haloSize);
        p.fill(tc[0], tc[1], tc[2], p.lerp(3, 12, prog));
        p.ellipse(ax, ay, haloSize * 1.6);
        p.fill(tc[0], tc[1], tc[2], p.lerp(140, 255, prog));
        p.ellipse(ax, ay, nodeSize);

        // Node B
        p.fill(tc[0], tc[1], tc[2], p.lerp(6, 25, prog));
        p.ellipse(bx, by, haloSize * 0.9);
        p.fill(tc[0], tc[1], tc[2], p.lerp(3, 10, prog));
        p.ellipse(bx, by, haloSize * 1.5);
        p.fill(tc[0], tc[1], tc[2], p.lerp(140, 245, prog));
        p.ellipse(bx, by, nodeSize * 0.9);
      };

      p.windowResized = function () {
        w = container.offsetWidth; h = container.offsetHeight;
        p.resizeCanvas(w, h);
      };
    }, container);
  }

  // ========== INIT ==========
  document.addEventListener('DOMContentLoaded', function () {
    const panels = document.querySelectorAll('.service-panel');
    const sketches = [alignmentNetwork, radialPulse, gravitationalPair];
    panels.forEach(function (panel, i) {
      const visual = panel.querySelector('.service-visual');
      if (visual && sketches[i]) {
        const svg = visual.querySelector('.service-svg');
        if (svg) svg.remove();
        manageVisibility(visual, sketches[i], i);
      }
    });
  });
})();
