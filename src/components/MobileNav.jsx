import * as Dialog from '@radix-ui/react-dialog';
import { Cross2Icon, HamburgerMenuIcon } from '@radix-ui/react-icons';
import ThemeToggle from './ThemeToggle.jsx';
import { withBase } from '../utils/withBase.js';

export default function MobileNav({ navItems, logoUrl }) {
	return (
		<Dialog.Root>
			<div className="mobile-menu-root">
				<Dialog.Trigger className="mobile-menu-trigger" aria-label="Abrir menú">
					<HamburgerMenuIcon aria-hidden="true" />
				</Dialog.Trigger>
			</div>

			<Dialog.Portal>
				<Dialog.Overlay className="mobile-menu-overlay" />
				<Dialog.Content className="mobile-menu-content" aria-label="Menú principal">
					<div className="mobile-menu-head">
						<Dialog.Close asChild>
							<a className="mobile-menu-logo" href={withBase('/#inicio')} aria-label="Noe Flores Avilés - inicio">
								<img src={logoUrl} alt="Noe Flores Avilés" width="112" height="42" />
							</a>
						</Dialog.Close>

						<div className="mobile-menu-head-actions">
							<ThemeToggle className="mobile-theme-toggle" />
							<Dialog.Close className="mobile-menu-close" aria-label="Cerrar menú">
								<Cross2Icon aria-hidden="true" />
							</Dialog.Close>
						</div>
					</div>

					<nav className="mobile-menu-links" aria-label="Navegación móvil">
						{navItems.map((item) => (
							<Dialog.Close asChild key={item.href}>
								<a href={item.href}>{item.label}</a>
							</Dialog.Close>
						))}
					</nav>

					<Dialog.Close asChild>
						<a className="mobile-menu-cta" href={withBase('/#cotizar')}>
							Cotizar Proyecto
						</a>
					</Dialog.Close>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
