import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Fetch all cards (Master + Custom) dynamically from Supabase Database
export async function fetchAllCardsFromSupabase() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('custom_decks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase cards fetch error:', error);
      return null;
    }
    return data || [];
  } catch (e) {
    console.warn('Supabase not connected:', e);
    return null;
  }
}

// Insert new custom card deck into Supabase Database
export async function saveCardToSupabase(cardObj) {
  if (!supabase) return null;
  try {
    const payload = {
      prompt: cardObj.prompt,
      penalty: cardObj.penalty || 'ดื่ม 1 ยก',
      deck_type: cardObj.deckType || 'truth_or_dare',
      intensity: cardObj.intensity || 'free',
      type: cardObj.type || 'truth',
      is_master: false
    };

    const { data, error } = await supabase
      .from('custom_decks')
      .insert([payload])
      .select();

    if (error) {
      console.warn('Supabase insert card error:', error);
      return null;
    }
    return data;
  } catch (e) {
    console.warn('Failed to insert card to Supabase:', e);
    return null;
  }
}
