// ===========================
//  PsychoLab — App Shell
// ===========================

// ---- SESSION DATA ----
let sessionData = { plutchik: null, mak: null, schwartz: null };

// ---- NAVIGATION ----
function navigateTo(page, linkEl) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const pageEl = document.getElementById('page-' + page);
  if (pageEl) pageEl.classList.add('active');

  if (linkEl) linkEl.classList.add('active');
  else {
    const match = document.querySelector(`.nav-item[data-page="${page}"]`);
    if (match) match.classList.add('active');
  }

  const labels = {
    'home':'Головна',
    'module-plutchik':'Колесо Плутчика',
    'module-mak':'МАК-сесія',
    'module-schwartz':'Цінності Шварца',
    'dashboard':'Мій профіль'
  };
  document.getElementById('breadcrumb').textContent = labels[page] || page;

  if (page === 'module-plutchik') initPluchtik();
  if (page === 'module-mak') initMAK();
  if (page === 'module-schwartz') initSchwartz();
  if (page === 'dashboard') renderDashboard();

  closeSidebar();
  window.scrollTo({ top: 0 });
}

// ---- SIDEBAR ----
function toggleSidebar() {
  const sb = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (!overlay) {
    const ov = document.createElement('div');
    ov.id = 'sidebar-overlay';
    ov.className = 'sidebar-overlay';
    ov.onclick = closeSidebar;
    document.body.appendChild(ov);
  }
  const ov2 = document.getElementById('sidebar-overlay');
  sb.classList.toggle('open');
  ov2.classList.toggle('open');
}
function closeSidebar() {
  document.getElementById('sidebar')?.classList.remove('open');
  document.getElementById('sidebar-overlay')?.classList.remove('open');
}

// ---- THEME ----
let currentTheme = 'dark';
function toggleTheme() {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);
  document.getElementById('theme-icon').textContent = currentTheme === 'dark' ? '☀' : '☾';
  document.getElementById('theme-label').textContent = currentTheme === 'dark' ? 'Світла тема' : 'Темна тема';
}

// ---- THEORY TOGGLE ----
function toggleTheory(mod) {
  const panel = document.getElementById('theory-' + mod);
  const arrow = document.getElementById('theory-arrow-' + mod);
  if (panel.classList.contains('hidden')) {
    panel.classList.remove('hidden');
    arrow.textContent = '▲';
  } else {
    panel.classList.add('hidden');
    arrow.textContent = '▼';
  }
}

// ---- SESSION BADGE ----
function updateSessionBadge() {
  const done = [sessionData.plutchik, sessionData.mak, sessionData.schwartz].filter(Boolean).length;
  const badge = document.getElementById('session-badge');
  if (done > 0) badge.textContent = `${done}/3 модулів`;
}

// ---- PLUTCHIK STATE ACTIONS ----
function selectPluchtikEmotion(id) {
  plutchikState.selectedEmotion = PLUTCHIK_EMOTIONS.find(e => e.id === id);
  renderPluchtikStep(2);
}
function selectIntensity(lvl) {
  plutchikState.intensity = lvl;
  // re-render to update radio
  document.querySelectorAll('tr').forEach(tr => tr.style.background = '');
  document.querySelectorAll('input[name="intensity"]').forEach(r => {
    if (r.value === lvl) r.checked = true;
  });
  document.getElementById('p3-next')?.removeAttribute('disabled');
}
function toggleBodyZone(zone, svgEl) {
  if (plutchikState.bodyZones.includes(zone)) {
    plutchikState.bodyZones = plutchikState.bodyZones.filter(z => z !== zone);
  } else {
    plutchikState.bodyZones.push(zone);
  }
  // Update SVG zones
  document.querySelectorAll('.body-zone').forEach(el => {
    if (el.dataset.zone === zone) {
      el.classList.toggle('marked', plutchikState.bodyZones.includes(zone));
    }
  });
  // Update list
  document.querySelectorAll('.bzl-item').forEach(el => {
    el.classList.toggle('active', plutchikState.bodyZones.some(z => el.textContent.trim().includes(z)));
  });
  const zoneLabel = document.getElementById('zone-label');
  if (zoneLabel) zoneLabel.textContent = '📍 ' + zone;
}
function selectCognitiveMod(idx) {
  plutchikState.cognitiveMod = idx;
  document.querySelectorAll('.rg-item').forEach((el, i) => el.classList.toggle('selected', i === idx));
}
function updatePresence(val) {
  plutchikState.presenceScore = parseInt(val);
  const el = document.getElementById('presence-val');
  if (el) el.textContent = val;
}
function toggleMixed(name) {
  if (plutchikState.mixedEmotions.includes(name)) {
    plutchikState.mixedEmotions = plutchikState.mixedEmotions.filter(m => m !== name);
  } else {
    plutchikState.mixedEmotions.push(name);
  }
  renderPluchtikStep(7);
}
function saveReflectionA(val, idx) {
  plutchikState.reflections[`a${idx}`] = val;
}

