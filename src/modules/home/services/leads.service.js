import { createSupabaseClient } from '../../../db/supabase.js';

export const LEAD_SUBMISSION_ERROR_TYPES = {
	NETWORK: 'NETWORK',
	TABLE_MISSING: 'TABLE_MISSING',
	PERMISSION_DENIED: 'PERMISSION_DENIED',
	UNKNOWN: 'UNKNOWN',
};

function createSubmissionError(type, message, cause) {
	return {
		type,
		message,
		cause,
	};
}

function mapSupabaseError(error) {
	const message = error?.message || 'Unknown error';

	if (
		error?.code === 'PGRST116' ||
		message.includes('relation') ||
		message.includes('does not exist')
	) {
		return createSubmissionError(
			LEAD_SUBMISSION_ERROR_TYPES.TABLE_MISSING,
			'La tabla de leads no existe todavía en Supabase.',
			error,
		);
	}

	if (
		error?.code === '42501' ||
		message.toLowerCase().includes('row-level security') ||
		message.toLowerCase().includes('permission denied')
	) {
		return createSubmissionError(
			LEAD_SUBMISSION_ERROR_TYPES.PERMISSION_DENIED,
			'La policy de Supabase no permite insertar leads desde el formulario.',
			error,
		);
	}

	return createSubmissionError(
		LEAD_SUBMISSION_ERROR_TYPES.UNKNOWN,
		'No fue posible guardar el lead en Supabase.',
		error,
	);
}

function normalizeLead(lead) {
	return {
		name: lead.name.trim(),
		phone: lead.phone.trim(),
		email: lead.email?.trim() || null,
		service: lead.service.trim(),
		message: lead.message.trim(),
	};
}

export async function createLead({ supabaseUrl, supabaseKey, leadsTable, lead }) {
	const supabase = createSupabaseClient(supabaseUrl, supabaseKey);

	try {
		const { error } = await supabase.from(leadsTable).insert(normalizeLead(lead));

		if (error) {
			throw mapSupabaseError(error);
		}
	} catch (error) {
		if (error?.type) {
			throw error;
		}

		throw createSubmissionError(
			LEAD_SUBMISSION_ERROR_TYPES.NETWORK,
			'No se pudo conectar con Supabase. Revisa tu internet o la configuración del proyecto.',
			error,
		);
	}
}
