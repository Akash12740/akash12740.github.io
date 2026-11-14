function setActive(btn) {
  if (!btn || !btn.parentElement) return;
  btn.parentElement.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function toggleMobileNav() {
  const nav = document.querySelector('.nav-links');
  if (nav) nav.classList.toggle('mobile-open');
}
// Theme Toggle
function initTheme() {
  const saved = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  const btn = document.getElementById('themeToggle');
  if (btn) btn.textContent = saved === 'dark' ? '☀️ Light' : '🌙 Dark';
}
function toggleTheme() {
  const cur = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  const btn = document.getElementById('themeToggle');
  if (btn) btn.textContent = next === 'dark' ? '☀️ Light' : '🌙 Dark';
}
initTheme();

function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3200);
}

function copyEmail() {
  navigator.clipboard.writeText('aksainibits@gmail.com');
  showToast('✓ Copied aksainibits@gmail.com to clipboard!');
}

// 60-Second Hiring Manager / Founder Executive Brief Toggle
function toggleExecBrief() {
  const panel = document.getElementById('execBriefPanel');
  if (!panel) return;
  const open = panel.style.display === 'block';
  panel.style.display = open ? 'none' : 'block';
}

// Dynamic JSON Loader for Blogs + BibTeX & Social Share + TOC
let ALL_POSTS = [];
async function loadPosts() {
  const homeContainer = document.getElementById('featured-blogs-grid');
  const fullContainer = document.getElementById('all-blogs-list');
  if (!homeContainer && !fullContainer) return;

  try {
    const todayKey = new Date().toISOString().slice(0, 10);
    const res = await fetch('data/posts.json?v=' + todayKey);
    ALL_POSTS = await res.json();

    if (homeContainer) {
      const top3 = ALL_POSTS.slice(0, 3);
      homeContainer.innerHTML = top3.map(p => `
        <div class="card" style="display:flex; flex-direction:column; justify-content:space-between;">
          <div>
            <div class="item-header">
              <span class="section-tag" style="margin:0;">${p.topic_label}</span>
              <span class="item-date">${p.date} • ${p.read_time}</span>
            </div>
            <h3 style="font-size:1.12rem; margin:0.55rem 0;">${p.title}</h3>
            <p style="color:var(--muted); font-size:0.91rem; margin-bottom:1rem;">${p.summary}</p>
          </div>
          <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
            <button class="btn btn-primary btn-sm" onclick="openPostModal('${p.id}')">Read Article →</button>
            <button class="btn btn-glass btn-sm" onclick="copyBibtex('${p.id}')">Cite (BibTeX)</button>
          </div>
        </div>
      `).join('');
    }

    if (fullContainer) {
      renderBlogArchive('all', '');
    }
  } catch (e) {
    console.error('Failed to load posts.json', e);
  }
}

function copyBibtex(id) {
  const p = ALL_POSTS.find(x => x.id === id);
  if (!p) return;
  const year = (p.date || '2026').slice(0, 4);
  const bib = `@article{saini${year}_${p.id.replace('-','')},\n  author = {Saini, Akash},\n  title = {${p.title}},\n  journal = {Akash Saini Engineering Notes},\n  year = {${year}},\n  url = {https://akash12740.github.io/blog.html#${p.id}}\n}`;
  navigator.clipboard.writeText(bib);
  showToast('✓ Copied BibTeX citation to clipboard!');
}

function sharePostLinkedIn(id) {
  const url = encodeURIComponent(`https://akash12740.github.io/blog.html#${id}`);
  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
}

function renderBlogArchive(topic, query) {
  const fullContainer = document.getElementById('all-blogs-list');
  const tocContainer = document.getElementById('blog-toc');
  if (!fullContainer) return;
  const q = (query || '').toLowerCase();
  const filtered = ALL_POSTS.filter(p => {
    const matchTopic = topic === 'all' || p.topic === topic;
    const matchQuery = !q || p.title.toLowerCase().includes(q) || p.summary.toLowerCase().includes(q);
    return matchTopic && matchQuery;
  });

  if (tocContainer) {
    tocContainer.innerHTML = filtered.map(p => `<a href="#${p.id}" style="color:var(--accent); text-decoration:none; font-size:0.82rem; display:block; margin-bottom:0.35rem;">→ ${p.title}</a>`).join('');
  }

  fullContainer.innerHTML = filtered.map(p => `
    <article id="${p.id}" class="card" style="margin-bottom:1.75rem;">
      <div class="item-header">
        <span class="section-tag" style="margin:0;">${p.topic_label} • ${p.date}</span>
        <span class="item-date">${p.read_time}</span>
      </div>
      <h2 style="font-size:1.45rem; margin:0.45rem 0 0.75rem;">${p.title}</h2>
      <p style="color:var(--muted); margin-bottom:0.9rem;">${p.summary}</p>
      <div class="trace-box" style="color:var(--accent);">${p.architecture_flow}</div>
      ${(p.sections || []).map(s => `
        <h3 style="font-size:1.02rem; margin:1rem 0 0.35rem; font-family:'Fira Code', monospace;">${s.heading}</h3>
        <p style="color:var(--muted); font-size:0.94rem;">${s.body}</p>
      `).join('')}
      <div class="verdict-box show" style="margin-top:1rem;"><strong>Key Takeaway:</strong> ${p.takeaway}</div>
      <div style="display:flex; gap:0.6rem; flex-wrap:wrap; margin-top:1.1rem; padding-top:0.9rem; border-top:1px solid var(--border);">
        <button class="btn btn-glass btn-sm" onclick="copyBibtex('${p.id}')">📋 Copy BibTeX Citation</button>
        <button class="btn btn-primary btn-sm" onclick="sharePostLinkedIn('${p.id}')">Share on LinkedIn ↗</button>
        <button class="btn btn-glass btn-sm" onclick="copyLinkedInPost('${p.id}')">✍️ Copy LinkedIn Post</button>
      </div>
    </article>
  `).join('') || '<p style="color:var(--muted);">No articles match that filter.</p>';
}

function openPostModal(id) {
  const p = ALL_POSTS.find(item => item.id === id);
  if (!p) return;
  document.getElementById('modalTag').textContent = `${p.topic_label} • ${p.date}`;
  document.getElementById('modalTitle').textContent = p.title;
  document.getElementById('modalArch').textContent = p.architecture_flow;
  document.getElementById('modalDesc').innerHTML =
    (p.sections || []).map(s => `<p style="margin-bottom:0.8rem;"><strong>${s.heading}:</strong> ${s.body}</p>`).join('') +
    `<p style="color:var(--accent-green); margin-bottom:1rem;"><strong>Takeaway:</strong> ${p.takeaway}</p>` +
    `<div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
      <button class="btn btn-glass btn-sm" onclick="copyBibtex('${p.id}')">📋 Copy BibTeX</button>
      <button class="btn btn-glass btn-sm" onclick="sharePostLinkedIn('${p.id}')">Share on LinkedIn ↗</button>
    </div>`;
  const link = document.getElementById('modalRepoLink');
  link.textContent = 'Open Full Blog Archive →';
  link.href = 'blog.html';
  document.getElementById('projectModal').classList.add('open');
}

// Dynamic Projects & Testimonials
let ALL_PROJECTS = [];
async function loadProjects() {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;
  try {
    const res = await fetch('data/projects.json');
    ALL_PROJECTS = await res.json();
    grid.innerHTML = ALL_PROJECTS.map(pr => `
      <div class="card project-card" data-cat="${pr.cat}" style="display:flex; flex-direction:column; justify-content:space-between;">
        <div>
          <div class="item-header">
            <span class="item-title">${pr.title}</span>
            <span class="item-date">${pr.badge}</span>
          </div>
          <p style="color:var(--muted); font-size:0.93rem; margin:0.75rem 0 1rem;">${pr.summary}</p>
          <div class="tags">${pr.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
        </div>
        <div style="display:flex; gap:0.6rem; margin-top:1.2rem; padding-top:0.9rem; border-top:1px solid var(--border);">
          <a href="${pr.repo}" target="_blank" class="btn btn-primary btn-sm">View Code ↗</a>
          <button class="btn btn-glass btn-sm" onclick="openProjectModal('${pr.id}')">Architecture →</button>
        </div>
      </div>
    `).join('');
  } catch (e) { console.error(e); }
}

