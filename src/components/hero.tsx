import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DecorIcon } from "@/components/decor-icon";
import { FullWidthDivider } from "@/components/full-width-divider";
import { ArrowRightIcon } from "lucide-react";
import heroPhoto from "@/assets/hero_photo.png";

export function HeroSection() {
	return (
		<section id="home" className="scroll-mt-24">
			<div className="relative flex flex-col items-center justify-center gap-5 px-4 py-12 md:px-4 md:py-24 lg:py-28">
				{/* X Faded Borders & Shades */}
				<div
					aria-hidden="true"
					className="absolute inset-0 -z-10 size-full overflow-hidden"
				>
					<div className="absolute inset-y-0 left-0 w-px bg-linear-to-b from-transparent via-border to-border" />
					<div className="absolute inset-y-0 right-0 w-px bg-linear-to-b from-transparent via-border to-border" />
					<div className="absolute inset-y-0 left-4 w-px bg-linear-to-b from-transparent via-border/50 to-border/50 md:left-6" />
					<div className="absolute inset-y-0 right-4 w-px bg-linear-to-b from-transparent via-border/50 to-border/50 md:right-6" />
				</div>
				<a
					className={cn(
						"group mx-auto flex w-fit items-center gap-3 rounded-sm border bg-card p-1 shadow",
						"fade-in slide-in-from-bottom-10 animate-in fill-mode-backwards transition-all delay-500 duration-500 ease-out"
					)}
					href="#link"
				>
					<div className="rounded-xs border bg-card px-1.5 py-0.5 shadow-sm">
						<p className="font-mono text-xs">NOW</p>
					</div>

					<span className="text-xs">accepting new client projects</span>
					<span className="block h-5 border-l" />

					<div className="pr-1">
						<ArrowRightIcon className="size-3 -translate-x-0.5 duration-150 ease-out group-hover:translate-x-0.5" />
					</div>
				</a>

				<h1
					className={cn(
						"max-w-2xl text-balance text-center text-3xl text-foreground md:text-5xl lg:text-6xl",
						"fade-in slide-in-from-bottom-10 animate-in fill-mode-backwards delay-100 duration-500 ease-out"
					)}
				>
					Effort isn't a thing. It's proof.
				</h1>

				<p
					className={cn(
						"text-center text-muted-foreground text-sm tracking-wider sm:text-lg max-w-2xl",
						"fade-in slide-in-from-bottom-10 animate-in fill-mode-backwards delay-200 duration-500 ease-out"
					)}
				>
					EFFRT tracks real contribution — every task, every check-in, every commit — into a live, unforgeable proof trail.
				</p>

				<div className="fade-in slide-in-from-bottom-10 flex w-fit animate-in items-center justify-center gap-3 fill-mode-backwards pt-2 delay-300 duration-500 ease-out">
					<Button
						size="lg"
						className="h-11 px-6 text-sm font-semibold rounded-lg shadow-md hover:scale-[1.02] transition-transform"
						render={<a href="/signup" />}
						nativeButton={false}
					>
						Get started{" "}
						<ArrowRightIcon data-icon="inline-end" className="size-4 ml-1" />
					</Button>
				</div>
			</div>
			<div className="relative">
				<DecorIcon className="size-4" position="top-left" />
				<DecorIcon className="size-4" position="top-right" />
				<DecorIcon className="size-4" position="bottom-left" />
				<DecorIcon className="size-4" position="bottom-right" />

				<FullWidthDivider className="-top-px" />
				<div className="overflow-hidden *:pointer-events-none *:select-none">
					<img
						alt="EFFRT Hero Showcase"
						className="w-full h-auto block"
						src={heroPhoto}
					/>
				</div>
				<FullWidthDivider className="-bottom-px" />
			</div>
		</section>
	);
}
