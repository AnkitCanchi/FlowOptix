import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";
import { getAIInsight } from "@/lib/aiAnalysis";

interface FacilityNode {
  id: string;
  label: string;
  type: "arrival" | "triage" | "treatment" | "outcome";
  x: number;
  y: number;
}

interface FlowEdge {
  from: string;
  to: string;
  flow: number;
  capacity: number;
}

const nodes: FacilityNode[] = [
  { id: "s1", label: "Walk-In Patients", type: "arrival", x: 60, y: 80 },
  { id: "s2", label: "Ambulance", type: "arrival", x: 60, y: 220 },
  { id: "s3", label: "Urgent Referral", type: "arrival", x: 60, y: 360 },
  { id: "f1", label: "Triage Bay A", type: "triage", x: 280, y: 120 },
  { id: "f2", label: "Triage Bay B", type: "triage", x: 280, y: 300 },
  { id: "w1", label: "ED Room Block A", type: "treatment", x: 500, y: 100 },
  { id: "w2", label: "ED Room Block B", type: "treatment", x: 500, y: 220 },
  { id: "w3", label: "ED Room Block C", type: "treatment", x: 500, y: 340 },
  { id: "c1", label: "Discharged", type: "outcome", x: 700, y: 60 },
  { id: "c2", label: "Admitted", type: "outcome", x: 700, y: 180 },
  { id: "c3", label: "ICU Transfer", type: "outcome", x: 700, y: 300 },
  { id: "c4", label: "Observation", type: "outcome", x: 700, y: 400 },
];

const edges: FlowEdge[] = [
  { from: "s1", to: "f1", flow: 150, capacity: 200 },
  { from: "s2", to: "f1", flow: 80, capacity: 120 },
  { from: "s2", to: "f2", flow: 100, capacity: 150 },
  { from: "s3", to: "f2", flow: 130, capacity: 180 },
  { from: "f1", to: "w1", flow: 120, capacity: 160 },
  { from: "f1", to: "w2", flow: 110, capacity: 150 },
  { from: "f2", to: "w2", flow: 90, capacity: 130 },
  { from: "f2", to: "w3", flow: 140, capacity: 170 },
  { from: "w1", to: "c1", flow: 70, capacity: 100 },
  { from: "w1", to: "c2", flow: 50, capacity: 80 },
  { from: "w2", to: "c2", flow: 100, capacity: 120 },
  { from: "w2", to: "c3", flow: 100, capacity: 110 },
  { from: "w3", to: "c3", flow: 60, capacity: 90 },
  { from: "w3", to: "c4", flow: 80, capacity: 100 },
];

const typeColors: Record<string, { fill: string; stroke: string; label: string }> = {
  arrival: { fill: "hsl(185 80% 50% / 0.1)", stroke: "hsl(185 80% 50%)", label: "Patient Arrivals" },
  triage: { fill: "hsl(165 70% 45% / 0.1)", stroke: "hsl(165 70% 45%)", label: "Triage" },
  treatment: { fill: "hsl(45 90% 55% / 0.1)", stroke: "hsl(45 90% 55%)", label: "Treatment Rooms" },
  outcome: { fill: "hsl(280 70% 60% / 0.1)", stroke: "hsl(280 70% 60%)", label: "Outcomes" },
};

