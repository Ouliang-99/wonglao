import { createClient } from '@supabase/supabase-js';

// Load Supabase credentials from Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper: Fetch custom decks from Supabase (fallback to LocalStorage)
export async function fetchRemoteCustomDecks() {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase.from('custom_decks').select('*').order('created_at', { ascending: false });
    if (error) {
      console.warn('Supabase fetch error:', error);
      return [];
    }
    return data || [];
  } catch (e) {
    console.warn('Supabase not connected', e);
    return [];
  }
}

// Helper: Save custom deck to Supabase
export async function saveRemoteCustomDeck(deckCard) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('custom_decks').insert([deckCard]).select();
    if (error) console.warn('Supabase insert error:', error);
    return data;
  } catch (e) {
    console.warn('Failed to save to Supabase', e);
    return null;
  }
}
