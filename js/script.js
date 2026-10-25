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
  if (typeof updatePrintStudentInfo === "function") updatePrintStudentInfo();
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
// updatePrintStudentInfo se llama al final tras definirla

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
// Tarea (solo impresión)
// ============================================

const tareaExercises = [
  { problem: '(3x² + 5x − 2) + (2x² − 3x + 7)' },
  { problem: '(4x³ − 2x² + x) + (−x³ + 5x² − 3x + 1)' },
  { problem: '(5x² + 3x − 4) − (2x² − x + 6)' },
  { problem: '(7x³ − 4x + 2) − (3x³ + 5x² − x − 8)' },
  { problem: '3x · (2x² − 5x + 4)' },
  { problem: '(x + 3)(x − 5)' },
  { problem: '(2x − 1)(x² + 3x − 4)' },
  { problem: '(12x⁵ − 8x³ + 4x²) ÷ 4x²' },
  { problem: '(8x³ − 12x² + 4x) ÷ 4x' },
  { problem: '(x³ − 2x² − 5x + 6) ÷ (x − 3)' }
];

function renderTareaPrint() {
  const list = document.getElementById('tarea-print-list');
  if (!list) return;
  list.innerHTML = '';
  tareaExercises.forEach((ex, i) => {
    const div = document.createElement('div');
    div.className = 'print-exercise';
    div.innerHTML = `
      <div><span class="ex-num">${i + 1}.</span> <span class="ex-problem">${ex.problem}</span></div>
      <div class="work-space"></div>
    `;
    list.appendChild(div);
  });
}

