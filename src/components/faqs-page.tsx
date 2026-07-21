import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { DecorIcon } from "@/components/decor-icon";

export function FaqsSection() {
	return (
		<section id="faqs" className="mx-auto grid w-full max-w-7xl grid-cols-1 md:grid-cols-2 lg:border-x border-zinc-900 bg-transparent px-6 py-16 scroll-mt-20">
			<div className="px-4 pt-12 pb-6">
				<div className="space-y-5">
					<h2 className="text-balance font-bold text-4xl md:text-6xl lg:font-black">
						Frequently Asked Questions
					</h2>
					<p className="text-muted-foreground">
						Quick answers to common questions about EFFRT. Open any question to
						learn more.
					</p>
					<p className="text-muted-foreground">
						{"Can't find what you're looking for? "}
						<a className="text-primary hover:underline" href="#">
							Contact Us
						</a>
					</p>
				</div>
			</div>
			<div className="relative place-content-center">
				{/* vertical guide line */}
				<div
					aria-hidden="true"
					className="pointer-events-none absolute inset-y-0 left-3 h-full w-px bg-border"
				/>

				<Accordion
					className="rounded-none border-x-0 border-y"
				>
					{faqs.map((item) => (
						<AccordionItem
							className="group relative pl-5"
							key={item.id}
							value={item.id}
						>
							<DecorIcon
								className="left-[13px] size-3 group-last:hidden"
								position="bottom-left"
							/>

							<AccordionTrigger className="px-4 py-4 hover:no-underline focus-visible:underline focus-visible:ring-0">
								{item.title}
							</AccordionTrigger>

							<AccordionContent className="px-4 pb-4 text-muted-foreground">
								{item.content}
							</AccordionContent>
						</AccordionItem>
					))}
				</Accordion>
			</div>
		</section>
	);
}

const faqs = [
	{
		id: "item-1",
		title: "What is EFFRT?",
		content:
			"EFFRT is a contribution proof trail and project workspace designed to track real developer action and commits into an unforgeable timeline.",
	},
	{
		id: "item-2",
		title: "Who is EFFRT for?",
		content:
			"EFFRT is built for founders, engineering managers, and teams that want clear, verified insights into project velocity and contributions.",
	},
	{
		id: "item-3",
		title: "What features does EFFRT include?",
		content:
			"EFFRT offers a Task Ledger, Proof Trail timeline, Effort Meter velocity graphs, automated Standup Digests, and exportable Final Reports.",
	},
	{
		id: "item-4",
		title: "Can I customize components in EFFRT?",
		content:
			"Yes. EFFRT offers scaffolding and dashboard panels so you can tailor workflows to your team's specific stack and reporting needs.",
	},
	{
		id: "item-5",
		title: "Does EFFRT integrate with my existing tools?",
		content:
			"EFFRT connects with popular version control hosts, databases, and issue trackers to form a live receipt trail of execution.",
	},
	{
		id: "item-6",
		title: "How does the unforgeable proof trail work?",
		content:
			"EFFRT uses database foreign keys and strict write validation to ensure that all logged developer tasks represent verified action.",
	},
	{
		id: "item-7",
		title: "How do I get started with EFFRT?",
		content:
			"Simply click 'Sign Up' in the header to create your account, configure your workspace, and start tracking proof of work in minutes.",
	},
];
