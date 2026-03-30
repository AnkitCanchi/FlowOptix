import { motion } from "framer-motion";
import { BookOpen, Code, Database, GitBranch } from "lucide-react";

const topics = [
  {
    icon: BookOpen,
    title: "Queuing Theory in the ED",
    desc: "Emergency departments are M/M/c queues. Modeling patient arrivals and physician service rates reveals exactly how staffing decisions drive — or destroy — wait times.",
  },
  {
    icon: Database,
    title: "Data-Driven Staffing",
    desc: "Historical arrival patterns, shift-level throughput data, and regression models let us predict peak demand and staff proactively — before the waiting room overflows.",
  },
  {
    icon: GitBranch,
    title: "Lean Healthcare",
    desc: "DMAIC and value stream mapping applied to patient flow eliminate non-value-added steps — unnecessary handoffs, redundant triage checks, and avoidable boarding delays.",
  },
  {
    icon: Code,
    title: "LP-Based Scheduling",
    desc: "Linear programming finds the minimum-cost staffing mix that keeps wait times within target thresholds — balancing coverage requirements, shift constraints, and budget limits.",
  },
];

const AboutSection = () => {
  return (
    <section id="about" className="py-24 relative">
      <div className="absolute inset-0 blueprint-grid opacity-10" />
      <div className="container relative z-10 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="font-mono text-xs text-primary tracking-widest uppercase mb-2">
            // About This Project
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            The Problem Is <span className="text-primary">Solvable</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl leading-relaxed">
            The average US emergency room makes patients wait 2.5 hours — not because medicine is slow,
            but because the system around it isn't engineered. Industrial Engineering gives us the exact
            tools to fix this: queuing models that predict congestion, LP solvers that optimize staffing,
            and flow diagrams that expose bottlenecks before they become crises. Every simulator here was
            built from scratch by <span className="text-primary font-medium">Ankit Canchi</span> to show
            what a data-driven ED looks like.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-4 mb-16">
          {topics.map((t, i) => (
            <motion.div
              key={t.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl border border-border bg-card/80 backdrop-blur-sm p-6 hover:border-primary/30 transition-colors group"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg border border-primary/30 bg-primary/5 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
                  <t.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold mb-2">{t.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer / Credit */}
        <div className="border-t border-border pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="font-mono text-sm text-foreground">
              Created by <span className="text-primary font-semibold">Ankit Canchi</span>
            </div>
            <div className="flex items-center gap-6">
              <span className="font-mono text-xs text-muted-foreground/50">
                React • TypeScript • Recharts • Framer Motion • AI-Powered
              </span>
            </div>
          </div>
          <div className="text-center mt-4">
            <span className="font-mono text-[10px] text-muted-foreground/30">
              All simulations run client-side — no external APIs. Pure mathematics.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
