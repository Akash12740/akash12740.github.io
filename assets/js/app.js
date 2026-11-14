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