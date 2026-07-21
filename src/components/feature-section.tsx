import type React from "react";
import { DecorIcon } from "@/components/decor-icon";
import { 
  ListTodo, 
  History, 
  Gauge, 
  CalendarRange, 
  ShieldCheck, 
  FileText 
} from "lucide-react";

type FeatureType = {
	title: string;
	icon: React.ReactNode;
	description: string;
};

export function FeatureSection() {
	return (
		<div id="features" className="mx-auto max-w-5xl scroll-mt-24">
			<div className="text-center mb-12 flex flex-col items-center">
				<h2 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
					Engineered for Absolute Transparency
				</h2>
				<p className="mt-2 text-zinc-400 text-sm md:text-base max-w-xl">
					EFFRT turns developer activity into unforgeable receipts of execution.
				</p>
			</div>

			<div className="relative p-6 bg-zinc-950/20 border border-zinc-900 rounded-none backdrop-blur-xs">
				{/* Corner Icons */}
				<DecorIcon
					className="size-6 stroke-1.5 stroke-zinc-700"
					position="top-left"
				/>
				<DecorIcon
					className="size-6 stroke-1.5 stroke-zinc-700"
					position="top-right"
				/>
				<DecorIcon
					className="size-6 stroke-1.5 stroke-zinc-700"
					position="bottom-left"
				/>
				<DecorIcon
					className="size-6 stroke-1.5 stroke-zinc-700"
					position="bottom-right"
				/>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{features.map((feature) => (
						<div
							className="group/card relative p-6 rounded-xl border border-zinc-900 bg-zinc-950/40 hover:bg-zinc-900/20 hover:border-zinc-800 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-black/50"
							key={feature.title}
						>
							<div className="size-11 rounded-lg bg-zinc-900/80 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover/card:text-white group-hover/card:border-zinc-600 transition-colors mb-4 relative z-10">
								{feature.icon}
							</div>
							
							<h3 className="font-bold text-base text-zinc-100 group-hover/card:text-white transition-colors relative z-10">
								{feature.title}
							</h3>
							
							<p className="text-zinc-400 text-xs leading-relaxed mt-2 group-hover/card:text-zinc-300 transition-colors relative z-10">
								{feature.description}
							</p>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

const features: FeatureType[] = [
	{
		title: "Task Ledger",
		icon: <ListTodo className="size-5" />,
		description: "Visualize progress and track team velocity with a centralized Kanban board workflow.",
	},
	{
		title: "Proof Trail",
		icon: <History className="size-5" />,
		description: "An immutable audit timeline recording every single developer task update in real-time.",
	},
	{
		title: "Effort Meter",
		icon: <Gauge className="size-5" />,
		description: "Advanced analytics graphing contribution velocity, frequency, and member impact charts.",
	},
	{
		title: "Standup Digest",
		icon: <CalendarRange className="size-5" />,
		description: "Automatically aggregate daily developer standup summaries into unified team reviews.",
	},
	{
		title: "Unforgeable Proof",
		icon: <ShieldCheck className="size-5" />,
		description: "Secure contribution logs utilizing database foreign-key logic for unforgeable receipts.",
	},
	{
		title: "Final Reports",
		icon: <FileText className="size-5" />,
		description: "Export clean, verifiable project completion sheets for stakeholders and clients in one click.",
	},
];