function updatePrintStudentInfo() {
  if (!studentData) {
    document.getElementById('print-nombre').textContent = '_______________________________';
    document.getElementById('print-grupo').textContent = '________';
    document.getElementById('print-horario').textContent = '________';
  } else {
    document.getElementById('print-nombre').textContent = studentData.nombre;
    document.getElementById('print-grupo').textContent = studentData.grupo;
    document.getElementById('print-horario').textContent = studentData.horario;
  }
  const hoy = new Date();
  document.getElementById('print-fecha').textContent =
    hoy.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

document.getElementById('print-tarea').addEventListener('click', () => {
  if (!studentData) {
    alert('Debes registrar tus datos primero para que aparezcan en la hoja de tarea.');
    showModal();
    return;
  }
  updatePrintStudentInfo();
  window.print();
});

// ============================================
// Examen Final — Opción múltiple + imagen
// ============================================

let examQuestions = [];
let examAnswers = [];      // índice de la opción elegida (0-3) o null
let currentQIndex = 0;
let examTimer = null;
let timeLeft = 30 * 60;
let procedureImageData = null; // base64 de la imagen

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateDistractors(correctPoly) {
  // Genera 3 distractores a partir del polinomio correcto
  const distractors = [];
  const correctStr = polyToString(correctPoly);

  // 1. Cambiar un signo
  const keys = Object.keys(correctPoly).map(Number);
  if (keys.length > 0) {
    const k = keys[Math.floor(Math.random() * keys.length)];
    const d1 = { ...correctPoly };
    d1[k] = -d1[k];
    if (d1[k] === 0) delete d1[k];
    distractors.push(polyToString(d1));
  }

  // 2. Sumar/restar 1 a un coeficiente
  if (keys.length > 0) {
    const k = keys[0];
    const d2 = { ...correctPoly };
    d2[k] = (d2[k] || 0) + (Math.random() < 0.5 ? 1 : -1);
    if (d2[k] === 0) delete d2[k];
    distractors.push(polyToString(d2));
  }

  // 3. Polinomio aleatorio similar
  const d3 = randomPoly(2, 4);
  distractors.push(polyToString(d3));

  // Asegurar 3 distintos y distintos del correcto
  const unique = [];
  for (const d of distractors) {
    if (d !== correctStr && !unique.includes(d)) unique.push(d);
  }
  while (unique.length < 3) {
    const extra = polyToString(randomPoly(2, 5));
    if (extra !== correctStr && !unique.includes(extra)) unique.push(extra);
  }
  return unique.slice(0, 3);
}

function generateExamQuestions() {
  const types = ['suma', 'resta', 'multiplicacion', 'division'];
  const qs = [];
  for (let i = 0; i < 10; i++) {
    const type = types[i % 4];
    const ex = generateExercise(type);
    const correctStr = polyToString(ex.result);
    const distractors = generateDistractors(ex.result);
    const options = shuffleArray([correctStr, ...distractors]);
    const correctIndex = options.indexOf(correctStr);
    qs.push({
      problem: ex.problemStr,
      options,
      correctIndex,
      correctStr,
      type
    });
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
  examAnswers = new Array(10).fill(null);
  currentQIndex = 0;
  timeLeft = 30 * 60;
  procedureImageData = null;

  // Reset upload UI
  const fileInput = document.getElementById('procedure-image');
  if (fileInput) fileInput.value = '';
  const preview = document.getElementById('image-preview');
  if (preview) preview.style.display = 'none';

  document.getElementById('exam-start-screen').style.display = 'none';
  document.getElementById('exam-result-screen').style.display = 'none';
  const cam = document.getElementById('exam-camera-screen');
  if (cam) cam.style.display = 'none';
  document.getElementById('exam-active-screen').style.display = 'block';
  capturedPhotos = [];
  stopCamera && stopCamera();

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
      finishExamQuestions();
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
    dot.className = 'q-dot' + (i === currentQIndex ? ' current' : '') + (examAnswers[i] !== null ? ' answered' : '');
    dot.textContent = i + 1;
    dot.addEventListener('click', () => {
      currentQIndex = i;
      showExamQuestion();
    });
    container.appendChild(dot);
  }
}

function showExamQuestion() {
  const q = examQuestions[currentQIndex];
  document.getElementById('current-q').textContent = currentQIndex + 1;

  const letters = ['A', 'B', 'C', 'D'];
  let optionsHtml = '<div class="mc-options">';
  q.options.forEach((opt, idx) => {
    const selected = examAnswers[currentQIndex] === idx ? 'selected' : '';
    const checked = examAnswers[currentQIndex] === idx ? 'checked' : '';
    optionsHtml += `
      <label class="mc-option ${selected}">
        <input type="radio" name="mc-q" value="${idx}" ${checked}>
        <span class="mc-letter">${letters[idx]})</span>
        <span>${opt}</span>
      </label>
    `;
  });
  optionsHtml += '</div>';

  document.getElementById('exam-question').innerHTML = `
    <div class="q-text">${currentQIndex + 1}. ${q.problem}</div>
    ${optionsHtml}
  `;

  // Event listeners para opciones
  document.querySelectorAll('.mc-option').forEach((label, idx) => {
    label.addEventListener('click', () => {
      examAnswers[currentQIndex] = idx;
      document.querySelectorAll('.mc-option').forEach(l => l.classList.remove('selected'));
      label.classList.add('selected');
      label.querySelector('input').checked = true;
      renderQDots();
    });
  });

  renderQDots();
}

document.getElementById('prev-q').addEventListener('click', () => {
  if (currentQIndex > 0) {
    currentQIndex--;
    showExamQuestion();
  }
});

document.getElementById('next-q').addEventListener('click', () => {
  if (currentQIndex < 9) {
    currentQIndex++;
    showExamQuestion();
  }
});

// Subida de imagen de procedimientos
document.getElementById('procedure-image').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 4 * 1024 * 1024) {
    alert('La imagen es muy grande. Máximo 4 MB.');
    e.target.value = '';
    return;
  }
  const reader = new FileReader();
  reader.onload = (ev) => {
    procedureImageData = ev.target.result;
    document.getElementById('preview-img').src = procedureImageData;
    document.getElementById('image-preview').style.display = 'block';
  };
  reader.readAsDataURL(file);
});

document.getElementById('remove-image').addEventListener('click', () => {
  procedureImageData = null;
  document.getElementById('procedure-image').value = '';
  document.getElementById('image-preview').style.display = 'none';
});

// Estado del examen al calificar (antes de fotos)
let pendingExamScore = 0;
let pendingExamDetalles = [];
let capturedPhotos = []; // array de dataURLs
let cameraStream = null;
let useFrontCamera = false;

document.getElementById('submit-exam-btn').addEventListener('click', () => {
  if (confirm('¿Terminar el examen y pasar a fotografiar tus procedimientos?')) {
    finishExamQuestions();
  }
});

