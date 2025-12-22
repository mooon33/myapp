import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ygvpycmjsrfxismnszir.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_tALnQWCSkKn_1VYYP97oIw_cXryV808'; // В реальном проекте используй process.env

// Клиент для взаимодействия с базой данных
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);