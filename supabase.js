import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ysnbcylcuvkvwowhfsnf.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_-932F7QJP1z9lYRZaZRheg_Nm6xoOkj';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);