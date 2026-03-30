import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, Sparkles, Loader2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getAIInsight } from "@/lib/aiAnalysis";

interface QueueState {
  time: number;
  queueLength: number;
  serverBusy: boolean;
  customersServed: number;
  avgWait: number;
  utilization: number;
}

const QueueSimulator = () => {
  const [lambda, setLambda] = useState(3);
  const [mu, setMu] = useState(4);
  const [running, setRunning] = useState(false);
  const [history, setHistory] = useState<QueueState[]>([]);
  const [state, setState] = useState<QueueState>({
    time: 0, queueLength: 0, serverBusy: false, customersServed: 0, avgWait: 0, utilization: 0,
  });
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const rho = lambda / mu;
  const Lq = rho >= 1 ? Infinity : (rho * rho) / (1 - rho);
  const Wq = rho >= 1 ? Infinity : Lq / lambda;
  const W = rho >= 1 ? Infinity : Wq + 1 / mu;

  const step = useCallback(() => {
    setState((prev) => {
      const arrivalProb = lambda / 20;
      const serviceProb = mu / 20;
      let q = prev.queueLength;
      let busy = prev.serverBusy;
      let served = prev.customersServed;

      if (Math.random() < arrivalProb) {
        if (!busy) busy = true;
        else q++;
      }

      if (busy && Math.random() < serviceProb) {
        served++;
        if (q > 0) q--;
        else busy = false;
      }

      const t = prev.time + 1;
      const busyCount = busy ? 1 : 0;
      const util = served > 0 ? (prev.utilization * (t - 1) + busyCount) / t : 0;

      return {
        time: t, queueLength: q, serverBusy: busy, customersServed: served,
        avgWait: served > 0 ? q / (mu > 0 ? mu : 1) : 0, utilization: util,
      };
    });
  }, [lambda, mu]);

  useEffect(() => {
    if (running) intervalRef.current = setInterval(step, 50);
    return () => clearInterval(intervalRef.current);
  }, [running, step]);

  useEffect(() => {
    setHistory((prev) => [...prev, state].slice(-100));
  }, [state.time]);

  const reset = () => {
    setRunning(false);
    setState({ time: 0, queueLength: 0, serverBusy: false, customersServed: 0, avgWait: 0, utilization: 0 });
    setHistory([]);
  };

  const queueDots = Array.from({ length: Math.min(state.queueLength, 20) });

  const analyzeQueue = async () => {
    setAiLoading(true);
    setAiInsight(null);
    const context = `ED Queue Analysis: Arrival rate λ=${lambda.toFixed(1)} patients/hr, physician service rate μ=${mu.toFixed(1)} patients/hr, utilization ρ=${rho >= 1 ? "≥1 (UNSTABLE — queue grows without bound)" : rho.toFixed(3)}. ${rho < 1 ? `Expected Lq=${Lq.toFixed(2)} patients queued, Wq=${(Wq * 60).toFixed(1)} min average wait time, total system time W=${(W * 60).toFixed(1)} min.` : ""} Simulation shows ${state.customersServed} patients treated so far with current queue length of ${state.queueLength}. Provide a 3-4 sentence operational assessment for a hospital administrator: is this ED adequately staffed, what is the patient experience impact, and your single top recommendation?`;
    try {
      setAiInsight(await getAIInsight(context));
    } catch {
      setAiInsight("Analysis unavailable. Please try again.");
    }
    setAiLoading(false);
  };

  return (
    <section id="simulator" className="py-24 relative">
      <div className="absolute inset-0 blueprint-grid opacity-10" />
      <div className="container relative z-10 px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
          <div className="font-mono text-xs text-primary tracking-widest uppercase mb-2">// Module 01</div>
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            ED Queue <span className="text-primary">Simulator</span>
          </h2>
          <p className="text-muted-foreground max-w-xl">
            Model your Emergency Department as an M/M/1 queue. Adjust patient arrival rate (λ) and
            physician throughput (μ) to see how staffing decisions directly impact waiting room
            length and door-to-doctor time in real time.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card/80 backdrop-blur-sm p-6 box-glow">
              <h3 className="font-mono text-sm text-primary mb-4 uppercase tracking-wider">Parameters</h3>
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="font-mono text-xs text-muted-foreground">Patient Arrivals (λ)</label>
                    <span className="font-mono text-sm text-primary">{lambda.toFixed(1)}/hr</span>
                  </div>
                  <input type="range" min="0.5" max="8" step="0.1" value={lambda}
                    onChange={(e) => setLambda(Number(e.target.value))} className="w-full accent-primary" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="font-mono text-xs text-muted-foreground">Physician Throughput (μ)</label>
                    <span className="font-mono text-sm text-accent">{mu.toFixed(1)}/hr</span>
                  </div>
                  <input type="range" min="0.5" max="10" step="0.1" value={mu}
                    onChange={(e) => setMu(Number(e.target.value))} className="w-full accent-accent" />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button onClick={() => setRunning(!running)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-mono text-sm hover:shadow-lg hover:shadow-primary/20 transition-all">
                  {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {running ? "Pause" : "Run"}
                </button>
                <button onClick={reset}
                  className="px-4 py-2.5 rounded-lg border border-border text-muted-foreground font-mono text-sm hover:border-primary/50 transition-all">
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card/80 backdrop-blur-sm p-6">
              <h3 className="font-mono text-sm text-primary mb-4 uppercase tracking-wider">Wait Time Theory</h3>
              <div className="space-y-3 font-mono text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ρ = λ/μ</span>
                  <span className={rho >= 1 ? "text-destructive" : "text-primary"}>{rho >= 1 ? "≥ 1 (unstable)" : rho.toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lq (avg queue)</span>
                  <span className="text-foreground">{rho >= 1 ? "∞" : Lq.toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Wq (avg wait)</span>
                  <span className="text-foreground">{rho >= 1 ? "∞" : Wq.toFixed(3) + "min"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">W (total time)</span>
                  <span className="text-foreground">{rho >= 1 ? "∞" : W.toFixed(3) + "min"}</span>
                </div>
                {rho >= 1 && (
                  <div className="mt-3 p-2 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-xs">
                    ⚠ System is unstable — λ ≥ μ means queue grows without bound
                  </div>
                )}
              </div>
            </div>

            <div className="ai-panel p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">AI Analysis</span>
                </div>
                <button
                  onClick={analyzeQueue}
                  disabled={aiLoading}
                  data-testid="button-analyze-queue"
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors disabled:opacity-50"
                >
                  {aiLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                  {aiLoading ? "Analyzing…" : "Analyze"}
                </button>
              </div>
              {aiInsight ? (
                <p className="text-sm text-foreground/85 leading-relaxed">{aiInsight}</p>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  Click Analyze to get an AI-powered operational assessment of the current queue parameters.
                </p>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-border bg-card/80 backdrop-blur-sm p-6">
              <h3 className="font-mono text-sm text-primary mb-4 uppercase tracking-wider">Live ED State</h3>
              <div className="flex items-center gap-4 min-h-[60px]">
                <div className="flex-1 flex items-center gap-1 flex-wrap">
                  <span className="font-mono text-xs text-muted-foreground mr-2">WAITING</span>
                  {queueDots.map((_, i) => (
                    <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className="w-4 h-4 rounded-full bg-node-warning/70 border border-node-warning" />
                  ))}
                  {state.queueLength > 20 && <span className="font-mono text-xs text-node-warning">+{state.queueLength - 20}</span>}
                  {state.queueLength === 0 && <span className="font-mono text-xs text-muted-foreground/50">empty</span>}
                </div>
                <div className="text-muted-foreground font-mono">→</div>
                <div className={`w-16 h-16 rounded-xl border-2 flex items-center justify-center font-mono text-xs transition-colors ${
                  state.serverBusy ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary/30 text-muted-foreground"
                }`}>
                  {state.serverBusy ? "TREATING" : "AVAILABLE"}
                </div>
                <div className="text-muted-foreground font-mono">→</div>
                <div className="text-center">
                  <div className="font-mono text-2xl font-bold text-accent">{state.customersServed}</div>
                  <div className="font-mono text-[10px] text-muted-foreground">TREATED</div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card/80 backdrop-blur-sm p-6">
              <h3 className="font-mono text-sm text-primary mb-4 uppercase tracking-wider">Queue Length Over Time</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(200 20% 15%)" />
                    <XAxis dataKey="time" tick={{ fill: "hsl(200 10% 50%)", fontSize: 10, fontFamily: "JetBrains Mono" }} stroke="hsl(200 20% 18%)" />
                    <YAxis tick={{ fill: "hsl(200 10% 50%)", fontSize: 10, fontFamily: "JetBrains Mono" }} stroke="hsl(200 20% 18%)" />
                    <Tooltip contentStyle={{ background: "hsl(220 20% 10%)", border: "1px solid hsl(200 20% 18%)", borderRadius: 8, fontFamily: "JetBrains Mono", fontSize: 12 }} />
                    <Area type="stepAfter" dataKey="queueLength" stroke="hsl(185 80% 50%)" fill="hsl(185 80% 50% / 0.15)" name="Queue Length" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QueueSimulator;
