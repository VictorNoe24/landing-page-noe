import {
	getCurrentSession,
	onAuthStateChange,
	signInWithPassword,
	signOut,
} from '../services/auth.service.js';

function setLoginMessage(messageElement, status, text) {
	messageElement.textContent = text;
	messageElement.hidden = false;
	messageElement.classList.remove('is-error', 'is-success');
	messageElement.classList.add(status === 'success' ? 'is-success' : 'is-error');
}

function clearLoginMessage(messageElement) {
	messageElement.textContent = '';
	messageElement.hidden = true;
	messageElement.classList.remove('is-error', 'is-success');
}

function toggleViews(root, isAuthenticated) {
	const guestViews = root.querySelectorAll('[data-admin-auth-view="guest"]');
	const authenticatedViews = root.querySelectorAll('[data-admin-auth-view="authenticated"]');

	guestViews.forEach((view) => {
		view.hidden = isAuthenticated;
	});

	authenticatedViews.forEach((view) => {
		view.hidden = !isAuthenticated;
	});
}

function mapAuthError(error) {
	const message = error?.message?.toLowerCase() || '';

	if (message.includes('invalid login credentials')) {
		return 'El correo o la contraseña no son correctos.';
	}

	if (message.includes('email not confirmed')) {
		return 'Debes confirmar tu correo antes de iniciar sesión.';
	}

	return 'No fue posible iniciar sesión en este momento. Intenta nuevamente.';
}

function renderAuthenticatedState(root, session) {
	toggleViews(root, true);
	root.dataset.authenticated = 'true';

	root.querySelectorAll('[data-admin-user-email]').forEach((emailElement) => {
		emailElement.textContent = session?.user?.email || 'Sesión iniciada';
	});
}

function renderGuestState(root, form, messageElement) {
	toggleViews(root, false);
	root.dataset.authenticated = 'false';
	form?.reset();
	clearLoginMessage(messageElement);
}

export function setupAdminAuthPage() {
	const roots = document.querySelectorAll('[data-admin-auth-root]');

	roots.forEach((root) => {
		if (root.dataset.initialized === 'true') {
			return;
		}

		root.dataset.initialized = 'true';

		const form = root.querySelector('[data-admin-login-form]');
		const messageElement = root.querySelector('[data-admin-login-message]');
		const submitButton = root.querySelector('[data-admin-login-submit]');
		const submitLabel = root.querySelector('[data-admin-login-submit-label]');
		const logoutButtons = root.querySelectorAll('[data-admin-logout]');
		const sidebarToggles = root.querySelectorAll('[data-admin-sidebar-toggle]');

		if (!form || !messageElement || !submitButton || !submitLabel || !logoutButtons.length) {
			return;
		}

		const defaultSubmitText = submitLabel.textContent || 'Iniciar sesión';

		getCurrentSession()
			.then((session) => {
				if (session) {
					renderAuthenticatedState(root, session);
					return;
				}

				renderGuestState(root, form, messageElement);
			})
			.catch(() => {
				renderGuestState(root, form, messageElement);
			});

		onAuthStateChange((session) => {
			if (session) {
				renderAuthenticatedState(root, session);
				return;
			}

			renderGuestState(root, form, messageElement);
		});

		form.addEventListener('submit', async (event) => {
			event.preventDefault();

			const formData = new FormData(form);
			const email = formData.get('email')?.toString().trim() || '';
			const password = formData.get('password')?.toString() || '';

			if (!email || !password) {
				setLoginMessage(messageElement, 'error', 'Completa correo y contraseña.');
				return;
			}

			clearLoginMessage(messageElement);
			submitButton.disabled = true;
			submitLabel.textContent = 'Validando...';

			try {
				const { session } = await signInWithPassword({ email, password });

				setLoginMessage(messageElement, 'success', 'Sesión iniciada correctamente.');
				renderAuthenticatedState(root, session);
			} catch (error) {
				console.error('Admin login error:', error);
				setLoginMessage(messageElement, 'error', mapAuthError(error));
			} finally {
				submitButton.disabled = false;
				submitLabel.textContent = defaultSubmitText;
			}
		});

		logoutButtons.forEach((logoutButton) => {
			const defaultLabel = logoutButton.textContent || 'Cerrar sesión';

			logoutButton.addEventListener('click', async () => {
				logoutButton.disabled = true;
				logoutButton.textContent = 'Cerrando...';

				try {
					await signOut();
				} catch (error) {
					console.error('Admin logout error:', error);
				} finally {
					logoutButton.disabled = false;
					logoutButton.textContent = defaultLabel;
				}
			});
		});

		sidebarToggles.forEach((toggle) => {
			toggle.addEventListener('click', () => {
				const nextValue = root.dataset.sidebarCollapsed === 'true' ? 'false' : 'true';
				root.dataset.sidebarCollapsed = nextValue;
			});
		});
	});
}
