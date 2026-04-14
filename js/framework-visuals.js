/**
 * Framework visuals — scroll-driven sketches for "What I See" section.
 *
 * Three failure modes, three distinct visual metaphors:
 * 1. Hidden Misalignment — arrows that reveal divergence
 * 2. Plans Without Choices — grid that floods with false priority
 * 3. Untested Assumptions — path that fractures into unexamined branches
 *
 * Same scroll-position-as-timeline pattern as service-visuals.js
 * but entirely different visual vocabulary (structural/diagnostic vs organic/living).
 */

(function () {
  function isDarkMode() {
    return document.documentElement.getAttribute('data-theme') !== 'light';
  }

  function gold() { return isDarkMode() ? [251, 226, 72] : [201, 181, 10]; }
  function coral() { return isDarkMode() ? [207, 90, 90] : [184, 69, 69]; }
  function teal() { return isDarkMode() ? [82, 144, 153] : [45, 90, 102]; }
  function dim() { return isDarkMode() ? [60, 60, 68] : [180, 180, 175]; }
  function bg() { return isDarkMode() ? [9, 9, 11] : [250, 250, 248]; }

  var _lastScrollY = -1;
  function getFrameworkProgress(index) {
    var item = document.querySelectorAll('.framework-item')[index];
    if (!item) return 0;
    var rect = item.getBoundingClientRect();
    var viewH = window.innerHeight;
    // Completes when item center reaches viewport center (fully visible)
    var itemCenter = rect.top + rect.height * 0.5;
    var progress = 1 - (itemCenter / viewH);
    return Math.max(0, Math.min(1, progress * 1.8));
  }

  // Track scroll position so sketches can skip redundant redraws
  var _scrollChanged = true;
  window.addEventListener('scroll', function () { _scrollChanged = true; }, { passive: true });

  function manageVisibility(container, sketchFn, index) {
    if (!container) return;
    var instance = null;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && !instance) {
          instance = sketchFn(container, index);
        } else if (!e.isIntersecting && instance) {
          instance.remove();
          instance = null;
          container.querySelectorAll('canvas').forEach(function (c) { c.remove(); });
        }
      });
    }, { threshold: 0.1 });
    observer.observe(container);
  }

  // ========== 1. HIDDEN MISALIGNMENT ==========
  // Arrows that appear aligned at progress=0 but reveal their true
  // divergent directions as you scroll. The false consensus dissolves.
  function hiddenMisalignment(container, index) {
    return new p5(function (p) {
      var ARROW_COUNT = 12;
      var arrows = [];
      var w, h;

      p.setup = function () {
        w = container.offsetWidth;
        h = container.offsetHeight;
        p.createCanvas(w, h).style('display', 'block');
        p.frameRate(24);

        var baseAngle = -p.HALF_PI;
        for (var i = 0; i < ARROW_COUNT; i++) {
          var col = i % 4;
          var row = Math.floor(i / 4);
          arrows.push({
            x: w * 0.2 + col * (w * 0.2),
            y: h * 0.2 + row * (h * 0.25),
            alignedAngle: baseAngle + p.random(-0.08, 0.08),
            trueAngle: baseAngle + p.random(-p.PI * 0.6, p.PI * 0.6),
            len: p.random(28, 42),
            weight: p.random(1.8, 2.8)
          });
        }
      };

      var _lastT1 = -1;
      p.draw = function () {
        var prog = getFrameworkProgress(index);
        var t = prog * prog * (3 - 2 * prog);
        if (Math.abs(t - _lastT1) < 0.002 && !_scrollChanged) return;
        _lastT1 = t;
        p.clear();
        var gc = gold();
        var dc = dim();

        for (var i = 0; i < arrows.length; i++) {
          var a = arrows[i];
          var angle = p.lerp(a.trueAngle, a.alignedAngle, t);
          var divergence = Math.abs(a.trueAngle - a.alignedAngle);
          var normalizedDiv = divergence / (p.PI * 0.6);

          // Color shifts from dim (scattered) toward gold (aligned) as measurement reveals
          var cohesion = t * (1 - normalizedDiv * (1 - t));
          var r = p.lerp(dc[0], gc[0], cohesion);
          var g = p.lerp(dc[1], gc[1], cohesion);
          var b = p.lerp(dc[2], gc[2], cohesion);
          var alpha = p.lerp(80, 240, t);

          var x2 = a.x + p.cos(angle) * a.len;
          var y2 = a.y + p.sin(angle) * a.len;

          // Arrow shaft
          p.stroke(r, g, b, alpha);
          p.strokeWeight(a.weight);
          p.line(a.x, a.y, x2, y2);

          // Arrowhead
          p.noStroke();
          p.fill(r, g, b, alpha);
          p.push();
          p.translate(x2, y2);
          p.rotate(angle);
          p.triangle(0, 0, -10, -4, -10, 4);
          p.pop();

          // Connection lines emerge between aligned arrows
          if (t > 0.5) {
            var connAlpha = (t - 0.5) * 2 * 40 * (1 - normalizedDiv * 0.5);
            if (connAlpha > 2) {
              p.stroke(gc[0], gc[1], gc[2], connAlpha);
              p.strokeWeight(0.5);
              var x2 = a.x + p.cos(angle) * a.len;
              var y2 = a.y + p.sin(angle) * a.len;
              if (i < arrows.length - 1) {
                var next = arrows[i + 1];
                var nextAngle = p.lerp(next.trueAngle, next.alignedAngle, t);
                var nx2 = next.x + p.cos(nextAngle) * next.len;
                var ny2 = next.y + p.sin(nextAngle) * next.len;
                p.line(x2, y2, nx2, ny2);
              }
            }
          }
        }

      };

      p.windowResized = function () {
        w = container.offsetWidth;
        h = container.offsetHeight;
        p.resizeCanvas(w, h);
      };
    }, container);
  }

  // ========== 2. PLANS WITHOUT CHOICES ==========
  // A grid of tiles. At progress=0, two or three are highlighted.
  // As you scroll, more and more light up until every single one
  // is "high priority" — visual noise where nothing stands out.
  function plansWithoutChoices(container, index) {
    return new p5(function (p) {
      var COLS = 8;
      var ROWS = 6;
      var tiles = [];
      var w, h;

      p.setup = function () {
        w = container.offsetWidth;
        h = container.offsetHeight;
        p.createCanvas(w, h).style('display', 'block');
        p.frameRate(24);

        for (var row = 0; row < ROWS; row++) {
          for (var col = 0; col < COLS; col++) {
            tiles.push({
              col: col,
              row: row,
              activateAt: p.random(0, 0.85),
              seed: p.random(100)
            });
          }
        }
        // Sort so a few activate early and most activate later
        tiles.sort(function (a, b) { return a.activateAt - b.activateAt; });
        // Force first 2-3 to activate very early
        tiles[0].activateAt = 0;
        tiles[1].activateAt = 0.02;
        tiles[2].activateAt = 0.05;
      };

      var _lastT2 = -1;
      p.draw = function () {
        var prog = getFrameworkProgress(index);
        var t = prog * prog * (3 - 2 * prog);
        if (Math.abs(t - _lastT2) < 0.002 && !_scrollChanged) return;
        _lastT2 = t;
        p.clear();
        var cc = coral();
        var dc = dim();

        var padX = w * 0.08;
        var padY = h * 0.08;
        var availW = w - padX * 2;
        var availH = h - padY * 2;
        var gap = 4;
        var tileW = (availW - gap * (COLS - 1)) / COLS;
        var tileH = (availH - gap * (ROWS - 1)) / ROWS;

        for (var i = 0; i < tiles.length; i++) {
          var tile = tiles[i];
          var tx = padX + tile.col * (tileW + gap);
          var ty = padY + tile.row * (tileH + gap);

          // At progress=0: everything is lit (noise, no hierarchy)
          // At progress=1: only the 3 real priorities remain, rest fades to dim outlines
          var isChosen = tile.activateAt < 0.06;
          var fadeOutAt = isChosen ? 999 : p.map(tile.activateAt, 0.06, 0.85, 0.15, 0.85);

          if (t < fadeOutAt || isChosen) {
            var fadeT = isChosen ? 1 : p.constrain(p.map(t, Math.max(0, fadeOutAt - 0.2), fadeOutAt, 1, 0), 0, 1);
            var alpha = p.lerp(30, 160, fadeT);

            p.noStroke();
            p.fill(cc[0], cc[1], cc[2], alpha);

            if (isChosen && t > 0.4) {
              // Chosen tiles scale up and separate from the grid
              var growT = p.constrain(p.map(t, 0.4, 0.8, 0, 1), 0, 1);
              var scale = p.lerp(1, 1.6, growT);
              var chosenW = tileW * scale;
              var chosenH = tileH * scale;
              var offsetX = (chosenW - tileW) / 2;
              var offsetY = (chosenH - tileH) / 2;

              p.fill(cc[0], cc[1], cc[2], p.lerp(160, 220, growT));
              p.rect(tx - offsetX, ty - offsetY, chosenW, chosenH, 4);

              // Glow
              p.fill(cc[0], cc[1], cc[2], 35 * growT);
              p.rect(tx - offsetX - 5, ty - offsetY - 5, chosenW + 10, chosenH + 10, 6);
              p.noFill();
              p.stroke(cc[0], cc[1], cc[2], 160 * growT);
              p.strokeWeight(1.5);
              p.rect(tx - offsetX, ty - offsetY, chosenW, chosenH, 4);
            } else {
              p.rect(tx, ty, tileW, tileH, 3);
            }
          } else {
            // Faded out: dim outline, shrinks slightly
            var shrinkT = p.constrain(p.map(t, fadeOutAt, fadeOutAt + 0.15, 0, 1), 0, 1);
            var shrink = p.lerp(1, 0.6, shrinkT);
            var sW = tileW * shrink;
            var sH = tileH * shrink;
            var sOffX = (tileW - sW) / 2;
            var sOffY = (tileH - sH) / 2;
            p.noFill();
            p.stroke(dc[0], dc[1], dc[2], p.lerp(30, 12, shrinkT));
            p.strokeWeight(0.5);
            p.rect(tx + sOffX, ty + sOffY, sW, sH, 2);
          }
        }
      };

      p.windowResized = function () {
        w = container.offsetWidth;
        h = container.offsetHeight;
        p.resizeCanvas(w, h);
      };
    }, container);
  }

  // ========== 3. EVIDENCE — Growing Branch ==========
  // An organic branch grows left to right. At fork points, a dead
  // branch curves away and gets X'd while the trunk continues.
  // Smooth Perlin-noise curve. Branches taper. Trunk thickens as
  // dead ends are pruned. Like finding the right path through testing.
  function testedAssumptions(container, index) {
    return new p5(function (p) {
      var w, h;
      var trunk = [];
      var forks = [];

      p.setup = function () {
        w = container.offsetWidth;
        h = container.offsetHeight;
        p.createCanvas(w, h).style('display', 'block');
        p.frameRate(24);

        // Dense trunk points for smooth organic curve (Perlin noise)
        var pts = 80;
        var startX = w * 0.06;
        var endX = w * 0.94;
        var cy = h * 0.5;
        var nOff = p.random(1000);
        trunk = [];
        for (var i = 0; i <= pts; i++) {
          var frac = i / pts;
          trunk.push({
            x: p.lerp(startX, endX, frac),
            y: cy + (p.noise(nOff + frac * 2.5) - 0.5) * h * 0.15
          });
        }

        // 4 fork points with visible dead-end branches
        var forkIdxs = [
          Math.floor(pts * 0.2),
          Math.floor(pts * 0.4),
          Math.floor(pts * 0.6),
          Math.floor(pts * 0.8)
        ];
        var dirs = [-1, 1, -1, 1];
        var lengths = [h * 0.3, h * 0.25, h * 0.2, h * 0.16];

        forks = [];
        for (var f = 0; f < 4; f++) {
          var idx = forkIdxs[f];
          var origin = trunk[idx];
          // Get trunk direction at fork for natural branching angle
          var next = trunk[Math.min(idx + 3, pts)];
          var trunkAng = Math.atan2(next.y - origin.y, next.x - origin.x);
          var branchAng = trunkAng + dirs[f] * p.random(0.5, 0.8);
          var bLen = lengths[f];

          // Build curved dead branch with many points
          var bPts = [];
          var bx = origin.x;
          var by = origin.y;
          var ang = branchAng;
          var bSegCount = 16;
          for (var s = 0; s < bSegCount; s++) {
            var segLen = bLen / bSegCount;
            ang += dirs[f] * 0.03 + (p.noise(f * 77 + s * 0.4) - 0.5) * 0.12;
            bx += Math.cos(ang) * segLen;
            by += Math.sin(ang) * segLen;
            bPts.push({ x: bx, y: by });
          }

          forks.push({
            trunkIdx: idx,
            trunkFrac: idx / pts,
            points: bPts,
            revealAt: (idx / pts) * 0.85,
            xAt: (idx / pts) * 0.85 + 0.1
          });
        }
      };

      var _lastT3 = -1;
      p.draw = function () {
        var prog = getFrameworkProgress(index);
        var t = prog * prog * (3 - 2 * prog);
        if (Math.abs(t - _lastT3) < 0.001 && !_scrollChanged) return;
        _lastT3 = t;
        _scrollChanged = false;
        p.clear();
        var tc = teal();
        var gc = gold();
        var cc = coral();
        var dc = dim();
        var totalPts = trunk.length;

        // How far the trunk has grown
        var growFrac = p.constrain(t * 1.2, 0, 1);
        var growIdx = Math.floor(growFrac * (totalPts - 1));

        // Count pruned forks for progressive confidence
        var pruned = 0;
        for (var pc = 0; pc < forks.length; pc++) {
          if (t > forks[pc].xAt + 0.04) pruned++;
        }

        // --- Draw dead branches first (behind trunk) ---
        for (var fi = 0; fi < forks.length; fi++) {
          var fork = forks[fi];
          if (growFrac < fork.trunkFrac) continue;

          var brT = p.constrain(p.map(t, fork.revealAt, fork.revealAt + 0.08, 0, 1), 0, 1);
          if (brT <= 0) continue;

          var xT = p.constrain(p.map(t, fork.xAt, fork.xAt + 0.05, 0, 1), 0, 1);
          var origin = trunk[fork.trunkIdx];
          var bPts = fork.points;
          var showCount = Math.floor(brT * bPts.length);

          // Draw branch segments with taper
          var prevX = origin.x;
          var prevY = origin.y;
          var brAlpha = xT > 0 ? p.lerp(140, 90, xT) : 140 * brT;
          p.noFill();

          for (var bs = 0; bs < showCount; bs++) {
            var taper = 1 - (bs / bPts.length) * 0.3;
            var bWeight = p.lerp(2.2, 1, bs / bPts.length);
            if (xT > 0) bWeight *= p.lerp(1, 0.7, xT);

            // After X: shift color toward coral to show it was tested and failed
            var bR = xT > 0 ? p.lerp(tc[0], cc[0], xT * 0.5) : tc[0];
            var bG = xT > 0 ? p.lerp(tc[1], cc[1], xT * 0.5) : tc[1];
            var bB = xT > 0 ? p.lerp(tc[2], cc[2], xT * 0.5) : tc[2];

            p.stroke(bR, bG, bB, brAlpha * taper);
            p.strokeWeight(bWeight);
            if (xT > 0.4) p.drawingContext.setLineDash([3, 4]);
            p.line(prevX, prevY, bPts[bs].x, bPts[bs].y);
            p.drawingContext.setLineDash([]);
            prevX = bPts[bs].x;
            prevY = bPts[bs].y;
          }

          // X mark at branch tip
          if (xT > 0 && showCount > 0) {
            var tip = bPts[showCount - 1];
            if (xT < 0.6) {
              var fSize = p.lerp(4, 20, xT / 0.6);
              var fAlpha = p.lerp(200, 0, xT / 0.6);
              p.noFill();
              p.stroke(cc[0], cc[1], cc[2], fAlpha);
              p.strokeWeight(1.5);
              p.ellipse(tip.x, tip.y, fSize);
            }
            p.stroke(cc[0], cc[1], cc[2], 160 * Math.min(xT * 3, 1));
            p.strokeWeight(2);
            p.line(tip.x - 5, tip.y - 5, tip.x + 5, tip.y + 5);
            p.line(tip.x + 5, tip.y - 5, tip.x - 5, tip.y + 5);
          }
        }

        // --- Draw trunk (on top) as smooth continuous curve ---
        if (growIdx > 1) {
          p.noFill();
          for (var si = 1; si <= growIdx; si++) {
            var sFrac = si / totalPts;
            // How many forks pruned before this point?
            var sPruned = 0;
            for (var sp = 0; sp < forks.length; sp++) {
              if (sFrac > forks[sp].trunkFrac && t > forks[sp].xAt + 0.04) sPruned++;
            }
            var sConf = sPruned / Math.max(forks.length, 1);
            var r = p.lerp(tc[0], gc[0], sConf);
            var g = p.lerp(tc[1], gc[1], sConf);
            var b = p.lerp(tc[2], gc[2], sConf);
            var a = p.lerp(130, 240, sConf);
            var wt = p.lerp(2, 3.5, sConf);

            p.stroke(r, g, b, a);
            p.strokeWeight(wt);
            p.line(trunk[si - 1].x, trunk[si - 1].y, trunk[si].x, trunk[si].y);
          }

          // Trunk glow behind confirmed sections
          if (pruned > 1) {
            var glowConf = pruned / forks.length;
            p.noFill();
            p.stroke(gc[0], gc[1], gc[2], 10 * glowConf);
            p.strokeWeight(10);
            p.beginShape();
            for (var gi = 0; gi < growIdx; gi += 3) {
              p.curveVertex(trunk[gi].x, trunk[gi].y);
            }
            p.endShape();
          }
        }

        // Origin dot
        if (t > 0) {
          p.noStroke();
          p.fill(tc[0], tc[1], tc[2], 180);
          p.ellipse(trunk[0].x, trunk[0].y, 7);
        }

        // Arrival glow
        if (growFrac > 0.9) {
          var arrT = p.map(growFrac, 0.9, 1, 0, 1);
          var last = trunk[totalPts - 1];
          p.noStroke();
          p.fill(gc[0], gc[1], gc[2], 220 * arrT);
          p.ellipse(last.x, last.y, 10 * arrT);
          p.fill(gc[0], gc[1], gc[2], 30 * arrT);
          p.ellipse(last.x, last.y, 28 * arrT);
        }
      };

      p.windowResized = function () {
        w = container.offsetWidth;
        h = container.offsetHeight;
        p.resizeCanvas(w, h);
      };
    }, container);
  }

  // ========== INIT ==========
  document.addEventListener('DOMContentLoaded', function () {
    var items = document.querySelectorAll('.framework-item');
    var sketches = [hiddenMisalignment, plansWithoutChoices, testedAssumptions];
    items.forEach(function (item, i) {
      var visual = item.querySelector('.framework-visual');
      if (visual && sketches[i]) {
        manageVisibility(visual, sketches[i], i);
      }
    });
  });
})();
