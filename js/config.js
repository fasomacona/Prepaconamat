// ============================================
// Configuración de Supabase
// ============================================
// 1. Crea un proyecto en https://supabase.com
// 2. Ve a Settings → API y copia URL y anon key
// 3. Reemplaza los valores de abajo
// 4. Crea la tabla "resultados" (ver README.md)
// ============================================

const SUPABASE_URL = 'https://buqsnwghjbpxqtgvdmhj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_RVcQj3cZGGbsA9DUQ0Fpnw_lwtmdYnN';

// Inicializar cliente (solo si las claves están configuradas)
let supabaseClient = null;

function isSupabaseConfigured() {
  return SUPABASE_URL && 
         !SUPABASE_URL.includes('TU-PROYECTO') && 
         SUPABASE_ANON_KEY && 
         !SUPABASE_ANON_KEY.includes('TU-ANON-KEY');
}

if (typeof supabase !== 'undefined' && isSupabaseConfigured()) {
  supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
