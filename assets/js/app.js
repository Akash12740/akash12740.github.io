const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbx-lUmYJISZwTFuuh4gx4GqqNUJDf0wEFIL6fRD_gB1q9gSyPxeWbo1Zj2QIH0aKQa2/exec';
const WEB3FORMS_KEY = 'b85a0e4a-e4c4-4c83-84cf-5deb470c88c1';

function setActive(btn) {
  if (!btn || !btn.parentElement) return;
  btn.parentElement.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function toggleMobileNav() {
  document.querySelector('.nav-links')?.classList.toggle('mobile-open');
}

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

function toggleExecBrief() {
  const panel = document.getElementById('execBriefPanel');
  if (panel) panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
}

function sendLeadAsync(name, email, subject, message) {
  fetch(WEBHOOK_URL, {
    method: 'POST', mode: 'no-cors',
    body: JSON.stringify({ name, email, message })
  }).catch(() => {});
  fetch('https://api.web3forms.com/submit', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ access_key: WEB3FORMS_KEY, name, email, subject, message })
  }).catch(() => {});
}

// Blog Loader & Filter Tabs
let ALL_POSTS = [];
async function loadPosts() {
  const homeContainer = document.getElementById('featured-blogs-grid');
  const fullContainer = document.getElementById('all-blogs-list');
  if (!homeContainer && !fullContainer) return;
  try {
    const res = await fetch('data/posts.json?v=' + Date.now());
    ALL_POSTS = await res.json();

    if (homeContainer) {
      homeContainer.innerHTML = ALL_POSTS.slice(0, 3).map((p, idx) => `
        <div class="card" style="display:flex; flex-direction:column; justify-content:space-between;">
          <div>
            <div class="item-header">
              <span class="section-tag" style="margin:0;">${p.topic_label}</span>
              <span class="item-date">${p.date} • ${p.read_time}</span>
            </div>
            <h3 style="font-size:1.1rem; margin:0.55rem 0;">${p.title}</h3>
            <p style="color:var(--muted); font-size:0.9rem; margin-bottom:1rem;">${p.summary}</p>
          </div>
          <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
            <button type="button" class="btn btn-primary btn-sm" onclick="openPostModal(${idx})">Read Article →</button>
            <button type="button" class="btn btn-glass btn-sm" onclick="copyBibtex(${idx})">Cite (BibTeX)</button>
          </div>
        </div>
      `).join('');
    }
    if (fullContainer) renderBlogArchive('all', '');
  } catch (e) { console.error(e); }
}

function copyBibtex(idx) {
  const p = ALL_POSTS[idx];
  if (!p) return;
  const year = (p.date || '2026').slice(0, 4);
  const bib = `@article{saini${year}_${idx + 1},\n  author = {Saini, Akash},\n  title = {${p.title}},\n  journal = {Akash Saini Engineering Notes},\n  year = {${year}},\n  url = {https://akash12740.github.io/blog.html#${p.id}}\n}`;
  navigator.clipboard.writeText(bib);
  showToast('✓ Copied BibTeX citation!');
}

function sharePostLinkedIn(id) {
  const url = encodeURIComponent(`https://akash12740.github.io/blog.html#${id}`);
  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
}

function copyLinkedInPost(idx) {
  const p = ALL_POSTS[idx];
  if (!p) return;
  const text = `${p.title}\n\n${p.summary}\n\nArchitecture:\n${p.architecture_flow}\n\nKey Takeaway: ${p.takeaway}\n\nRead more: https://akash12740.github.io/blog.html#${p.id}`;
  navigator.clipboard.writeText(text);
  showToast('✓ LinkedIn post draft copied!');
}

