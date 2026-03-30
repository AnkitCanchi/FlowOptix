import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import { getAIInsight } from "@/lib/aiAnalysis";

const throughputData = [
  { hour: "06:00", actual: 18, target: 22 },
  { hour: "08:00", actual: 24, target: 22 },
  { hour: "10:00", actual: 21, target: 22 },
  { hour: "12:00", actual: 16, target: 22 },
  { hour: "14:00", actual: 25, target: 22 },
  { hour: "16:00", actual: 28, target: 22 },
  { hour: "18:00", actual: 22, target: 22 },
  { hour: "20:00", actual: 19, target: 22 },
];

const oeeData = [
  { metric: "Triage Speed", value: 88 },
  { metric: "Bed Availability", value: 74 },
  { metric: "Staff Utilization", value: 91 },
  { metric: "Discharge Rate", value: 79 },
  { metric: "Patient Sat.", value: 83 },
  { metric: "LWBS Avoidance", value: 96 },
];

const kpis = [
  { label: "Avg Wait Time", value: "38 min", trend: "-6 min", positive: true },
  { label: "Door-to-Doctor", value: "22 min", trend: "-4 min", positive: true },
  { label: "Patients/Shift", value: "147", trend: "+12", positive: true },
  { label: "LWBS Rate", value: "2.1%", trend: "-0.8%", positive: true },
  { label: "Bed Occupancy", value: "84%", trend: "on target", positive: true },
  { label: "Avg LOS", value: "3.8 hr", trend: "-0.5 hr", positive: true },
];

const Dashboard = () => {
  const [tick, setTick] = useState(0);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 3000);
    return () => clearInterval(interval);
  }, []);

  const analyzeShift = async () => {
    setAiLoading(true);
    setAiInsight(null);
    const context = `ED Shift Performance: Avg Wait=38min (-6min vs prior shift), Door-to-Doctor=22min (-4min), Patients/Shift=147 (+12), LWBS Rate=2.1% (-0.8%), Bed Occupancy=84%, Avg LOS=3.8hr (-0.5hr). Radar metrics: Triage Speed=88%, Bed Availability=74%, Staff Utilization=91%, Discharge Rate=79%, Patient Satisfaction=83%, LWBS Avoidance=96%. Throughput peaks at 8:00 and 12:00. Write a 3-4 sentence executive shift report: overall assessment, the standout metric, the one area still needing attention, and one priority action for the next shift.`;
    try {
      setAiInsight(await getAIInsight(context));
    } catch {
      setAiInsight("Report unavailable. Please try again.");
    }
    setAiLoading(false);
  };

  return (
    <section id="dashboard" className="py-24 relative">
      <div className="absolute inset-0 blueprint-grid opacity-10" />
      <div className="container relative z-10 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="font-mono text-xs text-primary tracking-widest uppercase mb-2">
            // Module 04
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            ED Operations <span className="text-primary">Dashboard</span>
          </h2>
          <p className="text-muted-foreground max-w-xl">
            Real-time KPIs tracking Emergency Department performance — wait times, door-to-doctor
            intervals, bed occupancy, and left-without-being-seen rates across all shifts.
          </p>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {kpis.map((kpi) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="rounded-xl border border-border bg-card/80 backdrop-blur-sm p-4 hover:border-primary/30 transition-colors"
            >
              <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{kpi.label}</div>
              <div className="font-mono text-xl font-bold text-foreground">{kpi.value}</div>
              <div className={`font-mono text-xs mt-1 ${kpi.positive ? "text-accent" : "text-node-warning"}`}>
                {kpi.trend}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Throughput Chart */}
          <div className="rounded-xl border border-border bg-card/80 backdrop-blur-sm p-6">
            <h3 className="font-mono text-sm text-primary mb-4 uppercase tracking-wider">Patients Treated/Hour vs Target</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={throughputData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(200 20% 15%)" />
                  <XAxis dataKey="hour" tick={{ fill: "hsl(200 10% 50%)", fontSize: 10, fontFamily: "JetBrains Mono" }} stroke="hsl(200 20% 18%)" />
                  <YAxis tick={{ fill: "hsl(200 10% 50%)", fontSize: 10, fontFamily: "JetBrains Mono" }} stroke="hsl(200 20% 18%)" />
                  <Tooltip contentStyle={{ background: "hsl(220 20% 10%)", border: "1px solid hsl(200 20% 18%)", borderRadius: 8, fontFamily: "JetBrains Mono", fontSize: 12 }} />
                  <Bar dataKey="actual" fill="hsl(185 80% 50% / 0.7)" radius={[4, 4, 0, 0]} name="Actual" />
                  <Bar dataKey="target" fill="hsl(200 20% 25%)" radius={[4, 4, 0, 0]} name="Target" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Radar Chart */}
          <div className="rounded-xl border border-border bg-card/80 backdrop-blur-sm p-6">
            <h3 className="font-mono text-sm text-primary mb-4 uppercase tracking-wider">ED Performance Radar</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={oeeData}>
                  <PolarGrid stroke="hsl(200 20% 18%)" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: "hsl(200 10% 50%)", fontSize: 10, fontFamily: "JetBrains Mono" }} />
                  <PolarRadiusAxis tick={{ fill: "hsl(200 10% 40%)", fontSize: 9 }} stroke="hsl(200 20% 15%)" />
                  <Radar dataKey="value" stroke="hsl(185 80% 50%)" fill="hsl(185 80% 50% / 0.15)" strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="mt-6 ai-panel p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">AI Shift Report</span>
            </div>
            <button
              onClick={analyzeShift}
              disabled={aiLoading}
              data-testid="button-analyze-shift"
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors disabled:opacity-50"
            >
              {aiLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
              {aiLoading ? "Generating…" : "Generate Report"}
            </button>
          </div>
          {aiInsight ? (
            <p className="text-sm text-foreground/85 leading-relaxed">{aiInsight}</p>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              Click Generate Report to get an AI-written executive summary of this shift's performance.
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
