// ============================================
// Sistema de Operaciones Algebraicas
// Prof. Fabián Soberanes Martín — Prepa CONAMAT
// ============================================

// --- Datos del alumno ---
let studentData = null;

function loadStudentFromStorage() {
  try {
    const raw = localStorage.getItem('conamat_student');
    if (raw) {
      studentData = JSON.parse(raw);
      return true;
    }
  } catch (e) {}
  return false;
}

function saveStudentToStorage() {
  if (studentData) {
    localStorage.setItem('conamat_student', JSON.stringify(studentData));
  }
}

function showStudentBadge() {
  if (!studentData) return;
  document.getElementById('student-badge').style.display = 'flex';
  document.getElementById('badge-name').textContent = studentData.nombre;
  document.getElementById('badge-meta').textContent = 
    `Grupo ${studentData.grupo} · ${studentData.horario}`;
}

function hideModal() {
  document.getElementById('student-modal').classList.add('hidden');
}

function showModal() {
  document.getElementById('student-modal').classList.remove('hidden');
}

// Registro
document.getElementById('student-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const nombre = document.getElementById('student-name').value.trim();
  const grupo = document.getElementById('student-group').value.trim();
  const horario = document.getElementById('student-schedule').value;

  if (!nombre || !grupo || !horario) {
    alert('Por favor completa todos los campos.');
    return;
  }

  studentData = {
    nombre,
    grupo,
    horario,
    registradoEn: new Date().toISOString()
  };
  saveStudentToStorage();
  showStudentBadge();
  hideModal();
});

document.getElementById('change-student-btn').addEventListener('click', () => {
  if (confirm('¿Cambiar de alumno? Se limpiará la sesión actual.')) {
    localStorage.removeItem('conamat_student');
    studentData = null;
    document.getElementById('student-badge').style.display = 'none';
    document.getElementById('student-form').reset();
    showModal();
  }
});

// Iniciar: mostrar modal si no hay alumno
if (loadStudentFromStorage()) {
  showStudentBadge();
  hideModal();
} else {
  showModal();
}

// --- Navegación ---
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.section).classList.add('active');
  });
});

// --- Tabs de teoría ---
document.querySelectorAll('.topic-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.topic-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.topic-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('topic-' + btn.dataset.topic).classList.add('active');
  });
});

// ============================================
// Utilidades de álgebra
// ============================================

function polyToString(poly) {
  const degrees = Object.keys(poly).map(Number).sort((a, b) => b - a);
  if (degrees.length === 0) return '0';
  let parts = [];
  degrees.forEach((d, i) => {
    const c = poly[d];
    if (c === 0) return;
    let term = '';
    const absC = Math.abs(c);
    if (d === 0) {
      term = String(absC);
    } else if (d === 1) {
      term = absC === 1 ? 'x' : absC + 'x';
    } else {
      term = absC === 1 ? 'x^' + d : absC + 'x^' + d;
    }
    if (c < 0) {
      term = (i === 0 ? '-' : ' - ') + term;
    } else {
      term = (i === 0 ? '' : ' + ') + term;
    }
    parts.push(term);
  });
  return parts.join('') || '0';
}

function parsePoly(str) {
  str = str.trim().toLowerCase().replace(/\s+/g, '');
  if (!str) return null;
  str = str.replace(/^\+/, '');
  const terms = str.replace(/-/g, '+-').split('+').filter(t => t);
  const poly = {};
  for (let t of terms) {
    t = t.trim();
    if (!t) continue;
    let coef = 1, deg = 0;
    if (t.includes('x')) {
      const parts = t.split('x');
      const cPart = parts[0];
      if (cPart === '' || cPart === '+') coef = 1;
      else if (cPart === '-') coef = -1;
      else coef = parseFloat(cPart);
      if (isNaN(coef)) return null;
      if (parts[1]) {
        const dStr = parts[1].replace('^', '');
        deg = parseInt(dStr, 10);
        if (isNaN(deg)) return null;
      } else {
        deg = 1;
      }
    } else {
      coef = parseFloat(t);
      if (isNaN(coef)) return null;
      deg = 0;
    }
    poly[deg] = (poly[deg] || 0) + coef;
  }
  Object.keys(poly).forEach(k => { if (poly[k] === 0) delete poly[k]; });
  return poly;
}