// ---- MAK STATE ACTIONS ----
function chooseMakCard(id) {
  makState.chosenCard = MAK_CARDS.find(c => c.id === id);
  renderMAKStep(3);
}
function toggleNVC(field, value) {
  const arr = makState.nvc[field];
  if (arr.includes(value)) {
    makState.nvc[field] = arr.filter(v => v !== value);
  } else {
    makState.nvc[field] = [...arr, value];
  }
  document.querySelectorAll(`.nvc-${field.slice(0,field.length)} .nvc-chip, .nvc-obs .nvc-chip, .nvc-feel .nvc-chip, .nvc-need .nvc-chip, .nvc-req .nvc-chip`).forEach(el => {
    if (el.textContent.trim() === value) {
      el.classList.toggle('selected', makState.nvc[field].includes(value));
    }
  });
}

// ---- SCHWARTZ ACTIONS ----
function setSZScore(itemId, val) {
  schwartzState.scores[itemId] = val;
  // Update UI
  const parent = document.querySelector(`.sz-btn[onclick="setSZScore('${itemId}',${val})"]`)?.closest('.sz-item');
  if (parent) {
    parent.querySelectorAll('.sz-btn').forEach((btn, i) => {
      const btnVal = parseInt(btn.getAttribute('onclick').match(/-?\d+\)$/)[0]);
      btn.classList.toggle('active', btnVal === val);
    });
  }
  // Update counter
  const block = SCHWARTZ_BLOCKS.find(b => b.items.some(i => i.id === itemId));
  if (block) {
    const answered = block.items.filter(i => schwartzState.scores[i.id] !== undefined).length;
    const tag = document.querySelector('.tag.tag-accent');
    if (tag) tag.textContent = `${answered}/${block.items.length}`;
  }
}

// ---- PLUTCHIK WHEEL ----
function drawPluchtikWheel() {
  const canvas = document.getElementById('wheel-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const cx = 160, cy = 160, count = PLUTCHIK_EMOTIONS.length;
  const angle = (2 * Math.PI) / count;

  canvas.onclick = (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width) - cx;
    const my = (e.clientY - rect.top) * (canvas.height / rect.height) - cy;
    const clickAngle = Math.atan2(my, mx);
    let adjusted = clickAngle + Math.PI / 2;
    if (adjusted < 0) adjusted += 2 * Math.PI;
    const idx = Math.floor(adjusted / angle) % count;
    showWheelEmotion(PLUTCHIK_EMOTIONS[idx]);
  };

  // Draw rings
  const rings = [
    {r:148, alpha:0.6},
    {r:100, alpha:0.8},
    {r:58, alpha:1.0},
  ];

  rings.forEach(({r, alpha}) => {
    PLUTCHIK_EMOTIONS.forEach((em, i) => {
      const start = i * angle - Math.PI / 2;
      const end = (i + 1) * angle - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, end);
      ctx.closePath();
      ctx.fillStyle = em.color + Math.round(alpha * 255).toString(16).padStart(2,'0');
      ctx.fill();
      ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '#0d0d12';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  });

  // Labels
  PLUTCHIK_EMOTIONS.forEach((em, i) => {
    const mid = (i + 0.5) * angle - Math.PI / 2;
    const r = 120;
    const tx = cx + r * Math.cos(mid);
    const ty = cy + r * Math.sin(mid);
    ctx.save();
    ctx.translate(tx, ty);
    ctx.rotate(mid + Math.PI / 2);
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = '600 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(em.name, 0, 0);
    ctx.restore();
  });

  // Center circle
  ctx.beginPath();
  ctx.arc(cx, cy, 22, 0, 2 * Math.PI);
  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--surface').trim() || '#17171f';
  ctx.fill();
  ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--border').trim() || '#2a2a38';
  ctx.lineWidth = 1;
  ctx.stroke();
}

function showWheelEmotion(em) {
  const el = document.getElementById('wheel-info');
  if (!el) return;
  el.innerHTML = `
    <div class="wse-emoji" style="color:${em.color}">${em.id === 'joy' ? '😊' : em.id === 'trust' ? '🤝' : em.id === 'fear' ? '😨' : em.id === 'surprise' ? '😲' : em.id === 'sadness' ? '😢' : em.id === 'disgust' ? '🤢' : em.id === 'anger' ? '😠' : '🔭'}</div>
    <div class="wse-name" style="color:${em.color}">${em.name}</div>
    <div class="wse-level">${em.weak.name} · ${em.mid.name} · ${em.strong.name}</div>
    <div class="wse-desc">${em.cognitivePattern}</div>
  `;
}

// ---- HOME PAGE VISUALS ----
function drawPluchtikMini() {
  const canvas = document.createElement('canvas');
  canvas.width = 140; canvas.height = 140;
  const ctx = canvas.getContext('2d');
  const cx = 70, cy = 70, count = PLUTCHIK_EMOTIONS.length;
  const angle = (2 * Math.PI) / count;
  const r = 65;
  PLUTCHIK_EMOTIONS.forEach((em, i) => {
    const start = i * angle - Math.PI / 2;
    const end = (i + 1) * angle - Math.PI / 2;
    ctx.beginPath(); ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, start, end); ctx.closePath();
    ctx.fillStyle = em.color + 'bb'; ctx.fill();
    ctx.strokeStyle = '#0d0d12'; ctx.lineWidth = 1; ctx.stroke();
  });
  ctx.beginPath(); ctx.arc(cx, cy, 18, 0, 2 * Math.PI);
  ctx.fillStyle = '#17171f'; ctx.fill();
  document.getElementById('plutchik-mini-home')?.replaceWith(canvas);
}

