import { Button } from "@/components/ui/button";
import { DecorIcon } from "@/components/decor-icon";
import { ArrowRightIcon } from "lucide-react";

export function CtaBanner() {
  return (
    <section id="contact" className="mx-auto w-full max-w-7xl border-x border-b border-zinc-900 bg-transparent px-6 py-16 scroll-mt-24">
      <div className="relative p-8 md:p-12 bg-zinc-950/20 border border-zinc-900 rounded-none backdrop-blur-xs text-center flex flex-col items-center">
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

        <h2 className="text-3xl font-extrabold tracking-tight text-white md:text-5xl max-w-2xl leading-tight">
          Build proof of work,<br className="hidden md:inline" /> not just words.
        </h2>
        
        <p className="mt-4 text-zinc-400 text-sm md:text-base max-w-xl leading-relaxed">
          Set up EFFRT in minutes. Connect your workspace, verify contributions automatically, and reclaim hours of manual log reporting.
        </p>

        <div className="mt-8">
          <Button
            size="lg"
            className="h-11 px-8 text-sm font-semibold rounded-lg shadow-md hover:scale-[1.02] transition-transform"
            render={<a href="/signup" />}
            nativeButton={false}
          >
            Get Started For Free
            <ArrowRightIcon className="size-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
}
