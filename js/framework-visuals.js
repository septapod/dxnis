/**
 * Framework visuals — scroll-driven sketches for the three framework conditions.
 *
 * 1. Group Alignment — arrows drift from divergent (cardinal bias) toward consensus
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

  // ========== 1. GROUP ALIGNMENT ==========
  // Arrows start pointing in different directions (cardinal-biased seed
  // with gaussian jitter — four camps, not pure noise). As the reader
  // scrolls, each arrow is pulled by two forces: (1) its own path
  // toward the consensus direction, and (2) the average angle of its
  // grid neighbors. The neighbor pull peaks mid-scroll (t≈0.5),
  // producing visible cluster formation — arrows near already-aligning
  // peers turn faster than isolated ones. Connection lines appear
  // between near-aligned grid neighbors, building up the feedback
  // network as the scroll progresses. End state: all arrows aligned,
  // full connection network.
  function groupAlignment(container, index) {
    return new p5(function (p) {
      var ARROW_COUNT;
      var COLS;
      var ROWS;
      var arrows = [];
      var w, h;
      var arrowLenMin, arrowLenMax, arrowWeightMin, arrowWeightMax, arrowHeadLen;
      var consensusAngle;

      // Shortest-path angle lerp. Without this, an arrow at PI lerping
      // to -HALF_PI would rotate through 0 (east) via linear
      // interpolation instead of taking the shortest route.
      function lerpAngle(from, to, t) {
        var d = to - from;
        while (d > p.PI) d -= p.TWO_PI;
        while (d < -p.PI) d += p.TWO_PI;
        return from + d * t;
      }

      // Circular mean of a list of angles. atan2(Σsin, Σcos) avoids
      // wrap-around bugs that a naive arithmetic mean would introduce.
      function circularMean(angles) {
        var sx = 0, sy = 0;
        for (var k = 0; k < angles.length; k++) {
          sx += Math.cos(angles[k]);
          sy += Math.sin(angles[k]);
        }
        return Math.atan2(sy, sx);
      }

      // Smallest signed angular difference between two angles,
      // normalized to [-PI, PI].
      function angleDelta(a, b) {
        var d = a - b;
        while (d > p.PI) d -= p.TWO_PI;
        while (d < -p.PI) d += p.TWO_PI;
        return d;
      }

      p.setup = function () {
        w = container.offsetWidth;
        h = container.offsetHeight;
        p.createCanvas(w, h).style('display', 'block');
        p.frameRate(24);

        var isMobile = w < 600;
        ARROW_COUNT = isMobile ? 12 : 20;
        COLS = isMobile ? 4 : 5;
        ROWS = Math.ceil(ARROW_COUNT / COLS);
        arrowLenMin = isMobile ? 22 : 28;
        arrowLenMax = isMobile ? 28 : 42;
        arrowWeightMin = isMobile ? 2.0 : 1.8;
        arrowWeightMax = isMobile ? 3.0 : 2.8;
        arrowHeadLen = isMobile ? 8 : 10;

        var padX = isMobile ? 0.12 : 0.14;
        var padY = isMobile ? 0.18 : 0.16;
        var stepX = (1 - padX * 2) / Math.max(COLS - 1, 1);
        var stepY = ROWS > 1 ? (1 - padY * 2) / (ROWS - 1) : 0;

        consensusAngle = -p.HALF_PI;
        // Four cardinal seeds: N, E, S, W. Each arrow picks one and
        // adds gaussian jitter (~23° std dev) so the initial field
        // reads as four camps facing different directions, not pure
        // random noise.
        var cardinals = [-p.HALF_PI, 0, p.HALF_PI, p.PI];
        arrows = [];
        for (var i = 0; i < ARROW_COUNT; i++) {
          var col = i % COLS;
          var row = Math.floor(i / COLS);
          var cardinal = cardinals[i % cardinals.length];
          var seed = cardinal + p.randomGaussian(0, 0.4);
          arrows.push({
            x: w * (padX + col * stepX),
            y: h * (padY + row * stepY),
            col: col,
            row: row,
            seedAngle: seed,
            len: p.random(arrowLenMin, arrowLenMax),
            weight: p.random(arrowWeightMin, arrowWeightMax)
          });
        }

        // Precompute grid neighbors for each arrow. Orthogonal
        // neighbors (up/down/left/right) — deterministic, O(1) lookup
        // per arrow per frame. Edge arrows have 2 neighbors; interior
        // arrows have 3-4. The asymmetry is intentional: it creates
        // visible "edges lagging center" cluster dynamics.
        for (var j = 0; j < arrows.length; j++) {
          arrows[j].neighbors = [];
          for (var k = 0; k < arrows.length; k++) {
            if (k === j) continue;
            var dc = Math.abs(arrows[k].col - arrows[j].col);
            var dr = Math.abs(arrows[k].row - arrows[j].row);
            if (dc + dr === 1) arrows[j].neighbors.push(k);
          }
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

        // PASS A: compute each arrow's raw angle (pass-1 pure lerp).
        // Stored on the arrow object so pass B can reference neighbors.
        for (var i = 0; i < arrows.length; i++) {
          arrows[i].rawAngle = lerpAngle(arrows[i].seedAngle, consensusAngle, t);
        }

        // PASS B: compute each arrow's displayed angle by blending its
        // raw angle toward the circular mean of its grid neighbors'
        // raw angles. Weight peaks at t=0.5 (bell curve) so the
        // feedback loop is visible mid-scroll, tapers to 0 at the ends
        // where pure seed (t=0) and pure consensus (t=1) dominate.
        var feedbackWeight = 4 * t * (1 - t) * 0.55;
        for (var i = 0; i < arrows.length; i++) {
          var a = arrows[i];
          if (a.neighbors.length === 0) {
            a.displayAngle = a.rawAngle;
            continue;
          }
          var neighborAngles = [];
          for (var n = 0; n < a.neighbors.length; n++) {
            neighborAngles.push(arrows[a.neighbors[n]].rawAngle);
          }
          var neighborAvg = circularMean(neighborAngles);
          a.displayAngle = lerpAngle(a.rawAngle, neighborAvg, feedbackWeight);
        }

        // PASS C: render arrows + connection network.
        // Connection threshold: wide at t=0.5 (~46°), tightens to
        // ~9° by t=1. Lines only draw between grid neighbors whose
        // displayed angles are within the threshold.
        var connThreshold = p.lerp(0.8, 0.15, t);
        var connAlphaMax = p.lerp(0, 50, t);

        for (var i = 0; i < arrows.length; i++) {
          var a = arrows[i];
          var angle = a.displayAngle;

          // Normalized divergence: how far the seed was from consensus
          // initially. Drives color cohesion lag for visual depth.
          var seedDiff = angleDelta(a.seedAngle, consensusAngle);
          var normalizedDiv = Math.abs(seedDiff) / p.PI;

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
          p.triangle(0, 0, -arrowHeadLen, -arrowHeadLen * 0.4, -arrowHeadLen, arrowHeadLen * 0.4);
          p.pop();

          // Connection lines: draw between grid neighbors only when
          // their displayed angles fall within the t-modulated
          // threshold. Only draw when j > i to avoid double-rendering
          // each pair.
          if (connAlphaMax > 2) {
            for (var n = 0; n < a.neighbors.length; n++) {
              var j = a.neighbors[n];
              if (j <= i) continue;
              var b2 = arrows[j];
              var diff = Math.abs(angleDelta(angle, b2.displayAngle));
              if (diff < connThreshold) {
                // Fade connection by how cleanly-aligned the pair is
                // (closer to parallel = brighter line).
                var strength = 1 - diff / connThreshold;
                var lineAlpha = connAlphaMax * strength;
                var nx2 = b2.x + p.cos(b2.displayAngle) * b2.len;
                var ny2 = b2.y + p.sin(b2.displayAngle) * b2.len;
                p.stroke(gc[0], gc[1], gc[2], lineAlpha);
                p.strokeWeight(0.6);
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
      var COLS;
      var ROWS;
      var tiles = [];
      var w, h;

      p.setup = function () {
        w = container.offsetWidth;
        h = container.offsetHeight;
        p.createCanvas(w, h).style('display', 'block');
        p.frameRate(24);

        var isMobile = w < 600;
        COLS = isMobile ? 5 : 8;
        ROWS = isMobile ? 4 : 6;

        // Fixed chosen positions so it's consistent across loads
        var chosenCells = isMobile
          ? [[1, 1], [3, 0], [2, 3]]
          : [[1, 2], [4, 1], [6, 4]];
        for (var row = 0; row < ROWS; row++) {
          for (var col = 0; col < COLS; col++) {
            var isFixed = false;
            for (var c = 0; c < chosenCells.length; c++) {
              if (chosenCells[c][0] === col && chosenCells[c][1] === row) isFixed = true;
            }
            tiles.push({
              col: col,
              row: row,
              activateAt: isFixed ? 0 : 0.1 + (col * 7 + row * 13) % 17 / 20,
              isChosen: isFixed
            });
          }
        }
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

        var isMobileDraw = w < 600;
        var padX = w * (isMobileDraw ? 0.08 : 0.1);
        var padY = h * (isMobileDraw ? 0.12 : 0.1);
        var availW = w - padX * 2;
        var availH = h - padY * 2;
        var gap = isMobileDraw ? 5 : 6;
        var tileW = (availW - gap * (COLS - 1)) / COLS;
        var tileH = (availH - gap * (ROWS - 1)) / ROWS;

        for (var i = 0; i < tiles.length; i++) {
          var tile = tiles[i];
          var tx = padX + tile.col * (tileW + gap);
          var ty = padY + tile.row * (tileH + gap);
          var fadeOutAt = tile.isChosen ? 999 : p.map(tile.activateAt, 0.1, 0.95, 0.15, 0.85);

          p.noStroke();
          if (tile.isChosen) {
            var chosenAlpha = t > 0.5 ? p.lerp(140, 220, p.constrain(p.map(t, 0.5, 0.8, 0, 1), 0, 1)) : 140;
            p.fill(cc[0], cc[1], cc[2], chosenAlpha);
            p.rect(tx, ty, tileW, tileH, 3);

            if (t > 0.6) {
              var glowT = p.constrain(p.map(t, 0.6, 0.85, 0, 1), 0, 1);
              p.noFill();
              p.stroke(cc[0], cc[1], cc[2], 120 * glowT);
              p.strokeWeight(1.5);
              p.rect(tx, ty, tileW, tileH, 3);
            }
          } else if (t < fadeOutAt) {
            var preAlpha = p.lerp(130, 60, p.constrain(t / Math.max(fadeOutAt, 0.01), 0, 1));
            p.fill(cc[0], cc[1], cc[2], preAlpha);
            p.rect(tx, ty, tileW, tileH, 3);
          } else {
            var fadeAge = p.constrain(p.map(t, fadeOutAt, fadeOutAt + 0.12, 0, 1), 0, 1);
            p.noFill();
            p.stroke(dc[0], dc[1], dc[2], p.lerp(35, 10, fadeAge));
            p.strokeWeight(0.5);
            p.rect(tx, ty, tileW, tileH, 2);
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

        var isMobile = w < 600;
        // Dense trunk points for smooth organic curve (Perlin noise)
        var pts = isMobile ? 50 : 80;
        var startX = w * (isMobile ? 0.08 : 0.06);
        var endX = w * (isMobile ? 0.92 : 0.94);
        var cy = h * 0.5;
        var nOff = p.random(1000);
        trunk = [];
        for (var i = 0; i <= pts; i++) {
          var frac = i / pts;
          trunk.push({
            x: p.lerp(startX, endX, frac),
            y: cy + (p.noise(nOff + frac * 2.5) - 0.5) * h * (isMobile ? 0.18 : 0.15)
          });
        }

        // 3-4 fork points with visible dead-end branches
        var forkIdxs = isMobile
          ? [Math.floor(pts * 0.25), Math.floor(pts * 0.5), Math.floor(pts * 0.75)]
          : [Math.floor(pts * 0.2), Math.floor(pts * 0.4), Math.floor(pts * 0.6), Math.floor(pts * 0.8)];
        var dirs = isMobile ? [-1, 1, -1] : [-1, 1, -1, 1];
        var lengths = isMobile
          ? [h * 0.32, h * 0.26, h * 0.2]
          : [h * 0.3, h * 0.25, h * 0.2, h * 0.16];
        var forkCount = forkIdxs.length;

        forks = [];
        for (var f = 0; f < forkCount; f++) {
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
    var sketches = [groupAlignment, plansWithoutChoices, testedAssumptions];
    items.forEach(function (item, i) {
      var visual = item.querySelector('.framework-visual');
      if (visual && sketches[i]) {
        manageVisibility(visual, sketches[i], i);
      }
    });
  });
})();
