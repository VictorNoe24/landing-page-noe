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

function openModal(modalElement, modalCard, modalTitle, modalDescription, status, title, description) {
	modalTitle.textContent = title;
	modalDescription.textContent = description;
	modalCard.classList.remove('is-success', 'is-error');
	modalCard.classList.add(status === 'success' ? 'is-success' : 'is-error');
	modalElement.hidden = false;
	document.body.style.overflow = 'hidden';
}

function closeModal(modalElement) {
	modalElement.hidden = true;
	document.body.style.overflow = '';
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
		const modalElement = form.parentElement?.querySelector('[data-form-modal]');
		const modalCard = modalElement?.querySelector('.form-modal__card');
		const modalTitle = modalElement?.querySelector('[data-form-modal-title]');
		const modalDescription = modalElement?.querySelector('[data-form-modal-description]');
		const modalCloseButtons = modalElement?.querySelectorAll('[data-form-modal-close]');

		if (!messageElement || !submitButton || !submitLabel) {
			return;
		}

		if (modalElement && modalCard && modalTitle && modalDescription && modalCloseButtons) {
			modalCloseButtons.forEach((button) => {
				button.addEventListener('click', () => closeModal(modalElement));
			});

			document.addEventListener('keydown', (event) => {
				if (event.key === 'Escape' && !modalElement.hidden) {
					closeModal(modalElement);
				}
			});
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
				if (modalElement && modalCard && modalTitle && modalDescription) {
					openModal(
						modalElement,
						modalCard,
						modalTitle,
						modalDescription,
						'success',
						'Mensaje enviado',
						'Gracias. Recibimos tus datos y te contactaremos pronto para revisar tu proyecto.',
					);
				}
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
				if (modalElement && modalCard && modalTitle && modalDescription) {
					openModal(
						modalElement,
						modalCard,
						modalTitle,
						modalDescription,
						'success',
						'Mensaje enviado',
						'Gracias. Recibimos tus datos y te contactaremos pronto para revisar tu proyecto.',
					);
				}
			} catch (error) {
				console.error('Error saving lead to Supabase:', error);
				const errorMessage = getErrorMessage(error?.type);
				setFormMessage(messageElement, 'error', errorMessage);
				if (modalElement && modalCard && modalTitle && modalDescription) {
					openModal(
						modalElement,
						modalCard,
						modalTitle,
						modalDescription,
						'error',
						'No pudimos enviar tu solicitud',
						errorMessage,
					);
				}
			} finally {
				submitButton.disabled = false;
				submitLabel.textContent = defaultButtonText;
			}
		});
	});
}
