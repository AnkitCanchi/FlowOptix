import { useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";

const HeroSection = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    const nodes = Array.from({ length: 22 }, () => ({
      x: Math.random() * canvas.offsetWidth,
      y: Math.random() * canvas.offsetHeight,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 2 + 1.5,
    }));

    const animate = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 160) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(148, 182, 255, ${(1 - dist / 160) * 0.12})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(148, 182, 255, 0.5)`;
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const stats = useMemo(() => [
    { label: "Avg ER Wait", value: "2.5 hrs", sub: "US national average" },
    { label: "Bed Occupancy", value: "87%", sub: "typical urban ED" },
    { label: "Door-to-Doctor", value: "34 min", sub: "median time" },
    { label: "LWBS Rate", value: "4.2%", sub: "left without being seen" },
  ], []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div className="absolute inset-0 blueprint-grid opacity-[0.15]" />
      <div className="absolute inset-0 gradient-radial" />

      <div className="relative z-10 container px-6 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-10">
            <span className="w-1.5 h-1.5 rounded-full bg-primary opacity-80" />
            <span className="text-xs font-medium text-primary/80 tracking-wide uppercase">
              ED Systems — Wait Time Optimization
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.08] mb-7">
            <span className="text-foreground">Cutting Hospital</span>
            <br />
            <span className="text-primary">Wait Times</span>
            <span className="text-foreground"> Through</span>
            <br />
            <span className="text-accent">Engineering</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Every hour a patient spends waiting is a system failure. These AI-powered tools apply
            queuing theory, LP optimization, and flow analysis to Emergency Department operations —
            built by <span className="text-foreground font-medium">Ankit Canchi</span>.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-16">
            <a
              href="#simulator"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            >
              Launch ED Simulator
              <span className="text-primary-foreground/70">→</span>
            </a>
            <a
              href="#about"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border text-muted-foreground text-sm font-medium hover:border-primary/40 hover:text-foreground transition-colors"
            >
              Read More
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto"
        >
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-border bg-card/70 backdrop-blur-sm p-4 text-center"
            >
              <div className="text-2xl font-bold text-primary mb-1 font-mono">{s.value}</div>
              <div className="text-xs font-semibold text-foreground/80 uppercase tracking-wider mb-0.5">{s.label}</div>
              <div className="text-[11px] text-muted-foreground">{s.sub}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
