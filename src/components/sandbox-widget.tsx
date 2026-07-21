import { useState, useEffect, useRef } from "react";
import { Play, ShieldCheck, Terminal, CheckCircle2, GitBranch, ListChecks, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LogEntry {
  id: string;
  time: string;
  type: "info" | "success" | "hash" | "action";
  text: string;
}

export function SandboxWidget() {
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: "init-1", time: "12:04:10", type: "info", text: "EFFRT Contribution Proof Engine v1.0.4 initialized." },
    { id: "init-2", time: "12:04:11", type: "info", text: "Database connection verified. Awaiting workspace activity..." },
  ]);
  const [activeSimulation, setActiveSimulation] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const addLog = (text: string, type: "info" | "success" | "hash" | "action" = "info") => {
    const time = new Date().toTimeString().split(" ")[0];
    const id = Math.random().toString(36).substring(2, 9);
    setLogs((prev) => [...prev, { id, time, type, text }]);
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [logs]);

  const simulateGitPush = () => {
    if (activeSimulation) return;
    setActiveSimulation("git");
    addLog("Event captured: Git Push detected on branch 'main'", "action");
    
    setTimeout(() => {
      const commitHash = Math.random().toString(16).substring(2, 10);
      addLog(`Analyzing commit diff [sha: ${commitHash}]...`, "info");
    }, 800);

    setTimeout(() => {
      const proofHash = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      addLog(`PROOF GENERATED: sha256:${proofHash.substring(0, 16)}...`, "hash");
    }, 1600);

    setTimeout(() => {
      addLog("VERIFIED: Commit ledger synced to immutable timeline successfully.", "success");
      setActiveSimulation(null);
    }, 2400);
  };

  const simulateTaskLedger = () => {
    if (activeSimulation) return;
    setActiveSimulation("task");
    addLog("Event captured: Task status changed to 'Completed'", "action");

    setTimeout(() => {
      addLog("Verifying task owner, comments, and time duration logs...", "info");
    }, 800);

    setTimeout(() => {
      const taskId = Math.floor(Math.random() * 800 + 100);
      addLog(`RECORD SIGNED: DB transaction signed [Task #${taskId}].`, "hash");
    }, 1600);

    setTimeout(() => {
      addLog("VERIFIED: Task contribution logs committed to workspace ledger.", "success");
      setActiveSimulation(null);
    }, 2400);
  };

  const simulateStandup = () => {
    if (activeSimulation) return;
    setActiveSimulation("standup");
    addLog("Event captured: Standup compilation submitted", "action");

    setTimeout(() => {
      addLog("Structuring team logs into daily Standup Digest summary...", "info");
    }, 800);

    setTimeout(() => {
      addLog("STANDUP DIGEST HASH: verified standup checklist match.", "hash");
    }, 1600);

    setTimeout(() => {
      addLog("VERIFIED: Daily standup summary published to team log.", "success");
      setActiveSimulation(null);
    }, 2400);
  };

  return (
    <section id="sandbox" className="mx-auto w-full max-w-7xl border-x border-b border-zinc-900 bg-transparent px-6 py-16 scroll-mt-24">
      <div className="text-center mb-12 flex flex-col items-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
          Try the Contribution Ledger
        </h2>
        <p className="mt-2 text-zinc-400 text-sm md:text-base max-w-xl">
          Simulate workspace activities and see how EFFRT automatically generates unforgeable verification logs in real-time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 bg-zinc-950/20 border border-zinc-900 p-6 rounded-none relative">
        {/* Left Side - Simulation Controls */}
        <div className="lg:col-span-2 flex flex-col gap-4 justify-center">
          <div className="p-4 bg-zinc-950/40 border border-zinc-900 rounded-lg">
            <h3 className="text-sm font-bold text-zinc-200 mb-2 flex items-center gap-2">
              <Play className="size-4 text-emerald-500" /> Control Panel
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              Click any event button below to simulate team actions. Watch the verification terminal generate cryptographic proofs.
            </p>

            <div className="flex flex-col gap-3">
              <Button 
                variant="outline" 
                onClick={simulateGitPush}
                disabled={activeSimulation !== null}
                className="justify-start gap-3 h-11 w-full text-xs font-semibold hover:border-zinc-700 bg-zinc-950/60 border border-zinc-900 transition-all"
              >
                <GitBranch className={`size-4 ${activeSimulation === "git" ? "animate-pulse text-emerald-400" : "text-zinc-400"}`} />
                Simulate git push origin main
              </Button>

              <Button 
                variant="outline" 
                onClick={simulateTaskLedger}
                disabled={activeSimulation !== null}
                className="justify-start gap-3 h-11 w-full text-xs font-semibold hover:border-zinc-700 bg-zinc-950/60 border border-zinc-900 transition-all"
              >
                <ListChecks className={`size-4 ${activeSimulation === "task" ? "animate-pulse text-emerald-400" : "text-zinc-400"}`} />
                Complete Task (Task Ledger)
              </Button>

              <Button 
                variant="outline" 
                onClick={simulateStandup}
                disabled={activeSimulation !== null}
                className="justify-start gap-3 h-11 w-full text-xs font-semibold hover:border-zinc-700 bg-zinc-950/60 border border-zinc-900 transition-all"
              >
                <CalendarDays className={`size-4 ${activeSimulation === "standup" ? "animate-pulse text-emerald-400" : "text-zinc-400"}`} />
                Publish Daily Standup Digest
              </Button>
            </div>
          </div>
        </div>

        {/* Right Side - Terminal UI */}
        <div className="lg:col-span-3 flex flex-col h-[320px] bg-zinc-950/80 border border-zinc-900 rounded-lg overflow-hidden font-mono text-[11px] leading-relaxed relative">
          {/* Terminal Title Bar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-900 bg-zinc-950/60">
            <div className="flex items-center gap-2">
              <Terminal className="size-3.5 text-zinc-400" />
              <span className="text-zinc-400 text-xxs font-bold uppercase tracking-wider">verification_feed.log</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-2 rounded-full bg-zinc-800" />
              <div className="size-2 rounded-full bg-zinc-800" />
              <div className="size-2 rounded-full bg-zinc-800" />
            </div>
          </div>

          {/* Terminal Logs View */}
          <div 
            className="flex-1 p-4 overflow-y-auto space-y-2.5 custom-scrollbar"
            ref={scrollContainerRef}
          >
            {logs.map((log) => (
              <div key={log.id} className="flex gap-2.5 items-start">
                <span className="text-zinc-600 select-none">[{log.time}]</span>
                <span className={
                  log.type === "success" ? "text-emerald-400 font-bold" :
                  log.type === "hash" ? "text-blue-400" :
                  log.type === "action" ? "text-purple-400 font-bold" :
                  "text-zinc-300"
                }>
                  {log.type === "success" && <CheckCircle2 className="inline size-3 mr-1 -mt-0.5 text-emerald-400" />}
                  {log.type === "hash" && <ShieldCheck className="inline size-3 mr-1 -mt-0.5 text-blue-400" />}
                  {log.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