function openProjectModal(id) {
  const pr = ALL_PROJECTS.find(p => p.id === id);
  if (!pr) return;
  document.getElementById('modalTag').textContent = pr.badge;
  document.getElementById('modalTitle').textContent = pr.title;
  document.getElementById('modalArch').textContent = pr.arch;
  document.getElementById('modalDesc').textContent = pr.details;
  const link = document.getElementById('modalRepoLink');
  link.textContent = 'Open GitHub Repository ↗';
  link.href = pr.repo;
  document.getElementById('projectModal').classList.add('open');
}

function closeModalBtn() { document.getElementById('projectModal').classList.remove('open'); }
function closeModal(e) { if (e.target.id === 'projectModal') closeModalBtn(); }

async function loadTestimonials() {
  const wrap = document.getElementById('testimonials-grid');
  if (!wrap) return;
  try {
    const res = await fetch('data/testimonials.json');
    const items = await res.json();
    wrap.innerHTML = items.map(t => `
      <div class="card">
        <p style="font-style:italic; color:var(--text); font-size:0.94rem; margin-bottom:0.9rem;">"${t.quote}"</p>
        <div style="font-weight:700; font-size:0.88rem; color:var(--accent);">${t.author}</div>
        <div style="font-size:0.78rem; color:var(--muted); font-family:'Fira Code', monospace;">${t.role}</div>
      </div>
    `).join('');
  } catch (e) { console.error(e); }
}

// Live NLP Fake News Classifier Sandbox
function runFakeNewsDemo() {
  const input = document.getElementById('newsInput');
  const out = document.getElementById('newsOutput');
  if (!input || !out) return;
  const text = input.value.trim();
  if (!text) return;

  const sensational = ['shocking', 'miracle', 'secret', 'exposed', 'guaranteed', '100%', 'conspiracy', 'breaking', 'unbelievable', 'banned', 'hoax', 'scam'];
  const credible = ['study', 'dataset', 'university', 'published', 'report', 'according', 'researchers', 'evidence', 'analysis', 'ministry', 'journal', 'percent'];

  const words = text.toLowerCase().replace(/[^a-z0-9%\s]/g, '').split(/\s+/).filter(Boolean);
  let sensHits = words.filter(w => sensational.includes(w));
  let credHits = words.filter(w => credible.includes(w));
  const exclamations = (text.match(/!/g) || []).length;
  const capsWords = text.split(/\s+/).filter(w => w.length > 3 && w === w.toUpperCase() && /[A-Z]/.test(w));

  let rawScore = 0.25 + (sensHits.length * 0.22) + (exclamations * 0.1) + (capsWords.length * 0.12) - (credHits.length * 0.15);
  const fakeProb = Math.max(0.04, Math.min(0.98, rawScore));
  const isFake = fakeProb >= 0.5;

  out.innerHTML = `
    <div style="color:${isFake ? '#ef4444' : '#10b981'}; font-weight:700;">
      [${isFake ? '⚠️ HIGH SENSATIONALISM / MISINFORMATION RISK' : '✓ VERIFIED / NEUTRAL REPORTING STYLE'}] • Misinformation Score: ${(fakeProb * 100).toFixed(1)}%
    </div>
    <div style="margin-top:0.4rem; color:var(--muted);">
      Sensational N-Grams: [${sensHits.join(', ') || 'none'}] | Credibility Markers: [${credHits.join(', ') || 'none'}] | Caps/Exclamation Signals: ${capsWords.length + exclamations}
    </div>
  `;
}

