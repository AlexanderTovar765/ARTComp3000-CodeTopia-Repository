/* The carriage ride: a small pixel-art film. The camera follows the coach through the woods and past the gate, then watches it climb from behind
   until the crest drops away and the mansion rises on its hill. The title card fades in over the last frame. Click, Space or Escape skips it. */

"use strict";

function mansionRide() {
  return new Promise(res => {
    const el = $("#mRide"), cv = $("#mrCv"); el.hidden = false; el.classList.remove("out"); document.body.style.overflow = "hidden"; $(".app").inert = true;
    const cell = innerWidth < 600 ? 3 : 4, W = Math.ceil(innerWidth / cell), H = Math.ceil(innerHeight / cell); cv.width = W; cv.height = H;
    const g = cv.getContext("2d"); g.imageSmoothingEnabled = false;
    const r = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h))); };
    let seed = 5; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const SKY = ["#05040c", "#0b0818", "#150f26", "#221734", "#33213c", "#47303f"], BAY = [0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
    /* the sky is painted once */
    const sky = document.createElement("canvas"); sky.width = W; sky.height = H; const sg = sky.getContext("2d");
    for (let y = 0; y < H; y++) { const f = y / H * (SKY.length - 1), i = Math.min(SKY.length - 2, Math.floor(f)), fr = f - i; for (let x = 0; x < W; x++) { sg.fillStyle = fr > (BAY[(y & 3) * 4 + (x & 3)] + .5) / 16 ? SKY[i + 1] : SKY[i]; sg.fillRect(x, y, 1, 1); } }
    for (let i = 0; i < 70; i++) { sg.fillStyle = rnd() < .3 ? "#9fe0a8" : "#6a5a90"; sg.fillRect(rnd() * W | 0, rnd() * H * .45 | 0, 1, 1); }
    for (let i = 0; i < 8; i++) { const cx = rnd() * W, cy = H * (.1 + rnd() * .3), cw = 40 + rnd() * 60; sg.fillStyle = "#0d0a1a"; for (let q = 0; q < 5; q++) sg.fillRect(cx + q * cw * .15, cy - Math.sin(q / 4 * Math.PI) * 4, cw * .3, 5); }
    const mx = Math.round(W * .76), my = Math.round(H * .2), R = Math.max(7, Math.round(H * .09));
    for (let dy = -R - 5; dy <= R + 5; dy++) for (let dx = -R - 5; dx <= R + 5; dx++) { const d2 = dx * dx + dy * dy; if (d2 <= R * R) { sg.fillStyle = ((dx + R * .35) ** 2 + (dy - R * .2) ** 2 > (R * .9) ** 2) ? "#8fd9a0" : "#d6ffd8"; sg.fillRect(mx + dx, my + dy, 1, 1); } else if (d2 <= (R + 4) * (R + 4) && ((dx + dy) & 1) === 0) { sg.fillStyle = "#1f3a36"; sg.fillRect(mx + dx, my + dy, 1, 1); } }
    const drops = Array.from({ length:Math.round(W / 2.5) }, () => ({ x:rnd() * W, y:rnd() * H, v:4 + rnd() * 4 }));
    const trees = Array.from({ length:40 }, () => ({ x:rnd() * 3000, h:.5 + rnd() * .8, z:rnd() < .5 ? 0 : 1, a:rnd() }));
    const branch = (x, y, a, len, d, col) => { if (d > 4 || len < 3) return; for (let q = 0; q < len; q++) r(x + Math.cos(a) * q, y + Math.sin(a) * q, d < 1 ? 2 : 1, 1, col); const ex = x + Math.cos(a) * len, ey = y + Math.sin(a) * len; branch(ex, ey, a - .55, len * .7, d + 1, col); branch(ex, ey, a + .5, len * .68, d + 1, col); };
    const tree = (x, by, h, col, k) => { r(x - 1, by - h, 2, h, col); const sd = seed; seed = Math.round(k * 9973) + 7; branch(x, by - h * .7, -Math.PI / 2 - .7, h * .4, 1, col); branch(x, by - h * .5, -Math.PI / 2 + .7, h * .36, 1, col); branch(x, by - h, -Math.PI / 2 + .1, h * .3, 1, col); seed = sd; };
    const T1 = 9.2, T2 = 15.2, GATE = 6.4, SPEED = 70;
    let t0 = 0, flash = 0, thunder1 = false, thunder2 = false, done = false, raf = 0;
    const ell = (x, y, rx, ry, c) => { for (let dy = -ry; dy <= ry; dy++) { const hw = Math.round(rx * Math.sqrt(Math.max(0, 1 - (dy * dy) / (ry * ry)))); r(x - hw, y + dy, hw * 2 + 1, 1, c); } };
    const wheel = (x, y, R, t, spokes) => { ell(x, y, R, R, "#06040c"); ell(x, y, R - 2, R - 2, "#150f26"); for (let a = 0; a < spokes; a++) { const an = a * Math.PI * 2 / spokes + t * 9; for (let q = 1; q < R - 1; q++) r(x + Math.cos(an) * q, y + Math.sin(an) * q, 1, 1, "#4a3a78"); } ell(x, y, R - 1, R - 1, "rgba(0,0,0,0)"); for (let a = 0; a < 24; a++) { const an = a * Math.PI / 12; r(x + Math.cos(an) * (R - 1), y + Math.sin(an) * (R - 1), 1, 1, "#5a4a8a"); } ell(x, y, 1, 1, "#c9a45a"); };
    const horse = (hx, gy, t, k, col, hi) => {
      const gal = ph => Math.sin(t * 15 + ph), by = gy - 21 + Math.round(Math.sin(t * 15 + k * 2) * 1.2);
      /* legs: upper and lower sections swing opposite */
      [[2, 0], [6, 3.1], [17, 1.5], [21, 4.6]].forEach(([lx, ph]) => { const s = gal(ph + k); const kx = hx + lx + s * 2.5, kneeY = by + 9; r(hx + lx, by + 4, 3, 6, col); r(kx, kneeY, 2, 5 - (s > .4 ? 1 : 0), col); r(kx + (s > 0 ? 1 : 0), kneeY + 5, 3, 2, "#1a1428"); });
      ell(hx + 11, by, 11, 6, col); r(hx + 2, by - 6, 18, 1, hi);                                /* body and back highlight */
      r(hx + 18, by - 12, 5, 12, col); r(hx + 19, by - 14, 4, 4, col);                           /* neck */
      r(hx + 21, by - 16, 8, 5, col); r(hx + 27, by - 14, 3, 5, col); r(hx + 29, by - 11, 2, 3, "#1a1428"); /* head, muzzle */
      r(hx + 21, by - 18, 2, 3, col); r(hx + 23, by - 18, 1, 2, col);                           /* ears */
      r(hx + 25, by - 15, 2, 2, "#ff3030"); r(hx + 25, by - 15, 1, 1, "#ffb0a0");               /* glowing red eye */
      r(hx + 22, by - 16, 1, 6, "#5a4a8a"); r(hx + 20, by - 15, 3, 1, "#5a4a8a");               /* bridle */
      for (let q = 0; q < 6; q++) r(hx + 17 - q + Math.round(Math.sin(t * 12 + q) * 1), by - 12 + q * 1.5, 3, 1, hi);   /* mane streaming back */
      for (let q = 0; q < 9; q++) r(hx - 2 - q + Math.round(Math.sin(t * 11 + q * .7 + k) * 1.5), by - 4 + q * .5, 2, 2, hi);  /* tail */
      r(hx + 15, by - 7, 5, 9, "#4a3018"); r(hx + 16, by - 3, 2, 2, "#c9a45a");                 /* collar and buckle */
      const sp = (t * 2.5 + k) % 1; r(hx + 31 + sp * 8, by - 11 - sp * 4, 2, 2, `rgba(200,210,230,${.45 * (1 - sp)})`); /* breath */
    };
    const cart = (cx, gy, t) => {
      const bob = Math.round(Math.sin(t * 14) * .8), K = "#07050e", ky = gy + bob, TR = "#4a3a78", GO = "#8a6a30";
      r(cx - 52, gy + 1, 120, 3, "#05030a");                                                      /* shadow */
      horse(cx + 14, gy, t, 1, "#0c0818", "#1f1736");                                             /* far horse */
      /* far-side wheels hint */
      wheel(cx - 33, gy - 8, 8, t, 8); wheel(cx - 6, gy - 6, 6, t, 6);
      r(cx - 36, gy - 8, 33, 2, "#0a0716");                                                       /* axles */
      /* body */
      r(cx - 50, ky - 30, 42, 19, K); r(cx - 48, ky - 11, 38, 4, K); r(cx - 52, ky - 12, 4, 6, K); r(cx - 8, ky - 22, 4, 12, K);
      r(cx - 50, ky - 30, 42, 1, TR); r(cx - 50, ky - 13, 42, 1, GO); r(cx - 46, ky - 9, 34, 1, TR); r(cx - 50, ky - 30, 1, 18, TR);
      r(cx - 53, ky - 33, 48, 3, "#1c1432"); r(cx - 51, ky - 35, 44, 2, "#241a3c"); r(cx - 52, ky - 33, 46, 1, TR);   /* curved roof */
      /* roof luggage and rail */
      r(cx - 46, ky - 41, 18, 7, "#2a1a14"); r(cx - 46, ky - 41, 18, 1, "#4a3018"); r(cx - 40, ky - 41, 2, 7, "#c9a45a"); r(cx - 33, ky - 41, 2, 7, "#c9a45a"); r(cx - 24, ky - 38, 8, 4, "#1a1228"); for (let x = -48; x < -18; x += 5) r(cx + x, ky - 36, 1, 3, "#5a4a8a");
      /* door and windows */
      r(cx - 40, ky - 27, 20, 14, "#0e0a1c"); r(cx - 40, ky - 27, 20, 1, TR); r(cx - 40, ky - 14, 20, 1, TR); r(cx - 40, ky - 27, 1, 14, TR); r(cx - 21, ky - 27, 1, 14, TR);
      r(cx - 37, ky - 24, 14, 8, "#ffcf5a"); r(cx - 37, ky - 24, 14, 1, "#e8b24a"); r(cx - 30, ky - 24, 1, 8, "#0a0716");                 /* lit window with bar */
      r(cx - 37, ky - 24, 3, 8, "#7a1428"); r(cx - 26, ky - 24, 3, 8, "#7a1428"); r(cx - 36, ky - 23, 1, 7, "#a02438");                         /* red curtains */
      r(cx - 33, ky - 21, 4, 5, "#2a1a10"); r(cx - 32, ky - 22, 2, 2, "#2a1a10");                                                             /* passenger's head, hat brim */
      r(cx - 23, ky - 19, 2, 2, "#c9a45a"); r(cx - 46, ky - 25, 4, 6, "#ffcf5a"); r(cx - 46, ky - 25, 4, 1, "#e8b24a"); r(cx - 44, ky - 25, 1, 6, "#0a0716");   /* handle, rear window */
      for (let q = 0; q < 4; q++) r(cx - 48 + q * 10, ky - 10, 1, 1, "#ffcf5a");                  /* studs */
      /* rear trunk, step and lamp */
      r(cx - 56, ky - 18, 6, 9, "#2a1a14"); r(cx - 56, ky - 18, 6, 1, "#4a3018"); r(cx - 54, ky - 16, 2, 5, "#c9a45a"); r(cx - 52, ky - 8, 5, 1, "#1c1432");
      r(cx - 52, ky - 31, 2, 2, "#ff4a4a"); r(cx - 53, ky - 32, 4, 1, "rgba(255,74,74,.35)");
      /* driver's box, driver, reins */
      r(cx - 12, ky - 22, 10, 3, "#1c1432"); r(cx - 12, ky - 19, 10, 9, K); r(cx - 4, ky - 12, 8, 2, "#1c1432");
      r(cx - 10, ky - 32, 6, 10, "#05030a"); r(cx - 12, ky - 30, 3, 8, "#05030a"); r(cx - 8, ky - 40, 5, 8, "#05030a"); r(cx - 10, ky - 33, 9, 1, "#05030a");  /* cloak, hat */
      r(cx - 7, ky - 36, 3, 3, "#d8cfb4"); r(cx - 6, ky - 36, 2, 1, "#8fd9a0"); r(cx - 4, ky - 35, 2, 1, "#8fd9a0"); r(cx - 10, ky - 41, 7, 2, "#05030a");   /* pale face, glasses glint, hat brim */
      r(cx - 4, ky - 28, 8, 2, "#05030a"); for (let q = 0; q < 28; q++) r(cx + 4 + q, ky - 28 + q * .12 + Math.sin(t * 8 + q * .3) * .5, 1, 1, "#3a2c58");      /* arm and reins */
      /* lantern on the box, swinging */
      const lx = cx - 2 + Math.round(Math.sin(t * 9)), ly = ky - 30; r(cx - 2, ky - 36, 1, 6, "#1c1432"); r(lx, ly, 4, 5, "#ffcf5a"); r(lx - 1, ly - 1, 6, 1, K); r(lx - 1, ly + 5, 6, 1, K); for (let q = -8; q <= 8; q += 2) r(lx + 1 + q, ly + 2, 1, 1, "rgba(255,207,90,.22)");
      /* near horse in front of the far one */
      horse(cx + 6, gy + 2, t, 0, "#07050e", "#2a2040");
      /* wheels in front, with mud flicks */
      wheel(cx - 30, gy - 7, 9, t + .3, 10); wheel(cx - 4, gy - 5, 7, t + .3, 8);
      for (let q = 0; q < 5; q++) { const s2 = (t * 4 + q * .2) % 1; r(cx - 40 - s2 * 10, gy - 2 - s2 * 8 + q % 2, 1, 1, `rgba(80,70,110,${.7 * (1 - s2)})`); }
    };
    const gate = x => { const K = "#04030a"; r(x - 30, 0, 0, 0, K); const gy = Math.round(H * .74);
      [-34, 34].forEach(o => { r(x + o - 4, gy - 46, 9, 46, "#0d0a1a"); r(x + o - 5, gy - 49, 11, 4, "#150f26"); r(x + o - 2, gy - 56, 5, 7, "#ffcf5a"); r(x + o - 3, gy - 57, 7, 2, K); r(x + o - 6, gy - 52, 1, 1, "rgba(255,207,90,.3)"); });
      for (let q = -30; q <= 30; q += 4) { r(x + q, gy - 40 - Math.round(Math.abs(q) < 12 ? (12 - Math.abs(q)) * .6 : 0), 1, 40, K); r(x + q - 1, gy - 42, 3, 2, K); } r(x - 30, gy - 30, 60, 1, K); r(x - 30, gy - 12, 60, 1, K); };
    const frame = now => {
      if (done) return; raf = requestAnimationFrame(frame); if (!t0) t0 = now; const t = (now - t0) / 1000;
      g.drawImage(sky, 0, 0);
      if (flash > 0) { flash--; r(0, 0, W, H, flash > 1 ? "rgba(210,255,220,.3)" : "rgba(210,255,220,.1)"); } else if (Math.random() < .018) flash = 4;
      if (t < T1) {
        const gy = Math.round(H * .74), off = t * SPEED;
        for (let x = 0; x < W; x++) { const hh = Math.sin((x + off * .15) * .012) * 8 + Math.sin((x + off * .15) * .04) * 3; r(x, H * .5 + hh, 1, H, "#0c0916"); }
        trees.filter(q => q.z === 0).forEach(q => { const x = ((q.x - off * .35) % 1200 + 1200) % 1200 - 100; if (x < W + 20 && Math.abs(x - W * .76) > 45) tree(x, H * .62, 40 * q.h + 14, "#0a0714", q.a); });
        r(0, H * .62, W, H, "#0f0b1a"); trees.filter(q => q.z === 1).forEach(q => { const x = ((q.x - off * .7) % 1500 + 1500) % 1500 - 100; if (x < W + 30) tree(x, gy - 4, 70 * q.h + 30, "#06040d", q.a); });
        r(0, gy - 2, W, H, "#120d20"); r(0, gy + 4, W, 14, "#1d1630"); for (let x = 0; x < W; x += 9) r(((x * 7 - off * 1.6) % W + W) % W, gy + 8 + (x % 3) * 3, 3, 1, "#241a38");
        const gx = W * .38 + (GATE - t) * SPEED; if (gx > -80 && gx < W + 80) gate(gx);
        const ry = Math.round(H * .74) + 22; r(0, ry, W, H, "#050309");
        const mist = .08 + .05 * Math.sin(t); r(0, gy - 8, W, 12, `rgba(120,100,150,${mist})`);
        cart(Math.round(W * .38), gy + 6, t);
        if (t > T1 - .5 && !thunder1) { thunder1 = true; flash = 6; try { SND.sfx("thunder"); } catch (e) {} }
      } else {
        const u = Math.min(1, (t - T1) / (T2 - T1)), e = u * u * (3 - 2 * u), cx = W / 2, crest = H * (.3 + .36 * e), base = H * .66;
        const mh = H * .42, mw = Math.min(W * .62, 200), mxx = cx - mw / 2, HC = "#07050e";
        g.save(); g.beginPath(); g.rect(0, 0, W, crest + 2); g.clip();
        r(mxx, base - mh * .7, mw, mh * .7, HC); const tw = mw * .26; r(cx - tw / 2, base - mh, tw, mh, HC); for (let q = 0; q < tw / 2 + 3; q++) r(cx - tw / 2 - 3 + q, base - mh - q * 1.3, tw + 6 - q * 2, 2, HC);
        [mxx, mxx + mw - tw * .6].forEach(sx => { const sw = tw * .6, sh = mh * .85; r(sx, base - sh, sw, sh, HC); for (let q = 0; q < sw / 2 + 2; q++) r(sx - 2 + q, base - sh - q * 1.5, sw + 4 - q * 2, 2, HC); });
        const win = (wx, wy, c) => { r(wx, wy, 5, 8, c); r(wx + 2, wy, 1, 8, HC); r(wx, wy + 3, 5, 1, HC); };
        for (let i = 0; i < 6; i++) win(mxx + 10 + i * (mw - 26) / 5, base - mh * .45, [0, 2, 3, 5].includes(i) ? "#ffcf5a" : "#2a2036");
        for (let i = 0; i < 3; i++) win(cx - 12 + i * 10, base - mh * .8, i === 1 ? "#9bff9b" : "#ffcf5a"); r(cx - 4, base - 12, 8, 12, "#ffcf5a");
        g.restore();
        r(0, crest, W, H, "#09070f"); for (let x = 0; x < W; x++) { const h = Math.sin(x * .02) * 3 + Math.sin(x * .07) * 1.5; r(x, crest - 2 + h, 1, 4, "#09070f"); }
        const hw = y => 6 + (y - crest) * .55;
        for (let y = Math.round(crest); y < H; y++) { const w = hw(y); r(cx - w, y, w * 2, 1, (y & 1) ? "#1a1428" : "#161022"); }
        trees.slice(0, 16).forEach((q, i) => { const p = ((i * .0625 + u * 1.4) % 1), s = p * p, y = crest + (H - crest) * s + 4, side = i % 2 ? 1 : -1, x = cx + side * (hw(y) + 8 + s * 120 * (.4 + q.h * .6)); if (s > .02) tree(x, y, 8 + 90 * s * q.h, "#04030a", q.a); });
        for (let x = 0; x < W; x += 6) { const y = crest + 2 + Math.sin(x * .02) * 3; r(x, y - 5, 1, 7, "#04030a"); }
        const cs = 1 - .55 * e, cy = crest + (H - crest) * (.78 - .7 * Math.pow(e, .8)), bob = Math.sin(t * 15) * .6 * cs, K = "#07050e", cw = 34 * cs, chh = 26 * cs;
        if (e < .97) {
          const u = cs, S = (v) => Math.max(1, Math.round(v * u)), px = (dx, dy, w, h, c) => r(cx + dx * u, cy + dy * u + bob, Math.max(1, w * u), Math.max(1, h * u), c);
          /* wheels at the sides */
          [-1, 1].forEach(sd => { px(sd * 19 - 2, -12, 5, 12, "#06040c"); for (let q = 0; q < 6; q++) px(sd * 19 - 1, -11 + ((q + Math.floor(t * 18)) % 6) * 2, 3, 1, "#4a3a78"); });
          /* the two horses' backs and ears peeking past the sides */
          [-1, 1].forEach(sd => { px(sd * 12 - 4, -30 - Math.round(Math.sin(t * 15 + sd) * 1), 9, 3, "#07050e"); px(sd * 12 - 3, -34, 2, 4, "#07050e"); px(sd * 12 + 1, -34, 2, 4, "#07050e"); });
          /* body back, roof, luggage */
          px(-15, -26, 30, 21, K); px(-17, -28, 34, 3, "#1c1432"); px(-15, -26, 30, 1, "#4a3a78"); px(-15, -8, 30, 1, "#8a6a30");
          px(-11, -40, 22, 7, "#2a1a14"); px(-11, -40, 22, 1, "#4a3018"); px(-7, -40, 2, 7, "#c9a45a"); px(5, -40, 2, 7, "#c9a45a");
          px(-9, -24, 18, 11, "#0e0a1c"); px(-7, -22, 14, 7, "#ffcf5a"); px(-1, -22, 1, 7, "#0a0716"); px(-7, -22, 3, 7, "#7a1428"); px(4, -22, 3, 7, "#7a1428");
          px(-16, -12, 4, 4, "#ff4a4a"); px(12, -12, 4, 4, "#ff4a4a"); px(-17, -13, 6, 1, "rgba(255,74,74,.35)"); px(11, -13, 6, 1, "rgba(255,74,74,.35)");
          px(-8, -6, 16, 3, "#1c1432"); px(-12, -5, 24, 1, "#05030a");
          /* driver peeking over the roof */
          px(-3, -50, 6, 9, "#05030a"); px(-5, -52, 10, 2, "#05030a"); px(-3, -57, 6, 5, "#05030a");
          const lq = Math.round(Math.sin(t * 9) * 1.5); px(-1 + lq, -45, 2, 3, "#ffcf5a");
        }
        r(0, crest - 6, W, 10, `rgba(120,100,150,${.1 + .12 * e})`);
        if (t > T1 + .6 && !thunder2 && e > .78) { thunder2 = true; flash = 7; try { SND.sfx("thunder"); } catch (e2) {} }
        if (t >= T2 + 1.2) end();
      }
      g.fillStyle = "rgba(160,180,210,.3)"; drops.forEach(d => { d.y += d.v; d.x -= d.v * .3; if (d.y > H) { d.y = -4; d.x = Math.random() * W; } g.fillRect(Math.round(d.x), Math.round(d.y), 1, 3); });
      const fade = t < .7 ? 1 - t / .7 : 0; if (fade > 0) r(0, 0, W, H, `rgba(5,4,12,${fade})`);
      if (t >= T1 - .14 && t < T1 + .35) r(0, 0, W, H, `rgba(5,4,12,${Math.max(0, .9 - Math.abs(t - T1) * 3.5)})`);
    };
    const key = e => { if (e.key === "Escape" || e.key === " " || e.key === "Enter") { e.preventDefault(); end(); } };
    const end = () => { if (done) return; done = true; cancelAnimationFrame(raf); removeEventListener("keydown", key); el.removeEventListener("click", end); $(".app").inert = false; res(); };
    addEventListener("keydown", key); el.addEventListener("click", end);
    if (reduce) { done = false; setTimeout(end, 300); return; }
    raf = requestAnimationFrame(frame);
  });
}
/* the ride screen stays up under the title card, then goes */
function mansionRideClose() { const el = $("#mRide"); el.hidden = true; }