function renderBlogArchive(topic, query) {
  const fullContainer = document.getElementById('all-blogs-list');
  const tocContainer = document.getElementById('blog-toc');
  if (!fullContainer) return;
  const q = (query || '').toLowerCase();
  const filtered = ALL_POSTS.map((p, idx) => ({ ...p, _idx: idx })).filter(p => {
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
      ${(p.sections || []).map(s => `<h3 style="font-size:1.02rem; margin:1rem 0 0.35rem; font-family:'Fira Code', monospace;">${s.heading}</h3><p style="color:var(--muted); font-size:0.94rem;">${s.body}</p>`).join('')}
      <div class="verdict-box show" style="margin-top:1rem;"><strong>Key Takeaway:</strong> ${p.takeaway}</div>
      <div style="display:flex; gap:0.6rem; flex-wrap:wrap; margin-top:1.1rem; padding-top:0.9rem; border-top:1px solid var(--border);">
        <button type="button" class="btn btn-glass btn-sm" onclick="copyBibtex(${p._idx})">📋 Copy BibTeX</button>
        <button type="button" class="btn btn-primary btn-sm" onclick="sharePostLinkedIn('${p.id}')">Share on LinkedIn ↗</button>
        <button type="button" class="btn btn-glass btn-sm" onclick="copyLinkedInPost(${p._idx})">✍️ Copy LinkedIn Post</button>
      </div>
    </article>
  `).join('') || '<p style="color:var(--muted);">No articles match that filter.</p>';
}

function openPostModal(idx) {
  const p = ALL_POSTS[idx];
  const modal = document.getElementById('projectModal');
  if (!p || !modal) return;
  document.getElementById('modalTag').textContent = `${p.topic_label} • ${p.date}`;
  document.getElementById('modalTitle').textContent = p.title;
  document.getElementById('modalArch').textContent = p.architecture_flow;
  document.getElementById('modalDesc').innerHTML =
    (p.sections || []).map(s => `<p style="margin-bottom:0.8rem;"><strong>${s.heading}:</strong> ${s.body}</p>`).join('') +
    `<p style="color:var(--accent-green); margin-bottom:1rem;"><strong>Takeaway:</strong> ${p.takeaway}</p>`;
  const link = document.getElementById('modalRepoLink');
  if (link) { link.textContent = 'Open Full Blog Archive →'; link.href = 'blog.html'; }
  modal.classList.add('open');
}

// Projects & Filter Tabs
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
          <p style="color:var(--muted); font-size:0.92rem; margin:0.75rem 0 1rem;">${pr.summary}</p>
          <div class="tags">${pr.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
        </div>
        <div style="display:flex; gap:0.6rem; margin-top:1.2rem; padding-top:0.9rem; border-top:1px solid var(--border);">
          <a href="${pr.repo}" target="_blank" class="btn btn-primary btn-sm">View Code ↗</a>
          <button type="button" class="btn btn-glass btn-sm" onclick="openProjectModal('${pr.id}')">Architecture →</button>
        </div>
      </div>
    `).join('');
  } catch (e) { console.error(e); }
}

function filterItems(cardClass, category, btn) {
  setActive(btn);
  document.querySelectorAll('.' + cardClass).forEach(card => {
    const cat = card.getAttribute('data-cat');
    card.style.display = (category === 'all' || cat === category) ? '' : 'none';
  });
}

function openProjectModal(id) {
  const pr = ALL_PROJECTS.find(p => p.id === id);
  const modal = document.getElementById('projectModal');
  if (!pr || !modal) return;
  document.getElementById('modalTag').textContent = pr.badge;
  document.getElementById('modalTitle').textContent = pr.title;
  document.getElementById('modalArch').textContent = pr.arch;
  document.getElementById('modalDesc').textContent = pr.details;
  const link = document.getElementById('modalRepoLink');
  if (link) { link.textContent = 'Open GitHub Repository ↗'; link.href = pr.repo; }
  modal.classList.add('open');
}

function closeModalBtn() { document.getElementById('projectModal')?.classList.remove('open'); }
function closeModal(e) { if (e.target.id === 'projectModal') closeModalBtn(); }