// 2x2 Matrix, Eigenvalue & Determinant Lab
function updateMatrixLab() {
  const a = +(document.getElementById('matA')?.value || 2);
  const b = +(document.getElementById('matB')?.value || 1);
  const c = +(document.getElementById('matC')?.value || 0);
  const d = +(document.getElementById('matD')?.value || 1.5);
  const readout = document.getElementById('matrixReadout');
  const canvas = document.getElementById('matrixCanvas');
  if (!readout || !canvas) return;

  const det = a * d - b * c;
  const tr = a + d;
  const disc = tr * tr - 4 * det;
  let eigText = '';
  if (disc >= 0) {
    const l1 = ((tr + Math.sqrt(disc)) / 2).toFixed(2);
    const l2 = ((tr - Math.sqrt(disc)) / 2).toFixed(2);
    eigText = `Real Eigenvalues: λ₁ = ${l1}, λ₂ = ${l2}`;
  } else {
    const re = (tr / 2).toFixed(2);
    const im = (Math.sqrt(-disc) / 2).toFixed(2);
    eigText = `Complex Eigenvalues: ${re} ± ${im}i`;
  }
  const comp = Math.abs(det) < 1e-6 ? 'Singular (Not in GL₂(ℝ))' : (det > 0 ? 'GL₂⁺(ℝ) Component (det > 0)' : 'GL₂⁻(ℝ) Component (det < 0)');
  readout.innerHTML = `Matrix [[${a}, ${b}], [${c}, ${d}]] | <strong>det(A) = ${det.toFixed(2)}</strong> | tr(A) = ${tr.toFixed(2)}<br>${eigText} | Topology: <span style="color:#00f2fe;">${comp}</span>`;

  const ctx = canvas.getContext('2d');
  const w = canvas.width = canvas.offsetWidth;
  const h = canvas.height = 210;
  ctx.clearRect(0, 0, w, h);
  const cx = w / 2, cy = h / 2, s = 32;

  ctx.strokeStyle = 'rgba(148,163,184,0.25)';
  ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.moveTo(cx, 0); ctx.lineTo(cx, h); ctx.stroke();

  // Unit square
  ctx.strokeStyle = '#64748b'; ctx.setLineDash([4, 4]);
  ctx.strokeRect(cx, cy - s, s, s);
  ctx.setLineDash([]);

  // Transformed parallelogram
  const pts = [[0,0], [a,c], [a+b, c+d], [b,d]];
  ctx.fillStyle = det >= 0 ? 'rgba(0,242,254,0.22)' : 'rgba(168,85,247,0.25)';
  ctx.strokeStyle = det >= 0 ? '#00f2fe' : '#a855f7';
  ctx.lineWidth = 2;
  ctx.beginPath();
  pts.forEach(([px, py], idx) => {
    const sx = cx + px * s, sy = cy - py * s;
    if (idx === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
  });
  ctx.closePath(); ctx.fill(); ctx.stroke();
}

// GAME 1: Gradient Descent Valley Finder
let gdX = -3.6, gdSteps = 0;
function resetGD() {
  gdX = -3.6; gdSteps = 0;
  drawGD();
  const msg = document.getElementById('gdStatus');
  if (msg) msg.textContent = 'Ball placed at x = -3.60. Choose a learning rate α and step toward the global minimum (x ≈ 1.45)!';
}
function stepGD() {
  const lr = +(document.getElementById('gdLr')?.value || 0.15);
  // f(x) = 0.25*x^4 - 0.3*x^3 - 1.5*x^2 + 0.8*x + 4
  const grad = Math.pow(gdX, 3) - 0.9 * Math.pow(gdX, 2) - 3 * gdX + 0.8;
  gdX = Math.max(-4.2, Math.min(4.2, gdX - lr * grad));
  gdSteps++;
  drawGD();
  const msg = document.getElementById('gdStatus');
  if (!msg) return;
  if (Math.abs(gdX - 1.45) < 0.18) {
    msg.innerHTML = `<span style="color:#10b981;">✓ Global Minimum Reached at x = ${gdX.toFixed(2)} in ${gdSteps} steps!</span>`;
  } else if (Math.abs(gdX + 1.15) < 0.18 && Math.abs(grad) < 0.15) {
    msg.innerHTML = `<span style="color:#f59e0b;">⚠️ Trapped in Local Minimum at x = ${gdX.toFixed(2)}! Try a larger α to escape.</span>`;
  } else {
    msg.textContent = `Step ${gdSteps}: x = ${gdX.toFixed(2)} | Gradient f'(x) = ${grad.toFixed(2)}`;
  }
}
function drawGD() {
  const canvas = document.getElementById('gdCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width = canvas.offsetWidth;
  const h = canvas.height = 175;
  ctx.clearRect(0, 0, w, h);

  const f = x => 0.25 * Math.pow(x, 4) - 0.3 * Math.pow(x, 3) - 1.5 * Math.pow(x, 2) + 0.8 * x + 4.5;
  const toSx = x => ((x + 4.2) / 8.4) * (w - 30) + 15;
  const toSy = y => h - 20 - (y / 14) * (h - 35);

  ctx.strokeStyle = '#00f2fe'; ctx.lineWidth = 2; ctx.beginPath();
  for (let x = -4.0; x <= 4.0; x += 0.08) {
    const sx = toSx(x), sy = toSy(f(x));
    if (x === -4.0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
  }
  ctx.stroke();

  // Ball
  ctx.fillStyle = '#a855f7';
  ctx.beginPath(); ctx.arc(toSx(gdX), toSy(f(gdX)), 7, 0, Math.PI * 2); ctx.fill();
}

// GAME 2: Eigenvalue & Determinant Speed Blitz
let blitzScore = 0, blitzAns = 0;
function nextBlitzQuestion() {
  const a = Math.floor(Math.random() * 7) - 3;
  const b = Math.floor(Math.random() * 7) - 3;
  const c = Math.floor(Math.random() * 7) - 3;
  const d = Math.floor(Math.random() * 7) - 3;
  const askDet = Math.random() > 0.4;
  blitzAns = askDet ? (a * d - b * c) : (a + d);
  const qEl = document.getElementById('blitzPrompt');
  if (qEl) {
    qEl.innerHTML = `Score: <strong>${blitzScore}</strong> | Compute <strong>${askDet ? 'det(A)' : 'trace(A)'}</strong> for <code>[[${a}, ${b}], [${c}, ${d}]]</code>:`;
  }
}
function checkBlitz() {
  const inp = document.getElementById('blitzInput');
  const fb = document.getElementById('blitzFeedback');
  if (!inp || !fb) return;
  const val = parseInt(inp.value, 10);
  if (val === blitzAns) {
    blitzScore++;
    fb.innerHTML = `<span style="color:#10b981;">✓ Correct! (${blitzAns})</span>`;
    inp.value = '';
    nextBlitzQuestion();
  } else {
    fb.innerHTML = `<span style="color:#ef4444;">✕ Try again! Remember det = ad - bc, trace = a + d.</span>`;
  }
}

// GAME 3: Monty Hall & Bayesian Intuition Simulator
let mhStayWins = 0, mhStayTotal = 0, mhSwitchWins = 0, mhSwitchTotal = 0;
function playMontyHall(trials, doSwitch) {
  for (let i = 0; i < trials; i++) {
    const prize = Math.floor(Math.random() * 3);
    const pick = Math.floor(Math.random() * 3);
    const won = doSwitch ? (pick !== prize) : (pick === prize);
    if (doSwitch) { mhSwitchTotal++; if (won) mhSwitchWins++; }
    else { mhStayTotal++; if (won) mhStayWins++; }
  }
  const el = document.getElementById('mhStats');
  if (el) {
    const stayPct = mhStayTotal ? ((mhStayWins / mhStayTotal) * 100).toFixed(1) : '0.0';
    const swPct = mhSwitchTotal ? ((mhSwitchWins / mhSwitchTotal) * 100).toFixed(1) : '0.0';
    el.innerHTML = `<strong>Stay Strategy:</strong> ${mhStayWins}/${mhStayTotal} wins (${stayPct}%)  |  <strong style="color:#10b981;">Switch Strategy:</strong> ${mhSwitchWins}/${mhSwitchTotal} wins (${swPct}%)`;
  }
}

// Spot the AI Reasoning Flaw
function evaluateTrace(choice) {
  const box = document.getElementById('reasoningVerdict');
  if (!box) return;
  box.classList.add('show');
  if (choice === 'A') {
    box.style.borderLeftColor = 'var(--accent-green)';
    box.innerHTML = '<strong>✓ Spot On! Trace A contains a subtle topological fallacy.</strong> For m(t) = t³ - t, the eigenvalues {0, 1, -1} partition ℝ⁴ into eigenspaces of dimensions (2, 1, 1), so G ≅ GL₂(ℝ) × GL₁(ℝ) × GL₁(ℝ). Trace A falsely assumes GL_n(ℝ) is path-connected (1 component), ignoring det(X) > 0 vs. det(X) < 0 (2 components each ⇒ 2³ = 8).';
  } else {
    box.style.borderLeftColor = 'var(--accent-red)';
    box.innerHTML = '<strong>✕ Look closer at Trace A!</strong> Trace B correctly decomposes G ≅ GL₂(ℝ) × GL₁(ℝ) × GL₁(ℝ) and multiplies the 2 determinant components per factor (2 × 2 × 2 = 8). Trace A forgets that GL_n(ℝ) has two disconnected components.';
  }
}

// 2D Cosine Similarity & Time-Series Visualizers
function updateCosineViz() {
  const canvas = document.getElementById('cosineCanvas');
  const angleSlider = document.getElementById('vecAngle');
  const label = document.getElementById('cosineReadout');
  if (!canvas || !angleSlider) return;

  const deg = +angleSlider.value;
  const rad = (deg * Math.PI) / 180;
  const sim = Math.cos(rad);
  const passes = sim >= 0.70;
  label.innerHTML = `Angle θ = <strong>${deg}°</strong> | Cosine Similarity = <strong>${sim.toFixed(3)}</strong> | Gate (≥ 0.70): <span style="color:${passes ? '#10b981' : '#ef4444'}">${passes ? 'ACCEPTED' : 'FILTERED OUT'}</span>`;

  const ctx = canvas.getContext('2d');
  const w = canvas.width = canvas.offsetWidth;
  const h = canvas.height = 190;
  ctx.clearRect(0, 0, w, h);
  const ox = 60, oy = h - 30, len = 120;
  ctx.strokeStyle = 'rgba(148,163,184,0.3)';
  ctx.beginPath(); ctx.moveTo(ox, 15); ctx.lineTo(ox, oy); ctx.lineTo(w - 25, oy); ctx.stroke();

  const qRad = (15 * Math.PI) / 180;
  drawArrow(ctx, ox, oy, ox + len * Math.cos(qRad), oy - len * Math.sin(qRad), '#00f2fe', 'Query q');
  const dRad = ((15 + deg) * Math.PI) / 180;
  drawArrow(ctx, ox, oy, ox + len * Math.cos(dRad), oy - len * Math.sin(dRad), passes ? '#10b981' : '#ef4444', 'Chunk d');
}

function drawArrow(ctx, x1, y1, x2, y2, color, text) {
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.beginPath(); ctx.arc(x2, y2, 4, 0, Math.PI * 2); ctx.fill();
  ctx.font = '12px Fira Code, monospace';
  ctx.fillText(text, x2 + 8, y2 + 4);
}

function updateTsViz() {
  const canvas = document.getElementById('tsDecompCanvas');
  const seasonSlider = document.getElementById('seasonWeight');
  const readout = document.getElementById('tsReadout');
  if (!canvas || !seasonSlider) return;

  const sWeight = +seasonSlider.value / 100;
  readout.innerHTML = `Seasonal Amplitude = <strong>${Math.round(sWeight * 100)}%</strong> | Y_t = Trend + ${sWeight.toFixed(2)}·Seasonality + Noise`;

  const ctx = canvas.getContext('2d');
  const w = canvas.width = canvas.offsetWidth;
  const h = canvas.height = 190;
  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = '#00f2fe'; ctx.lineWidth = 2; ctx.beginPath();
  for (let x = 0; x < w - 20; x++) {
    const t = x / 28;
    const y = (h - 30) - (0.2 * x + sWeight * 38 * Math.sin(t * Math.PI) + 5 * Math.sin(t * 7.3));
    if (x === 0) ctx.moveTo(x + 10, y); else ctx.lineTo(x + 10, y);
  }
  ctx.stroke();
}

function filterItems(cardClass, category, btn) {
  btn.parentElement.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.' + cardClass).forEach(card => {
    const cat = card.getAttribute('data-cat');
    card.style.display = (category === 'all' || cat === category) ? '' : 'none';
  });
}

async function handleContactSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('senderName').value.trim();
  const email = document.getElementById('senderEmail').value.trim();
  const message = document.getElementById('senderMsg').value.trim();
  const key = document.getElementById('web3Key').value.trim();
  fetch('https://script.google.com/macros/s/AKfycbx-lUmYJISZwTFuuh4gx4GqqNUJDf0wEFIL6fRD_gB1q9gSyPxeWbo1Zj2QIH0aKQa2/exec', {
    method: 'POST',
    mode: 'no-cors',
    body: JSON.stringify({ name, email, message })
  });
  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ access_key: key, name, email, message, subject: `Portfolio Inquiry from ${name}` })
    });
    if (res.ok) {
      showToast('✓ Message sent directly to Akash!');
      document.getElementById('contactForm').reset();
      return;
    }
  } catch (_) {}
  window.location.href = `mailto:aksainibits@gmail.com?subject=${encodeURIComponent('Portfolio Inquiry from ' + name)}&body=${encodeURIComponent(message)}`;
}