function finishExamQuestions() {
  clearInterval(examTimer);

  // Si hay dibujo en pizarra, incluirlo como primera "foto"
  if (examPad && !examPad.isEmpty()) {
    try {
      const padImg = examPad.toDataURL('image/jpeg', 0.8);
      if (!procedureImageData) procedureImageData = padImg;
    } catch (e) {}
  }

  let score = 0;
  const detalles = [];
  const letters = ['A', 'B', 'C', 'D'];

  examQuestions.forEach((q, i) => {
    const chosen = examAnswers[i];
    const ok = chosen !== null && chosen === q.correctIndex;
    if (ok) score++;
    detalles.push({
      numero: i + 1,
      problema: q.problem,
      opciones: q.options,
      respuestaAlumno: chosen !== null ? letters[chosen] + ') ' + q.options[chosen] : '(sin responder)',
      respuestaCorrecta: letters[q.correctIndex] + ') ' + q.correctStr,
      correcto: ok
    });
  });

  pendingExamScore = score;
  pendingExamDetalles = detalles;
  capturedPhotos = [];

  // Si ya había una imagen subida durante el examen, agregarla
  if (procedureImageData) {
    capturedPhotos.push(procedureImageData);
  }

  document.getElementById('exam-active-screen').style.display = 'none';
  document.getElementById('exam-result-screen').style.display = 'none';
  document.getElementById('exam-camera-screen').style.display = 'block';

  renderCapturedPhotos();
  // Abrir cámara automáticamente
  setTimeout(() => startCamera(), 300);
}

function renderCapturedPhotos() {
  const container = document.getElementById('captured-photos');
  container.innerHTML = '';
  capturedPhotos.forEach((dataUrl, i) => {
    const div = document.createElement('div');
    div.className = 'captured-photo';
    div.innerHTML = `
      <img src="${dataUrl}" alt="Foto ${i + 1}">
      <button type="button" class="remove-photo" data-idx="${i}" title="Quitar">×</button>
    `;
    container.appendChild(div);
  });
  container.querySelectorAll('.remove-photo').forEach(btn => {
    btn.addEventListener('click', () => {
      capturedPhotos.splice(Number(btn.dataset.idx), 1);
      renderCapturedPhotos();
    });
  });
  document.getElementById('finish-with-photos-btn').disabled = capturedPhotos.length === 0;
}

async function startCamera() {
  stopCamera();
  const video = document.getElementById('camera-video');
  const placeholder = document.getElementById('camera-placeholder');
  try {
    const constraints = {
      video: {
        facingMode: useFrontCamera ? 'user' : 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    };
    cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = cameraStream;
    video.classList.add('active');
    placeholder.classList.add('hidden');
    document.getElementById('start-camera-btn').style.display = 'none';
    document.getElementById('capture-photo-btn').style.display = 'inline-block';
    document.getElementById('switch-camera-btn').style.display = 'inline-block';
    document.getElementById('stop-camera-btn').style.display = 'inline-block';
  } catch (err) {
    console.error('Cámara:', err);
    placeholder.classList.remove('hidden');
    placeholder.innerHTML = '<p>No se pudo acceder a la cámara.<br>Usa "Subir desde galería" o permite el permiso de cámara.</p>';
    document.getElementById('start-camera-btn').style.display = 'inline-block';
    alert('No se pudo abrir la cámara. Revisa los permisos del navegador o sube fotos desde la galería.');
  }
}

function stopCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach(t => t.stop());
    cameraStream = null;
  }
  const video = document.getElementById('camera-video');
  if (video) {
    video.srcObject = null;
    video.classList.remove('active');
  }
  const placeholder = document.getElementById('camera-placeholder');
  if (placeholder) placeholder.classList.remove('hidden');
  const cap = document.getElementById('capture-photo-btn');
  const sw = document.getElementById('switch-camera-btn');
  const st = document.getElementById('stop-camera-btn');
  const start = document.getElementById('start-camera-btn');
  if (cap) cap.style.display = 'none';
  if (sw) sw.style.display = 'none';
  if (st) st.style.display = 'none';
  if (start) start.style.display = 'inline-block';
}

function capturePhoto() {
  const video = document.getElementById('camera-video');
  const canvas = document.getElementById('camera-snapshot');
  if (!video || !video.srcObject || video.videoWidth === 0) {
    alert('La cámara aún no está lista.');
    return;
  }
  // Limitar tamaño para no saturar Supabase
  const maxW = 1024;
  let w = video.videoWidth;
  let h = video.videoHeight;
  if (w > maxW) {
    h = Math.round(h * (maxW / w));
    w = maxW;
  }
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, w, h);
  const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
  capturedPhotos.push(dataUrl);
  renderCapturedPhotos();
}

