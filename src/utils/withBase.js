export function withBase(path = '/') {
	const base = import.meta.env.BASE_URL || '/';
	const normalizedBase = base === '/' ? '' : base.replace(/\/$/, '');
	const normalizedPath = path.startsWith('/') ? path : `/${path}`;

	return `${normalizedBase}${normalizedPath}` || '/';
}