async function loadTestimonials() {
  const wrap = document.getElementById('testimonials-grid');
  if (!wrap) return;
  try {
    const res = await fetch('data/testimonials.json');
    const items = await res.json();
    wrap.innerHTML = items.map(t => `
      <div class="card">
        <p style="font-style:italic; color:var(--text); font-size:0.93rem; margin-bottom:0.9rem;">"${t.quote}"</p>
        <div style="font-weight:700; font-size:0.88rem; color:var(--accent);">${t.author}</div>
        <div style="font-size:0.78rem; color:var(--muted); font-family:'Fira Code', monospace;">${t.role}</div>
      </div>
    `).join('');
  } catch (e) { console.error(e); }
}

// Interactive Visualizers & Labs
function updateMatrixLab() {
  const a = +(document.getElementById('matA')?.value || 2);
  const b = +(document.getElementById('matB')?.value || 1);
  const c = +(document.getElementById('matC')?.value || 0);
  const d = +(document.getElementById('matD')?.value || 1.5);
  const readout = document.getElementById('matrixReadout');
  const canvas = document.getElementById('matrixCanvas');
  if (!readout || !canvas) return;
  const det = a * d - b * c, tr = a + d, disc = tr * tr - 4 * det;
  const eigText = disc >= 0
    ? `Real Eigenvalues: λ₁ = ${((tr + Math.sqrt(disc)) / 2).toFixed(2)}, λ₂ = ${((tr - Math.sqrt(disc)) / 2).toFixed(2)}`
    : `Complex Eigenvalues: ${(tr / 2).toFixed(2)} ± ${(Math.sqrt(-disc) / 2).toFixed(2)}i`;
  const comp = Math.abs(det) < 1e-6 ? 'Singular' : (det > 0 ? 'GL₂⁺(ℝ) (det > 0)' : 'GL₂⁻(ℝ) (det < 0)');
  readout.innerHTML = `Matrix [[${a}, ${b}], [${c}, ${d}]] | <strong>det(A) = ${det.toFixed(2)}</strong> | tr(A) = ${tr.toFixed(2)}<br>${eigText} | <span style="color:var(--accent);">${comp}</span>`;
  const ctx = canvas.getContext('2d'), w = canvas.width = canvas.offsetWidth, h = canvas.height = 210;
  ctx.clearRect(0, 0, w, h);
  const cx = w / 2, cy = h / 2, s = 32;
  ctx.strokeStyle = 'rgba(148,163,184,0.25)'; ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.moveTo(cx, 0); ctx.lineTo(cx, h); ctx.stroke();
  ctx.strokeStyle = '#64748b'; ctx.setLineDash([4, 4]); ctx.strokeRect(cx, cy - s, s, s); ctx.setLineDash([]);
  const pts = [[0, 0], [a, c], [a + b, c + d], [b, d]];
  ctx.fillStyle = det >= 0 ? 'rgba(56,189,248,0.22)' : 'rgba(168,85,247,0.25)';
  ctx.strokeStyle = det >= 0 ? '#38bdf8' : '#a855f7'; ctx.lineWidth = 2;
  ctx.beginPath();
  pts.forEach(([px, py], i) => { const sx = cx + px * s, sy = cy - py * s; i === 0 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy); });
  ctx.closePath(); ctx.fill(); ctx.stroke();
}