// ---- MAK PREVIEW ----
function renderMAKPreview() {
  const container = document.getElementById('mak-preview');
  if (!container) return;
  const cards = MAK_CARDS.slice(0, 5);
  const grads = ['linear-gradient(135deg,#1e3a5f,#0f4c81)','linear-gradient(135deg,#3b1f5e,#6b21a8)','linear-gradient(135deg,#1a3a2a,#166534)','linear-gradient(135deg,#3a1a1a,#991b1b)','linear-gradient(135deg,#1a2a3a,#0c4a6e)'];
  container.innerHTML = cards.map((c,i) => `<div class="mak-preview-card" style="background:${grads[i]}">${c.emoji}</div>`).join('');
}

// ---- DASHBOARD ----
function renderDashboard() {
  const grid = document.getElementById('dash-grid');
  const done = [sessionData.plutchik, sessionData.mak, sessionData.schwartz].filter(Boolean).length;
  if (done === 0) {
    grid.innerHTML = `<div class="dash-empty">
      <div class="de-icon">◎</div>
      <h3>Поки немає результатів</h3>
      <p>Пройди хоча б один модуль, щоб побачити аналітику тут.</p>
      <button class="btn-primary" onclick="navigateTo('home',null)">До модулів →</button>
    </div>`;
    return;
  }

  let html = '';

  if (sessionData.plutchik) {
    const p = sessionData.plutchik;
    html += `<div class="dash-widget">
      <div class="dw-title">Модуль 01 · Емоція: ${p.emotion}</div>
      <div style="display:flex;flex-direction:column;gap:var(--sp2);font-size:var(--text-xs);color:var(--text-m)">
        <div>🎭 Інтенсивність: <strong>${p.intensity}</strong></div>
        <div>📊 Сила присутності: <strong style="color:var(--accent)">${p.score}/10</strong></div>
        <div>📍 Тілесні зони: <strong>${p.bodyZones?.join(', ')||'—'}</strong></div>
        ${p.mixed?.length ? `<div>🔀 Змішані стани: <strong>${p.mixed.join(', ')}</strong></div>` : ''}
        ${p.reflectionNeed ? `<div style="margin-top:var(--sp2);padding:var(--sp3);background:var(--surface2);border-radius:var(--r-sm);font-style:italic">"${p.reflectionNeed.slice(0,100)}${p.reflectionNeed.length>100?'…':''}"</div>` : ''}
      </div>
      <canvas id="dash-plutchik" style="margin-top:var(--sp4)"></canvas>
    </div>`;
  }

  if (sessionData.mak) {
    const m = sessionData.mak;
    html += `<div class="dash-widget">
      <div class="dw-title">Модуль 02 · МАК: ${m.card}</div>
      <div style="display:flex;flex-direction:column;gap:var(--sp2);font-size:var(--text-xs);color:var(--text-m)">
        <div>🃏 Тема: <strong>${m.theme}</strong></div>
        <div>💛 Почуття: <strong>${m.feelings?.join(', ')||'—'}</strong></div>
        <div>🎯 Потреби: <strong>${m.needs?.join(', ')||'—'}</strong></div>
        <div>🔑 Прохання: <strong>${m.requests?.join(', ')||'—'}</strong></div>
        ${m.integration ? `<div style="margin-top:var(--sp2);padding:var(--sp3);background:var(--surface2);border-radius:var(--r-sm);font-style:italic">"${m.integration.slice(0,100)}${m.integration.length>100?'…':''}"</div>` : ''}
      </div>
    </div>`;
  }

  if (sessionData.schwartz) {
    const s = sessionData.schwartz;
    html += `<div class="dash-widget" style="grid-column:1/-1">
      <div class="dw-title">Модуль 03 · Ціннісний профіль</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--sp5)">
        <div>
          <div style="font-size:var(--text-xs);font-weight:600;color:var(--green);margin-bottom:var(--sp2)">Провідні цінності:</div>
          ${s.top?.map(n=>`<div style="font-size:var(--text-xs);padding:var(--sp2) var(--sp3);background:var(--green-bg);border-radius:var(--r-sm);margin-bottom:4px;color:var(--text)">${n}</div>`).join('')}
        </div>
        <div>
          <div style="font-size:var(--text-xs);font-weight:600;color:var(--text-f);margin-bottom:var(--sp2)">Менш виражені:</div>
          ${s.low?.map(n=>`<div style="font-size:var(--text-xs);padding:var(--sp2) var(--sp3);background:var(--surface2);border-radius:var(--r-sm);margin-bottom:4px;color:var(--text-m)">${n}</div>`).join('')}
        </div>
      </div>
      <canvas id="dash-schwartz" style="margin-top:var(--sp4);max-height:200px"></canvas>
    </div>`;
  }

  if (done === 3) {
    html += `<div class="dash-widget" style="grid-column:1/-1">
      <div class="dw-title">🔗 Інтегрований аналіз</div>
      <div class="insight-list">${generateIntegratedInsights()}</div>
    </div>`;
  }

  grid.innerHTML = html;

  // Render mini charts
  if (sessionData.plutchik) {
    setTimeout(() => {
      const canvas = document.getElementById('dash-plutchik');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      new Chart(ctx, {
        type:'bar',
        data:{ labels:['Емоція','Присутність'], datasets:[{
          data:[8, sessionData.plutchik.score],
          backgroundColor:['rgba(129,140,248,0.4)','rgba(251,113,133,0.4)'],
          borderColor:['#818cf8','#fb7185'], borderWidth:2, borderRadius:4
        }]},
        options:{ responsive:true, maintainAspectRatio:true, aspectRatio:3,
          plugins:{legend:{display:false}},
          scales:{ y:{min:0,max:10,grid:{color:'rgba(255,255,255,0.04)'},ticks:{color:'#8888a8',font:{size:10}}},
                   x:{grid:{display:false},ticks:{color:'#8888a8',font:{size:10}}}}}
      });
    }, 100);
  }

  if (sessionData.schwartz) {
    setTimeout(() => {
      const canvas = document.getElementById('dash-schwartz');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const scores = sessionData.schwartz.scores || [];
      new Chart(ctx, {
        type:'radar',
        data:{ labels: scores.map(s=>s.name), datasets:[{
          label:'Цінності', data: scores.map(s=>s.avg),
          backgroundColor:'rgba(129,140,248,0.12)',
          borderColor:'rgba(129,140,248,0.6)',
          pointBackgroundColor:'#818cf8', pointRadius:3
        }]},
        options:{ responsive:true, maintainAspectRatio:true, aspectRatio:2,
          scales:{ r:{ min:-1,max:7, grid:{color:'rgba(255,255,255,0.05)'},
            pointLabels:{font:{size:10},color:'#8888a8'}, ticks:{display:false}}},
          plugins:{legend:{display:false}}}
      });
    }, 150);
  }
}