document.addEventListener('DOMContentLoaded', () => {
  loadPosts();
  loadProjects();
  loadTestimonials();
  updateCosineViz();
  updateTsViz();
  updateMatrixLab();
  resetGD();
  nextBlitzQuestion();

  const typedEl = document.getElementById('typed-text');
  if (typedEl) {
    const roles = ["AI & Machine Learning Engineer", "LLM Evaluation & RAG Specialist", "BITS Pilani Mathematics Graduate", "NLP & Data Pipeline Architect"];
    let r = 0, c = 0, del = false;
    (function loop() {
      const cur = roles[r];
      typedEl.textContent = del ? cur.substring(0, c--) : cur.substring(0, c++);
      let spd = del ? 40 : 85;
      if (!del && c === cur.length + 1) { spd = 1800; del = true; }
      else if (del && c === 0) { del = false; r = (r + 1) % roles.length; spd = 400; }
      setTimeout(loop, spd);
    })();
  }

  const tsCtx = document.getElementById('tsChart');
  const nlpCtx = document.getElementById('nlpChart');
  if (tsCtx && nlpCtx && typeof Chart !== 'undefined') {
    new Chart(tsCtx, {
      type: 'bar',
      data: {
        labels: ['AR(2,1,0)', 'MA(0,1,2)', 'ARIMA(2,1,2)', 'SARIMA (Optimal)'],
        datasets: [{ label: 'RMSE (MWh)', data: [412.8, 398.5, 341.2, 164.7], backgroundColor: ['#64748b', '#64748b', '#4facfe', '#00f2fe'], borderRadius: 6 }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
    new Chart(nlpCtx, {
      type: 'bar',
      data: {
        labels: ['Naive Bayes', 'Logistic Reg', 'Passive-Aggressive'],
        datasets: [{ label: 'Accuracy (%)', data: [90.4, 94.2, 95.0], backgroundColor: ['#a855f7', '#4facfe', '#00f2fe'], borderRadius: 6 }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { min: 80, max: 100 } } }
    });
  }
});

function runCmd(key) {
  const body = document.getElementById('terminal-body');
  const map = {
    stack: { c: "./stack.sh", o: `"frameworks": ["PyTorch", "TensorFlow", "HuggingFace", "FAISS"],<br>"infra": ["Docker", "Kubernetes", "GitHub Actions", "Linux"]` },
    llm: { c: "./llm_eval.sh", o: `[PASS] Gemini instruction tuning & safety audit<br>[PASS] Atomic step verification & hallucination gates` },
    impact: { c: "./metrics.sh", o: `• Swecha Voice: 6,000x training DB scale<br>• Fake News NLP: 95.0% accuracy | SARIMA: 60% RMSE drop` },
    contact: { c: "./book_call.sh", o: `Topmate: topmate.io/akash12740 | Gumroad: akashsaini12740.gumroad.com` }
  };
  const item = map[key];
  body.innerHTML = `<div><span style="color:#10b981;">➜</span> ${item.c}</div><div class="cmd-output">${item.o}</div>`;
}


let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (typeof updateCosineViz === 'function') updateCosineViz();
    if (typeof updateTsViz === 'function') updateTsViz();
    if (typeof updateMatrixLab === 'function') updateMatrixLab();
    if (typeof drawGD === 'function') drawGD();
  }, 150);
});
// Interactive Sprint Scope & Pricing Estimator
let EST_CURRENCY = 'USD';
const SPRINT_CATALOG = {
  rag:      { name: 'Sprint 01: Custom RAG & Citation-Grounded Q&A', usd: [1400, 2200], inr: [65000, 110000], days: [7, 10] },
  audit:    { name: 'Sprint 02: LLM Evaluation & Hallucination Audit', usd: [1000, 1800], inr: [45000, 85000], days: [5, 7] },
  nlp:      { name: 'Sprint 03: NLP Classification / SARIMA Forecasting Engine', usd: [1200, 2400], inr: [55000, 115000], days: [7, 14] },
  retainer: { name: 'Monthly Fractional AI & Eval Advisor (10 hrs/mo)', usd: [1500, 2500], inr: [75000, 125000], days: [30, 30] }
};

function setEstimatorCurrency(curr) {
  EST_CURRENCY = curr;
  const usdBtn = document.getElementById('currUsdBtn');
  const inrBtn = document.getElementById('currInrBtn');
  if (usdBtn) usdBtn.classList.toggle('active', curr === 'USD');
  if (inrBtn) inrBtn.classList.toggle('active', curr === 'INR');
  updateSprintEstimate();
}

function updateSprintEstimate() {
  const trackEl = document.getElementById('estTrack');
  if (!trackEl) return;
  const base = SPRINT_CATALOG[trackEl.value] || SPRINT_CATALOG.rag;
  const addEval = document.getElementById('addonEval')?.checked;
  const addDocker = document.getElementById('addonDocker')?.checked;
  const addUi = document.getElementById('addonUi')?.checked;
  const addonCount = (addEval ? 1 : 0) + (addDocker ? 1 : 0) + (addUi ? 1 : 0);

  const minDays = base.days[0] + addonCount * 2;
  const maxDays = base.days[1] + addonCount * 2;

  let priceStr = '';
  if (EST_CURRENCY === 'USD') {
    const low = base.usd[0] + addonCount * 350;
    const high = base.usd[1] + addonCount * 450;
    priceStr = `$${low.toLocaleString()} – $${high.toLocaleString()}`;
  } else {
    const low = base.inr[0] + addonCount * 18000;
    const high = base.inr[1] + addonCount * 25000;
    priceStr = `₹${low.toLocaleString('en-IN')} – ₹${high.toLocaleString('en-IN')}`;
  }

  const priceEl = document.getElementById('estPriceDisplay');
  const timeEl = document.getElementById('estTimeDisplay');
  if (priceEl) priceEl.textContent = priceStr + (trackEl.value === 'retainer' ? ' / mo' : '');
  if (timeEl) timeEl.textContent = trackEl.value === 'retainer'
    ? 'Ongoing Monthly Advisory • Async Slack + Weekly Syncs'
    : `Estimated Timeline: ${minDays}–${maxDays} Business Days`;
}

