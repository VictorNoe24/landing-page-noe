import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_KEY;

export function createSupabaseClient(url, key) {
	if (!url) {
		throw new Error('supabaseUrl is required.');
	}

	if (!key) {
		throw new Error('supabaseKey is required.');
	}

	return createClient(url, key);
}

export const supabase =
	supabaseUrl && supabaseKey ? createSupabaseClient(supabaseUrl, supabaseKey) : null;
