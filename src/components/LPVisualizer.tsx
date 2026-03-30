import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";
import { getAIInsight } from "@/lib/aiAnalysis";

interface Constraint {
  a: number;
  b: number;
  op: "<=" | ">=" | "=";
  rhs: number;
  label: string;
  color: string;
}

const LPVisualizer = () => {
  const [c1, setC1] = useState(5); // objective x coefficient
  const [c2, setC2] = useState(4); // objective y coefficient
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [constraints, setConstraints] = useState<Constraint[]>([
    { a: 6, b: 4, op: "<=", rhs: 24, label: "Staffing Budget", color: "hsl(185 80% 50%)" },
    { a: 1, b: 2, op: "<=", rhs: 6, label: "Coverage Hours", color: "hsl(165 70% 45%)" },
    { a: 1, b: 0, op: "<=", rhs: 3, label: "Max Day Staff", color: "hsl(45 90% 55%)" },
  ]);

  const scale = 50;
  const maxVal = 8;
  const svgW = maxVal * scale;
  const svgH = maxVal * scale;

  // Find feasible vertices
  const vertices = useMemo(() => {
    const lines: { a: number; b: number; rhs: number }[] = [
      ...constraints.map((c) => ({ a: c.a, b: c.b, rhs: c.rhs })),
      { a: 1, b: 0, rhs: 0 }, // x >= 0
      { a: 0, b: 1, rhs: 0 }, // y >= 0
    ];

    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i < lines.length; i++) {
      for (let j = i + 1; j < lines.length; j++) {
        const det = lines[i].a * lines[j].b - lines[j].a * lines[i].b;
        if (Math.abs(det) < 1e-9) continue;
        const x = (lines[i].rhs * lines[j].b - lines[j].rhs * lines[i].b) / det;
        const y = (lines[i].a * lines[j].rhs - lines[j].a * lines[i].rhs) / det;
        if (x < -1e-9 || y < -1e-9) continue;
        // Check feasibility
        const feasible = constraints.every(
          (c) => c.a * x + c.b * y <= c.rhs + 1e-9
        );
        if (feasible) pts.push({ x, y });
      }
    }

    // Sort by angle for polygon
    if (pts.length === 0) return [];
    const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
    const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
    pts.sort((a, b) => Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx));
    return pts;
  }, [constraints]);

  const optimal = useMemo(() => {
    if (vertices.length === 0) return null;
    let best = vertices[0];
    let bestVal = c1 * best.x + c2 * best.y;
    for (const v of vertices) {
      const val = c1 * v.x + c2 * v.y;
      if (val > bestVal) {
        best = v;
        bestVal = val;
      }
    }
    return { ...best, z: bestVal };
  }, [vertices, c1, c2]);

  const toSvg = (x: number, y: number) => ({
    sx: x * scale,
    sy: svgH - y * scale,
  });

  const analyzeOptimal = async () => {
    if (!optimal) return;
    setAiLoading(true);
    setAiInsight(null);
    const context = `ED Staff Scheduling LP Result: Maximizing patient throughput with objective ${c1}x₁ + ${c2}x₂. Optimal: x₁*=${optimal.x.toFixed(2)} day-shift physicians, x₂*=${optimal.y.toFixed(2)} night-shift physicians, achieving Z*=${optimal.z.toFixed(2)} patients treated per shift. Constraints: Staffing Budget (6x₁+4x₂≤24), Coverage Hours (x₁+2x₂≤6), Max Day Staff (x₁≤3). Interpret this staffing schedule in 3-4 sentences for a hospital administrator: what does this mix mean operationally, which constraint is the binding bottleneck, and what would happen if the budget constraint were relaxed by 20%?`;
    try {
      setAiInsight(await getAIInsight(context));
    } catch {
      setAiInsight("Analysis unavailable. Please try again.");
    }
    setAiLoading(false);
  };

  return (
    <section id="lp-solver" className="py-24 relative">
      <div className="absolute inset-0 blueprint-grid opacity-10" />
      <div className="container relative z-10 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="font-mono text-xs text-primary tracking-widest uppercase mb-2">
            // Module 02
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Staff Scheduling <span className="text-primary">Optimizer</span>
          </h2>
          <p className="text-muted-foreground max-w-xl">
            Find the optimal number of day-shift (x₁) and night-shift (x₂) physicians to maximize
            patient throughput while respecting staffing budget and coverage constraints. Drag the
            objective coefficients to see how priorities shift the optimal solution.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card/80 backdrop-blur-sm p-6 box-glow">
              <h3 className="font-mono text-sm text-primary mb-4 uppercase tracking-wider">Objective Function</h3>
              <div className="font-mono text-lg text-foreground mb-4">
                max patients = <span className="text-primary">{c1}</span>x₁ + <span className="text-accent">{c2}</span>x₂
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-mono text-xs text-muted-foreground">c₁ (x₁ coefficient)</span>
                    <span className="font-mono text-sm text-primary">{c1}</span>
                  </div>
                  <input type="range" min="0" max="10" step="0.5" value={c1}
                    onChange={(e) => setC1(Number(e.target.value))}
                    className="w-full accent-primary" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-mono text-xs text-muted-foreground">c₂ (x₂ coefficient)</span>
                    <span className="font-mono text-sm text-accent">{c2}</span>
                  </div>
                  <input type="range" min="0" max="10" step="0.5" value={c2}
                    onChange={(e) => setC2(Number(e.target.value))}
                    className="w-full accent-accent" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card/80 backdrop-blur-sm p-6">
              <h3 className="font-mono text-sm text-primary mb-4 uppercase tracking-wider">Constraints</h3>
              <div className="space-y-3">
                {constraints.map((c, i) => (
                  <div key={i} className="font-mono text-sm flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: c.color }} />
                    <span className="text-muted-foreground">
                      {c.a}x₁ + {c.b}x₂ ≤ {c.rhs}
                    </span>
                    <span className="text-muted-foreground/50 text-xs ml-auto">{c.label}</span>
                  </div>
                ))}
                <div className="font-mono text-sm text-muted-foreground/50">
                  x₁, x₂ ≥ 0
                </div>
              </div>
            </div>

            {optimal && (
              <div className="rounded-xl border border-primary/30 bg-primary/5 backdrop-blur-sm p-6 box-glow">
                <h3 className="font-mono text-sm text-primary mb-3 uppercase tracking-wider">Optimal Solution</h3>
                <div className="space-y-2 font-mono text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">x₁*</span>
                    <span className="text-foreground">{optimal.x.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">x₂*</span>
                    <span className="text-foreground">{optimal.y.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2 mt-2">
                    <span className="text-primary font-semibold">Z*</span>
                    <span className="text-primary font-bold text-lg">{optimal.z.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="ai-panel p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">AI Analysis</span>
                </div>
                <button
                  onClick={analyzeOptimal}
                  disabled={aiLoading || !optimal}
                  data-testid="button-analyze-lp"
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors disabled:opacity-50"
                >
                  {aiLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                  {aiLoading ? "Analyzing…" : "Interpret Result"}
                </button>
              </div>
              {aiInsight ? (
                <p className="text-sm text-foreground/85 leading-relaxed">{aiInsight}</p>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  {optimal ? "Click Interpret Result to get an AI explanation of this staffing schedule." : "Adjust constraints to find a feasible region first."}
                </p>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="rounded-xl border border-border bg-card/80 backdrop-blur-sm p-6">
              <h3 className="font-mono text-sm text-primary mb-4 uppercase tracking-wider">Feasible Region</h3>
              <div className="w-full overflow-auto">
                <svg width={svgW + 40} height={svgH + 40} viewBox={`-20 -20 ${svgW + 40} ${svgH + 40}`}
                  className="w-full max-w-[500px] mx-auto">
                  {/* Grid */}
                  {Array.from({ length: maxVal + 1 }).map((_, i) => {
                    const { sx, sy } = toSvg(i, 0);
                    const { sy: syTop } = toSvg(i, maxVal);
                    return (
                      <g key={`grid-${i}`}>
                        <line x1={sx} y1={sy} x2={sx} y2={syTop} stroke="hsl(200 20% 14%)" strokeWidth="0.5" />
                        <line x1={0} y1={toSvg(0, i).sy} x2={svgW} y2={toSvg(0, i).sy} stroke="hsl(200 20% 14%)" strokeWidth="0.5" />
                        <text x={sx} y={sy + 15} textAnchor="middle" fill="hsl(200 10% 40%)" fontSize="10" fontFamily="JetBrains Mono">{i}</text>
                        {i > 0 && <text x={-8} y={toSvg(0, i).sy + 4} textAnchor="end" fill="hsl(200 10% 40%)" fontSize="10" fontFamily="JetBrains Mono">{i}</text>}
                      </g>
                    );
                  })}

                  {/* Axes */}
                  <line x1={0} y1={svgH} x2={svgW} y2={svgH} stroke="hsl(200 20% 25%)" strokeWidth="1.5" />
                  <line x1={0} y1={0} x2={0} y2={svgH} stroke="hsl(200 20% 25%)" strokeWidth="1.5" />
                  <text x={svgW - 10} y={svgH + 15} fill="hsl(200 10% 50%)" fontSize="11" fontFamily="JetBrains Mono">x₁</text>
                  <text x={-15} y={10} fill="hsl(200 10% 50%)" fontSize="11" fontFamily="JetBrains Mono">x₂</text>

                  {/* Feasible region */}
                  {vertices.length > 2 && (
                    <polygon
                      points={vertices.map((v) => { const p = toSvg(v.x, v.y); return `${p.sx},${p.sy}`; }).join(" ")}
                      fill="hsl(185 80% 50% / 0.08)"
                      stroke="hsl(185 80% 50% / 0.3)"
                      strokeWidth="1"
                    />
                  )}

                  {/* Constraint lines */}
                  {constraints.map((c, i) => {
                    const pts: string[] = [];
                    if (c.b !== 0) {
                      const y0 = c.rhs / c.b;
                      const xEnd = c.rhs / c.a;
                      if (c.a !== 0) {
                        const p1 = toSvg(0, Math.min(y0, maxVal));
                        const p2 = toSvg(Math.min(xEnd, maxVal), c.b !== 0 ? (c.rhs - c.a * Math.min(xEnd, maxVal)) / c.b : 0);
                        return <line key={i} x1={p1.sx} y1={p1.sy} x2={p2.sx} y2={p2.sy} stroke={c.color} strokeWidth="2" strokeDasharray="6 3" opacity="0.7" />;
                      }
                    } else if (c.a !== 0) {
                      const xVal = c.rhs / c.a;
                      const p1 = toSvg(xVal, 0);
                      const p2 = toSvg(xVal, maxVal);
                      return <line key={i} x1={p1.sx} y1={p1.sy} x2={p2.sx} y2={p2.sy} stroke={c.color} strokeWidth="2" strokeDasharray="6 3" opacity="0.7" />;
                    }
                    return null;
                  })}

                  {/* Vertices */}
                  {vertices.map((v, i) => {
                    const p = toSvg(v.x, v.y);
                    return (
                      <circle key={i} cx={p.sx} cy={p.sy} r="4" fill="hsl(200 20% 90%)" stroke="hsl(185 80% 50%)" strokeWidth="1.5" />
                    );
                  })}

                  {/* Optimal */}
                  {optimal && (
                    <g>
                      <circle cx={toSvg(optimal.x, optimal.y).sx} cy={toSvg(optimal.x, optimal.y).sy} r="8" fill="none" stroke="hsl(185 80% 50%)" strokeWidth="2" opacity="0.5">
                        <animate attributeName="r" values="8;14;8" dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.5;0.1;0.5" dur="2s" repeatCount="indefinite" />
                      </circle>
                      <circle cx={toSvg(optimal.x, optimal.y).sx} cy={toSvg(optimal.x, optimal.y).sy} r="5" fill="hsl(185 80% 50%)" />
                      <text x={toSvg(optimal.x, optimal.y).sx + 12} y={toSvg(optimal.x, optimal.y).sy - 8}
                        fill="hsl(185 80% 50%)" fontSize="11" fontFamily="JetBrains Mono" fontWeight="600">
                        Z*={optimal.z.toFixed(1)}
                      </text>
                    </g>
                  )}
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LPVisualizer;
