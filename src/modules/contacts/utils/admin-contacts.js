import { getCurrentSession, onAuthStateChange } from '../../auth/services/auth.service.js';
import {
	fetchContacts,
	fetchLeadStatuses,
	updateContactStatus,
} from '../services/contacts.service.js';

function setFeedback(feedbackElement, status, text) {
	feedbackElement.textContent = text;
	feedbackElement.hidden = false;
	feedbackElement.classList.remove('is-error', 'is-success');
	feedbackElement.classList.add(status === 'success' ? 'is-success' : 'is-error');
}

function clearFeedback(feedbackElement) {
	feedbackElement.textContent = '';
	feedbackElement.hidden = true;
	feedbackElement.classList.remove('is-error', 'is-success');
}

function formatDate(value) {
	if (!value) {
		return 'Sin fecha';
	}

	return new Intl.DateTimeFormat('es-MX', {
		dateStyle: 'medium',
		timeStyle: 'short',
	}).format(new Date(value));
}

function escapeHtml(value) {
	return String(value || '')
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#039;');
}

function getStatusLabel(statuses, statusKey) {
	return statuses.find((status) => status.status_key === statusKey)?.label || statusKey || 'Sin estatus';
}

function mapContactsError(error) {
	const message = error?.message?.toLowerCase() || '';

	if (message.includes('permission denied') || message.includes('row-level security')) {
		return 'Tu usuario no tiene permisos para consultar o actualizar estos contactos.';
	}

	if (message.includes('relation') || message.includes('does not exist')) {
		return 'Falta crear o actualizar las tablas de contactos y estatus en Supabase.';
	}

	return 'No fue posible consultar los contactos en este momento.';
}

function filterContacts(contacts, activeTab, searchTerm, statusFilter) {
	return contacts.filter((contact) => {
		const normalizedSearch = searchTerm.trim().toLowerCase();
		const haystack = [
			contact.name,
			contact.phone,
			contact.email,
			contact.service,
			contact.message,
		]
			.filter(Boolean)
			.join(' ')
			.toLowerCase();

		if (normalizedSearch && !haystack.includes(normalizedSearch)) {
			return false;
		}

		if (statusFilter !== 'all' && contact.status_key !== statusFilter) {
			return false;
		}

		if (activeTab === 'new') {
			return contact.status_key === 'new';
		}

		if (activeTab === 'active') {
			return ['interested', 'quoting', 'no_response'].includes(contact.status_key);
		}

		return true;
	});
}

function renderTabCounts(panel, contacts) {
	const counts = {
		new: contacts.filter((contact) => contact.status_key === 'new').length,
		active: contacts.filter((contact) =>
			['interested', 'quoting', 'no_response'].includes(contact.status_key),
		).length,
		all: contacts.length,
	};

	Object.entries(counts).forEach(([key, value]) => {
		const counter = panel.querySelector(`[data-contacts-tab-count="${key}"]`);

		if (counter) {
			counter.textContent = String(value);
		}
	});
}

function renderStatusFilterOptions(select, statuses) {
	select.innerHTML = `
		<option value="all">Todos los estatus</option>
		${statuses
			.map(
				(status) => `
					<option value="${escapeHtml(status.status_key)}">${escapeHtml(status.label)}</option>
				`,
			)
			.join('')}
	`;
}

function buildStatusOptions(statuses, currentStatusKey) {
	return statuses
		.map(
			(status) => `
				<option value="${escapeHtml(status.status_key)}" ${status.status_key === currentStatusKey ? 'selected' : ''}>
					${escapeHtml(status.label)}
				</option>
			`,
		)
		.join('');
}