function updateCosineViz() {
  const canvas = document.getElementById('cosineCanvas'), slider = document.getElementById('vecAngle'), label = document.getElementById('cosineReadout');
  if (!canvas || !slider || !label) return;
  const deg = +slider.value, sim = Math.cos((deg * Math.PI) / 180), passes = sim >= 0.70;
  label.innerHTML = `Angle θ = <strong>${deg}°</strong> | Cosine Similarity = <strong>${sim.toFixed(3)}</strong> | Gate (≥ 0.70): <span style="color:${passes ? '#10b981' : '#ef4444'}">${passes ? 'ACCEPTED' : 'FILTERED'}</span>`;
  const ctx = canvas.getContext('2d'), w = canvas.width = canvas.offsetWidth, h = canvas.height = 190;
  ctx.clearRect(0, 0, w, h);
  const ox = 60, oy = h - 30, len = 120;
  ctx.strokeStyle = 'rgba(148,163,184,0.3)'; ctx.beginPath(); ctx.moveTo(ox, 15); ctx.lineTo(ox, oy); ctx.lineTo(w - 25, oy); ctx.stroke();
  const qRad = (15 * Math.PI) / 180, dRad = ((15 + deg) * Math.PI) / 180;
  drawArrow(ctx, ox, oy, ox + len * Math.cos(qRad), oy - len * Math.sin(qRad), '#38bdf8', 'Query q');
  drawArrow(ctx, ox, oy, ox + len * Math.cos(dRad), oy - len * Math.sin(dRad), passes ? '#10b981' : '#ef4444', 'Chunk d');
}
function drawArrow(ctx, x1, y1, x2, y2, color, text) {
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.beginPath(); ctx.arc(x2, y2, 4, 0, Math.PI * 2); ctx.fill();
  ctx.font = '12px Fira Code, monospace'; ctx.fillText(text, x2 + 8, y2 + 4);
}

let gdX = -3.6, gdSteps = 0;
function resetGD() {
  gdX = -3.6; gdSteps = 0; drawGD();
  const msg = document.getElementById('gdStatus');
  if (msg) msg.textContent = 'Ball placed at x = -3.60. Step toward the global minimum (x ≈ 1.45)!';
}
function stepGD() {
  const lr = +(document.getElementById('gdLr')?.value || 0.15);
  const grad = Math.pow(gdX, 3) - 0.9 * Math.pow(gdX, 2) - 3 * gdX + 0.8;
  gdX = Math.max(-4.2, Math.min(4.2, gdX - lr * grad));
  gdSteps++; drawGD();
  const msg = document.getElementById('gdStatus');
  if (!msg) return;
  if (Math.abs(gdX - 1.45) < 0.18) msg.innerHTML = `<span style="color:#10b981;">✓ Global Minimum Reached at x = ${gdX.toFixed(2)} in ${gdSteps} steps!</span>`;
  else if (Math.abs(gdX + 1.15) < 0.18 && Math.abs(grad) < 0.15) msg.innerHTML = `<span style="color:#f59e0b;">⚠️ Local Minimum at x = ${gdX.toFixed(2)}! Increase α.</span>`;
  else msg.textContent = `Step ${gdSteps}: x = ${gdX.toFixed(2)} | Gradient f'(x) = ${grad.toFixed(2)}`;
}
function drawGD() {
  const canvas = document.getElementById('gdCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d'), w = canvas.width = canvas.offsetWidth, h = canvas.height = 175;
  ctx.clearRect(0, 0, w, h);
  const f = x => 0.25 * Math.pow(x, 4) - 0.3 * Math.pow(x, 3) - 1.5 * Math.pow(x, 2) + 0.8 * x + 4.5;
  const toSx = x => ((x + 4.2) / 8.4) * (w - 30) + 15;
  const toSy = y => h - 20 - (y / 14) * (h - 35);
  ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2; ctx.beginPath();
  for (let x = -4.0; x <= 4.0; x += 0.08) { x === -4.0 ? ctx.moveTo(toSx(x), toSy(f(x))) : ctx.lineTo(toSx(x), toSy(f(x))); }
  ctx.stroke();
  ctx.fillStyle = '#a855f7'; ctx.beginPath(); ctx.arc(toSx(gdX), toSy(f(gdX)), 7, 0, Math.PI * 2); ctx.fill();
}

