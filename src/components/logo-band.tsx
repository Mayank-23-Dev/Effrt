import type React from "react";

export function LogoBand() {
  return (
    <section className="mx-auto w-full max-w-7xl border-x border-b border-zinc-900 bg-transparent px-6 py-10">
      <p className="text-center text-xs font-semibold tracking-widest text-zinc-500 uppercase mb-8">
        Integrated with your engineering stack
      </p>
      
      <div className="flex flex-wrap items-center justify-center gap-x-16 gap-y-8 px-4">
        {logos.map((logo) => (
          <div 
            key={logo.name} 
            className="flex items-center gap-2 grayscale opacity-45 hover:grayscale-0 hover:opacity-90 transition-all duration-300 cursor-pointer"
          >
            {logo.icon}
            <span className="text-sm font-bold tracking-tight text-zinc-300">{logo.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

const logos = [
  {
    name: "GitHub",
    icon: (
      <svg className="size-5 fill-current" viewBox="0 0 24 24">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
      </svg>
    )
  },
  {
    name: "Supabase",
    icon: (
      <svg className="size-5 fill-current text-[#3ECF8E]" viewBox="0 0 24 24">
        <path d="M21.362 9.354H12v-7.64a.852.852 0 0 0-1.501-.515L1.139 12.836A.852.852 0 0 0 1.79 14.22h9.362v7.64a.852.852 0 0 0 1.501.515l9.359-11.637a.852.852 0 0 0-.65-1.384z"/>
      </svg>
    )
  },
  {
    name: "Vercel",
    icon: (
      <svg className="size-5 fill-current text-white" viewBox="0 0 24 24">
        <path d="M12 2L2 22h20L12 2z"/>
      </svg>
    )
  },
  {
    name: "Slack",
    icon: (
      <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523 2.528 2.528 0 0 1-2.522-2.523 2.528 2.528 0 0 1 2.522-2.52h2.52v2.52zm1.261 0a2.528 2.528 0 0 1 2.52-2.52h5.043a2.528 2.528 0 0 1 2.522 2.52v5.042a2.528 2.528 0 0 1-2.522 2.52H8.824a2.528 2.528 0 0 1-2.52-2.52v-5.042zM8.824 5.043a2.528 2.528 0 0 1-2.52-2.52 2.528 2.528 0 0 1 2.52-2.522 2.528 2.528 0 0 1 2.522 2.522v2.52h-2.522zm0 1.261a2.528 2.528 0 0 1 2.522 2.52v5.043a2.528 2.528 0 0 1-2.522 2.52H3.782a2.528 2.528 0 0 1-2.52-2.52V8.824a2.528 2.528 0 0 1 2.52-2.52h5.042zm10.134 3.76a2.528 2.528 0 0 1 2.52-2.52 2.528 2.528 0 0 1 2.522 2.52 2.528 2.528 0 0 1-2.522 2.52h-2.52v-2.52zm-1.262 0a2.528 2.528 0 0 1-2.52 2.52h-5.043a2.528 2.528 0 0 1-2.522-2.52V3.782a2.528 2.528 0 0 1 2.522-2.52h5.043a2.528 2.528 0 0 1 2.52 2.52v5.042zm-3.78 10.134a2.528 2.528 0 0 1 2.52 2.52 2.528 2.528 0 0 1-2.52 2.522 2.528 2.528 0 0 1-2.522-2.522v-2.52h2.522zm0-1.262a2.528 2.528 0 0 1-2.522-2.52v-5.043a2.528 2.528 0 0 1 2.522-2.52h5.042a2.528 2.528 0 0 1 2.52 2.52v5.043h-5.042z"/>
      </svg>
    )
  },
  {
    name: "Linear",
    icon: (
      <svg className="size-5 fill-current text-white" viewBox="0 0 24 24">
        <path d="M12 2c5.522 0 10 4.477 10 10s-4.478 10-10 10S2 17.523 2 12 6.478 2 12 2zm1.006 4.98h-2.012v4.02h-4.015v2.01h4.015v4.01h2.012v-4.01h4.015v-2.01h-4.015V6.98z"/>
      </svg>
    )
  }
];
