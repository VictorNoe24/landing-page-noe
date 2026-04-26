import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
	ArrowRightIcon,
	CheckCircledIcon,
	Cross2Icon,
	ImageIcon,
	SewingPinIcon,
	TimerIcon,
} from '@radix-ui/react-icons';
import { projectCategories, projects } from '../utils/projects';

export default function PortfolioGallery({ showFilters = false, variant = 'mosaic', limit = projects.length }) {
	const [activeCategory, setActiveCategory] = useState('Todos');
	const [activeProject, setActiveProject] = useState(projects[0]);
	const [activeImage, setActiveImage] = useState(0);
	const [open, setOpen] = useState(false);
	const visibleProjects = projects
		.filter((project) => activeCategory === 'Todos' || project.category === activeCategory)
		.slice(0, limit);

	function openProject(project) {
		setActiveProject(project);
		setActiveImage(0);
		setOpen(true);
	}

	return (
		<Dialog.Root open={open} onOpenChange={setOpen}>
			{showFilters && (
				<div className="project-filters" aria-label="Filtrar proyectos">
					{projectCategories.map((category) => (
						<button
							data-active={category === activeCategory}
							key={category}
							type="button"
							onClick={() => setActiveCategory(category)}
						>
							{category}
						</button>
					))}
				</div>
			)}

			<div className={`portfolio-gallery portfolio-gallery-${variant}`}>
				{visibleProjects.map((project) => (
					<button
						className={`portfolio-card ${project.size === 'large' ? 'portfolio-card-large' : 'portfolio-card-wide'}`}
						key={project.title}
						type="button"
						onClick={() => openProject(project)}
					>
						<img src={project.images[0]} alt={project.title} loading="lazy" />
						<span className="portfolio-count">
							<ImageIcon aria-hidden="true" />
							+{project.photos} fotos
						</span>
						<span className="portfolio-card-content">
							<small>{project.category}</small>
							<strong>{project.title}</strong>
							<span>
								Ver galería ({project.photos} fotos) <ArrowRightIcon aria-hidden="true" />
							</span>
						</span>
					</button>
				))}
			</div>

			<Dialog.Portal>
				<Dialog.Overlay className="portfolio-modal-overlay" />
				<Dialog.Content className="portfolio-modal" aria-describedby="portfolio-modal-description">
					<div className="portfolio-modal-media">
						<div className="portfolio-modal-image">
							<img src={activeProject.images[activeImage]} alt={activeProject.title} />
						</div>
						<div className="portfolio-thumbs" aria-label="Fotos del proyecto">
							{activeProject.images.map((image, index) => (
								<button
									className="portfolio-thumb"
									data-active={index === activeImage}
									key={image}
									type="button"
									onClick={() => setActiveImage(index)}
									aria-label={`Ver foto ${index + 1}`}
								>
									<img src={image} alt="" />
								</button>
							))}
						</div>
					</div>

					<div className="portfolio-modal-content">
						<Dialog.Close className="portfolio-close" aria-label="Cerrar modal">
							<Cross2Icon aria-hidden="true" />
						</Dialog.Close>

						<p className="portfolio-category">{activeProject.category}</p>
						<Dialog.Title className="portfolio-modal-title">{activeProject.title}</Dialog.Title>

						<div className="portfolio-meta">
							<span>
								<SewingPinIcon aria-hidden="true" />
								{activeProject.location}
							</span>
							<span>
								<TimerIcon aria-hidden="true" />
								{activeProject.duration}
							</span>
						</div>

						<h3>Descripción de la obra:</h3>
						<p id="portfolio-modal-description">{activeProject.description}</p>

						<h3>Trabajos realizados:</h3>
						<ul className="portfolio-checks">
							{activeProject.works.map((work) => (
								<li key={work}>
									<CheckCircledIcon aria-hidden="true" />
									{work}
								</li>
							))}
						</ul>

						<a className="portfolio-cta" href="#cotizar">
							Quiero un proyecto similar
						</a>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
