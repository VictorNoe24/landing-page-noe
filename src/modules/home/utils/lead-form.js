import { createLead, LEAD_SUBMISSION_ERROR_TYPES } from '../services/leads.service.js';

function getErrorMessage(errorType) {
	switch (errorType) {
		case LEAD_SUBMISSION_ERROR_TYPES.TABLE_MISSING:
			return 'Falta crear la tabla de leads en Supabase antes de usar este formulario.';
		case LEAD_SUBMISSION_ERROR_TYPES.PERMISSION_DENIED:
			return 'Supabase rechazó el guardado. Revisa las policies de inserción para esta tabla.';
		case LEAD_SUBMISSION_ERROR_TYPES.NETWORK:
			return 'No pudimos conectarnos para enviar tu solicitud. Intenta nuevamente en un momento.';
		default:
			return 'No pudimos guardar tu solicitud en este momento. Intenta nuevamente.';
	}
}

function setFormMessage(messageElement, status, text) {
	messageElement.textContent = text;
	messageElement.hidden = false;
	messageElement.classList.remove('is-success', 'is-error');
	messageElement.classList.add(status === 'success' ? 'is-success' : 'is-error');
}

function clearFormMessage(messageElement) {
	messageElement.textContent = '';
	messageElement.hidden = true;
	messageElement.classList.remove('is-success', 'is-error');
}

export function setupLeadForms() {
	const forms = document.querySelectorAll('[data-lead-form]');

	forms.forEach((form) => {
		if (form.dataset.initialized === 'true') {
			return;
		}

		form.dataset.initialized = 'true';

		const messageElement = form.querySelector('[data-form-message]');
		const submitButton = form.querySelector('[data-submit-button]');
		const submitLabel = form.querySelector('[data-submit-label]');

		if (!messageElement || !submitButton || !submitLabel) {
			return;
		}

		const defaultButtonText = submitLabel?.textContent || 'Enviar Mensaje';

		form.addEventListener('submit', async (event) => {
			event.preventDefault();

			const formData = new FormData(form);
			const website = formData.get('website')?.toString().trim();

			if (website) {
				form.reset();
				setFormMessage(
					messageElement,
					'success',
					'Gracias. Recibimos tus datos y te contactaremos pronto para revisar tu proyecto.',
				);
				return;
			}

			const lead = {
				name: formData.get('name')?.toString().trim() || '',
				phone: formData.get('phone')?.toString().trim() || '',
				email: formData.get('email')?.toString().trim() || '',
				service: formData.get('service')?.toString().trim() || '',
				message: formData.get('message')?.toString().trim() || '',
			};

			if (!lead.name || !lead.phone || !lead.service || !lead.message) {
				setFormMessage(
					messageElement,
					'error',
					'Completa todos los campos obligatorios antes de enviar tu solicitud.',
				);
				return;
			}

			clearFormMessage(messageElement);
			submitButton.disabled = true;
			submitLabel.textContent = 'Enviando...';

			try {
				await createLead({
					supabaseUrl: form.dataset.supabaseUrl,
					supabaseKey: form.dataset.supabaseKey,
					leadsTable: form.dataset.leadsTable,
					lead,
				});

				form.reset();
				setFormMessage(
					messageElement,
					'success',
					'Gracias. Recibimos tus datos y te contactaremos pronto para revisar tu proyecto.',
				);
			} catch (error) {
				console.error('Error saving lead to Supabase:', error);
				setFormMessage(messageElement, 'error', getErrorMessage(error?.type));
			} finally {
				submitButton.disabled = false;
				submitLabel.textContent = defaultButtonText;
			}
		});
	});
}