function applyEstimateToContact() {
  const trackEl = document.getElementById('estTrack');
  const msgBox = document.getElementById('senderMsg');
  const contactSec = document.getElementById('contact');
  if (!trackEl || !msgBox) return;

  const base = SPRINT_CATALOG[trackEl.value];
  const addons = [];
  if (document.getElementById('addonEval')?.checked) addons.push('Automated Adversarial Eval Harness');
  if (document.getElementById('addonDocker')?.checked) addons.push('FastAPI + Docker Deployment');
  if (document.getElementById('addonUi')?.checked) addons.push('Custom Interactive Web UI');

  const priceText = document.getElementById('estPriceDisplay')?.textContent || '';
  const timeText = document.getElementById('estTimeDisplay')?.textContent || '';

  msgBox.value = `Hi Akash,\n\nI'd like to scope an engagement:\n• Track: ${base.name}\n• Add-ons: ${addons.length ? addons.join(', ') : 'Core Sprint Only'}\n• Estimator Range: ${priceText} (${timeText})\n\nProject context & dataset details:\n`;
  if (contactSec) contactSec.scrollIntoView({ behavior: 'smooth' });
  msgBox.focus();
  showToast('✓ Sprint scope pre-filled in the project brief below!');
}

async function handleLeadMagnetSubmit(e) {
  e.preventDefault();
  const emailInput = document.getElementById('leadEmail');
  const key = document.getElementById('web3Key')?.value.trim();
  if (!emailInput) return;
  const email = emailInput.value.trim();

  fetch('https://script.google.com/macros/s/AKfycbx-lUmYJISZwTFuuh4gx4GqqNUJDf0wEFIL6fRD_gB1q9gSyPxeWbo1Zj2QIH0aKQa2/exec', {
    method: 'POST',
    mode: 'no-cors',
    body: JSON.stringify({ name: 'Lead Magnet Subscriber', email, message: 'Requested 12-Point LLM Hallucination Audit Checklist' })
  });

  if (key) {
    try {
      await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: key,
          name: 'Checklist Lead',
          email,
          subject: 'New Lead Magnet Request: 12-Point LLM Hallucination Checklist',
          message: `Subscriber email: ${email} requested the 12-Point LLM Hallucination Audit Checklist.`
        })
      });
    } catch (_) {}
  }

  emailInput.value = '';
  showToast('✓ Request received! Check your inbox shortly for the 12-Point LLM Checklist.');
}

document.addEventListener('DOMContentLoaded', () => {
  if (typeof updateSprintEstimate === 'function') updateSprintEstimate();
});
// Grounded Client-Side Portfolio Q&A Assistant
const PORTFOLIO_KB = [
  {
    keys: ['price', 'cost', 'pricing', 'rate', 'sprint', 'timeline', 'days', 'budget', 'retainer', 'inr', 'usd'],
    ans: 'Fixed-scope sprints start at $1,000–$1,800 (₹45k–₹85k) for a 5-day LLM Hallucination Audit, $1,400–$2,200 (₹65k–₹1.1L) for a 7–10 day Custom RAG Engine, and $1,500–$2,500/mo for Fractional AI Advisory. Use the Sprint Estimator in Section 01 to customize add-ons!'
  },
  {
    keys: ['rag', 'hallucination', 'faiss', 'vector', 'citation', 'gemini', 'innodata', 'llm', 'eval', 'safety'],
    ans: 'Akash audited Gemini instruction fine-tuning and AI safety workflows at Innodata (Jan–Jun 2026) and builds FAISS/vector RAG engines with strict cosine similarity gates and mandatory [doc_id | chunk] citations to eliminate hallucinations.'
  },
  {
    keys: ['education', 'bits', 'pilani', 'math', 'mathematics', 'wilp', 'degree', 'teach', 'facilitator'],
    ans: 'Akash holds an Integrated M.Sc. in Mathematics from BITS Pilani (2019–2023) and serves as a Learning Facilitator at WILP, BITS Pilani teaching Linear Algebra, Optimization, and Computer Programming.'
  },
  {
    keys: ['project', 'swecha', 'fake', 'news', 'energy', 'sarima', 'arima', 'forecast', 'nlp', 'accuracy', 'rmse'],
    ans: 'Key verified outcomes: 6,000x NLP training database scale at Swecha Voice, 95.0% classification accuracy on Fake News Detection, and a 60% RMSE reduction (412.8 -> 164.7 MWh) using SARIMA on 15-year energy data.'
  },
  {
    keys: ['hire', 'book', 'call', 'contact', 'email', 'linkedin', 'topmate', 'gumroad', 'timezone', 'remote'],
    ans: 'Akash works remotely with US, UK, EU, and APAC teams (IST timezone with overlap). Book a free 15-min call at cal.com/akash-saini-12740/15min, message on LinkedIn, or email aksainibits@gmail.com.'
  }
];

function togglePortfolioChat() {
  const box = document.getElementById('aiChatBox');
  if (!box) return;
  box.style.display = box.style.display === 'none' || !box.style.display ? 'block' : 'none';
}

function askPortfolioBot(question) {
  const log = document.getElementById('aiChatLog');
  if (!log) return;
  const qWords = question.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
  let best = PORTFOLIO_KB[0], bestScore = 0;

  PORTFOLIO_KB.forEach(entry => {
    const score = entry.keys.reduce((acc, k) => acc + (qWords.some(w => w.includes(k) || k.includes(w)) ? 1 : 0), 0);
    if (score > bestScore) { bestScore = score; best = entry; }
  });

  const reply = bestScore > 0
    ? best.ans
    : 'I only answer from verified facts in Akash’s portfolio (similarity gate check). Ask about sprint pricing, RAG & LLM evals, BITS Pilani math background, projects, or booking a 15-min call!';

  log.innerHTML += `<div style="margin-top:0.55rem; color:var(--text);"><strong>You:</strong> ${question}</div>`;
  log.innerHTML += `<div style="margin-top:0.25rem; color:var(--accent-green);"><strong>AI:</strong> ${reply}</div>`;
  log.scrollTop = log.scrollHeight;
}
// 1-Click LinkedIn Post Generator from Blog Posts
function copyLinkedInPost(id) {
  const p = ALL_POSTS.find(x => x.id === id);
  if (!p) return;
  const postText = `${p.title}\n\n${p.summary}\n\nArchitecture:\n${p.architecture_flow}\n\nKey Takeaway: ${p.takeaway}\n\nRead the full breakdown + BibTeX citation:\nhttps://akash12740.github.io/blog.html#${p.id}\n\n#AI #MachineLearning #LLMs #RAG #AppliedMath #DataScience`;
  navigator.clipboard.writeText(postText);
  showToast('✓ Ready-to-post LinkedIn draft copied to clipboard!');
}

// Lightweight Conversion Telemetry (tracks Cal.com, Gumroad, Topmate & Resume clicks)
document.addEventListener('click', (e) => {
  const anchor = e.target.closest('a');
  if (!anchor) return;
  const href = anchor.getAttribute('href') || '';
  if (/cal\.com|gumroad\.com|topmate\.io|resume_AkashSaini\.pdf|linkedin\.com/.test(href)) {
    fetch('https://script.google.com/macros/s/AKfycbx-lUmYJISZwTFuuh4gx4GqqNUJDf0wEFIL6fRD_gB1q9gSyPxeWbo1Zj2QIH0aKQa2/exec', {
      method: 'POST',
      mode: 'no-cors',
      keepalive: true,
      body: JSON.stringify({
        name: 'Conversion Click',
        email: href,
        message: `Clicked [${anchor.textContent.trim()}] on ${window.location.pathname}`
      })
    });
  }
});
// Demo 3: RAG Chunking & Token Cost Visualizer
function updateChunkVisualizer() {
  const txtEl = document.getElementById('chunkInput');
  const sizeEl = document.getElementById('chunkSizeSlider');
  const ovEl = document.getElementById('chunkOverlapSlider');
  const outEl = document.getElementById('chunkOutput');
  if (!txtEl || !sizeEl || !ovEl || !outEl) return;

  const size = parseInt(sizeEl.value, 10);
  const overlap = Math.min(parseInt(ovEl.value, 10), size - 1);
  document.getElementById('chunkSizeVal').textContent = size;
  document.getElementById('chunkOverlapVal').textContent = overlap;

  const words = txtEl.value.trim().split(/\s+/).filter(Boolean);
  const step = Math.max(1, size - overlap);
  const chunks = [];
  for (let i = 0; i < words.length; i += step) {
    chunks.push(words.slice(i, i + size).join(' '));
    if (i + size >= words.length) break;
  }
  const estTokens = Math.round(words.length * 1.33);
  outEl.innerHTML = `<div style="color:var(--accent); margin-bottom:0.4rem;">Chunks: <strong>${chunks.length}</strong> | Est. Tokens: <strong>${estTokens}</strong> | Embed Cost: <strong>$${(estTokens * 0.00000002).toFixed(6)}</strong></div>` +
    chunks.map((c, idx) => `<div style="margin-bottom:0.35rem; padding-left:0.5rem; border-left:2px solid var(--accent-purple);"><span style="color:var(--accent-green);">[chunk_${idx}]</span> ${c}</div>`).join('');
}