const SupplyChainViz = () => {
  const getNode = (id: string) => nodes.find((n) => n.id === id)!;
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const totalFlow = edges.reduce((s, e) => s + e.flow, 0);
  const totalCapacity = edges.reduce((s, e) => s + e.capacity, 0);
  const networkUtil = ((totalFlow / totalCapacity) * 100).toFixed(1);

  const analyzeFlow = async () => {
    setAiLoading(true);
    setAiInsight(null);
    const context = `ED Patient Flow Network: ${totalFlow} patients/shift processed against ${totalCapacity} capacity (${networkUtil}% utilization). Bottleneck: Treatment→ICU pathway. Patient inputs: Walk-In (150/200), Ambulance bay A (80/120), Ambulance bay B (100/150), Urgent Referral (130/180). Outcomes: 120 discharged home, 150 admitted to ward, 160 ICU transfers, 160 observation. Identify the primary bottleneck in 3-4 sentences: what is its clinical risk, what is causing the ICU transfer constraint, and what specific operational change would most reduce throughput time?`;
    try {
      setAiInsight(await getAIInsight(context));
    } catch {
      setAiInsight("Analysis unavailable. Please try again.");
    }
    setAiLoading(false);
  };

  return (
    <section id="supply-chain" className="py-24 relative">
      <div className="absolute inset-0 blueprint-grid opacity-10" />
      <div className="container relative z-10 px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
          <div className="font-mono text-xs text-primary tracking-widest uppercase mb-2">// Module 03</div>
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Patient Flow <span className="text-primary">Network</span>
          </h2>
          <p className="text-muted-foreground max-w-xl">
            Network flow model of an Emergency Department — from patient arrival through triage and
            treatment to final outcome. Edge thickness shows patient volume; color intensity reveals
            where bottlenecks form and capacity is being strained.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="rounded-xl border border-border bg-card/80 backdrop-blur-sm p-6 overflow-auto">
              <svg viewBox="0 0 800 460" className="w-full" style={{ minWidth: 600 }}>
                {edges.map((e, i) => {
                  const from = getNode(e.from);
                  const to = getNode(e.to);
                  const util = e.flow / e.capacity;
                  return (
                    <g key={i}>
                      <line x1={from.x + 30} y1={from.y + 15} x2={to.x - 10} y2={to.y + 15}
                        stroke={`hsl(185 80% 50% / ${0.3 + util * 0.7})`} strokeWidth={1 + util * 3}
                        strokeDasharray="8 4" className="animate-flow-dash" />
                      <text x={(from.x + to.x) / 2 + 15} y={(from.y + to.y) / 2 + 10}
                        fill="hsl(200 10% 45%)" fontSize="9" fontFamily="JetBrains Mono">
                        {e.flow}/{e.capacity}
                      </text>
                    </g>
                  );
                })}
                {nodes.map((n) => {
                  const colors = typeColors[n.type];
                  const w = n.type === "arrival" || n.type === "outcome" ? 80 : 70;
                  return (
                    <g key={n.id}>
                      <rect x={n.x - 10} y={n.y} width={w} height={30} rx={4}
                        fill={colors.fill} stroke={colors.stroke} strokeWidth={1.5} />
                      <text x={n.x - 10 + w / 2} y={n.y + 19} textAnchor="middle"
                        fill="hsl(200 20% 85%)" fontSize="9" fontFamily="JetBrains Mono">
                        {n.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card/80 backdrop-blur-sm p-5">
              <h3 className="font-mono text-sm text-primary mb-3 uppercase tracking-wider">Flow Stats</h3>
              <div className="space-y-3 font-mono text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Total Patients</span><span className="text-foreground">{totalFlow}/shift</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Capacity</span><span className="text-foreground">{totalCapacity}/shift</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Bed Utilization</span><span className="text-primary font-bold">{networkUtil}%</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Bottleneck</span><span className="text-node-warning">Treatment→ICU</span></div>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card/80 backdrop-blur-sm p-5">
              <h3 className="font-mono text-sm text-primary mb-3 uppercase tracking-wider">Legend</h3>
              <div className="space-y-2">
                {Object.entries(typeColors).map(([key, val]) => (
                  <div key={key} className="flex items-center gap-2 font-mono text-xs">
                    <span className="w-3 h-3 rounded-sm border" style={{ background: val.fill, borderColor: val.stroke }} />
                    <span className="text-muted-foreground">{val.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card/80 backdrop-blur-sm p-5">
              <h3 className="font-mono text-sm text-primary mb-3 uppercase tracking-wider">Methodology</h3>
              <p className="font-mono text-xs text-muted-foreground leading-relaxed">
                Directed graph G(V,E) solved via successive shortest path algorithm with reduced costs. 
                Capacity constraints enforce upper bounds on each arc.
              </p>
            </div>

            <div className="ai-panel p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">AI Analysis</span>
                </div>
                <button
                  onClick={analyzeFlow}
                  disabled={aiLoading}
                  data-testid="button-analyze-flow"
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors disabled:opacity-50"
                >
                  {aiLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                  {aiLoading ? "Analyzing…" : "Find Bottleneck"}
                </button>
              </div>
              {aiInsight ? (
                <p className="text-sm text-foreground/85 leading-relaxed">{aiInsight}</p>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  Click Find Bottleneck to get an AI-powered analysis of where patients are waiting longest.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SupplyChainViz;
