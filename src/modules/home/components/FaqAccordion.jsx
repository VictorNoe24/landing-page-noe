import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDownIcon } from '@radix-ui/react-icons';

const faqs = [
	{
		question: '¿Cobran por hacer un presupuesto?',
		answer:
			'No, la visita técnica inicial y la entrega del presupuesto no tienen costo ni compromiso. Queremos que nos conozcas y evaluar tu proyecto adecuadamente.',
	},
	{
		question: '¿Ustedes compran el material o lo compro yo?',
		answer:
			'Podemos trabajar de ambas formas. Si prefieres, te ayudamos a comprar materiales confiables y transparentamos cada gasto desde el inicio.',
	},
	{
		question: '¿Trabajan los fines de semana?',
		answer:
			'Sí, podemos agendar trabajos en fin de semana cuando el proyecto lo requiere. Lo definimos contigo desde la planeación para evitar sorpresas.',
	},
	{
		question: '¿Dan garantía sobre el trabajo realizado?',
		answer:
			'Sí. Respondemos por la calidad de la mano de obra y revisamos cualquier detalle relacionado con el trabajo acordado.',
	},
	{
		question: '¿Cuáles son las formas de pago?',
		answer:
			'Aceptamos pagos por transferencia y efectivo. Normalmente trabajamos con anticipo y pagos por avance, siempre acordados antes de iniciar.',
	},
];

export default function FaqAccordion() {
	return (
		<Accordion.Root className="faq-accordion" type="single" defaultValue="item-0" collapsible>
			{faqs.map((faq, index) => (
				<Accordion.Item className="faq-item" value={`item-${index}`} key={faq.question}>
					<Accordion.Header>
						<Accordion.Trigger className="faq-trigger">
							{faq.question}
							<ChevronDownIcon aria-hidden="true" />
						</Accordion.Trigger>
					</Accordion.Header>
					<Accordion.Content className="faq-content">
						<div className="faq-content-inner">
							<p>{faq.answer}</p>
						</div>
					</Accordion.Content>
				</Accordion.Item>
			))}
		</Accordion.Root>
	);
}
