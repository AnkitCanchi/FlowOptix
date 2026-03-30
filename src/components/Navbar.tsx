import { useState } from "react";
import { motion } from "framer-motion";
import { Activity, Menu, X } from "lucide-react";

const navItems = [
  { label: "ED Simulator", href: "#simulator" },
  { label: "Staff Scheduler", href: "#lp-solver" },
  { label: "Patient Flow", href: "#supply-chain" },
  { label: "Dashboard", href: "#dashboard" },
  { label: "About", href: "#about" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl"
    >
      <div className="container flex h-16 items-center justify-between">
        <a href="#" className="flex items-center gap-2 group">
          <Activity className="h-5 w-5 text-primary animate-pulse-glow" />
          <span className="font-mono text-sm font-semibold tracking-widest uppercase text-primary">
            ANKIT CANCHI
          </span>
        </a>

        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="px-3 py-2 text-sm font-mono text-muted-foreground hover:text-primary transition-colors relative group"
            >
              <span className="text-primary/40 mr-1">&gt;</span>
              {item.label}
              <span className="absolute bottom-0 left-0 w-0 h-px bg-primary group-hover:w-full transition-all duration-300" />
            </a>
          ))}
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-muted-foreground hover:text-primary transition-colors"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl"
        >
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block px-6 py-3 text-sm font-mono text-muted-foreground hover:text-primary hover:bg-secondary/50 transition-colors"
            >
              <span className="text-primary/40 mr-2">&gt;</span>
              {item.label}
            </a>
          ))}
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
