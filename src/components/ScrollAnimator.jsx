import { useEffect } from 'react';
const animationSettings = {
	'fade-left': { x: '-32px', y: '0px', scale: '1', duration: '600ms' },
	'fade-right': { x: '32px', y: '0px', scale: '1', duration: '600ms' },
	'fade-up': { x: '0px', y: '28px', scale: '1', duration: '600ms' },
	'zoom-in': { x: '0px', y: '18px', scale: '0.96', duration: '650ms' },
};

export default function ScrollAnimator() {
	useEffect(() => {
		/** @type {WeakSet<Element>} */
		const observedElements = new WeakSet();

		const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (!entry.isIntersecting) return;

					const element = entry.target;
					const animation = element.dataset.scrollAnimate || 'fade-up';
					const delay = element.dataset.scrollDelay || '0ms';
					const settings = animationSettings[animation] || animationSettings['fade-up'];

					element.style.setProperty('--scroll-delay', delay);
					element.style.setProperty('--scroll-duration', settings.duration);
					element.style.setProperty('--scroll-x', settings.x);
					element.style.setProperty('--scroll-y', settings.y);
					element.style.setProperty('--scroll-scale', settings.scale);
					element.classList.add('is-scroll-visible');
					observer.unobserve(element);
				});
			},
			{
				rootMargin: '0px 0px -12% 0px',
				threshold: 0.18,
			},
		);

		/**
		 * @param {ParentNode} scope
		 */
		const registerElements = (scope) => {
			const elements = scope.querySelectorAll('[data-scroll-animate]');

			elements.forEach((element) => {
				if (observedElements.has(element)) return;
				observedElements.add(element);
				const animation = element.dataset.scrollAnimate || 'fade-up';
				const settings = animationSettings[animation] || animationSettings['fade-up'];

				element.style.setProperty('--scroll-duration', settings.duration);
				element.style.setProperty('--scroll-x', settings.x);
				element.style.setProperty('--scroll-y', settings.y);
				element.style.setProperty('--scroll-scale', settings.scale);

				if (prefersReducedMotion) {
					element.classList.add('is-scroll-visible');
					return;
				}

				observer.observe(element);
			});
		};

		registerElements(document);

		if (prefersReducedMotion) {
			return undefined;
		}

		const mutationObserver = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				mutation.addedNodes.forEach((node) => {
					if (!(node instanceof HTMLElement)) return;
					if (node.matches('[data-scroll-animate]')) {
						registerElements(node.parentNode ?? document);
						return;
					}

					registerElements(node);
				});
			});
		});

		mutationObserver.observe(document.body, {
			childList: true,
			subtree: true,
		});

		return () => {
			observer.disconnect();
			mutationObserver.disconnect();
		};
	}, []);

	return null;
}
