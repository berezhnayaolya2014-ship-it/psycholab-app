// ===========================
//  PsychoLab — Module Renderers
// ===========================

// ---- PLUTCHIK MODULE ----
const PLUTCHIK_STEPS = [
  'Знайомство з моделлю',
  'Вибір базової емоції',
  'Рівень інтенсивності',
  'Тілесна карта',
  'Коґнітивний патерн',
  'Шкала присутності',
  'Змішані емоції',
  'Рефлексія A: Джерело',
  'Рефлексія Б: Потреба',
  'Профіль та підсумок',
];

let plutchikState = {
  step: 1,
  selectedEmotion: null,
  intensity: null, // 'weak'|'mid'|'strong'
  bodyZones: [],
  cognitiveMod: null,
  presenceScore: 5,
  mixedEmotions: [],
  reflections: { source: '', need: '' },
  emotionScores: {}, // {emotionId: 0-10}
};

function initPluchtik() {
  plutchikState = {
    step: 1, selectedEmotion: null, intensity: null,
    bodyZones: [], cognitiveMod: null, presenceScore: 5,
    mixedEmotions: [], reflections: { source: '', need: '' }, emotionScores: {}
  };
  renderPluchtikStepList();
  renderPluchtikStep(1);
}

function renderPluchtikStepList() {
  const el = document.getElementById('plutchik-step-list');
  el.innerHTML = PLUTCHIK_STEPS.map((s, i) => {
    const n = i + 1;
    const cls = n < plutchikState.step ? 'done' : n === plutchikState.step ? 'active' : '';
    const dot = n < plutchikState.step ? '✓' : n;
    return `<div class="step-item ${cls}"><div class="step-dot">${dot}</div><span>${s}</span></div>`;
  }).join('');
}

function renderPluchtikStep(n) {
  plutchikState.step = n;
  renderPluchtikStepList();
  const main = document.getElementById('plutchik-main');

  const prog = Math.round((n - 1) / PLUTCHIK_STEPS.length * 100);

  let html = `<div class="progress-pill" style="margin-bottom:var(--sp5)">
    <span>${n} / ${PLUTCHIK_STEPS.length}</span>
    <div class="progress-track"><div class="progress-fill-bar" style="width:${prog}%"></div></div>
    <span>${prog}%</span>
  </div>`;

  if (n === 1) html += renderP_Intro();
  else if (n === 2) html += renderP_ChooseEmotion();
  else if (n === 3) html += renderP_Intensity();
  else if (n === 4) html += renderP_BodyMap();
  else if (n === 5) html += renderP_Cognitive();
  else if (n === 6) html += renderP_Presence();
  else if (n === 7) html += renderP_Mixed();
  else if (n === 8) html += renderP_ReflectionA();
  else if (n === 9) html += renderP_ReflectionB();
  else if (n === 10) html += renderP_Summary();

  main.innerHTML = html;

  if (n === 1) drawPluchtikWheel();
  if (n === 10) renderPluchtikChart();
  updateSessionBadge();
}

function renderP_Intro() {
  return `<div class="step-panel active">
  <div class="step-card">
    <div class="step-number">Крок 01</div>
    <h3>Знайомство з моделлю Плутчика</h3>
    <p>Роберт Плутчик (1927–2006) розробив психоеволюційну теорію емоцій. Він стверджував, що існують <strong>8 базових емоцій</strong>, організованих у пари протилежностей. Колесо візуалізує їх у вигляді пелюстків з трьома рівнями інтенсивності.</p>

    <div class="wheel-wrap">
      <div class="wheel-svg-wrap">
        <canvas id="wheel-canvas" width="320" height="320"></canvas>
      </div>
      <div class="wheel-selected-emotion" id="wheel-info">
        <div class="wse-emoji">◉</div>
        <div class="wse-name">Натисни на сектор</div>
        <div class="wse-desc">Досліди кожен сегмент колеса, щоб дізнатися про емоцію</div>
      </div>
    </div>

    <div class="insight-list" style="margin-top:var(--sp5)">
      <div class="insight-item neutral"><div class="insight-icon">💡</div><div class="insight-text"><strong>Принцип полярності:</strong> кожна базова емоція має протилежну (Радість ↔ Смуток, Страх ↔ Злість).</div></div>
      <div class="insight-item neutral"><div class="insight-icon">💡</div><div class="insight-text"><strong>Принцип схожості:</strong> сусідні емоції схожі; поєднуючись, вони утворюють <em>діади</em> — складні змішані стани.</div></div>
      <div class="insight-item neutral"><div class="insight-icon">💡</div><div class="insight-text"><strong>Принцип інтенсивності:</strong> кожна емоція існує у трьох рівнях — від легкого до пікового.</div></div>
    </div>

    <div class="step-nav"><div></div><div class="step-nav-right">
      <button class="btn-primary" onclick="renderPluchtikStep(2)">Перейти до діагностики →</button>
    </div></div>
  </div></div>`;
}

function renderP_ChooseEmotion() {
  return `<div class="step-panel active">
  <div class="step-card">
    <div class="step-number">Крок 02</div>
    <h3>Яка базова емоція зараз найближча?</h3>
    <p>Закрий очі на 30 секунд. Зроби кілька глибоких вдихів. Дозволь увазі спокійно спуститися всередину. Яка емоція, якщо прибрати назву, є зараз у тілі та розумі?</p>
    <div class="radio-grid">
      ${PLUTCHIK_EMOTIONS.map(e => `
        <button class="rg-item ${plutchikState.selectedEmotion?.id===e.id?'selected':''}"
          onclick="selectPluchtikEmotion('${e.id}')"
          style="${plutchikState.selectedEmotion?.id===e.id?`border-color:${e.color};background:${e.color}20;color:${e.color}`:''}">
          <div style="font-weight:700;margin-bottom:4px">${e.name}</div>
          <div style="font-size:var(--text-xs);opacity:0.7">${e.weak.name} / ${e.mid.name} / ${e.strong.name}</div>
        </button>`).join('')}
    </div>
    <div class="step-nav">
      <button class="btn-ghost" onclick="renderPluchtikStep(1)">← Назад</button>
      <div class="step-nav-right">
        <button class="btn-primary" id="p2-next" onclick="renderPluchtikStep(3)"
          ${!plutchikState.selectedEmotion?'disabled':''}>Далі →</button>
      </div>
    </div>
  </div></div>`;
}

