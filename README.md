# Sistema de Operaciones Algebraicas — Prepa CONAMAT

Sistema web interactivo para el aprendizaje de **operaciones algebraicas** (suma, resta, multiplicación y división de polinomios).

**Realizado por:** Prof. Fabián Soberanes Martín  
**Institución:** Prepa CONAMAT — Educando para el futuro

---

## Características

- **Registro del alumno**: nombre completo, grupo y horario
- **Teoría y ejemplos** paso a paso
- **Ejercicios interactivos** con generación aleatoria y retroalimentación inmediata
- **Tarea** imprimible: 10 ejercicios con datos del alumno y espacios para procedimientos a mano
- **Examen final** de 30 minutos en **opción múltiple** (10 preguntas)
- Subida de **foto de la hoja de procedimientos** en el examen
- Resultados del examen se guardan en **Supabase** (incluye imagen si no es muy pesada)
- Logo CONAMAT en encabezado y en la hoja de tarea

---

## Estructura del proyecto

```
operaciones-algebraicas/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── config.js      ← Configuración de Supabase
│   └── script.js
├── assets/
│   └── conamat_logo.png
├── README.md
└── .gitignore
```

---

## Cómo subir a GitHub

1. Crea un repositorio nuevo en GitHub (ej: `operaciones-algebraicas`).
2. En la carpeta del proyecto ejecuta:

```bash
git init
git add .
git commit -m "Sistema de Operaciones Algebraicas - Prepa CONAMAT"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/operaciones-algebraicas.git
git push -u origin main
```

3. Para publicarlo con **GitHub Pages**:
   - Ve a Settings → Pages
   - Source: Deploy from a branch → `main` → `/ (root)`
   - Guarda. La URL será: `https://TU-USUARIO.github.io/operaciones-algebraicas/`

---

## Configuración de Supabase (guardar resultados)

### 1. Crear proyecto

1. Entra a [https://supabase.com](https://supabase.com) y crea una cuenta / proyecto.
2. Ve a **Settings → API**.
3. Copia:
   - **Project URL**
   - **anon public** key

### 2. Configurar el sistema

Abre el archivo `js/config.js` y reemplaza:

```js
const SUPABASE_URL = 'https://TU-PROYECTO.supabase.co';
const SUPABASE_ANON_KEY = 'TU-ANON-KEY-AQUI';
```

por tus valores reales.

### 3. Crear la tabla `resultados`

En el **SQL Editor** de Supabase ejecuta:

```sql
CREATE TABLE resultados (
  id BIGSERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  grupo TEXT NOT NULL,
  horario TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('tarea', 'examen')),
  puntuacion INTEGER NOT NULL,
  total INTEGER NOT NULL DEFAULT 10,
  detalles JSONB,
  fecha TIMESTAMPTZ DEFAULT NOW()
);

-- Permitir inserción desde el cliente (anon key)
ALTER TABLE resultados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir inserción pública"
  ON resultados
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- (Opcional) Solo el profesor puede leer con la service_role key
CREATE POLICY "Solo lectura autenticada"
  ON resultados
  FOR SELECT
  TO authenticated
  USING (true);
```

### 4. Ver resultados

- En el **Table Editor** de Supabase verás todos los registros.
- Cada fila incluye: nombre, grupo, horario, tipo (tarea/examen), puntuación, detalles de cada respuesta y fecha.

---

## Uso local

Abre `index.html` en el navegador (doble clic o con un servidor local):

```bash
# Opcional: servidor simple
npx serve .
# o
python -m http.server 8000
```

Si Supabase no está configurado, los resultados se guardan **localmente** en el navegador (localStorage) como respaldo.

---

## Notas

- El alumno debe ingresar nombre, grupo y horario al inicio.
- Los datos del alumno se guardan en `localStorage` para no pedirlos cada vez.
- Se puede cambiar de alumno con el botón "Cambiar" del encabezado.
- El examen tiene límite de **30 minutos** y se envía automáticamente al terminar el tiempo.

---

© 2026 Prepa CONAMAT · Prof. Fabián Soberanes Martín