// Botones de cámara
document.getElementById('start-camera-btn').addEventListener('click', startCamera);
document.getElementById('capture-photo-btn').addEventListener('click', capturePhoto);
document.getElementById('switch-camera-btn').addEventListener('click', () => {
  useFrontCamera = !useFrontCamera;
  startCamera();
});
document.getElementById('stop-camera-btn').addEventListener('click', stopCamera);

document.getElementById('gallery-upload').addEventListener('change', (e) => {
  const files = Array.from(e.target.files || []);
  files.forEach(file => {
    if (!file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Una imagen es muy grande (máx. 5 MB): ' + file.name);
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      capturedPhotos.push(ev.target.result);
      renderCapturedPhotos();
    };
    reader.readAsDataURL(file);
  });
  e.target.value = '';
});

document.getElementById('finish-with-photos-btn').addEventListener('click', () => {
  stopCamera();
  finalizeExamAndSave();
});

document.getElementById('skip-photos-btn').addEventListener('click', () => {
  if (capturedPhotos.length === 0 && !confirm('¿Continuar sin fotos de procedimientos?')) return;
  stopCamera();
  finalizeExamAndSave();
});

async function finalizeExamAndSave() {
  const score = pendingExamScore;
  const detalles = pendingExamDetalles;
  const letters = ['A', 'B', 'C', 'D'];

  // Preparar revisión visual
  const review = document.getElementById('exam-review');
  review.innerHTML = '';
  detalles.forEach((d) => {
    const div = document.createElement('div');
    div.className = 'review-item ' + (d.correcto ? 'ok' : 'fail');
    div.innerHTML = `
      <strong>${d.numero}.</strong> ${d.problema}<br>
      Tu respuesta: ${d.respuestaAlumno}
      ${d.correcto ? ' ✅' : ' ❌ Correcta: ' + d.respuestaCorrecta}
    `;
    review.appendChild(div);
  });

  // Mostrar miniaturas de fotos en resultados
  if (capturedPhotos.length > 0) {
    const photosDiv = document.createElement('div');
    photosDiv.style.cssText = 'margin:1rem 0;display:flex;flex-wrap:wrap;gap:0.5rem;justify-content:center;';
    photosDiv.innerHTML = '<p style="width:100%;text-align:center;font-weight:500;">Fotos de procedimientos:</p>';
    capturedPhotos.forEach((url, i) => {
      const img = document.createElement('img');
      img.src = url;
      img.alt = 'Procedimiento ' + (i + 1);
      img.style.cssText = 'width:100px;height:75px;object-fit:cover;border-radius:6px;border:1px solid #ccc;';
      photosDiv.appendChild(img);
    });
    review.prepend(photosDiv);
  }

  document.getElementById('final-score').textContent = score;
  const msg = document.getElementById('score-message');
  if (score >= 9) msg.textContent = '¡Excelente trabajo! Dominas las operaciones algebraicas.';
  else if (score >= 7) msg.textContent = 'Muy bien. Sigue practicando para perfeccionar.';
  else if (score >= 5) msg.textContent = 'Aprobado. Revisa los temas donde tuviste errores.';
  else msg.textContent = 'Necesitas reforzar más. Revisa la teoría y vuelve a intentar.';

  document.getElementById('exam-camera-screen').style.display = 'none';
  document.getElementById('exam-result-screen').style.display = 'block';

  const statusEl = document.getElementById('exam-save-status');
  statusEl.className = 'save-status info';
  statusEl.textContent = 'Guardando resultados e imágenes en la base de datos...';

  // Limitar tamaño total de imágenes para JSON
  const imagenes = [];
  let totalSize = 0;
  const maxTotal = 1200000; // ~1.2 MB en base64
  for (const img of capturedPhotos) {
    if (totalSize + img.length > maxTotal) {
      imagenes.push({ omitida: true, razon: 'límite de tamaño' });
      break;
    }
    imagenes.push(img);
    totalSize += img.length;
  }

  const payload = {
    respuestas: detalles,
    cantidadFotos: capturedPhotos.length,
    imagenesProcedimientos: imagenes,
    tieneImagenProcedimientos: capturedPhotos.length > 0
  };

  const result = await saveResultToSupabase('examen', score, 10, payload);
  statusEl.className = 'save-status ' + (result.ok ? 'ok' : 'error');
  statusEl.textContent = result.msg + (capturedPhotos.length ? ` (${capturedPhotos.length} foto(s) incluidas)` : '');
}