function renderP_Intensity() {
  const e = plutchikState.selectedEmotion;
  if (!e) return renderP_ChooseEmotion();
  return `<div class="step-panel active">
  <div class="step-card">
    <div class="step-number">Крок 03</div>
    <h3>На якому рівні ця ${e.name}?</h3>
    <p>Модель Плутчика виділяє три рівні інтенсивності для кожної базової емоції. Обери той, що найточніше описує твій стан прямо зараз.</p>

    <div class="intensity-matrix">
      <table class="matrix-table">
        <thead><tr>
          <th>Рівень</th><th>Назва</th><th>Опис</th><th>Твоя оцінка</th>
        </tr></thead>
        <tbody>
          ${['weak','mid','strong'].map((lvl,i) => `
            <tr style="${plutchikState.intensity===lvl?`background:${e.color}15`:''}" onclick="selectIntensity('${lvl}')">
              <td><span class="tag ${i===0?'tag-accent':i===1?'tag-green':'tag-amber'}">${i===0?'Слабкий':i===1?'Середній':'Сильний'}</span></td>
              <td><strong class="intensity-row-label">${e[lvl].name}</strong></td>
              <td style="font-size:var(--text-xs);color:var(--text-m)">${e[lvl].desc}</td>
              <td><input type="radio" name="intensity" value="${lvl}" ${plutchikState.intensity===lvl?'checked':''}
                onchange="selectIntensity('${lvl}')" style="accent-color:${e.color}"/></td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>

    <div class="step-nav">
      <button class="btn-ghost" onclick="renderPluchtikStep(2)">← Назад</button>
      <div class="step-nav-right">
        <button class="btn-primary" id="p3-next" onclick="renderPluchtikStep(4)"
          ${!plutchikState.intensity?'disabled':''}>Далі →</button>
      </div>
    </div>
  </div></div>`;
}

function renderP_BodyMap() {
  const e = plutchikState.selectedEmotion;
  const zones = ['голова','обличчя','горло','груди / серце','живіт','плечі','руки','ноги'];
  return `<div class="step-panel active">
  <div class="step-card">
    <div class="step-number">Крок 04</div>
    <h3>Де ця емоція живе у тілі?</h3>
    <p>Прислухайся до свого тіла. Відзнач <strong>всі зони</strong>, де ти відчуваєш фізичний відгук цієї емоції. Можна обирати кілька.</p>
    <div class="body-map-wrap">
      <div class="body-svg-container">
        <svg class="body-svg" viewBox="0 0 200 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="48" r="32" fill="var(--surface2)" stroke="var(--border2)" stroke-width="1.5"/>
          <rect x="88" y="79" width="24" height="16" rx="4" fill="var(--surface2)" stroke="var(--border2)" stroke-width="1.5"/>
          <rect x="58" y="94" width="84" height="100" rx="10" fill="var(--surface2)" stroke="var(--border2)" stroke-width="1.5"/>
          <rect x="26" y="96" width="30" height="88" rx="12" fill="var(--surface2)" stroke="var(--border2)" stroke-width="1.5"/>
          <rect x="144" y="96" width="30" height="88" rx="12" fill="var(--surface2)" stroke="var(--border2)" stroke-width="1.5"/>
          <rect x="62" y="192" width="32" height="110" rx="12" fill="var(--surface2)" stroke="var(--border2)" stroke-width="1.5"/>
          <rect x="106" y="192" width="32" height="110" rx="12" fill="var(--surface2)" stroke="var(--border2)" stroke-width="1.5"/>
          <circle class="body-zone ${plutchikState.bodyZones.includes('голова')?'marked':''}" data-zone="голова" cx="100" cy="48" r="32" onclick="toggleBodyZone('голова',this)"/>
          <rect class="body-zone ${plutchikState.bodyZones.includes('обличчя')?'marked':''}" data-zone="обличчя" x="78" y="20" width="44" height="30" rx="4" onclick="toggleBodyZone('обличчя',this)"/>
          <rect class="body-zone ${plutchikState.bodyZones.includes('горло')?'marked':''}" data-zone="горло" x="88" y="78" width="24" height="18" rx="4" onclick="toggleBodyZone('горло',this)"/>
          <rect class="body-zone ${plutchikState.bodyZones.includes('груди / серце')?'marked':''}" data-zone="груди / серце" x="58" y="94" width="84" height="50" rx="6" onclick="toggleBodyZone('груди / серце',this)"/>
          <rect class="body-zone ${plutchikState.bodyZones.includes('живіт')?'marked':''}" data-zone="живіт" x="58" y="144" width="84" height="50" rx="6" onclick="toggleBodyZone('живіт',this)"/>
          <rect class="body-zone ${plutchikState.bodyZones.includes('плечі')?'marked':''}" data-zone="плечі" x="26" y="96" width="30" height="44" rx="10" onclick="toggleBodyZone('плечі',this)"/>
          <rect class="body-zone" x="144" y="96" width="30" height="44" rx="10" onclick="toggleBodyZone('плечі',this)" class="body-zone ${plutchikState.bodyZones.includes('плечі')?'marked':''}"/>
          <rect class="body-zone ${plutchikState.bodyZones.includes('руки')?'marked':''}" data-zone="руки" x="26" y="140" width="30" height="44" rx="10" onclick="toggleBodyZone('руки',this)"/>
          <rect class="body-zone ${plutchikState.bodyZones.includes('ноги')?'marked':''}" data-zone="ноги" x="62" y="192" width="76" height="110" rx="12" onclick="toggleBodyZone('ноги',this)"/>
        </svg>
      </div>
      <div class="body-labels">
        <h4>Відзначені зони:</h4>
        <div class="body-zone-list" id="bz-list">
          ${zones.map(z=>`<div class="bzl-item ${plutchikState.bodyZones.includes(z)?'active':''}" onclick="toggleBodyZone('${z}',null)">
            <div class="bzl-dot"></div><span>${z}</span>
          </div>`).join('')}
        </div>
        ${e.bodyZones.length ? `<p style="font-size:var(--text-xs);color:var(--text-f);margin-top:var(--sp3)">💡 Типові зони для <strong>${e.name}</strong>: ${e.bodyZones.join(', ')}</p>` : ''}
      </div>
    </div>
    <div class="step-nav">
      <button class="btn-ghost" onclick="renderPluchtikStep(3)">← Назад</button>
      <div class="step-nav-right">
        <button class="btn-primary" onclick="renderPluchtikStep(5)">Далі →</button>
      </div>
    </div>
  </div></div>`;
}

function renderP_Cognitive() {
  const e = plutchikState.selectedEmotion;
  const mods = [
    'Підтверджує мою думку про ситуацію',
    'Суперечить тому, що я очікував(ла)',
    'Пов\u2019язана зі спогадом або минулим досвідом',
    'Виникла несподівано, без явної причини',
    'Є реакцією на чужі слова або дії',
    'Пов\u2019язана з уявним сценарієм майбутнього',
  ];
  return `<div class="step-panel active">
  <div class="step-card">
    <div class="step-number">Крок 05</div>
    <h3>Коґнітивний контекст</h3>
    <p>Типовий внутрішній монолог при <strong>${e.name}</strong>: <em>${e.cognitivePattern}</em>. Обери, що найточніше описує, як ця емоція виникла у тебе зараз.</p>
    <div class="radio-grid">
      ${mods.map((m,i) => `<button class="rg-item ${plutchikState.cognitiveMod===i?'selected':''}" onclick="selectCognitiveMod(${i})">${m}</button>`).join('')}
    </div>
    <div class="step-nav">
      <button class="btn-ghost" onclick="renderPluchtikStep(4)">← Назад</button>
      <div class="step-nav-right">
        <button class="btn-primary" onclick="renderPluchtikStep(6)">Далі →</button>
      </div>
    </div>
  </div></div>`;
}

function renderP_Presence() {
  const e = plutchikState.selectedEmotion;
  return `<div class="step-panel active">
  <div class="step-card">
    <div class="step-number">Крок 06</div>
    <h3>Наскільки ця емоція присутня прямо зараз?</h3>
    <p>Оціни за шкалою від 0 до 10, де 0 — емоція практично відсутня, 10 — вона домінує і займає весь простір уваги.</p>
    <div class="slider-group" style="max-width:500px">
      <div class="slider-label-row">
        <span class="slider-name">${e.name}</span>
        <span class="slider-val" id="presence-val">${plutchikState.presenceScore}</span>
      </div>
      <input type="range" class="custom-range" min="0" max="10" step="1"
        value="${plutchikState.presenceScore}"
        oninput="updatePresence(this.value)"/>
      <div class="slider-sublabels"><span>0 — не відчуваю</span><span>10 — повністю захоплює</span></div>
    </div>

    <div class="insight-item neutral" style="margin-top:var(--sp4);max-width:500px">
      <div class="insight-icon">💡</div>
      <div class="insight-text">Оцінка 7–10 означає, що емоція <strong>домінує</strong> і потребує усвідомленого опрацювання. 4–6 — помірна присутність. 1–3 — фоновий стан.</div>
    </div>

    <div class="step-nav">
      <button class="btn-ghost" onclick="renderPluchtikStep(5)">← Назад</button>
      <div class="step-nav-right">
        <button class="btn-primary" onclick="renderPluchtikStep(7)">Далі →</button>
      </div>
    </div>
  </div></div>`;
}

function renderP_Mixed() {
  const e = plutchikState.selectedEmotion;
  const relevant = PLUTCHIK_DYADS.filter(d =>
    d.formula.includes(e.name) ||
    d.formula.includes(PLUTCHIK_EMOTIONS.find(x=>x.id===e.opposite)?.name)
  );
  const show = relevant.length ? relevant : PLUTCHIK_DYADS.slice(0,4);
  return `<div class="step-panel active">
  <div class="step-card">
    <div class="step-number">Крок 07</div>
    <h3>Змішані емоції (діади)</h3>
    <p>Коли поєднуються дві сусідні базові емоції, виникає складніший стан. Серед наведених діад — чи є такі, що відповідають тому, що ти відчуваєш <em>разом</em> з основною емоцією?</p>
    <div class="mixed-grid">
      ${PLUTCHIK_DYADS.map(d => `
        <div class="mixed-card ${plutchikState.mixedEmotions.includes(d.name)?'selected':''}"
          onclick="toggleMixed('${d.name}')"
          style="${plutchikState.mixedEmotions.includes(d.name)?`border-color:${d.color};background:${d.color}18`:``}">
          <div class="mc-title">${d.name}</div>
          <div class="mc-formula">${d.formula}</div>
          <div class="mc-desc">${d.desc}</div>
        </div>`).join('')}
    </div>
    <div class="step-nav">
      <button class="btn-ghost" onclick="renderPluchtikStep(6)">← Назад</button>
      <div class="step-nav-right">
        <button class="btn-primary" onclick="renderPluchtikStep(8)">Далі →</button>
      </div>
    </div>
  </div></div>`;
}

function renderP_ReflectionA() {
  const e = plutchikState.selectedEmotion;
  const qs = REFLECTION_QUESTIONS[e.id] || [];
  return `<div class="step-panel active">
  <div class="step-card">
    <div class="step-number">Крок 08 — Рефлексія А</div>
    <h3>Джерело емоції</h3>
    <p>Рефлексія — ключовий інструмент психологічного розвитку. Відповідай розгорнуто, не поспішай.</p>
    ${qs.map((q,i) => `
      <div class="reflection-prompt-box">${q}</div>
      <textarea class="journal-area" placeholder="Запиши свою відповідь тут..."
        oninput="saveReflectionA(this.value,${i})" rows="4"
        style="margin-bottom:var(--sp5)">${plutchikState.reflections[`a${i}`]||''}</textarea>`).join('')}
    <div class="step-nav">
      <button class="btn-ghost" onclick="renderPluchtikStep(7)">← Назад</button>
      <div class="step-nav-right">
        <button class="btn-primary" onclick="renderPluchtikStep(9)">Далі →</button>
      </div>
    </div>
  </div></div>`;
}

function renderP_ReflectionB() {
  const e = plutchikState.selectedEmotion;
  return `<div class="step-panel active">
  <div class="step-card">
    <div class="step-number">Крок 09 — Рефлексія Б</div>
    <h3>Потреба за емоцією</h3>
    <p>За кожною емоцією стоїть потреба — задоволена або ні. Дослідимо це детальніше.</p>

    <div class="reflection-prompt-box">
      Якщо ця ${e.name} — сигнал від твого внутрішнього «я», яке повідомлення вона несе? Яка потреба за нею стоїть?
    </div>
    <textarea class="journal-area" placeholder="Яка потреба могла б бути задоволена або порушена?..."
      oninput="plutchikState.reflections.need=this.value" rows="4"
      style="margin-bottom:var(--sp5)">${plutchikState.reflections.need||''}</textarea>

    <div class="reflection-prompt-box">
      Якщо дати цій ${e.name.toLowerCase()} ім\u2019я та голос — що б вона сказала? Спробуй написати від першої особи цієї емоції.
    </div>
    <textarea class="journal-area" placeholder="«Я — твоя ${e.name.toLowerCase()}. Я тут, бо...»"
      oninput="plutchikState.reflections.voice=this.value" rows="4">${plutchikState.reflections.voice||''}</textarea>

    <div class="step-nav">
      <button class="btn-ghost" onclick="renderPluchtikStep(8)">← Назад</button>
      <div class="step-nav-right">
        <button class="btn-primary" onclick="renderPluchtikStep(10)">Завершити модуль →</button>
      </div>
    </div>
  </div></div>`;
}

function renderP_Summary() {
  const e = plutchikState.selectedEmotion;
  const lvlNames = {weak:'Слабкий',mid:'Середній',strong:'Сильний'};
  const intensityName = e && plutchikState.intensity ? e[plutchikState.intensity].name : '—';

  const scoreLevel = plutchikState.presenceScore >= 7 ? 'high' : plutchikState.presenceScore >= 4 ? 'medium' : 'low';
  const scoreLevelLabel = scoreLevel === 'high' ? 'Домінуюча' : scoreLevel === 'medium' ? 'Помірна' : 'Фонова';
  const scoreLevelClass = scoreLevel === 'high' ? 'tag-amber' : scoreLevel === 'medium' ? 'tag-green' : 'tag-accent';

  const insights = generatePluchtikInsights();

  // Save to session
  sessionData.plutchik = {
    emotion: e?.name, intensity: intensityName, score: plutchikState.presenceScore,
    bodyZones: plutchikState.bodyZones, mixed: plutchikState.mixedEmotions,
    reflectionNeed: plutchikState.reflections.need
  };

  return `<div class="step-panel active">
  <div class="result-card">
    <div class="result-header">
      <div><div class="msb-tag">Результат · Модуль 01</div>
      <div class="rh-title">Твій емоційний профіль</div></div>
      <span class="rh-badge ${scoreLevelClass}">${scoreLevelLabel} присутність</span>
    </div>

    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:var(--sp3);margin-bottom:var(--sp5)">
      <div style="background:var(--surface2);border:1px solid var(--border);border-radius:var(--r-md);padding:var(--sp4)">
        <div style="font-size:var(--text-xs);color:var(--text-f);font-weight:600;margin-bottom:var(--sp2)">БАЗОВА ЕМОЦІЯ</div>
        <div style="font-size:var(--text-lg);font-weight:700;color:var(--text)">${e?.name || '—'}</div>
      </div>
      <div style="background:var(--surface2);border:1px solid var(--border);border-radius:var(--r-md);padding:var(--sp4)">
        <div style="font-size:var(--text-xs);color:var(--text-f);font-weight:600;margin-bottom:var(--sp2)">РІВЕНЬ ІНТЕНСИВНОСТІ</div>
        <div style="font-size:var(--text-lg);font-weight:700;color:var(--text)">${intensityName}</div>
      </div>
      <div style="background:var(--surface2);border:1px solid var(--border);border-radius:var(--r-md);padding:var(--sp4)">
        <div style="font-size:var(--text-xs);color:var(--text-f);font-weight:600;margin-bottom:var(--sp2)">СИЛА ПРИСУТНОСТІ</div>
        <div style="font-size:var(--text-lg);font-weight:700;color:var(--accent)">${plutchikState.presenceScore}/10</div>
      </div>
      <div style="background:var(--surface2);border:1px solid var(--border);border-radius:var(--r-md);padding:var(--sp4)">
        <div style="font-size:var(--text-xs);color:var(--text-f);font-weight:600;margin-bottom:var(--sp2)">ТІЛЕСНІ ЗОНИ</div>
        <div style="font-size:var(--text-sm);font-weight:600;color:var(--text)">${plutchikState.bodyZones.join(', ')||'—'}</div>
      </div>
    </div>

    ${plutchikState.mixedEmotions.length ? `
    <div style="margin-bottom:var(--sp5)">
      <div style="font-size:var(--text-sm);font-weight:600;color:var(--text);margin-bottom:var(--sp3)">Змішані стани:</div>
      <div style="display:flex;flex-wrap:wrap;gap:var(--sp2)">
        ${plutchikState.mixedEmotions.map(m => `<span class="tag tag-accent">${m}</span>`).join('')}
      </div>
    </div>` : ''}

    <div class="chart-container"><canvas id="plutchik-result-chart"></canvas></div>

    <div class="insight-list">${insights}</div>

    <div class="step-nav" style="margin-top:var(--sp5)">
      <button class="btn-ghost" onclick="initPluchtik()">↺ Повторити</button>
      <div class="step-nav-right">
        <button class="btn-primary" onclick="navigateTo('dashboard',null)">Дашборд →</button>
        <button class="btn-primary" onclick="navigateTo('module-mak',null)">Модуль 02 →</button>
      </div>
    </div>
  </div></div>`;
}

function generatePluchtikInsights() {
  const e = plutchikState.selectedEmotion;
  if (!e) return '';
  const score = plutchikState.presenceScore;
  const lvl = plutchikState.intensity;
  const zones = plutchikState.bodyZones;
  let out = '';

  if (score >= 7) {
    out += `<div class="insight-item tension"><div class="insight-icon">⚠</div><div class="insight-text"><strong>Висока інтенсивність:</strong> Сила ${e.name.toLowerCase()} на рівні ${score}/10 свідчить про те, що ця емоція домінує у свідомості. Важливо дати їй місце та дослідити причину.</div></div>`;
  }
  if (zones.includes('живіт') && ['fear','anger'].includes(e.id)) {
    out += `<div class="insight-item neutral"><div class="insight-icon">💡</div><div class="insight-text"><strong>Вісцеральна реакція:</strong> Відчуття у животі при ${e.name.toLowerCase()} — класичний ознака активації автономної нервової системи. Техніки дихання можуть знизити інтенсивність.</div></div>`;
  }
  if (lvl === 'strong') {
    out += `<div class="insight-item challenge"><div class="insight-icon">🔎</div><div class="insight-text"><strong>Пікова інтенсивність:</strong> ${e.strong.name} — найсильніший прояв ${e.name.toLowerCase()}. Це може означати тривалу незадоволену потребу або гострий тригер.</div></div>`;
  }
  if (plutchikState.mixedEmotions.length >= 2) {
    out += `<div class="insight-item neutral"><div class="insight-icon">🔬</div><div class="insight-text"><strong>Складна емоційна суміш:</strong> Ти ідентифікував(ла) ${plutchikState.mixedEmotions.length} змішані стани. Це свідчить про емоційну зрілість та здатність до тонкої диференціації.</div></div>`;
  }
  out += `<div class="insight-item positive"><div class="insight-icon">✓</div><div class="insight-text"><strong>Поведінковий патерн:</strong> При ${e.name.toLowerCase()} типовою реакцією є: <em>${e.behaviors}</em>. Спостерігаєш це у себе?</div></div>`;
  return out;
}

function renderPluchtikChart() {
  setTimeout(() => {
    const canvas = document.getElementById('plutchik-result-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const labels = PLUTCHIK_EMOTIONS.map(e=>e.name);
    const selected = plutchikState.selectedEmotion;
    const data = PLUTCHIK_EMOTIONS.map(e => {
      if (e.id === selected?.id) return plutchikState.presenceScore;
      if (e.id === selected?.opposite) return Math.max(0, 10 - plutchikState.presenceScore);
      return Math.random() * 3 + 1;
    });
    new Chart(ctx, {
      type:'radar',
      data:{ labels, datasets:[{
        label:'Емоційний профіль',
        data,
        backgroundColor:'rgba(129,140,248,0.15)',
        borderColor:'rgba(129,140,248,0.8)',
        pointBackgroundColor:'rgba(129,140,248,1)',
        pointRadius:4,
      }]},
      options:{ responsive:true, maintainAspectRatio:false,
        scales:{ r:{ min:0,max:10, grid:{color:'rgba(255,255,255,0.07)'},
          pointLabels:{font:{size:11},color:'#8888a8'},
          ticks:{display:false}}},
        plugins:{ legend:{display:false}}
      }
    });
  }, 100);
}

// ---- MAK MODULE ----
const MAK_STEPS = [
  'Вступ до МАК-методики','Вибір карти','Перший погляд','NVC: Спостереження',
  'NVC: Почуття','NVC: Потреби','NVC: Прохання',
  'Рефлексія A','Рефлексія Б','Інтеграційний запит','Аналіз образів','Підсумок сесії'
];

let makState = {
  step:1, chosenCard:null,
  nvc:{ obs:[], feelings:[], needs:[], requests:[] },
  reflections:{},
};

function initMAK() {
  makState = { step:1, chosenCard:null, nvc:{obs:[],feelings:[],needs:[],requests:[]}, reflections:{} };
  renderMAKStepList();
  renderMAKStep(1);
}

function renderMAKStepList() {
  const el = document.getElementById('mak-step-list');
  el.innerHTML = MAK_STEPS.map((s,i) => {
    const n=i+1, cls=n<makState.step?'done':n===makState.step?'active':'';
    return `<div class="step-item ${cls}"><div class="step-dot">${n<makState.step?'✓':n}</div><span>${s}</span></div>`;
  }).join('');
}

function renderMAKStep(n) {
  makState.step = n;
  renderMAKStepList();
  const main = document.getElementById('mak-main');
  const prog = Math.round((n-1)/MAK_STEPS.length*100);
  let html = `<div class="progress-pill" style="margin-bottom:var(--sp5)">
    <span>${n} / ${MAK_STEPS.length}</span>
    <div class="progress-track"><div class="progress-fill-bar" style="width:${prog}%"></div></div>
    <span>${prog}%</span></div>`;

  if (n===1) html += renderMAK_Intro();
  else if (n===2) html += renderMAK_ChooseCard();
  else if (n===3) html += renderMAK_FirstLook();
  else if (n===4) html += renderMAK_NVC_Obs();
  else if (n===5) html += renderMAK_NVC_Feelings();
  else if (n===6) html += renderMAK_NVC_Needs();
  else if (n===7) html += renderMAK_NVC_Requests();
  else if (n===8) html += renderMAK_ReflA();
  else if (n===9) html += renderMAK_ReflB();
  else if (n===10) html += renderMAK_Integration();
  else if (n===11) html += renderMAK_ImageAnalysis();
  else if (n===12) html += renderMAK_Summary();

  main.innerHTML = html;
  if (n===12) renderMAKSummaryChart();
}

function renderMAK_Intro() {
  return `<div class="step-card">
    <div class="step-number">Крок 01</div>
    <h3>Що таке МАК і як вони працюють?</h3>
    <p>Метафоричні асоціативні карти (МАК, або MAC — Metaphorical Associative Cards) — проєктивна техніка, в якій зображення виступає <strong>«дзеркалом» несвідомого</strong>. Людина проєктує власні зміст, переживання та смисли на нейтральний образ.</p>

    <div class="insight-list" style="margin-bottom:var(--sp5)">
      <div class="insight-item neutral"><div class="insight-icon">🔬</div><div class="insight-text"><strong>Механізм проєкції:</strong> Коли ми дивимося на неоднозначний образ, мозок заповнює «прогалини» власним досвідом, страхами та бажаннями. Саме тому дві людини бачать в одній карті різне.</div></div>
      <div class="insight-item neutral"><div class="insight-icon">🧩</div><div class="insight-text"><strong>МАК у терапії:</strong> Використовуються в КПТ, нарративній терапії, гештальті. Допомагають обійти захисні механізми і дістатися до емоційно насичених тем.</div></div>
      <div class="insight-item neutral"><div class="insight-icon">📌</div><div class="insight-text"><strong>NVC-інтеграція:</strong> У цій сесії ми поєднаємо образ карти з 4-компонентною моделлю Розенберга: <em>Спостереження → Почуття → Потреби → Прохання</em>.</div></div>
    </div>

    <div style="background:var(--surface2);border:1px solid var(--border);border-radius:var(--r-md);padding:var(--sp5);margin-bottom:var(--sp5)">
      <div style="font-size:var(--text-sm);font-weight:600;color:var(--text);margin-bottom:var(--sp3)">Як проводиться сесія:</div>
      <ol style="font-size:var(--text-sm);color:var(--text-m);line-height:1.8;padding-left:var(--sp5)">
        <li>Ти обираєш карту — довільно або за темою</li>
        <li>Описуєш, що <em>бачиш</em> на зображенні (без інтерпретацій)</li>
        <li>Досліджуєш, що <em>відчуваєш</em> під час погляду на образ</li>
        <li>Зв\u2019язуєш образ зі своїми актуальними <em>потребами</em></li>
        <li>Формулюєш <em>прохання</em> до себе або інших</li>
      </ol>
    </div>

    <div class="step-nav"><div></div><div class="step-nav-right">
      <button class="btn-primary" onclick="renderMAKStep(2)">Почати сесію →</button>
    </div></div>
  </div>`;
}

function renderMAK_ChooseCard() {
  const shuffled = [...MAK_CARDS].sort(()=>Math.random()-0.5).slice(0,8);
  const gradients = [
    'linear-gradient(135deg,#1e3a5f,#0f4c81)','linear-gradient(135deg,#3b1f5e,#6b21a8)',
    'linear-gradient(135deg,#1a3a2a,#166534)','linear-gradient(135deg,#3a1a1a,#991b1b)',
    'linear-gradient(135deg,#1a2a3a,#0c4a6e)','linear-gradient(135deg,#2a1a3a,#7c3aed)',
    'linear-gradient(135deg,#3a3a1a,#a16207)','linear-gradient(135deg,#1a3a3a,#0d9488)',
  ];
  return `<div class="step-card">
    <div class="step-number">Крок 02</div>
    <h3>Обери свою карту</h3>
    <p>Не думай надто довго. Закрий очі, зроби вдих і запитай себе: <em>«Яка карта зараз мені потрібна?»</em> Відкрий очі та натисни на ту, що перша притягнула погляд.</p>
    <div class="mak-deck">
      ${shuffled.map((c,i)=>`
        <div class="mak-card-back" style="background:${gradients[i%gradients.length]}"
          onclick="chooseMakCard(${c.id})">?</div>`).join('')}
    </div>
    <div class="step-nav">
      <button class="btn-ghost" onclick="renderMAKStep(1)">← Назад</button>
    </div>
  </div>`;
}

function renderMAK_FirstLook() {
  const c = makState.chosenCard;
  return `<div class="step-card">
    <div class="step-number">Крок 03 — Перший погляд</div>
    <h3>Дивись на карту. Просто дивись.</h3>
    <p>Проведи з цим образом хвилину. Не аналізуй, не шукай сенс — просто дозволь образу проникнути.</p>
    <div class="mak-card-front">
      <div class="mcf-image" style="background:linear-gradient(135deg,var(--surface2),var(--surface3))">${c.emoji}</div>
      <div class="mcf-body">
        <div class="mcf-label">Карта #${c.id} · ${c.theme}</div>
        <div class="mcf-title">${c.title}</div>
        <div class="mcf-desc">${c.desc}</div>
        <div class="mcf-meta">
          ${c.archetypes.map(a=>`<span class="mcf-meta-tag">${a}</span>`).join('')}
        </div>
      </div>
    </div>
    <div class="reflection-prompt-box">
      Що перше ти помітив(ла) на цій карті? Який елемент притягнув увагу найбільше?
    </div>
    <textarea class="journal-area" placeholder="Запиши свої перші враження..."
      oninput="makState.reflections.firstLook=this.value" rows="3">${makState.reflections.firstLook||''}</textarea>
    <div class="step-nav">
      <button class="btn-ghost" onclick="renderMAKStep(2)">← Назад</button>
      <div class="step-nav-right"><button class="btn-primary" onclick="renderMAKStep(4)">До NVC-аналізу →</button></div>
    </div>
  </div>`;
}

function renderMAK_NVC_Obs() {
  const c = makState.chosenCard;
  return `<div class="step-card">
    <div class="step-number">Крок 04 — NVC: Спостереження</div>
    <h3>Що ти <em>бачиш</em> на карті?</h3>
    <p>У NVC перший крок — <strong>чисте спостереження</strong> без оцінок та інтерпретацій. Опиши образ максимально конкретно: кольори, форми, об\u2019єкти, просторові відносини.</p>
    <div class="insight-item neutral" style="margin-bottom:var(--sp4)"><div class="insight-icon">💡</div><div class="insight-text"><strong>NVC-правило:</strong> «Я бачу/чую...» — а не «я думаю, що», «здається», «тут зображено». Спостереження — це опис, а не оцінка.</div></div>
    <div class="reflection-prompt-box">Опиши точно те, що бачиш: що зображено, де розміщено, які кольори та форми?</div>
    <textarea class="journal-area" placeholder="На зображенні я бачу..." rows="4"
      oninput="makState.reflections.obs=this.value">${makState.reflections.obs||''}</textarea>
    <div style="font-size:var(--text-sm);color:var(--text-m);margin-top:var(--sp4);margin-bottom:var(--sp2)">Або обери готові спостереження:</div>
    <div class="nvc-grid" style="grid-template-columns:1fr"><div class="nvc-block nvc-obs">
      <div class="nvc-label">Спостереження</div>
      <div class="nvc-chips">
        ${['Темні тони','Світло та тінь','Горизонт','Рух','Самотня фігура','Замкнений простір','Відкритий простір','Природні елементи','Архітектура','Вода','Вогонь','Висота'].map(o=>`
          <span class="nvc-chip ${makState.nvc.obs.includes(o)?'selected':''}" onclick="toggleNVC('obs','${o}')">${o}</span>`).join('')}
      </div>
    </div></div>
    <div class="step-nav">
      <button class="btn-ghost" onclick="renderMAKStep(3)">← Назад</button>
      <div class="step-nav-right"><button class="btn-primary" onclick="renderMAKStep(5)">Далі →</button></div>
    </div>
  </div>`;
}

function renderMAK_NVC_Feelings() {
  const c = makState.chosenCard;
  return `<div class="step-card">
    <div class="step-number">Крок 05 — NVC: Почуття</div>
    <h3>Що ти <em>відчуваєш</em>, дивлячись на цей образ?</h3>
    <p>Другий крок NVC — <strong>почуття</strong>. Важливо розрізняти справжні почуття («тривога», «радість») і псевдопочуття-оцінки («почуваюся знехтуваним» — це оцінка, не почуття).</p>
    <div class="nvc-grid" style="grid-template-columns:1fr">
      <div class="nvc-block nvc-feel">
        <div class="nvc-label">Почуття — обери всі, що резонують</div>
        <div class="nvc-chips">
          ${c.nvcFeelings.concat(['спокій','радість','захоплення','самотність','вразливість','безсилля','надія','злість','ніжність','тривога','збудження','смуток']).filter((v,i,a)=>a.indexOf(v)===i).map(f=>`
            <span class="nvc-chip ${makState.nvc.feelings.includes(f)?'selected':''}" onclick="toggleNVC('feelings','${f}')">${f}</span>`).join('')}
        </div>
      </div>
    </div>
    <div class="reflection-prompt-box" style="margin-top:var(--sp4)">Яке з обраних почуттів найсильніше? Де ти відчуваєш його в тілі?</div>
    <textarea class="journal-area" placeholder="Найсильніше відчуття — ... Я відчуваю це в..." rows="3"
      oninput="makState.reflections.feelings=this.value">${makState.reflections.feelings||''}</textarea>
    <div class="step-nav">
      <button class="btn-ghost" onclick="renderMAKStep(4)">← Назад</button>
      <div class="step-nav-right"><button class="btn-primary" onclick="renderMAKStep(6)">Далі →</button></div>
    </div>
  </div>`;
}

function renderMAK_NVC_Needs() {
  const c = makState.chosenCard;
  const allNeeds = c.nvcNeeds.concat(Object.keys(NVC_NEEDS_FULL)).filter((v,i,a)=>a.indexOf(v)===i);
  return `<div class="step-card">
    <div class="step-number">Крок 06 — NVC: Потреби</div>
    <h3>Яка <em>потреба</em> говорить через цей образ?</h3>
    <p>Третій крок NVC — <strong>потреби</strong>. Розенберг стверджує: всі почуття є наслідком задоволених або незадоволених потреб. Запитай себе: «Що мені важливо? Чого мені зараз не вистачає або що є?»</p>
    <div class="nvc-grid" style="grid-template-columns:1fr">
      <div class="nvc-block nvc-need">
        <div class="nvc-label">Потреби — оберіть що резонує</div>
        <div class="nvc-chips">
          ${allNeeds.map(n=>`<span class="nvc-chip ${makState.nvc.needs.includes(n)?'selected':''}" onclick="toggleNVC('needs','${n}')">${n}</span>`).join('')}
        </div>
      </div>
    </div>
    <div class="reflection-prompt-box" style="margin-top:var(--sp4)">Яка незадоволена або задоволена потреба резонує найбільше зараз? Як давно ця потреба активна у твоєму житті?</div>
    <textarea class="journal-area" placeholder="Ця карта нагадує мені про потребу в..." rows="3"
      oninput="makState.reflections.needs=this.value">${makState.reflections.needs||''}</textarea>
    <div class="step-nav">
      <button class="btn-ghost" onclick="renderMAKStep(5)">← Назад</button>
      <div class="step-nav-right"><button class="btn-primary" onclick="renderMAKStep(7)">Далі →</button></div>
    </div>
  </div>`;
}

function renderMAK_NVC_Requests() {
  return `<div class="step-card">
    <div class="step-number">Крок 07 — NVC: Прохання</div>
    <h3>Яке <em>прохання</em> ти формулюєш?</h3>
    <p>Четвертий крок NVC — <strong>конкретне, виконуване прохання</strong>. Воно має бути позитивним (що ти хочеш, а не що не хочеш), конкретним і здійсненним прямо зараз.</p>
    <div class="nvc-grid" style="grid-template-columns:1fr">
      <div class="nvc-block nvc-req">
        <div class="nvc-label">Прохання — можна обрати або написати своє</div>
        <div class="nvc-chips">
          ${['Дозволити собі відпочити','Поговорити з кимось близьким','Виразити почуття словами','Поставити межу','Попросити про підтримку','Зробити паузу','Написати у щоденнику','Зробити першу маленьку дію','Прийняти ситуацію як є','Визнати власну потребу'].map(r=>`
            <span class="nvc-chip ${makState.nvc.requests.includes(r)?'selected':''}" onclick="toggleNVC('requests','${r}')">${r}</span>`).join('')}
        </div>
      </div>
    </div>
    <div class="reflection-prompt-box" style="margin-top:var(--sp4)">Сформулюй прохання від себе до себе (або до іншої людини): «Я прошу... зробити... щоб...»</div>
    <textarea class="journal-area" placeholder="Я прошу себе..." rows="3"
      oninput="makState.reflections.requests=this.value">${makState.reflections.requests||''}</textarea>
    <div class="step-nav">
      <button class="btn-ghost" onclick="renderMAKStep(6)">← Назад</button>
      <div class="step-nav-right"><button class="btn-primary" onclick="renderMAKStep(8)">Рефлексія →</button></div>
    </div>
  </div>`;
}

function renderMAK_ReflA() {
  return `<div class="step-card">
    <div class="step-number">Крок 08 — Рефлексія А: Зв\u2019язок з реальністю</div>
    <h3>Де цей образ живе у твоєму реальному житті?</h3>
    <p>Найважливіший момент МАК-сесії — <strong>перенос</strong>: переведення символічного змісту образу в конкретну реальність.</p>

    <div class="reflection-prompt-box">Ця карта може символізувати певну ситуацію, стосунок або внутрішній стан. Що у твоєму житті прямо зараз <em>схоже</em> на цей образ?</div>
    <textarea class="journal-area" placeholder="У моєму житті зараз є ситуація, де я..." rows="4"
      oninput="makState.reflections.refl_a1=this.value">${makState.reflections.refl_a1||''}</textarea>

    <div class="reflection-prompt-box" style="margin-top:var(--sp4)">Якби ця карта могла щось порадити тобі — що б вона сказала?</div>
    <textarea class="journal-area" placeholder="Ця карта каже мені: ..." rows="3"
      oninput="makState.reflections.refl_a2=this.value">${makState.reflections.refl_a2||''}</textarea>

    <div class="step-nav">
      <button class="btn-ghost" onclick="renderMAKStep(7)">← Назад</button>
      <div class="step-nav-right"><button class="btn-primary" onclick="renderMAKStep(9)">Далі →</button></div>
    </div>
  </div>`;
}

function renderMAK_ReflB() {
  return `<div class="step-card">
    <div class="step-number">Крок 09 — Рефлексія Б: Ресурс образу</div>
    <h3>Ресурс, який несе цей образ</h3>
    <p>МАК-методика не лише виявляє труднощі, а й допомагає знайти <strong>ресурс</strong>. Кожен образ несе в собі не лише виклик, а й силу.</p>

    <div class="reflection-prompt-box">Що сильного або ресурсного є у цьому образі? Яку якість або здатність він символізує?</div>
    <textarea class="journal-area" placeholder="Сила цього образу — це..." rows="3"
      oninput="makState.reflections.refl_b1=this.value">${makState.reflections.refl_b1||''}</textarea>

    <div class="reflection-prompt-box" style="margin-top:var(--sp4)">Якою б ти хотів(ла) бачити цю ситуацію через місяць? Намалюй словами «найкращий варіант» розвитку.</div>
    <textarea class="journal-area" placeholder="Через місяць я бачу себе..." rows="4"
      oninput="makState.reflections.refl_b2=this.value">${makState.reflections.refl_b2||''}</textarea>

    <div class="step-nav">
      <button class="btn-ghost" onclick="renderMAKStep(8)">← Назад</button>
      <div class="step-nav-right"><button class="btn-primary" onclick="renderMAKStep(10)">Далі →</button></div>
    </div>
  </div>`;
}

function renderMAK_Integration() {
  return `<div class="step-card">
    <div class="step-number">Крок 10 — Інтеграційний запит</div>
    <h3>Що ти забираєш з цієї сесії?</h3>
    <p>Завершуємо сесію інтеграцією — перетворенням інсайтів у конкретні думки та дії.</p>

    <div class="reflection-prompt-box">Назви <strong>одне усвідомлення</strong>, яке з\u2019явилося під час цієї сесії. Воно може бути про себе, про стосунки, про ситуацію — що завгодно.</div>
    <textarea class="journal-area" placeholder="Я усвідомив(ла), що..." rows="3"
      oninput="makState.reflections.integration1=this.value">${makState.reflections.integration1||''}</textarea>

    <div class="reflection-prompt-box" style="margin-top:var(--sp4)">Назви <strong>одну конкретну дію</strong> (мікро-крок), яку ти готовий(а) зробити протягом найближчих 24 годин на основі цього усвідомлення.</div>
    <textarea class="journal-area" placeholder="Протягом сьогодні/завтра я зроблю..." rows="3"
      oninput="makState.reflections.integration2=this.value">${makState.reflections.integration2||''}</textarea>

    <div class="step-nav">
      <button class="btn-ghost" onclick="renderMAKStep(9)">← Назад</button>
      <div class="step-nav-right"><button class="btn-primary" onclick="renderMAKStep(11)">Аналіз образів →</button></div>
    </div>
  </div>`;
}

function renderMAK_ImageAnalysis() {
  const c = makState.chosenCard;
  const feelCount = makState.nvc.feelings.length;
  const needCount = makState.nvc.needs.length;
  return `<div class="step-card">
    <div class="step-number">Крок 11 — Аналіз образу</div>
    <h3>Архетипічний зміст твоєї карти</h3>
    <p>Твоя карта — <strong>${c.title}</strong> — несе кілька архетипічних шарів. Розглянемо їх через призму психологічного аналізу.</p>
    <div class="nvc-grid">
      <div class="nvc-block nvc-obs"><div class="nvc-label">Архетипи образу</div>
        <div class="nvc-chips">${c.archetypes.map(a=>`<span class="nvc-chip selected">${a}</span>`).join('')}</div>
      </div>
      <div class="nvc-block nvc-feel"><div class="nvc-label">Твої почуття (${feelCount})</div>
        <div class="nvc-chips">${makState.nvc.feelings.map(f=>`<span class="nvc-chip selected">${f}</span>`).join('')||'<span style="color:var(--text-f);font-size:var(--text-xs)">Не обрано</span>'}</div>
      </div>
      <div class="nvc-block nvc-need"><div class="nvc-label">Твої потреби (${needCount})</div>
        <div class="nvc-chips">${makState.nvc.needs.map(n=>`<span class="nvc-chip selected">${n}</span>`).join('')||'<span style="color:var(--text-f);font-size:var(--text-xs)">Не обрано</span>'}</div>
      </div>
      <div class="nvc-block nvc-req"><div class="nvc-label">Твої прохання</div>
        <div class="nvc-chips">${makState.nvc.requests.map(r=>`<span class="nvc-chip selected">${r}</span>`).join('')||'<span style="color:var(--text-f);font-size:var(--text-xs)">Не обрано</span>'}</div>
      </div>
    </div>
    <div class="insight-list" style="margin-top:var(--sp5)">
      ${feelCount >= 4 ? `<div class="insight-item positive"><div class="insight-icon">✓</div><div class="insight-text"><strong>Емоційна диференціація:</strong> Ти ідентифікував(ла) ${feelCount} різних почуттів — це свідчить про розвинений емоційний словник.</div></div>` : ''}
      ${needCount >= 3 ? `<div class="insight-item positive"><div class="insight-icon">✓</div><div class="insight-text"><strong>Усвідомленість потреб:</strong> Ти назвав(ла) ${needCount} актуальних потреб. Здатність усвідомлювати потреби — основа ненасильницького спілкування.</div></div>` : ''}
      <div class="insight-item neutral"><div class="insight-icon">🔎</div><div class="insight-text"><strong>Тема образу «${c.theme}»</strong> пов\u2019язана з архетипами: ${c.archetypes.join(', ')}. Ці теми часто активуються у моменти, коли відповідна сфера потребує уваги.</div></div>
    </div>
    <div class="step-nav">
      <button class="btn-ghost" onclick="renderMAKStep(10)">← Назад</button>
      <div class="step-nav-right"><button class="btn-primary" onclick="renderMAKStep(12)">Підсумок →</button></div>
    </div>
  </div>`;
}

function renderMAK_Summary() {
  const c = makState.chosenCard;
  sessionData.mak = {
    card: c?.title, theme: c?.theme,
    feelings: makState.nvc.feelings, needs: makState.nvc.needs,
    requests: makState.nvc.requests,
    integration: makState.reflections.integration1
  };
  return `<div class="result-card">
    <div class="result-header">
      <div><div class="msb-tag">Результат · Модуль 02</div>
      <div class="rh-title">Підсумок МАК-сесії</div></div>
      <span class="tag tag-accent">${c.emoji} ${c.title}</span>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--sp3);margin-bottom:var(--sp5)">
      <div style="background:var(--surface2);border:1px solid var(--border);border-radius:var(--r-md);padding:var(--sp4)">
        <div style="font-size:var(--text-xs);font-weight:600;color:var(--teal);margin-bottom:var(--sp2)">СПОСТЕРЕЖЕННЯ</div>
        <div style="font-size:var(--text-xs);color:var(--text-m)">${makState.nvc.obs.join(', ')||'—'}</div>
      </div>
      <div style="background:var(--surface2);border:1px solid var(--border);border-radius:var(--r-md);padding:var(--sp4)">
        <div style="font-size:var(--text-xs);font-weight:600;color:var(--rose);margin-bottom:var(--sp2)">ПОЧУТТЯ</div>
        <div style="font-size:var(--text-xs);color:var(--text-m)">${makState.nvc.feelings.join(', ')||'—'}</div>
      </div>
      <div style="background:var(--surface2);border:1px solid var(--border);border-radius:var(--r-md);padding:var(--sp4)">
        <div style="font-size:var(--text-xs);font-weight:600;color:var(--amber);margin-bottom:var(--sp2)">ПОТРЕБИ</div>
        <div style="font-size:var(--text-xs);color:var(--text-m)">${makState.nvc.needs.join(', ')||'—'}</div>
      </div>
      <div style="background:var(--surface2);border:1px solid var(--border);border-radius:var(--r-md);padding:var(--sp4)">
        <div style="font-size:var(--text-xs);font-weight:600;color:var(--accent);margin-bottom:var(--sp2)">ПРОХАННЯ</div>
        <div style="font-size:var(--text-xs);color:var(--text-m)">${makState.nvc.requests.join(', ')||'—'}</div>
      </div>
    </div>
    ${makState.reflections.integration1 ? `<div class="insight-item positive" style="margin-bottom:var(--sp4)">
      <div class="insight-icon">💡</div>
      <div class="insight-text"><strong>Ключове усвідомлення:</strong> «${makState.reflections.integration1}»</div>
    </div>` : ''}
    ${makState.reflections.integration2 ? `<div class="insight-item positive">
      <div class="insight-icon">🎯</div>
      <div class="insight-text"><strong>Мій крок:</strong> «${makState.reflections.integration2}»</div>
    </div>` : ''}
    <canvas id="mak-summary-chart" height="80" style="margin-top:var(--sp5)"></canvas>
    <div class="step-nav" style="margin-top:var(--sp5)">
      <button class="btn-ghost" onclick="initMAK()">↺ Нова сесія</button>
      <div class="step-nav-right">
        <button class="btn-primary" onclick="navigateTo('module-schwartz',null)">Модуль 03 →</button>
      </div>
    </div>
  </div>`;
}

function renderMAKSummaryChart() {
  setTimeout(() => {
    const canvas = document.getElementById('mak-summary-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const categories = ['Спостереження','Почуття','Потреби','Прохання'];
    const data = [makState.nvc.obs.length, makState.nvc.feelings.length, makState.nvc.needs.length, makState.nvc.requests.length];
    new Chart(ctx, {
      type:'bar',
      data:{ labels:categories, datasets:[{ label:'Елементи NVC', data, backgroundColor:['rgba(45,212,191,0.4)','rgba(251,113,133,0.4)','rgba(251,191,36,0.4)','rgba(129,140,248,0.4)'], borderColor:['#2dd4bf','#fb7185','#fbbf24','#818cf8'], borderWidth:2, borderRadius:6}]},
      options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}},
        scales:{y:{min:0,beginAtZero:true, grid:{color:'rgba(255,255,255,0.05)'},ticks:{color:'#8888a8',stepSize:1}},
                x:{grid:{display:false},ticks:{color:'#8888a8'}}}}
    });
  }, 100);
}

// ---- SCHWARTZ MODULE ----
const SCHWARTZ_STEP_NAMES = SCHWARTZ_BLOCKS.map(b=>`${b.name} (${b.items.length} пунктів)`);
SCHWARTZ_STEP_NAMES.unshift('Вступ до методики');
SCHWARTZ_STEP_NAMES.push('Результати та аналіз');

let schwartzState = {
  step: 1,
  scores: {}, // {itemId: -1|0|1|2|3|4|5|6|7}
};

function initSchwartz() {
  schwartzState = { step:1, scores:{} };
  renderSchwartzStepList();
  renderSchwartzStep(1);
}

function renderSchwartzStepList() {
  const el = document.getElementById('schwartz-step-list');
  el.innerHTML = SCHWARTZ_STEP_NAMES.map((s,i) => {
    const n=i+1, cls=n<schwartzState.step?'done':n===schwartzState.step?'active':'';
    return `<div class="step-item ${cls}"><div class="step-dot">${n<schwartzState.step?'✓':n}</div><span style="font-size:10px">${s}</span></div>`;
  }).join('');
}

function renderSchwartzStep(n) {
  schwartzState.step = n;
  renderSchwartzStepList();
  const main = document.getElementById('schwartz-main');
  const total = SCHWARTZ_STEP_NAMES.length;
  const prog = Math.round((n-1)/total*100);
  let html = `<div class="progress-pill" style="margin-bottom:var(--sp5)">
    <span>${n} / ${total}</span>
    <div class="progress-track"><div class="progress-fill-bar" style="width:${prog}%"></div></div>
    <span>${prog}%</span></div>`;

  if (n===1) html += renderSZ_Intro();
  else if (n >= 2 && n <= 11) html += renderSZ_Block(n-2);
  else if (n===12) html += renderSZ_Results();

  main.innerHTML = html;
  if (n===12) renderSchwartzCharts();
}

function renderSZ_Intro() {
  return `<div class="step-card">
    <div class="step-number">Вступ</div>
    <h3>Методика Шварца: Портрет цінностей людини</h3>
    <p>Шалом Шварц (Shalom H. Schwartz) — ізраїльсько-американський соціальний психолог. Його теорія базових людських цінностей (1992) є однією з найбільш верифікованих у крос-культурній психології.</p>

    <div class="insight-list" style="margin-bottom:var(--sp5)">
      <div class="insight-item neutral"><div class="insight-icon">📐</div><div class="insight-text"><strong>Структура:</strong> 10 мотиваційних типів цінностей, організованих у циркумплекс — кружало, де сусідні блоки сумісні, а протилежні — конфліктні.</div></div>
      <div class="insight-item neutral"><div class="insight-icon">🔬</div><div class="insight-text"><strong>Шкала оцінювання:</strong> від <strong>-1</strong> («суперечить моїм принципам») до <strong>7</strong> («надзвичайно важливо»). Середина — 3-4 — «помірно важливо».</div></div>
      <div class="insight-item neutral"><div class="insight-icon">⏱</div><div class="insight-text"><strong>Порада:</strong> відповідай інтуїтивно, не обдумуючи надто довго. Важлива твоя перша реакція, а не те, яким(ою) «правильним(ою)» ти хочеш виглядати.</div></div>
    </div>

    <div style="background:var(--surface2);border:1px solid var(--border);border-radius:var(--r-md);padding:var(--sp5);margin-bottom:var(--sp5)">
      <div style="font-size:var(--text-sm);font-weight:600;margin-bottom:var(--sp3)">Шкала оцінювання:</div>
      <div style="display:flex;flex-wrap:wrap;gap:var(--sp2)">
        ${[-1,0,1,2,3,4,5,6,7].map(v=>`
          <div style="text-align:center;min-width:48px">
            <div style="font-size:var(--text-sm);font-weight:700;color:${v<0?'var(--red)':v<=2?'var(--text-m)':v<=4?'var(--accent)':'var(--green)'}">${v}</div>
            <div style="font-size:9px;color:var(--text-f);margin-top:2px">${v===-1?'суперечить':v===0?'не важл.':v===3?'середньо':v===7?'найвищ.':''}</div>
          </div>`).join('')}
      </div>
    </div>

    <div class="step-nav"><div></div><div class="step-nav-right">
      <button class="btn-primary" onclick="renderSchwartzStep(2)">Розпочати опитувальник →</button>
    </div></div>
  </div>`;
}

function renderSZ_Block(blockIdx) {
  const block = SCHWARTZ_BLOCKS[blockIdx];
  const isLast = blockIdx === SCHWARTZ_BLOCKS.length - 1;
  const answered = block.items.filter(i => schwartzState.scores[i.id] !== undefined).length;
  return `<div class="step-card">
    <div class="step-number">Блок ${blockIdx+1} / ${SCHWARTZ_BLOCKS.length}</div>
    <h3>${block.name}</h3>
    <p>${block.desc}</p>

    <div class="schwartz-block">
      <div class="sb-block-header">
        <div class="sb-block-color" style="background:${block.color}"></div>
        <span class="sb-block-name">${block.name}</span>
        <span class="sb-block-desc">${block.shortDesc}</span>
        <span class="tag tag-accent" style="margin-left:auto">${answered}/${block.items.length}</span>
      </div>
      <div class="schwartz-items">
        <div class="sz-scale-labels" style="padding:var(--sp2) var(--sp5) 0">
          <span>-1 суперечить</span><span>0</span><span>1</span><span>2</span><span>3 помірно</span><span>4</span><span>5</span><span>6</span><span>7 надзвичайно</span>
        </div>
        ${block.items.map(item => `
          <div class="sz-item">
            <div>
              <div class="sz-item-text">${item.text}</div>
              <div class="sz-item-sub">${item.sub}</div>
            </div>
            <div class="sz-scale">
              ${[-1,0,1,2,3,4,5,6,7].map(v => {
                const isNeg = v<0;
                const active = schwartzState.scores[item.id] === v;
                return `<button class="sz-btn ${isNeg?'neg':''} ${active?'active':''}"
                  onclick="setSZScore('${item.id}',${v})"
                  title="${v}">${v}</button>`;
              }).join('')}
            </div>
          </div>`).join('')}
      </div>
    </div>

    <div class="step-nav">
      <button class="btn-ghost" onclick="renderSchwartzStep(${schwartzState.step-1})">← Назад</button>
      <div class="step-nav-right">
        <button class="btn-primary" onclick="renderSchwartzStep(${schwartzState.step+1})">
          ${isLast?'Переглянути результати →':'Наступний блок →'}
        </button>
      </div>
    </div>
  </div>`;
}

function renderSZ_Results() {
  const blockScores = SCHWARTZ_BLOCKS.map(block => {
    const answered = block.items.filter(i => schwartzState.scores[i.id] !== undefined);
    const avg = answered.length ? answered.reduce((s,i)=>s+(schwartzState.scores[i.id]||0),0)/answered.length : 0;
    return { ...block, avg: Math.round(avg*10)/10, answered: answered.length };
  });

  const sorted = [...blockScores].sort((a,b)=>b.avg-a.avg);
  const top3 = sorted.slice(0,3);
  const low3 = sorted.slice(-3);

  sessionData.schwartz = {
    scores: blockScores.map(b=>({name:b.name,avg:b.avg})),
    top: top3.map(b=>b.name),
    low: low3.map(b=>b.name)
  };

  const conflicts = SCHWARTZ_CONFLICTS.map(c => {
    const a = blockScores.find(b=>b.id===c.a);
    const bBlock = blockScores.find(b=>b.id===c.b);
    const diff = Math.abs((a?.avg||0)-(bBlock?.avg||0));
    return { ...c, aAvg: a?.avg||0, bAvg: bBlock?.avg||0, diff };
  }).sort((a,b)=>b.diff-a.diff);

  return `<div class="result-card">
    <div class="result-header">
      <div><div class="msb-tag">Результат · Модуль 03</div>
      <div class="rh-title">Твій ціннісний профіль</div></div>
    </div>

    <div class="chart-container"><canvas id="schwartz-radar"></canvas></div>

    <div style="margin:var(--sp5) 0">
      <div style="font-size:var(--text-sm);font-weight:600;color:var(--text);margin-bottom:var(--sp3)">Детальний профіль:</div>
      <div style="display:flex;flex-direction:column;gap:var(--sp2)">
        ${sorted.map((b,i) => `
          <div style="display:flex;align-items:center;gap:var(--sp3)">
            <div style="width:130px;font-size:var(--text-xs);font-weight:${i<3?'700':'400'};color:${i<3?'var(--text)':'var(--text-m)'}">${b.name}</div>
            <div style="flex:1;height:8px;background:var(--surface3);border-radius:9999px;overflow:hidden">
              <div style="height:100%;width:${Math.max(0,(b.avg+1)/8*100)}%;background:${b.color};border-radius:9999px;transition:width 0.8s ease"></div>
            </div>
            <div style="width:30px;text-align:right;font-size:var(--text-xs);font-weight:700;color:${b.avg>=5?'var(--green)':b.avg>=3?'var(--accent)':'var(--text-f)'}">${b.avg}</div>
          </div>`).join('')}
      </div>
    </div>

    <div style="margin-bottom:var(--sp5)">
      <div style="font-size:var(--text-sm);font-weight:600;margin-bottom:var(--sp3)">Провідні цінності:</div>
      <div class="insight-list">
        ${top3.map(b=>`<div class="insight-item positive"><div class="insight-icon">▲</div><div class="insight-text"><strong>${b.name} (${b.avg})</strong> — ${b.desc}</div></div>`).join('')}
      </div>
    </div>

    <div style="margin-bottom:var(--sp5)">
      <div style="font-size:var(--text-sm);font-weight:600;margin-bottom:var(--sp3)">Ціннісні конфлікти:</div>
      <div class="insight-list">
        ${conflicts.slice(0,3).map(c=>`
          <div class="insight-item ${c.diff>2?'tension':'neutral'}">
            <div class="insight-icon">${c.diff>2?'⚡':'◦'}</div>
            <div class="insight-text">
              <strong>${c.label}</strong> (різниця: ${c.diff.toFixed(1)})
              <br/><span style="font-size:var(--text-xs)">${c.desc}</span>
              <br/><span style="font-size:var(--text-xs);color:var(--text-f)">${c.a.charAt(0).toUpperCase()+c.a.slice(1)}: ${c.aAvg} · ${c.b.charAt(0).toUpperCase()+c.b.slice(1)}: ${c.bAvg}</span>
            </div>
          </div>`).join('')}
      </div>
    </div>

    <div class="step-nav">
      <button class="btn-ghost" onclick="initSchwartz()">↺ Повторити</button>
      <div class="step-nav-right">
        <button class="btn-primary" onclick="navigateTo('dashboard',null)">Переглянути профіль →</button>
      </div>
    </div>
  </div>`;
}

function renderSchwartzCharts() {
  setTimeout(() => {
    const canvas = document.getElementById('schwartz-radar');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const blockScores = SCHWARTZ_BLOCKS.map(block => {
      const answered = block.items.filter(i => schwartzState.scores[i.id] !== undefined);
      const avg = answered.length ? answered.reduce((s,i)=>s+(schwartzState.scores[i.id]||0),0)/answered.length : 0;
      return avg;
    });
    new Chart(ctx, {
      type:'radar',
      data:{ labels: SCHWARTZ_BLOCKS.map(b=>b.name), datasets:[{
        label:'Ціннісний профіль', data: blockScores,
        backgroundColor:'rgba(129,140,248,0.12)',
        borderColor:'rgba(129,140,248,0.7)',
        pointBackgroundColor: SCHWARTZ_BLOCKS.map(b=>b.color),
        pointRadius:5, pointHoverRadius:7,
      }]},
      options:{ responsive:true, maintainAspectRatio:false,
        scales:{ r:{ min:-1,max:7, grid:{color:'rgba(255,255,255,0.06)'},
          pointLabels:{font:{size:11},color:'#8888a8'},
          ticks:{display:false, stepSize:2}}},
        plugins:{ legend:{display:false},
          tooltip:{ callbacks:{ label:(c)=>`${c.label}: ${c.raw.toFixed(1)}` }}}
      }
    });
  }, 150);
}