function buildRowsMarkup(contacts, statuses) {
	if (!contacts.length) {
		return `
			<tr>
				<td colspan="6" class="contacts-table__empty">No hay contactos que coincidan con tu búsqueda.</td>
			</tr>
		`;
	}

	return contacts
		.map(
			(contact) => `
				<tr data-contact-row="${contact.id}">
					<td>
						<span class="contacts-table__id">#${escapeHtml(contact.id)}</span>
					</td>
					<td>
						<span class="contacts-table__name">${escapeHtml(contact.name)}</span>
						<span class="contacts-table__primary">${escapeHtml(contact.phone)}</span>
						<span class="contacts-table__subtle">${escapeHtml(contact.email || 'Sin correo')}</span>
						<div class="contacts-table__message">${escapeHtml(contact.message.slice(0, 120))}${contact.message.length > 120 ? '...' : ''}</div>
					</td>
					<td>
						<span class="contacts-table__pill">${escapeHtml(contact.service)}</span>
					</td>
					<td>
						<select class="contacts-table__select" data-contact-status-select data-contact-id="${contact.id}">
							${buildStatusOptions(statuses, contact.status_key)}
						</select>
						<span class="contacts-table__status-badge">${escapeHtml(getStatusLabel(statuses, contact.status_key))}</span>
					</td>
					<td>
						<span class="contacts-table__primary">${escapeHtml(formatDate(contact.created_at))}</span>
						<span class="contacts-table__subtle">
							Actualizado: ${escapeHtml(formatDate(contact.updated_at || contact.created_at))}
						</span>
					</td>
					<td>
						<div class="contacts-table__actions">
							<button
								type="button"
								class="contacts-table__action"
								data-contact-view-button
								data-contact-id="${contact.id}"
								aria-label="Ver detalle"
							>
								<svg viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
									<path d="M7.5 11C10.2614 11 12.5 7.5 12.5 7.5C12.5 7.5 10.2614 4 7.5 4C4.73858 4 2.5 7.5 2.5 7.5C2.5 7.5 4.73858 11 7.5 11Z" stroke="currentColor" stroke-width="1.2"/>
									<path d="M7.5 9C8.32843 9 9 8.32843 9 7.5C9 6.67157 8.32843 6 7.5 6C6.67157 6 6 6.67157 6 7.5C6 8.32843 6.67157 9 7.5 9Z" stroke="currentColor" stroke-width="1.2"/>
								</svg>
							</button>
						</div>
					</td>
				</tr>
			`,
		)
		.join('');
}