function polysEqual(p1, p2) {
  if (!p1 || !p2) return false;
  const keys = new Set([...Object.keys(p1), ...Object.keys(p2)]);
  for (let k of keys) {
    if ((p1[k] || 0) !== (p2[k] || 0)) return false;
  }
  return true;
}

function addPoly(a, b) {
  const res = { ...a };
  for (let d in b) res[d] = (res[d] || 0) + b[d];
  Object.keys(res).forEach(k => { if (res[k] === 0) delete res[k]; });
  return res;
}

function subPoly(a, b) {
  const negB = {};
  for (let d in b) negB[d] = -b[d];
  return addPoly(a, negB);
}

function mulPoly(a, b) {
  const res = {};
  for (let d1 in a) {
    for (let d2 in b) {
      const deg = Number(d1) + Number(d2);
      res[deg] = (res[deg] || 0) + a[d1] * b[d2];
    }
  }
  Object.keys(res).forEach(k => { if (res[k] === 0) delete res[k]; });
  return res;
}

function divPoly(a, b) {
  const degreesB = Object.keys(b).map(Number);
  if (degreesB.length === 0) return null;
  const maxB = Math.max(...degreesB);
  const coefB = b[maxB];
  if (degreesB.length === 1) {
    const res = {};
    for (let d in a) {
      const newDeg = Number(d) - maxB;
      if (newDeg < 0) return null;
      res[newDeg] = a[d] / coefB;
    }
    return res;
  }
  let dividend = { ...a };
  const quotient = {};
  for (let i = 0; i < 20; i++) {
    const keys = Object.keys(dividend).map(Number);
    if (keys.length === 0) break;
    const currMax = Math.max(...keys);
    if (currMax < maxB) break;
    const qDeg = currMax - maxB;
    const qCoef = dividend[currMax] / coefB;
    quotient[qDeg] = (quotient[qDeg] || 0) + qCoef;
    for (let d in b) {
      const termDeg = Number(d) + qDeg;
      dividend[termDeg] = (dividend[termDeg] || 0) - qCoef * b[d];
      if (Math.abs(dividend[termDeg]) < 1e-9) delete dividend[termDeg];
    }
  }
  const remaining = Object.values(dividend).some(v => Math.abs(v) > 1e-9);
  if (remaining) return null;
  return quotient;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPoly(maxDeg, maxCoef) {
  const poly = {};
  for (let d = 0; d <= maxDeg; d++) {
    if (Math.random() < 0.7 || d === maxDeg) {
      let c = randomInt(-maxCoef, maxCoef);
      if (c === 0 && d === maxDeg) c = randomInt(1, maxCoef) * (Math.random() < 0.5 ? 1 : -1);
      if (c !== 0) poly[d] = c;
    }
  }
  if (Object.keys(poly).length === 0) poly[0] = randomInt(1, maxCoef);
  return poly;
}

// ============================================
// Guardar en Supabase
// ============================================

async function saveResultToSupabase(tipo, score, total, detalles) {
  if (!studentData) {
    return { ok: false, msg: 'No hay datos del alumno. Recarga la página e ingresa tus datos.' };
  }

  if (!supabaseClient || !isSupabaseConfigured()) {
    // Guardar localmente como respaldo
    const localResults = JSON.parse(localStorage.getItem('conamat_results') || '[]');
    localResults.push({
      tipo,
      score,
      total,
      detalles,
      alumno: studentData,
      fecha: new Date().toISOString()
    });
    localStorage.setItem('conamat_results', JSON.stringify(localResults));
    return { 
      ok: true, 
      msg: '⚠️ Supabase no configurado. Resultado guardado localmente en este navegador.',
      local: true
    };
  }

  try {
    const { data, error } = await supabaseClient
      .from('resultados')
      .insert([{
        nombre: studentData.nombre,
        grupo: studentData.grupo,
        horario: studentData.horario,
        tipo: tipo,           // 'tarea' o 'examen'
        puntuacion: score,
        total: total,
        detalles: detalles,   // JSON con respuestas
        fecha: new Date().toISOString()
      }]);

    if (error) throw error;
    return { ok: true, msg: '✅ Resultados guardados correctamente en Supabase.' };
  } catch (err) {
    console.error('Error Supabase:', err);
    // Respaldo local
    const localResults = JSON.parse(localStorage.getItem('conamat_results') || '[]');
    localResults.push({
      tipo, score, total, detalles,
      alumno: studentData,
      fecha: new Date().toISOString(),
      error: err.message
    });
    localStorage.setItem('conamat_results', JSON.stringify(localResults));
    return { 
      ok: false, 
      msg: '❌ Error al guardar en Supabase: ' + (err.message || 'desconocido') + '. Guardado localmente.'
    };
  }
}

// ============================================
// Ejercicios interactivos
// ============================================

let currentExercise = null;
let correctCount = 0;
let attemptCount = 0;

function generateExercise(type) {
  let a, b, result, problemStr;
  switch (type) {
    case 'suma':
      a = randomPoly(2, 5);
      b = randomPoly(2, 5);
      result = addPoly(a, b);
      problemStr = `(${polyToString(a)}) + (${polyToString(b)})`;
      break;
    case 'resta':
      a = randomPoly(2, 5);
      b = randomPoly(2, 5);
      result = subPoly(a, b);
      problemStr = `(${polyToString(a)}) − (${polyToString(b)})`;
      break;
    case 'multiplicacion':
      a = randomPoly(1, 4);
      b = randomPoly(1, 4);
      result = mulPoly(a, b);
      problemStr = `(${polyToString(a)}) · (${polyToString(b)})`;
      break;
    case 'division':
      b = randomPoly(1, 3);
      const quot = randomPoly(1, 3);
      a = mulPoly(b, quot);
      result = quot;
      problemStr = `(${polyToString(a)}) ÷ (${polyToString(b)})`;
      break;
    default:
      return null;
  }
  return { problemStr, result, type };
}

function showExercise() {
  const type = document.getElementById('exercise-type').value;
  currentExercise = generateExercise(type);
  document.getElementById('exercise-problem').textContent = currentExercise.problemStr;
  document.getElementById('user-answer').value = '';
  document.getElementById('feedback').className = 'feedback';
  document.getElementById('feedback').style.display = 'none';
}

document.getElementById('new-exercise-btn').addEventListener('click', showExercise);

document.getElementById('check-answer-btn').addEventListener('click', () => {
  if (!currentExercise) {
    alert('Primero genera un ejercicio.');
    return;
  }
  const userStr = document.getElementById('user-answer').value;
  const userPoly = parsePoly(userStr);
  const fb = document.getElementById('feedback');
  attemptCount++;
  if (userPoly && polysEqual(userPoly, currentExercise.result)) {
    correctCount++;
    fb.className = 'feedback correct';
    fb.innerHTML = '✅ ¡Correcto! Muy bien.';
  } else {
    fb.className = 'feedback incorrect';
    fb.innerHTML = '❌ Incorrecto. Revisa tu respuesta o mira la solución.';
  }
  updateStats();
});

document.getElementById('show-solution-btn').addEventListener('click', () => {
  if (!currentExercise) return;
  const fb = document.getElementById('feedback');
  fb.className = 'feedback info';
  fb.innerHTML = `Solución: <strong>${polyToString(currentExercise.result)}</strong>`;
});

function updateStats() {
  document.getElementById('correct-count').textContent = correctCount;
  document.getElementById('attempt-count').textContent = attemptCount;
  document.getElementById('accuracy').textContent = attemptCount > 0
    ? Math.round((correctCount / attemptCount) * 100) + '%'
    : '—';
}

// ============================================
// Tarea (10 ejercicios)
// ============================================

const tareaExercises = [
  { problem: '(3x^2 + 5x - 2) + (2x^2 - 3x + 7)', answer: {2:5, 1:2, 0:5} },
  { problem: '(4x^3 - 2x^2 + x) + (-x^3 + 5x^2 - 3x + 1)', answer: {3:3, 2:3, 1:-2, 0:1} },
  { problem: '(5x^2 + 3x - 4) - (2x^2 - x + 6)', answer: {2:3, 1:4, 0:-10} },
  { problem: '(7x^3 - 4x + 2) - (3x^3 + 5x^2 - x - 8)', answer: {3:4, 2:-5, 1:-3, 0:10} },
  { problem: '3x · (2x^2 - 5x + 4)', answer: {3:6, 2:-15, 1:12} },
  { problem: '(x + 3)(x - 5)', answer: {2:1, 1:-2, 0:-15} },
  { problem: '(2x - 1)(x^2 + 3x - 4)', answer: {3:2, 2:5, 1:-11, 0:4} },
  { problem: '(12x^5 - 8x^3 + 4x^2) ÷ 4x^2', answer: {3:3, 1:-2, 0:1} },
  { problem: '(8x^3 - 12x^2 + 4x) ÷ 4x', answer: {2:2, 1:-3, 0:1} },
  { problem: '(x^3 - 2x^2 - 5x + 6) ÷ (x - 3)', answer: {2:1, 1:1, 0:-2} }
];

function renderTarea() {
  const list = document.getElementById('tarea-list');
  list.innerHTML = '';
  tareaExercises.forEach((ex, i) => {
    const div = document.createElement('div');
    div.className = 'tarea-item';
    div.innerHTML = `
      <div class="problem-text"><span class="num">${i + 1}.</span> ${ex.problem}</div>
      <input type="text" id="tarea-ans-${i}" placeholder="Tu respuesta (usa ^ para potencias)...">
      <div class="item-feedback" id="tarea-fb-${i}"></div>
    `;
    list.appendChild(div);
  });
}

document.getElementById('check-all-tarea').addEventListener('click', async () => {
  if (!studentData) {
    alert('Debes registrar tus datos primero.');
    showModal();
    return;
  }

  let correct = 0;
  const detalles = [];

  tareaExercises.forEach((ex, i) => {
    const input = document.getElementById(`tarea-ans-${i}`);
    const fb = document.getElementById(`tarea-fb-${i}`);
    const userStr = input.value;
    const user = parsePoly(userStr);
    const ok = user && polysEqual(user, ex.answer);
    if (ok) correct++;

    detalles.push({
      numero: i + 1,
      problema: ex.problem,
      respuestaAlumno: userStr || '(vacía)',
      respuestaCorrecta: polyToString(ex.answer),
      correcto: ok
    });

    fb.className = 'item-feedback show';
    if (ok) {
      fb.style.color = 'var(--success)';
      fb.textContent = '✅ Correcto';
    } else {
      fb.style.color = 'var(--danger)';
      fb.textContent = '❌ Incorrecto';
    }
  });

  const scoreBox = document.getElementById('tarea-score');
  scoreBox.style.display = 'block';
  scoreBox.textContent = `Puntuación: ${correct} / 10`;

  // Guardar en Supabase
  const statusEl = document.getElementById('tarea-save-status');
  statusEl.style.display = 'block';
  statusEl.className = 'save-status info';
  statusEl.textContent = 'Guardando resultados...';

  const result = await saveResultToSupabase('tarea', correct, 10, detalles);
  statusEl.className = 'save-status ' + (result.ok ? 'ok' : 'error');
  statusEl.textContent = result.msg;
});

document.getElementById('show-all-answers').addEventListener('click', () => {
  tareaExercises.forEach((ex, i) => {
    const fb = document.getElementById(`tarea-fb-${i}`);
    fb.className = 'item-feedback show';
    fb.style.color = 'var(--primary)';
    fb.textContent = 'Respuesta: ' + polyToString(ex.answer);
  });
});

document.getElementById('print-tarea').addEventListener('click', () => {
  window.print();
});

// ============================================
// Examen Final (30 minutos)
// ============================================

let examQuestions = [];
let examAnswers = [];
let currentQIndex = 0;
let examTimer = null;
let timeLeft = 30 * 60;

function generateExamQuestions() {
  const types = ['suma', 'resta', 'multiplicacion', 'division'];
  const qs = [];
  for (let i = 0; i < 10; i++) {
    const type = types[i % 4];
    const ex = generateExercise(type);
    qs.push({ problem: ex.problemStr, answer: ex.result, type });
  }
  return qs;
}

function startExam() {
  if (!studentData) {
    alert('Debes registrar tus datos antes de iniciar el examen.');
    showModal();
    return;
  }

  examQuestions = generateExamQuestions();
  examAnswers = new Array(10).fill('');
  currentQIndex = 0;
  timeLeft = 30 * 60;

  document.getElementById('exam-start-screen').style.display = 'none';
  document.getElementById('exam-result-screen').style.display = 'none';
  document.getElementById('exam-active-screen').style.display = 'block';

  renderQDots();
  showExamQuestion();
  startTimer();
}

function startTimer() {
  updateTimerDisplay();
  examTimer = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    if (timeLeft <= 0) {
      clearInterval(examTimer);
      submitExam();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const m = Math.floor(timeLeft / 60);
  const s = timeLeft % 60;
  const el = document.getElementById('exam-timer');
  el.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  if (timeLeft <= 60) el.classList.add('warning');
  else el.classList.remove('warning');
}

function renderQDots() {
  const container = document.getElementById('q-dots');
  container.innerHTML = '';
  for (let i = 0; i < 10; i++) {
    const dot = document.createElement('button');
    dot.className = 'q-dot' + (i === currentQIndex ? ' current' : '') + (examAnswers[i] ? ' answered' : '');
    dot.textContent = i + 1;
    dot.addEventListener('click', () => {
      saveCurrentAnswer();
      currentQIndex = i;
      showExamQuestion();
    });
    container.appendChild(dot);
  }
}

function showExamQuestion() {
  const q = examQuestions[currentQIndex];
  document.getElementById('current-q').textContent = currentQIndex + 1;
  document.getElementById('exam-question').innerHTML = `
    <div class="q-text">${currentQIndex + 1}. ${q.problem}</div>
    <input type="text" id="exam-input" placeholder="Escribe tu respuesta..." value="${examAnswers[currentQIndex] || ''}">
  `;
  document.getElementById('exam-input').focus();
  renderQDots();
}

function saveCurrentAnswer() {
  const input = document.getElementById('exam-input');
  if (input) examAnswers[currentQIndex] = input.value;
}

document.getElementById('prev-q').addEventListener('click', () => {
  saveCurrentAnswer();
  if (currentQIndex > 0) {
    currentQIndex--;
    showExamQuestion();
  }
});

document.getElementById('next-q').addEventListener('click', () => {
  saveCurrentAnswer();
  if (currentQIndex < 9) {
    currentQIndex++;
    showExamQuestion();
  }
});

document.getElementById('submit-exam-btn').addEventListener('click', () => {
  if (confirm('¿Estás seguro de enviar el examen?')) {
    submitExam();
  }
});

async function submitExam() {
  clearInterval(examTimer);
  saveCurrentAnswer();

  let score = 0;
  const detalles = [];
  const review = document.getElementById('exam-review');
  review.innerHTML = '';

  examQuestions.forEach((q, i) => {
    const user = parsePoly(examAnswers[i]);
    const ok = user && polysEqual(user, q.answer);
    if (ok) score++;

    detalles.push({
      numero: i + 1,
      problema: q.problem,
      respuestaAlumno: examAnswers[i] || '(vacía)',
      respuestaCorrecta: polyToString(q.answer),
      correcto: ok
    });

    const div = document.createElement('div');
    div.className = 'review-item ' + (ok ? 'ok' : 'fail');
    div.innerHTML = `
      <strong>${i + 1}.</strong> ${q.problem}<br>
      Tu respuesta: ${examAnswers[i] || '(vacía)'} 
      ${ok ? '✅' : '❌ Correcta: ' + polyToString(q.answer)}
    `;
    review.appendChild(div);
  });

  document.getElementById('final-score').textContent = score;
  const msg = document.getElementById('score-message');
  if (score >= 9) msg.textContent = '¡Excelente trabajo! Dominas las operaciones algebraicas.';
  else if (score >= 7) msg.textContent = 'Muy bien. Sigue practicando para perfeccionar.';
  else if (score >= 5) msg.textContent = 'Aprobado. Revisa los temas donde tuviste errores.';
  else msg.textContent = 'Necesitas reforzar más. Revisa la teoría y vuelve a intentar.';

  document.getElementById('exam-active-screen').style.display = 'none';
  document.getElementById('exam-result-screen').style.display = 'block';

  // Guardar en Supabase
  const statusEl = document.getElementById('exam-save-status');
  statusEl.className = 'save-status info';
  statusEl.textContent = 'Guardando resultados...';

  const result = await saveResultToSupabase('examen', score, 10, detalles);
  statusEl.className = 'save-status ' + (result.ok ? 'ok' : 'error');
  statusEl.textContent = result.msg;
}

document.getElementById('start-exam-btn').addEventListener('click', startExam);
document.getElementById('retry-exam-btn').addEventListener('click', () => {
  document.getElementById('exam-result-screen').style.display = 'none';
  document.getElementById('exam-start-screen').style.display = 'block';
});

// Inicialización
renderTarea();
showExercise();