function generateIntegratedInsights() {
  const p = sessionData.plutchik;
  const m = sessionData.mak;
  const s = sessionData.schwartz;
  let out = '';

  if (p && s) {
    const topVal = s.top?.[0];
    out += `<div class="insight-item neutral"><div class="insight-icon">🔗</div><div class="insight-text">Твоя провідна емоція (<strong>${p.emotion}</strong>) і провідна цінність (<strong>${topVal}</strong>) — чи бачиш ти зв\u2019язок між ними у своєму поточному стані?</div></div>`;
  }
  if (m && s) {
    out += `<div class="insight-item positive"><div class="insight-icon">✨</div><div class="insight-text">Карта <strong>${m.card}</strong> резонує з потребами: ${m.needs?.slice(0,3).join(', ')}. Порівняй це з твоїми ціннісними пріоритетами — чи є збіги?</div></div>`;
  }
  if (p?.score >= 7) {
    out += `<div class="insight-item tension"><div class="insight-icon">⚠</div><div class="insight-text">Висока інтенсивність емоції (<strong>${p.score}/10</strong>) вказує на активний психологічний матеріал, який заслуговує на увагу — через рефлексію, розмову або роботу з фахівцем.</div></div>`;
  }
  return out || `<div class="insight-item neutral"><div class="insight-icon">💡</div><div class="insight-text">Усі три модулі пройдено. Знайди час переглянути свої записи в рефлексіях і зафіксувати ключові усвідомлення.</div></div>`;
}

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
  drawPluchtikMini();
  renderMAKPreview();
  navigateTo('home', document.querySelector('[data-page="home"]'));
});
