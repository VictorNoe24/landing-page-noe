import { createSupabaseClient } from '../../../db/supabase.js';

let contactsClient;

const DEFAULT_LEAD_STATUSES = [
	{ status_key: 'new', label: 'Nuevo', position: 1 },
	{ status_key: 'no_response', label: 'No contestó', position: 2 },
	{ status_key: 'interested', label: 'Interesado', position: 3 },
	{ status_key: 'quoting', label: 'Cotizando', position: 4 },
	{ status_key: 'won', label: 'Cerrado ganado', position: 5 },
	{ status_key: 'lost', label: 'Cerrado perdido', position: 6 },
];

function getContactsClient() {
	if (contactsClient) {
		return contactsClient;
	}

	contactsClient = createSupabaseClient(
		import.meta.env.PUBLIC_SUPABASE_URL,
		import.meta.env.PUBLIC_SUPABASE_KEY,
	);

	return contactsClient;
}

export async function fetchLeadStatuses() {
	const { data, error } = await getContactsClient()
		.from('lead_statuses')
		.select('status_key,label,position')
		.order('position', { ascending: true });

	if (error) {
		console.warn('Falling back to default lead statuses:', error);
		return DEFAULT_LEAD_STATUSES;
	}

	if (!data?.length) {
		return DEFAULT_LEAD_STATUSES;
	}

	return data;
}

export async function fetchContacts() {
	const { data, error } = await getContactsClient()
		.from(import.meta.env.PUBLIC_SUPABASE_LEADS_TABLE || 'contact_leads')
		.select('id,name,phone,email,service,message,status_key,created_at,updated_at')
		.order('created_at', { ascending: false });

	if (error) {
		throw error;
	}

	return data || [];
}

export async function updateContactStatus({ contactId, statusKey }) {
	const { data, error } = await getContactsClient()
		.from(import.meta.env.PUBLIC_SUPABASE_LEADS_TABLE || 'contact_leads')
		.update({
			status_key: statusKey,
			updated_at: new Date().toISOString(),
		})
		.eq('id', contactId)
		.select('id,status_key,updated_at')
		.single();

	if (error) {
		throw error;
	}

	return data;
}