let blitzScore = 0, blitzAns = 0;
function nextBlitzQuestion() {
  const a = Math.floor(Math.random() * 7) - 3, b = Math.floor(Math.random() * 7) - 3;
  const c = Math.floor(Math.random() * 7) - 3, d = Math.floor(Math.random() * 7) - 3;
  const askDet = Math.random() > 0.4;
  blitzAns = askDet ? (a * d - b * c) : (a + d);
  const qEl = document.getElementById('blitzPrompt');
  if (qEl) qEl.innerHTML = `Score: <strong>${blitzScore}</strong> | Compute <strong>${askDet ? 'det(A)' : 'trace(A)'}</strong> for <code>[[${a}, ${b}], [${c}, ${d}]]</code>:`;
}
function checkBlitz() {
  const inp = document.getElementById('blitzInput'), fb = document.getElementById('blitzFeedback');
  if (!inp || !fb) return;
  if (parseInt(inp.value, 10) === blitzAns) {
    blitzScore++; fb.innerHTML = `<span style="color:#10b981;">✓ Correct! (${blitzAns})</span>`; inp.value = ''; nextBlitzQuestion();
  } else {
    fb.innerHTML = `<span style="color:#ef4444;">✕ Try again! det = ad - bc, trace = a + d.</span>`;
  }
}

let mhStayWins = 0, mhStayTotal = 0, mhSwitchWins = 0, mhSwitchTotal = 0;
function playMontyHall(trials, doSwitch) {
  for (let i = 0; i < trials; i++) {
    const won = doSwitch ? (Math.floor(Math.random() * 3) !== Math.floor(Math.random() * 3)) : (Math.floor(Math.random() * 3) === Math.floor(Math.random() * 3));
    if (doSwitch) { mhSwitchTotal++; if (won) mhSwitchWins++; } else { mhStayTotal++; if (won) mhStayWins++; }
  }
  const el = document.getElementById('mhStats');
  if (el) {
    const s1 = mhStayTotal ? ((mhStayWins / mhStayTotal) * 100).toFixed(1) : '0.0';
    const s2 = mhSwitchTotal ? ((mhSwitchWins / mhSwitchTotal) * 100).toFixed(1) : '0.0';
    el.innerHTML = `<strong>Stay:</strong> ${mhStayWins}/${mhStayTotal} (${s1}%) | <strong style="color:#10b981;">Switch:</strong> ${mhSwitchWins}/${mhSwitchTotal} (${s2}%)`;
  }
}

