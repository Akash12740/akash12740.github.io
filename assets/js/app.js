const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbx-lUmYJISZwTFuuh4gx4GqqNUJDf0wEFIL6fRD_gB1q9gSyPxeWbo1Zj2QIH0aKQa2/exec';
const WEB3FORMS_KEY = 'b85a0e4a-e4c4-4c83-84cf-5deb470c88c1';

function setActive(btn) {
  if (!btn || !btn.parentElement) return;
  btn.parentElement.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function toggleMobileNav() {
  const nav = document.querySelector('.nav-links');
  if (nav) nav.classList.toggle('mobile-open');
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
  if (!panel) return;
  const open = panel.style.display === 'block';
  panel.style.display = open ? 'none' : 'block';
}

// Blog Loader & Archive
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
  } catch (e) { console.error('Failed to load posts.json', e); }
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

function copyLinkedInPost(id) {
  const p = ALL_POSTS.find(x => x.id === id);
  if (!p) return;
  const postText = `${p.title}\n\n${p.summary}\n\nArchitecture:\n${p.architecture_flow}\n\nKey Takeaway: ${p.takeaway}\n\nRead the full breakdown + BibTeX citation:\nhttps://akash12740.github.io/blog.html#${p.id}\n\n#AI #MachineLearning #LLMs #RAG #AppliedMath #DataScience`;
  navigator.clipboard.writeText(postText);
  showToast('✓ Ready-to-post LinkedIn draft copied to clipboard!');
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
      ${(p.sections || []).map(s => `<h3 style="font-size:1.02rem; margin:1rem 0 0.35rem; font-family:'Fira Code', monospace;">${s.heading}</h3><p style="color:var(--muted); font-size:0.94rem;">${s.body}</p>`).join('')}
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

// Projects & Testimonials
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

// Fake News Classifier Sandbox
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
      Sensational N-Grams: [${sensHits.join(', ') || 'none'}] | Credibility Markers: [${credHits.join(', ') || 'none'}] | Signals: ${capsWords.length + exclamations}
    </div>`;
}

// Matrix & Math Lab
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
  const comp = Math.abs(det) < 1e-6 ? 'Singular' : (det > 0 ? 'GL₂⁺(ℝ) (det > 0)' : 'GL₂⁻(ℝ) (det < 0)');
  readout.innerHTML = `Matrix [[${a}, ${b}], [${c}, ${d}]] | <strong>det(A) = ${det.toFixed(2)}</strong> | tr(A) = ${tr.toFixed(2)}<br>${eigText} | Topology: <span style="color:#00f2fe;">${comp}</span>`;
}

// Gradient Descent Game
let gdX = -3.6, gdSteps = 0;
function resetGD() {
  gdX = -3.6; gdSteps = 0; drawGD();
  const msg = document.getElementById('gdStatus');
  if (msg) msg.textContent = 'Ball placed at x = -3.60. Choose α and step toward the global minimum (x ≈ 1.45)!';
}
function stepGD() {
  const lr = +(document.getElementById('gdLr')?.value || 0.15);
  const grad = Math.pow(gdX, 3) - 0.9 * Math.pow(gdX, 2) - 3 * gdX + 0.8;
  gdX = Math.max(-4.2, Math.min(4.2, gdX - lr * grad));
  gdSteps++;
  drawGD();
  const msg = document.getElementById('gdStatus');
  if (!msg) return;
  if (Math.abs(gdX - 1.45) < 0.18) {
    msg.innerHTML = `<span style="color:#10b981;">✓ Global Minimum Reached at x = ${gdX.toFixed(2)} in ${gdSteps} steps!</span>`;
  } else if (Math.abs(gdX + 1.15) < 0.18 && Math.abs(grad) < 0.15) {
    msg.innerHTML = `<span style="color:#f59e0b;">⚠️ Local Minimum at x = ${gdX.toFixed(2)}! Try a larger α.</span>`;
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
}

// Blitz Game
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
    fb.innerHTML = `<span style="color:#ef4444;">✕ Try again! det = ad - bc, trace = a + d.</span>`;
  }
}

// Monty Hall Simulator
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
    el.innerHTML = `<strong>Stay:</strong> ${mhStayWins}/${mhStayTotal} (${stayPct}%) | <strong style="color:#10b981;">Switch:</strong> ${mhSwitchWins}/${mhSwitchTotal} (${swPct}%)`;
  }
}

function evaluateTrace(choice) {
  const box = document.getElementById('reasoningVerdict');
  if (!box) return;
  box.classList.add('show');
  if (choice === 'A') {
    box.style.borderLeftColor = 'var(--accent-green)';
    box.innerHTML = '<strong>✓ Spot On! Trace A has a topological flaw.</strong> GL_n(ℝ) has 2 components (det > 0 and det < 0), giving 2 × 2 × 2 = 8 components.';
  } else {
    box.style.borderLeftColor = 'var(--accent-red)';
    box.innerHTML = '<strong>✕ Look closer!</strong> Trace B correctly accounts for determinant components.';
  }
}

function updateCosineViz() {
  const canvas = document.getElementById('cosineCanvas');
  const angleSlider = document.getElementById('vecAngle');
  const label = document.getElementById('cosineReadout');
  if (!canvas || !angleSlider) return;
  const deg = +angleSlider.value;
  const sim = Math.cos((deg * Math.PI) / 180);
  const passes = sim >= 0.70;
  label.innerHTML = `Angle θ = <strong>${deg}°</strong> | Similarity = <strong>${sim.toFixed(3)}</strong> | Gate (≥ 0.70): <span style="color:${passes ? '#10b981' : '#ef4444'}">${passes ? 'ACCEPTED' : 'FILTERED'}</span>`;
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
  const key = document.getElementById('web3Key')?.value.trim() || WEB3FORMS_KEY;
  
  sendLeadAsync(name, email, `Portfolio Inquiry from ${name}`, message);
  showToast('✓ Message sent directly to Akash!');
  document.getElementById('contactForm')?.reset();
}

document.addEventListener('DOMContentLoaded', () => {
  loadPosts();
  loadProjects();
  loadTestimonials();
  updateCosineViz();
  updateMatrixLab();
  resetGD();
  nextBlitzQuestion();

  const typedEl = document.getElementById('typed-text');
  if (typedEl) {
    const roles = ["AI & Machine Learning Engineer", "LLM Evaluation & RAG Specialist", "BITS Pilani Mathematics Graduate", "1-on-1 Online Tutor"];
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

function runCmd(key) {
  const body = document.getElementById('terminal-body');
  if (!body) return;
  const map = {
    stack: { c: "./stack.sh", o: '"frameworks": ["PyTorch", "TensorFlow", "HuggingFace", "FAISS"],<br>"infra": ["Docker", "Kubernetes", "GitHub Actions"]' },
    llm: { c: "./llm_eval.sh", o: "[PASS] Gemini instruction tuning & safety audit<br>[PASS] Atomic step verification & hallucination gates" },
    impact: { c: "./metrics.sh", o: "• Swecha Voice: 6,000x training DB scale<br>• Fake News NLP: 95.0% accuracy" },
    contact: { c: "./book_call.sh", o: "Cal.com: cal.com/akash-saini-12740/15min" }
  };
  const item = map[key];
  if (item) body.innerHTML = `<div><span style="color:#10b981;">➜</span> ${item.c}</div><div class="cmd-output">${item.o}</div>`;
}

// Tutoring Fee Calculator
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
  const gradeEl = document.getElementById('tutGrade');
  if (!gradeEl) return;
  const info = TUTOR_RATES[gradeEl.value] || TUTOR_RATES.mid;
  const rateEl = document.getElementById('tutRateDisplay');
  const packEl = document.getElementById('tutPackDisplay');
  if (!rateEl || !packEl) return;
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
  const contactSec = document.getElementById('book-trial');
  if (!gradeEl || !msgBox) return;
  const info = TUTOR_RATES[gradeEl.value];
  const subs = [];
  if (document.getElementById('subMath')?.checked) subs.push('Mathematics');
  if (document.getElementById('subSci')?.checked) subs.push('Science');
  if (document.getElementById('subEng')?.checked) subs.push('English');
  const rateText = document.getElementById('tutRateDisplay')?.textContent || '';
  msgBox.value = `Hi Akash,\n\nI would like to book a Free 20-Min Trial Class for 1-on-1 Online Tutoring:\n• Student Grade: ${info.label}\n• Subjects: ${subs.length ? subs.join(', ') : 'Mathematics'}\n• Estimated Rate: ${rateText}\n• Country / School Board & Preferred Days:\n`;
  if (contactSec) contactSec.scrollIntoView({ behavior: 'smooth' });
  msgBox.focus();
  showToast('✓ Trial class details pre-filled in inquiry form!');
}

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
    me: '<strong>🇦🇪 UAE & Middle East Slots:</strong><br/>• Weekdays: <strong>3:30 PM – 9:00 PM GST (Dubai)</strong><br/>• Weekends: <strong>10:00 AM – 7:00 PM GST</strong>',
    in: '<strong>🇮🇳 India After-School Slots (IST):</strong><br/>• Weekdays (Mon–Fri): <strong>4:00 PM – 9:30 PM IST</strong><br/>• Weekends: <strong>10:00 AM – 7:00 PM IST</strong>',
    apac: '<strong>🇸🇬 Singapore & Australia Slots:</strong><br/>• Weekdays: <strong>3:30 PM – 8:30 PM SGT</strong> (5:30 PM – 10:30 PM AEST)<br/>• Weekends: <strong>10:00 AM – 6:00 PM SGT</strong>'
  };
  box.innerHTML = slots[region] || slots.us;
}