// Demo 4: LLM Prompt Injection & PII Safety Guardrail Tester
function runSafetyGuardrail() {
  const inp = document.getElementById('guardInput');
  const out = document.getElementById('guardOutput');
  if (!inp || !out) return;
  const q = inp.value.trim();
  if (!q) return;

  const rules = [
    { name: 'Instruction Override / Jailbreak', re: /ignore\s+(all\s+)?previous|bypass|jailbreak|dan\s+mode|act\s+as\s+unrestricted/i },
    { name: 'System Prompt / Secret Exfiltration', re: /system\s+prompt|api\s*key|password|secret\s+token|hidden\s+instructions/i },
    { name: 'PII / Sensitive Identifier Leak', re: /\b\d{3}-\d{2}-\d{4}\b|\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i }
  ];
  const triggered = rules.filter(r => r.re.test(q)).map(r => r.name);
  if (triggered.length) {
    out.innerHTML = `<div style="color:#ef4444; font-weight:700;">[BLOCKED • UNSAFE INPUT] Triggered: ${triggered.join(', ')}</div><div style="color:var(--muted); margin-top:0.3rem;">Action: Request halted before LLM inference; audit event logged.</div>`;
  } else {
    out.innerHTML = `<div style="color:#10b981; font-weight:700;">[PASSED • SAFE FOR RAG INFERENCE] 0 policy violations detected.</div><div style="color:var(--muted); margin-top:0.3rem;">Action: Routed to FAISS retriever with cosine similarity gate (>= 0.70).</div>`;
  }
}

// Ctrl+K / Cmd+K Quick Command Palette
const PALETTE_COMMANDS = [
  { label: '📅 Book 15-Min Discovery Call (Cal.com)', action: () => window.open('https://cal.com/akash-saini-12740/15min', '_blank') },
  { label: '💰 Jump to Interactive Sprint Scope & Pricing Estimator', action: () => document.getElementById('sprint-estimator')?.scrollIntoView({ behavior: 'smooth' }) },
  { label: '🤗 Jump to Live RAG & Safety Playgrounds', action: () => document.getElementById('live-demo')?.scrollIntoView({ behavior: 'smooth' }) },
  { label: '🧮 Jump to AI Reasoning & Math Lab', action: () => document.getElementById('reasoning-lab')?.scrollIntoView({ behavior: 'smooth' }) },
  { label: '📚 Open Full Technical Blog Archive', action: () => window.location.href = 'blog.html' },
  { label: '📄 Open 1-Page Consulting Capabilities Deck', action: () => window.location.href = 'capabilities.html' },
  { label: '📦 Browse Gumroad RAG & Math Starter Kits', action: () => window.open('https://akashsaini12740.gumroad.com', '_blank') },
  { label: '✉️ Copy Direct Email (aksainibits@gmail.com)', action: () => copyEmail() },
  { label: '🌓 Toggle Dark / Light Theme', action: () => toggleTheme() }
];

function toggleCommandPalette() {
  const modal = document.getElementById('cmdPaletteBackdrop');
  if (!modal) return;
  const isOpen = modal.classList.contains('open');
  if (isOpen) {
    modal.classList.remove('open');
  } else {
    modal.classList.add('open');
    const inp = document.getElementById('cmdSearchInput');
    if (inp) { inp.value = ''; inp.focus(); }
    filterCommands('');
  }
}

function filterCommands(q) {
  const list = document.getElementById('cmdList');
  if (!list) return;
  const term = (q || '').toLowerCase();
  const matches = PALETTE_COMMANDS.filter(c => c.label.toLowerCase().includes(term));
  list.innerHTML = matches.map((c, idx) => `<button type="button" class="btn btn-glass btn-sm" style="justify-content:flex-start; width:100%;" onclick="toggleCommandPalette(); PALETTE_COMMANDS[${PALETTE_COMMANDS.indexOf(c)}].action();">${c.label}</button>`).join('');
}

document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    toggleCommandPalette();
  } else if (e.key === 'Escape') {
    const modal = document.getElementById('cmdPaletteBackdrop');
    if (modal?.classList.contains('open')) modal.classList.remove('open');
  }
});

document.addEventListener('DOMContentLoaded', () => {
  if (typeof updateChunkVisualizer === 'function') updateChunkVisualizer();
});
// Interactive Floating Math Symbols (+, −, ×, ÷, π, ∞, ∑, √, △, ○) & Hoverable Geometry
function initPlayfulMathCanvas() {
  const canvas = document.getElementById('neural-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w = canvas.width = window.innerWidth;
  let h = canvas.height = window.innerHeight;

  const symbols = ['+', '−', '×', '÷', 'π', '∞', '∑', '√', '△', '○'];
  const shapes = [
    { type: 'triangle', name: 'Equilateral Triangle (△) — 3 equal sides, angles add up to 180°!', x: w * 0.14, y: h * 0.24, r: 26, vx: 0.18, vy: 0.12 },
    { type: 'circle',   name: 'Circle (○) — Every point is the exact same distance from the center (π ≈ 3.14)!', x: w * 0.84, y: h * 0.22, r: 24, vx: -0.15, vy: 0.16 },
    { type: 'square',   name: 'Square (□) — 4 equal sides and 4 crisp 90° right angles!', x: w * 0.18, y: h * 0.74, r: 24, vx: 0.14, vy: -0.14 },
    { type: 'hexagon',  name: 'Hexagon (⬡) — Nature’s favorite shape (honeycombs!) with 6 equal sides!', x: w * 0.82, y: h * 0.72, r: 26, vx: -0.16, vy: -0.12 }
  ];

  const floaters = Array.from({ length: 24 }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.25,
    vy: -0.12 - Math.random() * 0.2,
    sym: symbols[Math.floor(Math.random() * symbols.length)],
    size: 16 + Math.floor(Math.random() * 8)
  }));

  let mouseX = -999, mouseY = -999;
  const tip = document.getElementById('shapeTooltip');

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!tip) return;
    const hit = shapes.find(s => Math.hypot(mouseX - s.x, mouseY - s.y) <= s.r + 12);
    if (hit) {
      tip.style.display = 'block';
      tip.style.left = Math.min(window.innerWidth - 290, mouseX + 14) + 'px';
      tip.style.top = (mouseY + 14) + 'px';
      tip.textContent = '✨ ' + hit.name;
    } else {
      tip.style.display = 'none';
    }
  });

  window.addEventListener('resize', () => {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  });

  function drawPolygon(sides, x, y, r) {
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
      const ang = (i * 2 * Math.PI) / sides - Math.PI / 2;
      const px = x + r * Math.cos(ang);
      const py = y + r * Math.sin(ang);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
  }

  function animate() {
    ctx.clearRect(0, 0, w, h);
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    ctx.fillStyle = isLight ? 'rgba(29, 78, 216, 0.20)' : 'rgba(56, 189, 248, 0.22)';

    floaters.forEach(f => {
      f.x += f.vx;
      f.y += f.vy;
      if (f.y < -20) { f.y = h + 20; f.x = Math.random() * w; }
      if (f.x < -20) f.x = w + 20;
      if (f.x > w + 20) f.x = -20;
      ctx.font = `600 ${f.size}px "Fira Code", monospace`;
      ctx.fillText(f.sym, f.x, f.y);
    });

    shapes.forEach(s => {
      s.x += s.vx;
      s.y += s.vy;
      if (s.x < 40 || s.x > w - 40) s.vx *= -1;
      if (s.y < 80 || s.y > h - 40) s.vy *= -1;

      const hovered = Math.hypot(mouseX - s.x, mouseY - s.y) <= s.r + 12;
      ctx.strokeStyle = hovered
        ? '#f59e0b'
        : (isLight ? 'rgba(29, 78, 216, 0.32)' : 'rgba(251, 191, 36, 0.35)');
      ctx.lineWidth = hovered ? 2.5 : 1.5;

      if (s.type === 'circle') {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.stroke();
      } else if (s.type === 'triangle') {
        drawPolygon(3, s.x, s.y, s.r);
        ctx.stroke();
      } else if (s.type === 'square') {
        drawPolygon(4, s.x, s.y, s.r);
        ctx.stroke();
      } else {
        drawPolygon(6, s.x, s.y, s.r);
        ctx.stroke();
      }
    });

    requestAnimationFrame(animate);
  }
  animate();
}