// Tutoring Calculators & Timezone Tabs
let TUT_CURRENCY = 'USD';
const TUTOR_RATES = {
  elem: { label: 'Elementary School (Grades 1–5)', usd: [15, 20], inr: [600, 850] },
  mid: { label: 'Middle School (Grades 6–8)', usd: [18, 24], inr: [750, 1000] },
  high: { label: 'High School (Grades 9–10)', usd: [22, 28], inr: [900, 1300] },
  senior: { label: 'Senior Secondary / Exam Prep (Grades 11–12 / IB / SAT)', usd: [25, 35], inr: [1100, 1600] }
};
function setTutorCurrency(curr) {
  TUT_CURRENCY = curr;
  document.getElementById('tutUsdBtn')?.classList.toggle('active', curr === 'USD');
  document.getElementById('tutInrBtn')?.classList.toggle('active', curr === 'INR');
  updateTutorEstimate();
}
function updateTutorEstimate() {
  const gradeEl = document.getElementById('tutGrade'), rateEl = document.getElementById('tutRateDisplay'), packEl = document.getElementById('tutPackDisplay');
  if (!gradeEl || !rateEl || !packEl) return;
  const info = TUTOR_RATES[gradeEl.value] || TUTOR_RATES.mid;
  if (TUT_CURRENCY === 'USD') {
    rateEl.textContent = `$${info.usd[0]} – $${info.usd[1]} / hour`;
    packEl.textContent = `Monthly 8-Session Pack: $${Math.round(info.usd[0] * 7.2)} – $${Math.round(info.usd[1] * 7.2)} (Save 10%)`;
  } else {
    rateEl.textContent = `₹${info.inr[0].toLocaleString('en-IN')} – ₹${info.inr[1].toLocaleString('en-IN')} / hour`;
    packEl.textContent = `Monthly 8-Session Pack: ₹${Math.round(info.inr[0] * 7.2).toLocaleString('en-IN')} – ₹${Math.round(info.inr[1] * 7.2).toLocaleString('en-IN')} (Save 10%)`;
  }
}
function showTutorTimezone(region, btn) {
  if (btn) setActive(btn);
  const box = document.getElementById('tzDisplay');
  if (!box) return;
  const slots = {
    us: '<strong>🇺🇸 US & Canada After-School Slots:</strong><br/>• Weekdays (Mon–Fri): <strong>4:30 PM – 9:30 PM EST</strong> (1:30 PM – 6:30 PM PST)<br/>• Weekends (Sat–Sun): <strong>8:00 AM – 1:00 PM EST</strong> & <strong>6:00 PM – 9:30 PM EST</strong>',
    uk: '<strong>🇬🇧 UK & Europe After-School Slots:</strong><br/>• Weekdays (Mon–Fri): <strong>3:30 PM – 8:30 PM GMT</strong> (4:30 PM – 9:30 PM CET)<br/>• Weekends (Sat–Sun): <strong>9:00 AM – 6:00 PM GMT</strong>',
    me: '<strong>🇦🇪 UAE, Saudi Arabia & Middle East Slots:</strong><br/>• Weekdays: <strong>3:30 PM – 9:00 PM GST (Dubai)</strong> • Weekends: <strong>10:00 AM – 7:00 PM GST</strong>',
    in: '<strong>🇮🇳 India After-School Slots (IST):</strong><br/>• Weekdays (Mon–Fri): <strong>4:00 PM – 9:30 PM IST</strong> • Weekends: <strong>10:00 AM – 7:00 PM IST</strong>',
    apac: '<strong>🇸🇬 Singapore, Hong Kong & Australia Slots:</strong><br/>• Weekdays: <strong>3:30 PM – 8:30 PM SGT</strong> (5:30 PM – 10:30 PM AEST) • Weekends: <strong>10:00 AM – 6:00 PM SGT</strong>'
  };
  box.innerHTML = slots[region] || slots.us;
}
function applyTutorToContact() {
  const gradeEl = document.getElementById('tutGrade'), msgBox = document.getElementById('senderMsg');
  if (!gradeEl || !msgBox) return;
  const info = TUTOR_RATES[gradeEl.value] || TUTOR_RATES.mid;
  const subs = [];
  if (document.getElementById('subMath')?.checked) subs.push('Mathematics');
  if (document.getElementById('subSci')?.checked) subs.push('Science');
  if (document.getElementById('subEng')?.checked) subs.push('English');
  const rateText = document.getElementById('tutRateDisplay')?.textContent || '';
  msgBox.value = `Hi Akash,\n\nI would like to book a Free 20-Min Demo Class for 1-on-1 Tuition:\n• Grade: ${info.label}\n• Subjects: ${subs.join(', ') || 'Mathematics'}\n• Estimated Rate: ${rateText}\n• Country / School Board & Preferred Days:\n`;
  document.getElementById('book-trial')?.scrollIntoView({ behavior: 'smooth' });
  msgBox.focus();
}

