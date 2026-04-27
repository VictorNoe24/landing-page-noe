import { useEffect, useState } from 'react';

function getResolvedTheme() {
	if (typeof document === 'undefined') return 'light';
	return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

function applyTheme(nextTheme) {
	document.documentElement.dataset.theme = nextTheme;
	window.localStorage.setItem('theme', nextTheme);
	window.dispatchEvent(new CustomEvent('themechange', { detail: nextTheme }));
}

export default function ThemeToggle({ className = '' }) {
	const [theme, setTheme] = useState('light');

	useEffect(() => {
		setTheme(getResolvedTheme());

		const handleThemeChange = (event) => {
			const nextTheme = event?.detail === 'dark' ? 'dark' : getResolvedTheme();
			setTheme(nextTheme);
		};

		window.addEventListener('themechange', handleThemeChange);
		window.addEventListener('storage', handleThemeChange);

		return () => {
			window.removeEventListener('themechange', handleThemeChange);
			window.removeEventListener('storage', handleThemeChange);
		};
	}, []);

	const isDark = theme === 'dark';

	return (
		<button
			type="button"
			className={`theme-toggle ${className}`.trim()}
			aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
			aria-pressed={isDark}
			onClick={() => {
				const nextTheme = isDark ? 'light' : 'dark';
				applyTheme(nextTheme);
				setTheme(nextTheme);
			}}
		>
			<span className="theme-toggle-track" aria-hidden="true">
				<span className={`theme-toggle-thumb ${isDark ? 'is-dark' : ''}`}>
					{isDark ? (
						<svg viewBox="0 0 24 24" fill="none">
							<path
								d="M18 15.2A7.2 7.2 0 0 1 8.8 6a7.9 7.9 0 1 0 9.2 9.2Z"
								stroke="currentColor"
								strokeWidth="1.8"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					) : (
						<svg viewBox="0 0 24 24" fill="none">
							<circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.8" />
							<path d="M12 2.8v2.3M12 18.9v2.3M21.2 12h-2.3M5.1 12H2.8M18.5 5.5l-1.6 1.6M7.1 16.9l-1.6 1.6M18.5 18.5l-1.6-1.6M7.1 7.1 5.5 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
						</svg>
					)}
				</span>
			</span>
		</button>
	);
}
