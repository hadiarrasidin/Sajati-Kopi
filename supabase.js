import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://njzcxmszjcicwpxrkszg.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_yo_S7xptB6xR7Sftu2WCsw_xEOtno1f';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);