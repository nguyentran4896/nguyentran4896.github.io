// crew.js: a crew of cursors that builds a part of a page in front of the visitor, then leaves it exactly as the HTML
// wrote it. Each cursor takes one task at a time: pull a guide, drag out a box, draw a drawing shape by shape, type a
// text, draw a hairline with the pen, copy a row down, switch on a layout grid, link one part to the next, flood a part
// out from a click, click a part open, set a slider. When all is built the crew gathers round the mouse a while, then
// flies home.
//
// After Swarm, Joel Califa's site that builds itself as you scroll, and Swarm Rebuild by Dhvanil Patel. Neither carries a
// licence, so nothing here is copied from them: this is the idea, written anew. The canonical copy of this file is the
// swarm-build skill's (.claude/skills/swarm-build/assets/crew.js); a site keeps its copy byte for byte the same.
//
// window.crew(options) hides the parts its plan names at once and returns { start, stop, teardown, layer }. The caller
// says when to start. Whatever is still hidden appears at once when the visitor scrolls past it, moves focus into the
// host, asks for reduced motion or changes the window's width, or when a frame throws. Typing writes into the real
// element, the rest of the text laid out but clear, so lines break where they will in the end and a screen reader has
// the whole text all along. Hiding is by clip, opacity or a clear border, never by layout, so nothing on the page moves.
//
// options
//   host     element the crew works in; its layer covers it (give it position: relative)
//   plan     ({ add, shapes, type }) => {}: the tasks, in page order. add(kind, el, after = [], extra = {}) returns the
//            task; a task waits for every task in `after`. Kinds: guide { axis: 'x' | 'y', to, until }, box, rect,
//            sketch, type { text, box, rate }, line { edge: 'top' | 'bottom' }, dup { from, reveal }, grid { cells, until },
//            link { from }, fill, open { at }, slide. type(els, after, extra) returns the tasks it made. Guides, grids
//            and links stay up until their `until` tasks stand, or until the build is done
//   from     () => ({ x, y }) in the window: where the crew comes out. home: where it goes back (from by default)
//   count    cursors (6 on a phone, 10 above); rate: characters typed per millisecond; pace: a speed for everything
//   ahead    a part starts once its top is above this share of the window (0.9); hurry: a part not built yet above this
//            share speeds the crew up (0.4, 0 for never); passed(task): built at once (scrolled under the bar)
//   park     (task) => ({ x, y }) in the window, or nothing: where a free cursor waits for that task
//   orbit    { radius, step, ms, gap }: the circle at the start; ignore: an element whose focus does not stop the crew
//   onEnd    called once, when the crew has left
(() => {
  const CURSOR = '<svg viewBox="-12 -12 36 36" width="36" height="36">'
    + '<path class="sw-arrow" d="M0 0V17L4.4 13.1L7.3 19.8L10.3 18.5L7.5 11.9H13.4Z"/>'
    + '<path class="sw-cross sw-under" d="M0-9V-3M0 3V9M-9 0H-3M3 0H9"/><path class="sw-cross" d="M0-9V-3M0 3V9M-9 0H-3M3 0H9"/>'
    + '<path class="sw-beam sw-under" d="M-4-9H4M-4 9H4M0-9V9"/><path class="sw-beam" d="M-4-9H4M-4 9H4M0-9V9"/>'
    + '<path class="sw-pen" d="M0 0L2.6 10.4L8.4 13.6L13.6 8.4L10.4 2.6Z"/><path class="sw-pen sw-nib" d="M0 0L5.6 5.6"/>'
    + '</svg>';
  const HIDE = { rect: 'clip', dup: 'clip', fill: 'clip', type: 'hide', slide: 'hide', open: 'fold' };
  const KEEP = new Set(['guide', 'grid', 'link']); // marks that stay up while the parts on them are built
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
  function* pause(ms) { for (let t = 0; t < ms;) t += yield; }

  window.crew = (o) => {
    const { host } = o;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    const RATE = o.rate ?? 0.075;
    const AHEAD = o.ahead ?? 0.9;
    const HURRY = o.hurry ?? 0.4;
    const PACE = o.pace ?? 1;
    const ORBIT = { radius: 34, step: 16, ms: 620, gap: 60, ...o.orbit };
    const passed = o.passed || ((t) => t.bottom < 72);

    // The work. A task waits for the tasks in `after`, and for its part to come up the screen.
    const tasks = [];
    const pops = [];
    const shapes = (svg) => {
      if (!svg) return svg;
      svg.dataset.swPop = '';
      pops.push(svg);
      for (const s of svg.children) s.dataset.sw = 'hide';
      return svg;
    };
    const reveal = (svg) => { for (const s of svg?.children || []) delete s.dataset.sw; };
    const add = (kind, el, after = [], extra = {}) => {
      const t = { kind, el, after, state: 'wait', nodes: [], agent: null, top: 0, bottom: 0, x: 0, w: 0, ...extra };
      const hide = kind === 'line' ? t.edge : HIDE[kind];
      if (el && hide) el.dataset.sw = hide;
      if (kind === 'sketch') shapes(el);
      if (kind === 'open' && t.at) t.at.dataset.swShut = ''; // the site may draw what is clicked as closed till then
      if (kind === 'slide') t.goal = el.value;
      tasks.push(t);
      return t;
    };
    // Only plain text is typed; anything with markup inside would lose it
    const type = (els, after = [], extra = {}) => {
      const made = [];
      for (const el of els) {
        if (el && !el.children.length && el.textContent.trim()) made.push(add('type', el, after, { text: el.textContent, ...extra }));
      }
      return made;
    };
    o.plan({ add, shapes, type });
    const kept = tasks.filter((t) => KEEP.has(t.kind));
    host.classList.add('sw-on');

    // The layer the crew and its marks live on: over the host, never in the way of a click
    const layer = document.createElement('div');
    layer.className = 'sw-layer';
    layer.setAttribute('aria-hidden', 'true');
    host.append(layer);
    const make = (cls, t) => {
      const n = document.createElement('div');
      n.className = cls;
      layer.append(n);
      t?.nodes.push(n);
      return n;
    };
    const place = (n, x, y, w, h) => {
      n.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      if (w != null) n.style.width = `${Math.max(0, w).toFixed(1)}px`;
      if (h != null) n.style.height = `${Math.max(0, h).toFixed(1)}px`;
    };
    const fadeOut = (n) => {
      n.classList.add('sw-fade');
      setTimeout(() => n.remove(), 360);
    };
    // A selection box: four handles, and the size underneath while it is being dragged
    const frame = (t, sized = true) => {
      const n = make('sw-frame', t);
      n.innerHTML = '<i></i><i></i><i></i><i></i>' + (sized ? '<b class="sw-size"></b>' : '');
      return { n, size: n.querySelector('.sw-size') };
    };

    // Geometry, in the host's own coordinates, so that scrolling moves nothing here
    let H = host.getBoundingClientRect();
    const local = (r) => ({ x: r.left - H.left, y: r.top - H.top, w: r.width, h: r.height });
    const rectOf = (el) => local(el.getBoundingClientRect());
    const at = (get) => {
      const p = get?.();
      return p ? { x: p.x - H.left, y: p.y - H.top } : { x: H.width / 2, y: 24 };
    };
    // The box of an element's text, not of the element: a number in a grid cell is as wide as the cell
    const inkOf = (el) => {
      const range = document.createRange();
      range.selectNodeContents(el);
      const r = range.getBoundingClientRect();
      return r.width ? local(r) : rectOf(el);
    };
    // A press: a ring opens where the cursor is, and goes
    const click = (a) => {
      const n = make('sw-click');
      place(n, a.x, a.y);
      setTimeout(() => n.remove(), 520);
    };
    // A slider's value, as if a hand had moved it: the page hears an input event, never a change
    const setValue = (el, v) => {
      if (el.value === String(v)) return;
      el.value = v;
      el.dispatchEvent(new Event('input', { bubbles: true }));
    };

    const count = o.count ?? (innerWidth < 640 ? 6 : 10);
    const agents = Array.from({ length: count }, (_, i) => {
      const el = document.createElement('div');
      el.className = 'sw-agent';
      el.dataset.tool = 'arrow';
      el.innerHTML = CURSOR;
      layer.append(el);
      return {
        el, i, x: 0, y: 0, gen: null, task: null, caret: null, idle: false, dim: false, out: false,
        bend: Math.random() - 0.5,
        lag: 70 + Math.random() * 160, // how closely it follows the mouse at the end
        toolName: 'arrow',
        down: false,
        tool(name) { if (name !== this.toolName) { this.toolName = name; el.dataset.tool = name; } },
        press(down) { if (down !== this.down) { this.down = down; el.classList.toggle('is-down', down); } },
      };
    });

    // A hand's path: eased, and bowed a little to one side
    function* travel(a, x, y, ms) {
      const x0 = a.x;
      const y0 = a.y;
      const d = Math.hypot(x - x0, y - y0);
      if (d < 1) return;
      const T = ms || Math.min(820, 170 + d * 0.5);
      const bend = a.bend * Math.min(90, d * 0.2);
      const cx = (x0 + x) / 2 + ((y - y0) / d) * bend;
      const cy = (y0 + y) / 2 - ((x - x0) / d) * bend;
      for (let t = 0; t < T;) {
        t += yield;
        const p = ease(Math.min(1, t / T));
        const q = 1 - p;
        a.x = q * q * x0 + 2 * q * p * cx + p * p * x;
        a.y = q * q * y0 + 2 * q * p * cy + p * p * y;
      }
    }
    // Crosshair from the top left corner to the bottom right one; `grow` hears the size as it changes
    function* drag(a, t, r, grow) {
      a.tool('cross');
      yield* travel(a, r.x, r.y);
      a.press(true);
      const f = frame(t);
      place(f.n, r.x, r.y, 0, 0);
      const T = Math.min(720, 260 + Math.hypot(r.w, r.h) * 0.45);
      for (let k = 0; k < T;) {
        k += yield;
        const p = ease(Math.min(1, k / T));
        const w = r.w * p;
        const h = r.h * p;
        a.x = r.x + w;
        a.y = r.y + h;
        place(f.n, r.x, r.y, w, h);
        f.size.textContent = `${Math.round(w)} × ${Math.round(h)}`;
        grow?.(w, h);
      }
      a.press(false);
      f.size.remove();
    }

    const run = {
      // A guide pulled out of the host's edge to the top, or the left, of `to`; the boxes start on it
      *guide(a, t) {
        const r = rectOf(t.to);
        const across = t.axis === 'y';
        a.tool('arrow');
        const from = across ? { x: r.x + r.w * (0.15 + Math.random() * 0.2), y: Math.max(0, r.y - 120) } : { x: 0, y: r.y + 40 };
        yield* travel(a, from.x, from.y);
        const g = make(`sw-guide sw-guide--${across ? 'h' : 'v'}`);
        t.line = g;
        if (across) place(g, 0, from.y, H.width, 1);
        else place(g, 0, r.y - 48, 1, r.h + 96);
        a.press(true);
        const T = 420;
        for (let k = 0; k < T;) {
          k += yield;
          const p = ease(Math.min(1, k / T));
          if (across) {
            a.y = from.y + (r.y - from.y) * p;
            place(g, 0, a.y, H.width, 1);
          } else {
            a.x = from.x + (r.x - from.x) * p;
            place(g, a.x, r.y - 48, 1, r.h + 96);
          }
        }
        a.press(false);
        finish(t);
      },
      // A box drawn round a part that is built by other tasks
      *box(a, t) {
        yield* drag(a, t, rectOf(t.el));
        finish(t);
      },
      *rect(a, t) {
        const r = rectOf(t.el);
        yield* drag(a, t, r, (w, h) => { t.el.style.clipPath = `inset(0 ${r.w - w}px ${r.h - h}px 0)`; });
        finish(t);
      },
      // A box for the drawing, then its shapes one at a time with the pen
      *sketch(a, t) {
        yield* drag(a, t, rectOf(t.el));
        a.tool('pen');
        const all = [...t.el.children];
        const each = Math.max(26, Math.min(70, 900 / all.length));
        for (const s of all) {
          const b = rectOf(s);
          yield* travel(a, b.x + b.w / 2, b.y + b.h / 2, each);
          delete s.dataset.sw;
        }
        finish(t);
      },
      // A text box first if asked; then the text is typed into the element itself, the rest of it held clear
      *type(a, t) {
        const r = rectOf(t.el);
        if (t.box) yield* drag(a, t, r);
        a.tool('beam');
        yield* travel(a, r.x, r.y + Math.min(r.h, 24) / 2, t.nodes.length ? 160 : undefined);
        const typed = document.createElement('span');
        const caret = document.createElement('span');
        const rest = document.createElement('span');
        caret.className = 'sw-caret';
        rest.className = 'sw-rest';
        rest.textContent = t.text;
        t.el.replaceChildren(typed, caret, rest);
        t.el.dataset.sw = 'type';
        a.caret = caret;
        const n = t.text.length;
        const rate = t.rate ?? RATE;
        for (let i = 0, carry = 0; i < n;) {
          carry += (yield) * rate * (0.5 + Math.random());
          const k = Math.min(n, i + Math.floor(carry));
          if (k === i) continue;
          carry -= k - i;
          i = k;
          typed.textContent = t.text.slice(0, i);
          rest.textContent = t.text.slice(i);
        }
        a.caret = null;
        finish(t);
      },
      // A hairline (the element's top or bottom border) with the pen, left to right
      *line(a, t) {
        const r = rectOf(t.el);
        const y = t.edge === 'top' ? r.y : r.y + r.h - 1;
        a.tool('pen');
        yield* travel(a, r.x, y);
        a.press(true);
        const line = make('sw-line', t);
        line.innerHTML = '<i></i><i></i>';
        place(line, r.x, y, 0, 1);
        const T = Math.min(900, 260 + r.w * 0.45);
        for (let k = 0; k < T;) {
          k += yield;
          const w = r.w * ease(Math.min(1, k / T));
          a.x = r.x + w;
          a.y = y;
          place(line, r.x, y, w, 1);
        }
        a.press(false);
        finish(t);
      },
      // Select the part above, then drag a copy of it down into place; the copy shows how far it has gone
      *dup(a, t) {
        const rf = rectOf(t.from);
        const dy = rectOf(t.el).y - rf.y;
        const gx = rf.x + Math.min(rf.w * 0.35, 150);
        const gy = rf.y + rf.h / 2;
        a.tool('arrow');
        yield* travel(a, gx, gy);
        const sel = frame(t, false);
        place(sel.n, rf.x, rf.y, rf.w, rf.h);
        yield* pause(150);
        a.press(true);
        const ghost = t.from.cloneNode(true);
        ghost.classList.add('sw-ghost');
        ghost.style.width = `${rf.w}px`;
        place(ghost, rf.x, rf.y);
        layer.append(ghost);
        t.nodes.push(ghost);
        const gap = make('sw-measure', t);
        gap.innerHTML = '<b class="sw-size"></b>';
        place(gap, rf.x - 12, rf.y, null, 0);
        const label = gap.firstChild;
        const T = Math.min(760, 300 + Math.abs(dy) * 0.8);
        for (let k = 0; k < T;) {
          k += yield;
          const p = ease(Math.min(1, k / T));
          const y = rf.y + dy * p;
          a.x = gx;
          a.y = gy + dy * p;
          place(ghost, rf.x, y);
          place(sel.n, rf.x, y, rf.w, rf.h);
          place(gap, rf.x - 12, rf.y, null, dy * p);
          label.textContent = Math.round(dy * p);
        }
        a.press(false);
        finish(t);
      },
      // A layout grid switched on over a list: a band for each cell, columns when the cells sit side by side and rows
      // when they stack, each with its size while it drops; the cells are then built in their bands
      *grid(a, t) {
        const r = rectOf(t.el);
        const cells = (t.cells || [...t.el.children]).map(rectOf);
        const rows = cells.length > 1 && cells.every((c) => Math.abs(c.x - cells[0].x) < 2);
        a.tool('arrow');
        yield* travel(a, r.x, r.y);
        a.press(true);
        click(a);
        const g = make('sw-grid');
        t.line = g;
        const bands = cells.map((c) => {
          const n = document.createElement('div');
          n.className = 'sw-band';
          n.innerHTML = '<b class="sw-size"></b>';
          n.firstChild.textContent = Math.round(rows ? c.h : c.w);
          g.append(n);
          const box = rows ? { x: r.x, y: c.y, w: r.w, h: c.h } : { x: c.x, y: r.y, w: c.w, h: r.h };
          place(n, box.x, box.y, rows ? 0 : box.w, rows ? box.h : 0);
          return { n, box };
        });
        const each = 520;
        const step = 80;
        const T = each + step * (bands.length - 1);
        for (let k = 0; k < T;) {
          k += yield;
          bands.forEach(({ n, box }, i) => {
            const p = ease(Math.max(0, Math.min(1, (k - step * i) / each)));
            place(n, box.x, box.y, rows ? box.w * p : box.w, rows ? box.h : box.h * p);
          });
          const q = ease(Math.min(1, k / T));
          if (rows) a.y = r.y + r.h * q;
          else a.x = r.x + r.w * q;
          if (k > 140) a.press(false);
        }
        a.press(false);
        for (const { n } of bands) n.firstChild.remove();
        finish(t);
      },
      // A connector from one part to the next, drawn with the pen the way a prototype links two screens: bowed over
      // the gap when they sit side by side, beside them when they stack, with a dot where it leaves and a head where
      // it arrives. `from` and `el` are measured by their text
      *link(a, t) {
        const A = inkOf(t.from);
        const B = inkOf(t.el);
        const side = Math.abs(B.x - A.x) > Math.abs(B.y - A.y);
        const s = side ? { x: A.x + A.w + 8, y: A.y + A.h / 2 } : { x: A.x - 8, y: A.y + A.h / 2 };
        const e = side ? { x: B.x - 8, y: B.y + B.h / 2 } : { x: B.x - 8, y: B.y + B.h / 2 };
        const bow = Math.min(36, Math.hypot(e.x - s.x, e.y - s.y) * 0.25);
        const c = side ? { x: (s.x + e.x) / 2, y: (s.y + e.y) / 2 - bow } : { x: (s.x + e.x) / 2 - bow, y: (s.y + e.y) / 2 };
        a.tool('pen');
        yield* travel(a, s.x, s.y);
        a.press(true);
        const n = make('sw-link');
        t.line = n;
        n.innerHTML = '<svg width="1" height="1"><circle r="2.5"/><path/><path class="sw-head"/></svg>';
        const [dot, path, head] = n.firstChild.children;
        const f = (v) => v.toFixed(1);
        dot.setAttribute('cx', f(s.x));
        dot.setAttribute('cy', f(s.y));
        path.setAttribute('d', `M${f(s.x)} ${f(s.y)}Q${f(c.x)} ${f(c.y)} ${f(e.x)} ${f(e.y)}`);
        const angle = Math.atan2(e.y - c.y, e.x - c.x);
        const wing = (turn) => `${f(e.x - 7 * Math.cos(angle + turn))} ${f(e.y - 7 * Math.sin(angle + turn))}`;
        head.setAttribute('d', `M${wing(0.5)}L${f(e.x)} ${f(e.y)}L${wing(-0.5)}`);
        const L = path.getTotalLength();
        path.style.strokeDasharray = `${f(L)} ${f(L)}`;
        path.style.strokeDashoffset = f(L);
        const T = Math.min(620, 200 + L * 0.5);
        for (let k = 0; k < T;) {
          k += yield;
          const p = ease(Math.min(1, k / T));
          const q = path.getPointAtLength(L * p);
          path.style.strokeDashoffset = f(L * (1 - p));
          a.x = q.x;
          a.y = q.y;
        }
        head.style.opacity = 1;
        a.press(false);
        finish(t);
      },
      // A click inside the part, and the part floods out from it to its far corner
      *fill(a, t) {
        const r = rectOf(t.el);
        const x = r.w * (0.25 + Math.random() * 0.2);
        const y = r.h * (0.3 + Math.random() * 0.2);
        a.tool('arrow');
        yield* travel(a, r.x + x, r.y + y);
        a.press(true);
        click(a);
        const far = Math.hypot(Math.max(x, r.w - x), Math.max(y, r.h - y));
        const T = Math.min(760, 300 + far * 0.8);
        for (let k = 0; k < T;) {
          k += yield;
          t.el.style.clipPath = `circle(${(far * ease(Math.min(1, k / T))).toFixed(1)}px at ${x.toFixed(1)}px ${y.toFixed(1)}px)`;
          if (k > 120) a.press(false);
        }
        a.press(false);
        finish(t);
      },
      // A click on `at` (at its right end, where a disclosure's marker sits), and the part unrolls from its top edge
      *open(a, t) {
        const r = rectOf(t.el);
        const b = t.at ? rectOf(t.at) : { x: r.x, y: r.y - 32, w: r.w, h: 32 };
        a.tool('arrow');
        yield* travel(a, b.x + b.w - 10, b.y + Math.min(b.h / 2, 26));
        a.press(true);
        click(a);
        if (t.at) delete t.at.dataset.swShut;
        yield* pause(90);
        a.press(false);
        const T = Math.min(700, 260 + r.h * 0.6);
        for (let k = 0; k < T;) {
          k += yield;
          t.el.style.clipPath = `inset(0 0 ${((1 - ease(Math.min(1, k / T))) * 100).toFixed(2)}% 0)`;
        }
        finish(t);
      },
      // A range input set by hand: grabbed at its low end and dragged to the value the page gave it
      *slide(a, t) {
        const { el } = t;
        const min = Number(el.min || 0);
        const max = Number(el.max || 100);
        const unit = Number(el.step) || 1;
        const goal = Number(t.goal);
        const r = rectOf(el);
        const knob = Math.min(r.h, 24);
        const xAt = (v) => r.x + knob / 2 + ((v - min) / (max - min || 1)) * (r.w - knob);
        const y = r.y + r.h / 2;
        a.tool('arrow');
        yield* travel(a, xAt(min), y);
        t.moved = true;
        setValue(el, min);
        delete el.dataset.sw;
        a.press(true);
        const T = Math.min(900, 380 + (xAt(goal) - xAt(min)) * 0.8);
        for (let k = 0; k < T;) {
          k += yield;
          const v = min + (goal - min) * ease(Math.min(1, k / T));
          setValue(el, Math.round(v / unit) * unit);
          a.x = xAt(v);
          a.y = y;
        }
        a.press(false);
        finish(t);
      },
    };

    // Done, at its own pace or at once: the part shows as the HTML has it, and the task's marks fade
    function finish(t) {
      if (t.state === 'done') return;
      t.state = 'done';
      const { el } = t;
      if (t.kind === 'rect' || t.kind === 'fill' || t.kind === 'open') el.style.clipPath = '';
      if (t.kind === 'type') el.textContent = t.text;
      if (t.kind === 'sketch') reveal(el);
      if (t.at) delete t.at.dataset.swShut;
      if (t.moved) setValue(el, t.goal); // a slider let go halfway goes to its value; one never touched stays as it is
      for (const svg of t.reveal || []) reveal(svg);
      // Only what this task hid: a link ends on a part that another task still has to build
      if (el && (t.kind === 'line' || HIDE[t.kind])) delete el.dataset.sw;
      for (const n of t.nodes) fadeOut(n);
      t.nodes.length = 0;
    }
    // Done at once while a cursor is still on it: the cursor lets go
    function cut(t) {
      const a = t.agent;
      if (a?.task === t) {
        a.gen = null;
        a.task = null;
        a.caret = null;
        a.press(false);
      }
      finish(t);
    }
    const fadeKept = (g) => { if (g.line) { fadeOut(g.line); g.line = null; } };

    // A free hand waits near the next part to build, out of the reading: where `park` says, or just above the part but
    // no lower than the bottom edge of the screen
    function* idle(a) {
      for (;;) {
        a.tool('arrow');
        const next = tasks.find((t) => t.state === 'wait' && t.el);
        const floor = innerHeight - H.top - 28;
        const spot = next && o.park?.(next);
        let x = next ? next.x + Math.random() * Math.min(next.w, H.width * 0.6) : H.width * (0.15 + Math.random() * 0.7);
        let y = next ? next.top - H.top - 36 : floor - Math.random() * 160;
        if (spot) ({ x, y } = at(() => spot));
        x = Math.max(16, Math.min(H.width - 32, x));
        y = Math.max(40, Math.min(H.height - 40, floor, y));
        yield* travel(a, x, y, 600 + Math.random() * 500);
        yield* pause(200 + Math.random() * 600);
      }
    }
    // Out one by one, once round the way out, then to work
    function* enter(a, n) {
      const L = at(o.from);
      a.x = L.x;
      a.y = L.y;
      yield* pause(a.i * ORBIT.gap);
      a.el.classList.add('is-in');
      const R = ORBIT.radius + (a.i % 3) * ORBIT.step;
      const turn = (a.i % 2 ? 1 : -1) * 0.0075;
      const T = (n - a.i) * ORBIT.gap + ORBIT.ms;
      for (let k = 0; k < T;) {
        k += yield;
        const grow = Math.min(1, k / 240);
        const angle = a.i * 2.4 + k * turn;
        a.x = L.x + Math.cos(angle) * R * grow;
        a.y = L.y + Math.sin(angle) * R * 0.6 * grow;
      }
    }
    function* home(a) {
      a.tool('arrow');
      yield* pause(a.i * 45);
      const L = at(o.home || o.from);
      yield* travel(a, L.x, L.y, 620);
      a.el.classList.remove('is-in');
      a.out = true;
    }

    // The mouse, for the end: the crew gathers round it while it moves over the host
    let mouse = null;
    const onMove = (event) => { if (event.pointerType === 'mouse') mouse = { x: event.clientX, y: event.clientY, at: performance.now() }; };
    const onLeave = () => { mouse = null; };

    let phase = 'wait'; // wait, enter, build, flock, home, gone
    let raf = 0;
    let last = 0;
    let flockSince = 0;
    let width = innerWidth;
    const timers = [];

    // The loop runs while the host is on screen; off it, there is nothing to watch and nothing moves on
    let onScreen = true;
    function frameLoop(now) {
      if (!onScreen) { raf = 0; last = 0; return; }
      raf = requestAnimationFrame(frameLoop);
      try { tick(now); } catch (error) { teardown(); throw error; }
    }
    function tick(now) {
      const dt = Math.min(50, now - (last || now)) * PACE;
      last = now;
      H = host.getBoundingClientRect();
      const vh = innerHeight;

      if (phase === 'build') {
        // Where the parts are now; one read for all of them, before anything is written
        for (const t of tasks) {
          if (t.state === 'done') continue;
          const r = (t.el || t.to || host).getBoundingClientRect();
          t.top = r.top;
          t.bottom = r.bottom;
          t.x = r.left - H.left;
          t.w = r.width;
        }
        // Scrolled past: done at once. Being read before it is built: the crew works faster.
        let speed = 1;
        for (const t of tasks) {
          if (t.state === 'done') continue;
          if (passed(t)) cut(t);
          else if (HURRY && t.top < vh * HURRY) speed = 2.4;
        }
        // A guide (grid, link) goes once the first of the parts that start on it stand
        for (const g of kept) {
          if (g.line && g.until?.some((b) => b.state === 'done') && !g.until.some((b) => b.state === 'run')) fadeKept(g);
        }
        // Hand each part that is ready to the nearest free cursor
        for (const t of tasks) {
          if (t.state !== 'wait' || t.top > vh * AHEAD || !t.after.every((d) => d.state === 'done')) continue;
          let best = null;
          let far = Infinity;
          for (const a of agents) {
            if (a.gen && !a.idle) continue;
            const d = Math.hypot(a.x - t.x, a.y - (t.top - H.top));
            if (d < far) { far = d; best = a; }
          }
          if (!best) break;
          t.state = 'run';
          t.agent = best;
          best.task = t;
          best.idle = false;
          best.gen = run[t.kind](best, t);
          best.gen.next();
        }
        for (const a of agents) {
          if (!a.gen) { a.idle = true; a.gen = idle(a); a.gen.next(); }
          if (a.gen.next(dt * speed).done) { a.gen = null; a.task = null; }
        }
        if (tasks.every((t) => t.state === 'done')) {
          kept.forEach(fadeKept);
          phase = mouse && now - mouse.at < 2500 ? 'flock' : 'home';
          flockSince = now;
          for (const a of agents) { a.gen = phase === 'home' ? home(a) : null; a.gen?.next(); a.idle = false; a.press(false); a.tool('arrow'); }
        }
      } else if (phase === 'enter') {
        let all = true;
        for (const a of agents) if (a.gen && !a.gen.next(dt).done) all = false;
        if (all) { phase = 'build'; for (const a of agents) a.gen = null; }
      } else if (phase === 'flock') {
        // Round the mouse, each at its own distance and lag, never on top of it
        if (!mouse || now - mouse.at > 2500 || now - flockSince > 9000) {
          phase = 'home';
          for (const a of agents) { a.gen = home(a); a.gen.next(); }
        } else {
          const mx = mouse.x - H.left;
          const my = mouse.y - H.top;
          for (const a of agents) {
            const angle = a.i * 0.63 * Math.PI + now * 0.0005 * (a.i % 2 ? 1 : -1);
            const R = 38 + (a.i % 4) * 15;
            const k = 1 - Math.exp(-dt / a.lag);
            a.x += (mx + Math.cos(angle) * R - a.x) * k;
            a.y += (my + Math.sin(angle) * R - a.y) * k;
          }
        }
      } else if (phase === 'home') {
        for (const a of agents) if (a.gen?.next(dt).done) a.gen = null;
        if (agents.every((a) => a.out)) { teardown(); return; }
      }

      // The cursors last, after every change to the text: one layout for all the carets
      for (const a of agents) {
        if (a.idle !== a.dim) { a.dim = a.idle; a.el.classList.toggle('is-idle', a.idle); }
        if (a.caret) {
          const c = a.caret.getBoundingClientRect();
          a.x = c.left - H.left + 1;
          a.y = c.top - H.top + c.height / 2;
        }
        a.el.style.transform = `translate(${a.x.toFixed(1)}px, ${a.y.toFixed(1)}px)`;
      }
    }

    function start() {
      if (phase !== 'wait' || torn) return;
      if (reduce.matches) { teardown(); return; }
      phase = 'enter';
      H = host.getBoundingClientRect();
      for (const a of agents) { a.gen = enter(a, agents.length); a.gen.next(); }
      raf = requestAnimationFrame(frameLoop);
    }

    // Everything shows, the crew leaves, the page is as the HTML wrote it
    let torn = false;
    function teardown() {
      if (torn) return;
      torn = true;
      cancelAnimationFrame(raf);
      for (const t of timers) clearTimeout(t);
      for (const t of tasks) finish(t);
      for (const svg of pops) delete svg.dataset.swPop;
      host.classList.remove('sw-on');
      layer.classList.add('sw-fade');
      setTimeout(() => layer.remove(), 400);
      seen.disconnect();
      reduce.removeEventListener('change', onReduce);
      host.removeEventListener('focusin', onFocus);
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerleave', onLeave);
      removeEventListener('resize', onResize);
      o.onEnd?.();
    }
    // Stopped (the AI switched off, reduced motion): the crew greys and stops where it is, the parts it had not built
    // are simply there. Before it has started there is nothing to watch, so it just goes.
    function stop() {
      if (torn) return;
      if (phase === 'wait') { teardown(); return; }
      layer.classList.add('is-off');
      for (const t of tasks) cut(t);
      phase = 'gone';
      timers.push(setTimeout(teardown, 700));
    }
    const onReduce = () => { if (reduce.matches) stop(); };
    const onFocus = (event) => { if (!o.ignore?.contains(event.target)) teardown(); };
    const onResize = () => { if (innerWidth !== width) teardown(); width = innerWidth; };

    const seen = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      // Built and scrolled away: the crew has nobody to come back to
      if (!onScreen && (phase === 'flock' || phase === 'home')) teardown();
      else if (onScreen && phase !== 'wait' && !raf && !torn) raf = requestAnimationFrame(frameLoop);
    });
    seen.observe(host);
    reduce.addEventListener('change', onReduce);
    host.addEventListener('focusin', onFocus);
    host.addEventListener('pointermove', onMove, { passive: true });
    host.addEventListener('pointerleave', onLeave);
    addEventListener('resize', onResize);

    return { start, stop, teardown, layer };
  };
})();