// Instant Tuition Demo Popup (Triggered only by button click, never blocks navbar links)
function openTuitionDemoPopup() {
  if (document.getElementById('tuitionDemoBackdrop')) return;
  const backdrop = document.createElement('div');
  backdrop.id = 'tuitionDemoBackdrop';
  backdrop.className = 'modal-backdrop open';
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) backdrop.remove(); });
  backdrop.innerHTML = `
    <div class="modal-box" style="max-width: 450px; padding: 1.75rem;">
      <button type="button" class="modal-close" aria-label="Close" onclick="document.getElementById('tuitionDemoBackdrop')?.remove()">✕</button>
      <span class="section-tag">1:1_LIVE_TUITION • BITS_PILANI_ALUMNUS</span>
      <h3 style="font-size: 1.3rem; margin: 0.35rem 0 0.5rem;">Book Your Free 1:1 Demo Class 🎓</h3>
      <p style="color: var(--muted); font-size: 0.87rem; margin-bottom: 1rem;">
        Personalized 1-on-1 coaching in <strong>Mathematics, Science &amp; English</strong> (Grades 1–12 • US, UK, IB, CBSE, ICSE).
      </p>
      <form id="tuitionDemoForm">
        <input type="text" id="demoStudentName" class="pg-input" placeholder="Student / Parent Name" required />
        <input type="email" id="demoStudentEmail" class="pg-input" placeholder="Email Address" required />
        <input type="text" id="demoSubjectGrade" class="pg-input" placeholder="Grade & Subject (e.g., Grade 10 Math, IB Physics)" required />
        <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center; margin-bottom: 0.55rem;">Request Free Demo Class 🚀</button>
      </form>
      <a href="https://cal.com/akash-saini-12740/15min" target="_blank" rel="noopener" class="btn btn-glass btn-sm" style="width: 100%; justify-content: center;">
        Or Pick a Time Directly on Cal.com ↗
      </a>
    </div>
  `;
  document.body.appendChild(backdrop);

  document.getElementById('tuitionDemoForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('demoStudentName').value.trim();
    const email = document.getElementById('demoStudentEmail').value.trim();
    const subject = document.getElementById('demoSubjectGrade').value.trim();
    sendLeadAsync(name, email, `New Free Demo Class Request: ${name}`, `[FREE DEMO CLASS] Student: ${name} (${email}) | Subject: ${subject}`);
    backdrop.remove();
    showToast('✓ Demo class request sent! Akash will confirm shortly.');
  });
}

async function handleContactSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('senderName').value.trim();
  const email = document.getElementById('senderEmail').value.trim();
  const message = document.getElementById('senderMsg').value.trim();
  sendLeadAsync(name, email, `Website Inquiry from ${name}`, message);
  showToast('✓ Message sent directly to Akash!');
  document.getElementById('contactForm')?.reset();
}

function runCmd(key) {
  const body = document.getElementById('terminal-body');
  if (!body) return;
  const map = {
    stack: { c: './stack.sh', o: '"frameworks": ["PyTorch", "TensorFlow", "HuggingFace", "FAISS"],<br>"infra": ["Docker", "Kubernetes", "GitHub Actions", "Linux"]' },
    llm: { c: './llm_eval.sh', o: '[PASS] Gemini instruction tuning & safety audit<br>[PASS] Atomic step verification & hallucination gates' },
    impact: { c: './metrics.sh', o: '• Swecha Voice: 6,000x training DB scale<br>• Fake News NLP: 95.0% accuracy | SARIMA: 60% RMSE drop' },
    contact: { c: './book_call.sh', o: 'Cal.com: cal.com/akash-saini-12740/15min | Topmate: topmate.io/akash12740' }
  };
  const item = map[key];
  if (item) body.innerHTML = `<div><span style="color:#10b981;">➜</span> ${item.c}</div><div class="cmd-output">${item.o}</div>`;
}

document.addEventListener('DOMContentLoaded', () => {
  loadPosts();
  loadProjects();
  loadTestimonials();
  updateCosineViz();
  updateMatrixLab();
  resetGD();
  nextBlitzQuestion();
  updateTutorEstimate();

  const typedEl = document.getElementById('typed-text');
  if (typedEl) {
    const roles = ['AI & Machine Learning Engineer', 'LLM Evaluation & RAG Specialist', 'BITS Pilani Mathematics Graduate', '1-on-1 Online Maths, Science & English Tutor'];
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
});