export function setupContactsPanel() {
	const panels = document.querySelectorAll('[data-contacts-panel]');

	panels.forEach((panel) => {
		if (panel.dataset.initialized === 'true') {
			return;
		}

		panel.dataset.initialized = 'true';

		const tableBody = panel.querySelector('[data-contacts-table-body]');
		const feedbackElement = panel.querySelector('[data-contacts-feedback]');
		const refreshButton = panel.querySelector('[data-contacts-refresh]');
		const searchInput = panel.querySelector('[data-contacts-search]');
		const statusFilterSelect = panel.querySelector('[data-contacts-status-filter]');
		const tabs = panel.querySelectorAll('[data-contacts-tab]');
		const detailModal = panel.querySelector('[data-contact-detail-modal]');
		const detailName = panel.querySelector('[data-contact-detail-name]');
		const detailPhone = panel.querySelector('[data-contact-detail-phone]');
		const detailEmail = panel.querySelector('[data-contact-detail-email]');
		const detailService = panel.querySelector('[data-contact-detail-service]');
		const detailDate = panel.querySelector('[data-contact-detail-date]');
		const detailMessage = panel.querySelector('[data-contact-detail-message]');
		const detailCloseButtons = panel.querySelectorAll('[data-contact-detail-close]');

		if (
			!tableBody ||
			!feedbackElement ||
			!refreshButton ||
			!searchInput ||
			!statusFilterSelect
		) {
			return;
		}

		let statuses = [];
		let contacts = [];
		let activeTab = 'new';
		let currentSearch = '';
		let currentStatusFilter = 'all';

		function updateTabState() {
			tabs.forEach((tab) => {
				tab.classList.toggle('is-active', tab.dataset.contactsTab === activeTab);
			});
		}

		function renderContactsTable() {
			const visibleContacts = filterContacts(contacts, activeTab, currentSearch, currentStatusFilter);
			renderTabCounts(panel, contacts);
			tableBody.innerHTML = buildRowsMarkup(visibleContacts, statuses);
		}

		function openDetailModal(contact) {
			if (
				!detailModal ||
				!detailName ||
				!detailPhone ||
				!detailEmail ||
				!detailService ||
				!detailDate ||
				!detailMessage
			) {
				return;
			}

			detailName.textContent = contact.name;
			detailPhone.textContent = contact.phone || 'Sin teléfono';
			detailEmail.textContent = contact.email || 'Sin correo';
			detailService.textContent = contact.service || 'Sin servicio';
			detailDate.textContent = formatDate(contact.created_at);
			detailMessage.textContent = contact.message || 'Sin mensaje';
			detailModal.hidden = false;
			document.body.style.overflow = 'hidden';
		}

		function closeDetailModal() {
			if (!detailModal) {
				return;
			}

			detailModal.hidden = true;
			document.body.style.overflow = '';
		}

		async function loadContacts() {
			refreshButton.disabled = true;
			refreshButton.textContent = 'Actualizando...';
			tableBody.innerHTML = `
				<tr>
					<td colspan="6" class="contacts-table__empty">Cargando contactos...</td>
				</tr>
			`;

			try {
				clearFeedback(feedbackElement);
				const [statusesResponse, contactsResponse] = await Promise.all([
					fetchLeadStatuses(),
					fetchContacts(),
				]);

				statuses = statusesResponse;
				contacts = contactsResponse;
				renderStatusFilterOptions(statusFilterSelect, statuses);
				renderContactsTable();
			} catch (error) {
				console.error('Contacts panel error:', error);
				tableBody.innerHTML = `
					<tr>
						<td colspan="6" class="contacts-table__empty">No pudimos cargar los contactos.</td>
					</tr>
				`;
				setFeedback(feedbackElement, 'error', mapContactsError(error));
			} finally {
				refreshButton.disabled = false;
				refreshButton.textContent = 'Actualizar';
			}
		}

		async function handleStatusChange(event) {
			const select = event.target.closest('[data-contact-status-select]');

			if (!select) {
				return;
			}

			const previousValue =
				contacts.find((contact) => String(contact.id) === String(select.dataset.contactId))
					?.status_key || select.value;

			select.disabled = true;

			try {
				const updated = await updateContactStatus({
					contactId: Number(select.dataset.contactId),
					statusKey: select.value,
				});

				contacts = contacts.map((contact) =>
					String(contact.id) === String(updated.id)
						? {
								...contact,
								status_key: updated.status_key,
								updated_at: updated.updated_at,
							}
						: contact,
				);

				renderContactsTable();
				setFeedback(feedbackElement, 'success', 'Estatus actualizado correctamente.');
			} catch (error) {
				console.error('Status update error:', error);
				select.value = previousValue;
				setFeedback(feedbackElement, 'error', mapContactsError(error));
			} finally {
				select.disabled = false;
			}
		}

		refreshButton.addEventListener('click', () => {
			loadContacts();
		});

		searchInput.addEventListener('input', (event) => {
			currentSearch = event.currentTarget.value || '';
			renderContactsTable();
		});

		statusFilterSelect.addEventListener('change', (event) => {
			currentStatusFilter = event.currentTarget.value || 'all';
			renderContactsTable();
		});

		tabs.forEach((tab) => {
			tab.addEventListener('click', () => {
				activeTab = tab.dataset.contactsTab || 'all';
				updateTabState();
				renderContactsTable();
			});
		});

		detailCloseButtons.forEach((button) => {
			button.addEventListener('click', closeDetailModal);
		});

		document.addEventListener('keydown', (event) => {
			if (event.key === 'Escape') {
				closeDetailModal();
			}
		});

		panel.addEventListener('change', handleStatusChange);
		panel.addEventListener('click', (event) => {
			const button = event.target.closest('[data-contact-view-button]');

			if (!button) {
				return;
			}

			const contact = contacts.find((item) => String(item.id) === String(button.dataset.contactId));

			if (contact) {
				openDetailModal(contact);
			}
		});

		updateTabState();

		getCurrentSession().then((session) => {
			if (session) {
				loadContacts();
			}
		});

		onAuthStateChange((session) => {
			if (!session) {
				tableBody.innerHTML = `
					<tr>
						<td colspan="6" class="contacts-table__empty">Inicia sesión para consultar contactos.</td>
					</tr>
				`;
				clearFeedback(feedbackElement);
				return;
			}

			loadContacts();
		});
	});
}
