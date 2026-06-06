"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const floatingSkills = [
  { name: "Stitch Loop", x: "10%", y: "20%", delay: 0 },
  { name: "Framer Motion", x: "75%", y: "15%", delay: 0.5 },
  { name: "UI/UX Pro Max", x: "25%", y: "70%", delay: 1 },
  { name: "21st.dev", x: "80%", y: "65%", delay: 1.5 },
  { name: "GSAP", x: "50%", y: "40%", delay: 0.8 },
  { name: "Remotion", x: "15%", y: "50%", delay: 1.2 },
  { name: "Mermaid", x: "65%", y: "80%", delay: 0.3 },
  { name: "AntV", x: "90%", y: "35%", delay: 0.7 },
];

export function HeroSection() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F2027] via-[#203A43] to-[#2C5364]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(212,175,55,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_80%,rgba(102,126,234,0.12),transparent_50%)]" />
      </div>

      {/* Floating skill badges */}
      {floatingSkills.map((skill, i) => (
        <motion.div
          key={skill.name}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.3, scale: 1 }}
          transition={{ delay: skill.delay + 1, duration: 0.5 }}
          className="absolute hidden md:block"
          style={{ left: skill.x, top: skill.y }}
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: "easeInOut" }}
            className="px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs text-white/40 font-mono"
          >
            {skill.name}
          </motion.div>
        </motion.div>
      ))}

      {/* Main content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mb-8"
          />
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 tracking-tight">
            Interactive Web
            <br />
            <span className="bg-gradient-to-r from-[#D4AF37] to-[#667eea] bg-clip-text text-transparent">
              Skill Stack Architecture
            </span>
          </h1>
          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-8">
            16 skills. 4 tiers. 5 design options. 1 design algorithm.
            <br className="hidden md:block" />
            Every item installable via <code className="text-[#D4AF37]/80">npx skills add</code>
          </p>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.2, delay: 0.4 }}
            className="h-0.5 bg-gradient-to-r from-transparent via-[#667eea] to-transparent"
          />
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="flex flex-wrap justify-center gap-6 md:gap-10 mt-12"
        >
          {[
            { value: "16", label: "Skills" },
            { value: "4", label: "Tiers" },
            { value: "5", label: "Options" },
            { value: "7", label: "Dimensions" },
            { value: "12", label: "Sections" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-[#D4AF37]">{stat.value}</div>
              <div className="text-xs text-white/40 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-16"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block text-white/30"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
