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

// Dynamic JSON Loader for Featured Blogs (index.html) & Full Blog Archive (blog.html)
let ALL_POSTS = [];
async function loadPosts() {
  const homeContainer = document.getElementById('featured-blogs-grid');
  const fullContainer = document.getElementById('all-blogs-list');
  if (!homeContainer && !fullContainer) return;

  try {
    const res = await fetch('data/posts.json?v=' + Date.now());
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
            <a href="blog.html" class="btn btn-glass btn-sm">All Posts (${ALL_POSTS.length})</a>
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

function renderBlogArchive(topic, query) {
  const fullContainer = document.getElementById('all-blogs-list');
  if (!fullContainer) return;
  const q = (query || '').toLowerCase();
  const filtered = ALL_POSTS.filter(p => {
    const matchTopic = topic === 'all' || p.topic === topic;
    const matchQuery = !q || p.title.toLowerCase().includes(q) || p.summary.toLowerCase().includes(q);
    return matchTopic && matchQuery;
  });

  fullContainer.innerHTML = filtered.map(p => `
    <article class="card" style="margin-bottom:1.75rem;">
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
    `<p style="color:var(--accent-green);"><strong>Takeaway:</strong> ${p.takeaway}</p>`;
  const link = document.getElementById('modalRepoLink');
  link.textContent = 'Open Full Blog Archive →';
  link.href = 'blog.html';
  document.getElementById('projectModal').classList.add('open');
}

// Dynamic Projects Loader
let ALL_PROJECTS = [];
async function loadProjects() {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;
  try {
    const res = await fetch('data/projects.json?v=' + Date.now());
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

// Dynamic Testimonials Loader
async function loadTestimonials() {
  const wrap = document.getElementById('testimonials-grid');
  if (!wrap) return;
  try {
    const res = await fetch('data/testimonials.json?v=' + Date.now());
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

// Interactive "Spot the AI Reasoning Flaw" Widget
function evaluateTrace(choice) {
  const box = document.getElementById('reasoningVerdict');
  if (!box) return;
  box.classList.add('show');
  if (choice === 'A') {
    box.style.borderLeftColor = 'var(--accent-green)';
    box.innerHTML = '<strong>✓ Spot On! Trace A contains a subtle topological fallacy.</strong> For $m(t) = t^3 - t$, the eigenvalues $\\{0, 1, -1\\}$ partition $\\mathbb{R}^4$ into eigenspaces of dimensions $(2, 1, 1)$, so $G \\cong GL_2(\\mathbb{R}) \\times GL_1(\\mathbb{R}) \\times GL_1(\\mathbb{R})$. Trace A falsely assumes $GL_n(\\mathbb{R})$ is path-connected (1 component), ignoring $\\det(X) > 0$ vs. $\\det(X) < 0$ (2 components each $\\Rightarrow 2^3 = 8$).';
  } else {
    box.style.borderLeftColor = 'var(--accent-red)';
    box.innerHTML = '<strong>✕ Look closer at Trace A!</strong> Trace B correctly decomposes $G \\cong GL_2(\\mathbb{R}) \\times GL_1(\\mathbb{R}) \\times GL_1(\\mathbb{R})$ and multiplies the 2 determinant components per factor ($2 \\times 2 \\times 2 = 8$). Trace A forgets that $GL_n(\\mathbb{R})$ has two disconnected components ($\\det > 0$ and $\\det < 0$).';
  }
}

// Interactive 2D Cosine Similarity Explorer
function updateCosineViz() {
  const canvas = document.getElementById('cosineCanvas');
  const angleSlider = document.getElementById('vecAngle');
  const label = document.getElementById('cosineReadout');
  if (!canvas || !angleSlider) return;

  const deg = +angleSlider.value;
  const rad = (deg * Math.PI) / 180;
  const sim = Math.cos(rad);
  const passes = sim >= 0.70;

  label.innerHTML = `Angle θ = <strong>${deg}°</strong> | Cosine Similarity = <strong>${sim.toFixed(3)}</strong> | Gate (≥ 0.70): <span style="color:${passes ? '#10b981' : '#ef4444'}">${passes ? 'ACCEPTED (Cited)' : 'FILTERED OUT (Blocked)'}</span>`;

  const ctx = canvas.getContext('2d');
  const w = canvas.width = canvas.offsetWidth;
  const h = canvas.height = 220;
  ctx.clearRect(0, 0, w, h);

  const ox = 70, oy = h - 40, len = 135;
  // Axes
  ctx.strokeStyle = 'rgba(148,163,184,0.3)';
  ctx.beginPath(); ctx.moveTo(ox, 20); ctx.lineTo(ox, oy); ctx.lineTo(w - 30, oy); ctx.stroke();

  // Query Vector (fixed at 15 deg)
  const qRad = (15 * Math.PI) / 180;
  drawArrow(ctx, ox, oy, ox + len * Math.cos(qRad), oy - len * Math.sin(qRad), '#00f2fe', 'Query Vector q');

  // Document Chunk Vector (15 + deg)
  const dRad = ((15 + deg) * Math.PI) / 180;
  drawArrow(ctx, ox, oy, ox + len * Math.cos(dRad), oy - len * Math.sin(dRad), passes ? '#10b981' : '#ef4444', 'Chunk Vector d');
}

function drawArrow(ctx, x1, y1, x2, y2, color, text) {
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.beginPath(); ctx.arc(x2, y2, 4, 0, Math.PI * 2); ctx.fill();
  ctx.font = '12px Fira Code, monospace';
  ctx.fillText(text, x2 + 8, y2 + 4);
}

// Interactive Time-Series Decomposition Visualizer
function updateTsViz() {
  const canvas = document.getElementById('tsDecompCanvas');
  const seasonSlider = document.getElementById('seasonWeight');
  const readout = document.getElementById('tsReadout');
  if (!canvas || !seasonSlider) return;

  const sWeight = +seasonSlider.value / 100;
  readout.innerHTML = `Seasonal Amplitude = <strong>${Math.round(sWeight * 100)}%</strong> | Y_t = Trend + ${sWeight.toFixed(2)}·Seasonality + Noise`;

  const ctx = canvas.getContext('2d');
  const w = canvas.width = canvas.offsetWidth;
  const h = canvas.height = 220;
  ctx.clearRect(0, 0, w, h);

  ctx.strokeStyle = '#00f2fe';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 0; x < w - 20; x++) {
    const t = x / 28;
    const trend = 0.22 * x;
    const seasonal = sWeight * 42 * Math.sin(t * Math.PI);
    const noise = 5 * Math.sin(t * 7.3);
    const y = (h - 35) - (trend + seasonal + noise);
    if (x === 0) ctx.moveTo(x + 10, y);
    else ctx.lineTo(x + 10, y);
  }
  ctx.stroke();
}

// Category Filter
function filterItems(cardClass, category, btn) {
  btn.parentElement.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.' + cardClass).forEach(card => {
    const cat = card.getAttribute('data-cat');
    card.style.display = (category === 'all' || cat === category) ? '' : 'none';
  });
}

// Web3Forms Contact Submit
async function handleContactSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('senderName').value.trim();
  const email = document.getElementById('senderEmail').value.trim();
  const message = document.getElementById('senderMsg').value.trim();
  const key = document.getElementById('web3Key').value.trim();

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

// Initialize Everything on Load
document.addEventListener('DOMContentLoaded', () => {
  loadPosts();
  loadProjects();
  loadTestimonials();
  updateCosineViz();
  updateTsViz();

  // Typing animation
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

  // Chart.js Benchmarks
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

// Terminal Commands
function runCmd(key) {
  const body = document.getElementById('terminal-body');
  const map = {
    stack: { c: "cat tech_stack.json", o: `"frameworks": ["PyTorch", "TensorFlow", "HuggingFace", "FAISS"],<br>"infra": ["Docker", "Kubernetes", "GitHub Actions", "Linux"]` },
    llm: { c: "python3 eval_trace.py", o: `[PASS] Gemini instruction tuning & safety audit<br>[PASS] Atomic step verification & hallucination gates` },
    impact: { c: "./metrics.sh", o: `• Swecha Voice: 6,000x training DB scale<br>• Fake News NLP: 95.0% accuracy | SARIMA: 60% RMSE drop` },
    contact: { c: "echo $LINKS", o: `Topmate: topmate.io/akash12740 | Gumroad: akashsaini12740.gumroad.com` }
  };
  const item = map[key];
  body.innerHTML = `<div><span style="color:#10b981;">➜</span> ${item.c}</div><div class="cmd-output">${item.o}</div>`;
}