document.getElementById('start-exam-btn').addEventListener('click', startExam);
document.getElementById('retry-exam-btn').addEventListener('click', () => {
  stopCamera();
  document.getElementById('exam-result-screen').style.display = 'none';
  document.getElementById('exam-camera-screen').style.display = 'none';
  document.getElementById('exam-start-screen').style.display = 'block';
});

// Al agotarse el tiempo también va a la cámara
// (submitExam ya no existe; el timer llama finishExamQuestions)


// Inicialización
renderTareaPrint();
updatePrintStudentInfo();
showExercise();

// ============================================
// Pizarra digital — lápiz óptico / stylus (corregido)
// ============================================

class DrawingPad {
  constructor(canvasId, opts = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.tool = 'pen';
    this.color = opts.color || '#1a3a6e';
    this.lineWidth = opts.lineWidth || 3;
    this.drawing = false;
    this.lastX = 0;
    this.lastY = 0;
    this.pointerId = null;

    // Atributos HTML iniciales (tamaño de referencia)
    this.baseW = parseInt(this.canvas.getAttribute('width'), 10) || 800;
    this.baseH = parseInt(this.canvas.getAttribute('height'), 10) || 220;

    this._fitToDisplay();
    this._bind();

    // Reajustar si cambia el tamaño de la ventana
    this._resizeObserver = new ResizeObserver(() => {
      // Guardar dibujo actual
      let backup = null;
      try { backup = this.canvas.toDataURL(); } catch (e) {}
      this._fitToDisplay();
      if (backup) {
        const img = new Image();
        img.onload = () => {
          this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
        };
        img.src = backup;
      }
    });
    this._resizeObserver.observe(this.canvas.parentElement || this.canvas);
  }

  _fitToDisplay() {
    const parent = this.canvas.parentElement;
    const cssW = (parent && parent.clientWidth) ? parent.clientWidth : this.baseW;
    const ratio = this.baseH / this.baseW;
    const cssH = Math.max(160, Math.round(cssW * ratio));

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Resolución interna (píxeles reales del buffer)
    this.canvas.width = Math.floor(cssW * dpr);
    this.canvas.height = Math.floor(cssH * dpr);

    // Tamaño visual en CSS
    this.canvas.style.width = cssW + 'px';
    this.canvas.style.height = cssH + 'px';

    // Dibujar en coordenadas CSS (más simple para el lápiz)
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.imageSmoothingEnabled = true;

    this.cssW = cssW;
    this.cssH = cssH;
  }

  /** Coordenadas relativas al canvas en espacio CSS */
  _coords(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * this.cssW;
    const y = ((e.clientY - rect.top) / rect.height) * this.cssH;
    return { x, y };
  }

  _start(e) {
    // Solo un puntero a la vez
    if (this.drawing) return;
    e.preventDefault();
    e.stopPropagation();

    this.drawing = true;
    this.pointerId = e.pointerId;

    try {
      this.canvas.setPointerCapture(e.pointerId);
    } catch (err) {}

    const { x, y } = this._coords(e);
    this.lastX = x;
    this.lastY = y;

    // Punto inicial
    this.ctx.beginPath();
    this.ctx.fillStyle = this.tool === 'eraser' ? '#000' : this.color;
    this.ctx.globalCompositeOperation = this.tool === 'eraser' ? 'destination-out' : 'source-over';
    this.ctx.arc(x, y, this.lineWidth / 2, 0, Math.PI * 2);
    this.ctx.fill();
  }

  _move(e) {
    if (!this.drawing) return;
    // Ignorar otros punteros (palma, segundo dedo, etc.)
    if (this.pointerId !== null && e.pointerId !== this.pointerId) return;

    e.preventDefault();
    e.stopPropagation();

    const { x, y } = this._coords(e);

    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(x, y);
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    if (this.tool === 'eraser') {
      this.ctx.globalCompositeOperation = 'destination-out';
      this.ctx.strokeStyle = '#000';
      this.ctx.lineWidth = this.lineWidth * 4;
    } else {
      this.ctx.globalCompositeOperation = 'source-over';
      this.ctx.strokeStyle = this.color;
      this.ctx.lineWidth = this.lineWidth;
    }
    this.ctx.stroke();

    this.lastX = x;
    this.lastY = y;
  }

