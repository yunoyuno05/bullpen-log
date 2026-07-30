import { createClient } from '@supabase/supabase-js';

const env = (import.meta as unknown as { env: Record<string, string> }).env || {};

const SUPABASE_URL = env.VITE_SUPABASE_URL || 'https://xvqhhcmqmvrbihasnsch.supabase.co';
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_hyNGDk0SkybbtGzqEHzKtA_-a8UqNrv';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

