import { createSupabaseClient } from '../../../db/supabase.js';

let authClient;

function getAuthClient() {
	if (authClient) {
		return authClient;
	}

	authClient = createSupabaseClient(
		import.meta.env.PUBLIC_SUPABASE_URL,
		import.meta.env.PUBLIC_SUPABASE_KEY,
	);

	return authClient;
}

export async function signInWithPassword({ email, password }) {
	const { data, error } = await getAuthClient().auth.signInWithPassword({
		email,
		password,
	});

	if (error) {
		throw error;
	}

	return data;
}

export async function signOut() {
	const { error } = await getAuthClient().auth.signOut();

	if (error) {
		throw error;
	}
}

export async function getCurrentSession() {
	const { data, error } = await getAuthClient().auth.getSession();

	if (error) {
		throw error;
	}

	return data.session;
}

export function onAuthStateChange(callback) {
	return getAuthClient().auth.onAuthStateChange((_event, session) => {
		callback(session);
	});
}
