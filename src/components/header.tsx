"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { EffrtLogo } from "@/components/shared/EffrtLogo";
import { useScroll } from "@/hooks/use-scroll";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/mobile-nav";

export const navLinks = [
	{
		label: "Home",
		href: "#home",
	},
	{
		label: "Features",
		href: "#features",
	},
	{
		label: "Ledger",
		href: "#sandbox",
	},
	{
		label: "FAQs",
		href: "#faqs",
	},
	{
		label: "Contact",
		href: "#contact",
	},
];

export function Header() {
	const scrolled = useScroll(10);

	const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
		if (href.startsWith("#")) {
			e.preventDefault();
			const element = document.querySelector(href);
			if (element) {
				element.scrollIntoView({ behavior: "smooth" });
			}
		}
	};

	return (
		<header
			className={cn(
				"sticky top-0 z-50 mx-auto w-full max-w-7xl border-transparent border-b md:rounded-md md:border md:transition-all md:ease-out",
				{
					"border-border bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/50 md:top-2 md:max-w-6xl md:shadow":
						scrolled,
				}
			)}
		>
			<nav
				className={cn(
					"flex h-14 w-full items-center justify-between px-4 md:h-12 md:transition-all md:ease-out",
					{
						"md:px-2": scrolled,
					}
				)}
			>
				<a
					className="flex items-center gap-1 rounded-md p-1.5 hover:bg-muted dark:hover:bg-muted/50 font-bold"
					href="#"
				>
					<EffrtLogo className="size-6 text-foreground" />
					<span className="font-bold text-lg tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
						EFFRT
					</span>
				</a>
				<div className="hidden items-center gap-2 md:flex">
					<div>
						{navLinks.map((link) => (
							<Button 
								key={link.label} 
								size="sm" 
								variant="ghost" 
								render={<a href={link.href} onClick={(e) => handleScroll(e, link.href)} />} 
								nativeButton={false}
							>
								{link.label}
							</Button>
						))}
					</div>
					<Button size="sm" variant="outline" render={<a href="/login" />} nativeButton={false}>
						Log In
					</Button>
					<Button size="sm" render={<a href="/signup" />} nativeButton={false}>
						Sign Up
					</Button>
				</div>
				<MobileNav />
			</nav>
		</header>
	);
}