// Everyday Math Fun Fact & Kid-Friendly Puzzle Widget
const MATH_FUN_FACTS = [
  { title: '🍕 The Pizza Volume Trick', text: 'A pizza with radius z and thickness a has volume Pi × z × z × a — literally "Pi · z · z · a"!' },
  { title: '🐝 Why Bees Love Hexagons', text: 'Out of all shapes that fit together without gaps, a 6-sided hexagon uses the least wax to hold the most honey!' },
  { title: '🌻 Sunflowers & Fibonacci Numbers', text: 'Count the spirals on a sunflower or pinecone: you will almost always get Fibonacci numbers like 21, 34, or 55!' },
  { title: '🎂 The Birthday Surprise', text: 'In a room of just 23 people, there is over a 50% chance that two people share the exact same birthday!' },
  { title: '🤖 How AI Reads Words Using Geometry', text: 'Computers turn words into arrows (vectors). Words with similar meanings—like "puppy" and "dog"—point in almost the same direction!' }
];
let funFactIdx = 0;

function nextMathFunFact() {
  const titleEl = document.getElementById('funFactTitle');
  const textEl = document.getElementById('funFactText');
  if (!titleEl || !textEl) return;
  funFactIdx = (funFactIdx + 1) % MATH_FUN_FACTS.length;
  titleEl.textContent = MATH_FUN_FACTS[funFactIdx].title;
  textEl.textContent = MATH_FUN_FACTS[funFactIdx].text;
}

document.addEventListener('DOMContentLoaded', initPlayfulMathCanvas);
// Worldwide School Tutoring Fee & Trial Class Planner
let TUT_CURRENCY = 'USD';
const TUTOR_RATES = {
  elem:   { label: 'Elementary School (Grades 1–5)', usd: [15, 20], inr: [600, 850] },
  mid:    { label: 'Middle School (Grades 6–8)', usd: [18, 24], inr: [750, 1000] },
  high:   { label: 'High School (Grades 9–10)', usd: [22, 28], inr: [900, 1300] },
  senior: { label: 'Senior Secondary / Exam Prep (Grades 11–12 / IB / SAT)', usd: [25, 35], inr: [1100, 1600] }
};

function setTutorCurrency(curr) {
  TUT_CURRENCY = curr;
  document.getElementById('tutUsdBtn')?.classList.toggle('active', curr === 'USD');
  document.getElementById('tutInrBtn')?.classList.toggle('active', curr === 'INR');
  updateTutorEstimate();
}

function updateTutorEstimate() {
  const gradeEl = document.getElementById('tutGrade');
  if (!gradeEl) return;
  const info = TUTOR_RATES[gradeEl.value] || TUTOR_RATES.mid;
  const rateEl = document.getElementById('tutRateDisplay');
  const packEl = document.getElementById('tutPackDisplay');

  if (TUT_CURRENCY === 'USD') {
    rateEl.textContent = `$${info.usd[0]} – $${info.usd[1]} / hour`;
    packEl.textContent = `Monthly 8-Session Pack: $${Math.round(info.usd[0] * 7.2)} – $${Math.round(info.usd[1] * 7.2)} (Save 10%)`;
  } else {
    rateEl.textContent = `₹${info.inr[0].toLocaleString('en-IN')} – ₹${info.inr[1].toLocaleString('en-IN')} / hour`;
    packEl.textContent = `Monthly 8-Session Pack: ₹${Math.round(info.inr[0] * 7.2).toLocaleString('en-IN')} – ₹${Math.round(info.inr[1] * 7.2).toLocaleString('en-IN')} (Save 10%)`;
  }
}

function applyTutorToContact() {
  const gradeEl = document.getElementById('tutGrade');
  const msgBox = document.getElementById('senderMsg');
  const contactSec = document.getElementById('contact');
  if (!gradeEl || !msgBox) return;

  const info = TUTOR_RATES[gradeEl.value];
  const subs = [];
  if (document.getElementById('subMath')?.checked) subs.push('Mathematics');
  if (document.getElementById('subSci')?.checked) subs.push('Science');
  if (document.getElementById('subEng')?.checked) subs.push('English');

  const rateText = document.getElementById('tutRateDisplay')?.textContent || '';
  msgBox.value = `Hi Akash,\n\nI would like to book a Free 20-Min Trial Class for 1-on-1 Online Tutoring:\n• Student Grade: ${info.label}\n• Subjects: ${subs.length ? subs.join(', ') : 'Mathematics'}\n• Estimated Rate: ${rateText}\n• Country / School Board (e.g., US, UK, IB, CBSE) & Preferred Days:\n`;
  if (contactSec) contactSec.scrollIntoView({ behavior: 'smooth' });
  msgBox.focus();
  showToast('✓ Trial class details pre-filled in the inquiry form below!');
}

if (typeof PORTFOLIO_KB !== 'undefined') {
  PORTFOLIO_KB.unshift({
    keys: ['tutor', 'tutoring', 'school', 'student', 'kids', 'child', 'grade', 'maths', 'math', 'science', 'english', 'ib', 'igcse', 'cbse', 'sat', 'trial', 'class', 'teacher'],
    ans: 'Akash offers personal 1-on-1 online tutoring in Mathematics, Science, and English for school students worldwide (Grades 1–12: US Common Core, UK GCSE/IGCSE, IB, CBSE, ICSE & Olympiad prep). Check the Tutoring section to see rates and book a Free 20-Min Trial Class!'
  });
}