  _end(e) {
    if (!this.drawing) return;
    if (e && this.pointerId !== null && e.pointerId !== this.pointerId) return;

    if (e) {
      e.preventDefault();
      try {
        this.canvas.releasePointerCapture(e.pointerId);
      } catch (err) {}
    }

    this.drawing = false;
    this.pointerId = null;
  }

  _bind() {
    const c = this.canvas;

    // Solo Pointer Events (cubre mouse, dedo y lápiz óptico)
    // NO añadir touch* a la vez: provoca doble trazo o que el stylus se cancele
    c.addEventListener('pointerdown', (e) => this._start(e));
    c.addEventListener('pointermove', (e) => this._move(e));
    c.addEventListener('pointerup', (e) => this._end(e));
    c.addEventListener('pointercancel', (e) => this._end(e));
    // NO usar pointerleave: el stylus a veces lo dispara al escribir y corta el trazo

    // Evitar menú contextual / selección al escribir
    c.addEventListener('contextmenu', (e) => e.preventDefault());
    c.addEventListener('selectstart', (e) => e.preventDefault());
  }

  setTool(t) { this.tool = t; }
  setColor(c) { this.color = c; }
  setLineWidth(w) { this.lineWidth = Math.max(1, Number(w) || 3); }

  clear() {
    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  isEmpty() {
    try {
      const data = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height).data;
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] !== 0) return false;
      }
    } catch (e) {
      return true;
    }
    return true;
  }

  toDataURL(type = 'image/png', quality) {
    return this.canvas.toDataURL(type, quality);
  }
}

let exercisePad = null;
let examPad = null;

function initDrawingPads() {
  exercisePad = new DrawingPad('exercise-canvas', { color: '#1a3a6e', lineWidth: 3 });
  examPad = new DrawingPad('exam-canvas', { color: '#1a3a6e', lineWidth: 3 });

  const el = (id) => document.getElementById(id);

  document.querySelectorAll('.tool-btn[data-pad="exercise"]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tool-btn[data-pad="exercise"]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (exercisePad) exercisePad.setTool(btn.dataset.tool);
    });
  });
  if (el('exercise-pen-color')) el('exercise-pen-color').addEventListener('input', e => exercisePad && exercisePad.setColor(e.target.value));
  if (el('exercise-pen-size')) el('exercise-pen-size').addEventListener('input', e => exercisePad && exercisePad.setLineWidth(e.target.value));
  if (el('exercise-clear-canvas')) el('exercise-clear-canvas').addEventListener('click', () => exercisePad && exercisePad.clear());

  document.querySelectorAll('.tool-btn[data-pad="exam"]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tool-btn[data-pad="exam"]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (examPad) examPad.setTool(btn.dataset.tool);
    });
  });
  if (el('exam-pen-color')) el('exam-pen-color').addEventListener('input', e => examPad && examPad.setColor(e.target.value));
  if (el('exam-pen-size')) el('exam-pen-size').addEventListener('input', e => examPad && examPad.setLineWidth(e.target.value));
  if (el('exam-clear-canvas')) {
    el('exam-clear-canvas').addEventListener('click', () => {
      if (confirm('¿Limpiar toda la pizarra de procedimientos?')) examPad && examPad.clear();
    });
  }

  if (el('new-exercise-btn')) {
    el('new-exercise-btn').addEventListener('click', () => setTimeout(() => exercisePad && exercisePad.clear(), 30));
  }
  if (el('start-exam-btn')) {
    el('start-exam-btn').addEventListener('click', () => setTimeout(() => {
      if (examPad) {
        examPad._fitToDisplay();
        examPad.clear();
      }
    }, 150));
  }

  // Antes de enviar: exportar pizarra si no hay foto
  if (el('submit-exam-btn')) {
    el('submit-exam-btn').addEventListener('click', () => {
      if (typeof procedureImageData !== 'undefined' && !procedureImageData && examPad && !examPad.isEmpty()) {
        try {
          procedureImageData = examPad.toDataURL('image/jpeg', 0.8);
        } catch (err) {}
      }
    }, true);
  }
}

// Inicializar pizarras (después del resto del DOM)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDrawingPads);
} else {
  // Pequeño delay para asegurar layout
  setTimeout(initDrawingPads, 50);
}
