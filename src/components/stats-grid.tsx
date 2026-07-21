import type React from "react";
import { DecorIcon } from "@/components/decor-icon";

export function StatsGrid() {
  return (
    <section className="mx-auto w-full max-w-7xl border-x border-b border-zinc-900 bg-transparent px-6 py-16">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-zinc-900">
          {stats.map((stat) => (
            <div key={stat.label} className="p-6 flex flex-col items-center text-center">
              <span className="text-4xl font-extrabold text-white tracking-tight md:text-5xl">
                {stat.value}
              </span>
              <span className="mt-3 text-xs font-bold uppercase tracking-widest text-zinc-400">
                {stat.label}
              </span>
              <p className="mt-2 text-zinc-500 text-xxs leading-relaxed max-w-[200px]">
                {stat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const stats = [
  {
    value: "400+",
    label: "Engineering Teams",
    description: "Active engineering teams trust EFFRT for contribution tracking.",
  },
  {
    value: "1.2M+",
    label: "Verified Commits",
    description: "Millions of commits and tasks mapped to verifiable receipt chains.",
  },
  {
    value: "100%",
    label: "Unforgeable Trails",
    description: "Database constraint tracking guarantees authentic proof records.",
  },
  {
    value: "0 Hrs",
    label: "Manual Log Required",
    description: "Saves hours spent manually writing standups and weekly updates.",
  },
];