document.addEventListener('DOMContentLoaded', () => {
  if (typeof updateTutorEstimate === 'function') updateTutorEstimate();
});
// Worldwide Tutoring Timezone Slot Matcher
function showTutorTimezone(region, btn) {
  if (btn && btn.parentElement) {
    btn.parentElement.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }
  const box = document.getElementById('tzDisplay');
  if (!box) return;
  const slots = {
    us: '<strong>🇺🇸 US & Canada After-School Slots:</strong><br/>• Weekdays (Mon–Fri): <strong>4:30 PM – 9:30 PM EST</strong> (1:30 PM – 6:30 PM PST)<br/>• Weekends (Sat–Sun): <strong>8:00 AM – 1:00 PM EST</strong> & <strong>6:00 PM – 9:30 PM EST</strong>',
    uk: '<strong>🇬🇧 UK & Europe After-School Slots:</strong><br/>• Weekdays (Mon–Fri): <strong>3:30 PM – 8:30 PM GMT</strong> (4:30 PM – 9:30 PM CET)<br/>• Weekends (Sat–Sun): <strong>9:00 AM – 6:00 PM GMT</strong>',
    me: '<strong>🇦🇪 UAE, Saudi Arabia & Middle East Slots:</strong><br/>• Weekdays (Sun–Thu / Mon–Fri): <strong>3:30 PM – 9:00 PM GST (Dubai)</strong><br/>• Weekends: <strong>10:00 AM – 7:00 PM GST</strong>',
    in: '<strong>🇮🇳 India After-School Slots (IST):</strong><br/>• Weekdays (Mon–Fri): <strong>4:00 PM – 9:30 PM IST</strong><br/>• Weekends (Sat–Sun): <strong>10:00 AM – 7:00 PM IST</strong>',
    apac: '<strong>🇸🇬 Singapore, Hong Kong & Australia Slots:</strong><br/>• Weekdays (Mon–Fri): <strong>3:30 PM – 8:30 PM SGT</strong> (5:30 PM – 10:30 PM AEST)<br/>• Weekends: <strong>10:00 AM – 6:00 PM SGT</strong>'
  };
  box.innerHTML = slots[region] || slots.us;
}
const CHEAT_SHEET_PDF = "BITS_Pilani_Math_LLM_Cheat_Sheet.pdf";
async function handleLeadCapture(e, source) { e.preventDefault(); const name = document.getElementById(source === 'popup' ? 'leadNamePopup' : 'leadNameInline')?.value.trim() || 'Reader'; const email = document.getElementById(source === 'popup' ? 'leadEmailPopup' : 'leadEmailInline')?.value.trim(); if (!email) return; localStorage.setItem('cheatSheetUnlocked', 'true'); fetch('https://script.google.com/macros/s/AKfycbx-lUmYJISZwTFuuh4gx4GqqNUJDf0wEFIL6fRD_gB1q9gSyPxeWbo1Zj2QIH0aKQa2/exec', { method: 'POST', mode: 'no-cors', body: JSON.stringify({ name, email, message: '[LEAD MAGNET] Downloaded ' + CHEAT_SHEET_PDF }) }); fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ access_key: 'b85a0e4a-e4c4-4c83-84cf-5deb470c88c1', name, email, subject: 'New Cheat Sheet Lead: ' + name, message: name + ' (' + email + ') unlocked ' + CHEAT_SHEET_PDF }) }).catch(() => {}); const u = document.getElementById(source === 'popup' ? 'leadUnlockPopup' : 'leadUnlockInline'); if (u) u.style.display = 'block'; showToast('✓ Cheat Sheet unlocked! Opening PDF...'); window.open(CHEAT_SHEET_PDF, '_blank'); }
function openLeadPopup() { if (document.getElementById('leadPopupBox')) return; const p = document.createElement('div'); p.id = 'leadPopupBox'; p.style.cssText = 'position:fixed; bottom:24px; left:24px; max-width:345px; background:var(--surface-solid); border:1.5px solid var(--accent); border-radius:14px; padding:1.15rem; box-shadow:0 12px 35px rgba(0,0,0,0.5); z-index:1800;'; p.innerHTML = '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;"><span class="section-tag" style="margin:0;">FREE_PDF_CHEAT_SHEET</span><button onclick="sessionStorage.setItem(''leadPopupDismissed'',''1''); document.getElementById(''leadPopupBox'').remove();" style="background:none; border:none; color:var(--muted); cursor:pointer; font-size:1.05rem;">✕</button></div><div style="font-weight:700; font-size:0.98rem; margin-bottom:0.35rem;">BITS Pilani Math & LLM Cheat Sheet</div><p style="color:var(--muted); font-size:0.82rem; margin-bottom:0.65rem;">Enter your email to download my visual Linear Algebra, RAG & LLM Audit PDF.</p><form onsubmit="handleLeadCapture(event, ''popup'')"><input type="text" id="leadNamePopup" class="pg-input" style="padding:0.55rem; margin-bottom:0.45rem;" placeholder="Your Name" required /><input type="email" id="leadEmailPopup" class="pg-input" style="padding:0.55rem; margin-bottom:0.55rem;" placeholder="Your Email" required /><button type="submit" class="btn btn-primary btn-sm" style="width:100%; justify-content:center;">Download Free PDF ↗</button></form><div id="leadUnlockPopup" style="display:none; margin-top:0.5rem; font-size:0.82rem; color:var(--accent-green);">✓ <a href="' + CHEAT_SHEET_PDF + '" target="_blank" download style="color:var(--accent); font-weight:700;">Open PDF Now ↗</a></div>'; document.body.appendChild(p); }
document.addEventListener('DOMContentLoaded', () => { const b = document.createElement('button'); b.className = 'btn btn-primary btn-sm'; b.textContent = '🎁 Free Math & LLM PDF'; b.style.cssText = 'position:fixed; bottom:24px; left:24px; z-index:1700;'; b.onclick = openLeadPopup; document.body.appendChild(b); if (localStorage.getItem('cheatSheetUnlocked') === 'true') { const u = document.getElementById('leadUnlockInline'); if (u) u.style.display = 'block'; return; } setTimeout(() => { if (!sessionStorage.getItem('leadPopupDismissed')) openLeadPopup(); }, 5000); });

// Instant "Book a Free Demo Class" Popup on Tuition Tab Click
function openTuitionDemoPopup() {
  if (document.getElementById('tuitionDemoBackdrop')) return;
  const backdrop = document.createElement('div');
  backdrop.id = 'tuitionDemoBackdrop';
  backdrop.className = 'modal-backdrop open';
  backdrop.onclick = (e) => { if (e.target === backdrop) backdrop.remove(); };

  backdrop.innerHTML = `
    <div class="modal-box" style="max-width: 460px; padding: 1.75rem;">
      <button class="modal-close" onclick="document.getElementById('tuitionDemoBackdrop').remove()">✕</button>
      <span class="section-tag">1:1_LIVE_TUTORING • BITS_PILANI_ALUMNUS</span>
      <h3 style="font-size: 1.35rem; margin: 0.35rem 0 0.5rem;">Book Your Free 1:1 Demo Class 🎓</h3>
      <p style="color: var(--muted); font-size: 0.88rem; margin-bottom: 1rem;">
        Personalized 1-on-1 coaching in <strong>Mathematics, Science, Programming & AI Foundations</strong> tailored to your syllabus and pace.
      </p>
      <form onsubmit="submitTuitionDemo(event)">
        <input type="text" id="demoStudentName" class="pg-input" placeholder="Student / Parent Name" required />
        <input type="email" id="demoStudentEmail" class="pg-input" placeholder="Email Address" required />
        <input type="text" id="demoSubjectGrade" class="pg-input" placeholder="Grade / Subject (e.g., Class 10 Math, Linear Algebra)" required />
        <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center; margin-bottom: 0.6rem;">Request Free Demo Class 🚀</button>
      </form>
      <a href="https://cal.com/akash-saini-12740/15min" target="_blank" rel="noopener" class="btn btn-glass btn-sm" style="width: 100%; justify-content: center;">
        Or Pick a Time Directly on Cal.com ↗
      </a>
    </div>
  `;
  document.body.appendChild(backdrop);
}

async function submitTuitionDemo(e) {
  e.preventDefault();
  const name = document.getElementById('demoStudentName').value.trim();
  const email = document.getElementById('demoStudentEmail').value.trim();
  const subject = document.getElementById('demoSubjectGrade').value.trim();

  fetch('https://script.google.com/macros/s/AKfycbx-lUmYJISZwTFuuh4gx4GqqNUJDf0wEFIL6fRD_gB1q9gSyPxeWbo1Zj2QIH0aKQa2/exec', {
    method: 'POST', mode: 'no-cors',
    body: JSON.stringify({ name, email, message: '[FREE DEMO CLASS] Subject/Grade: ' + subject })
  });
  fetch('https://api.web3forms.com/submit', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      access_key: 'b85a0e4a-e4c4-4c83-84cf-5deb470c88c1',
      name, email,
      subject: 'New Free Demo Class Request: ' + name,
      message: `Student/Parent: ${name} (${email})\nGrade/Subject: ${subject}`
    })
  }).catch(() => {});

  const box = document.getElementById('tuitionDemoBackdrop');
  if (box) box.remove();
  showToast('✓ Demo class request sent! Akash will confirm shortly.');
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('a, button').forEach(el => {
    const label = (el.textContent || '').toLowerCase();
    const href = (el.getAttribute('href') || '').toLowerCase();
    if (label.includes('tuition') || label.includes('tutoring') || href.includes('tutoring') || href.includes('tuition')) {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        openTuitionDemoPopup();
      });
    }
  });
});
