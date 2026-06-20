"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { staggerContainer, fadeInUp } from "@/lib/animation-variants";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { TextScramble } from "@/components/motion/TextScramble";

export function HeroSection() {
  const shouldReduce = useReducedMotion();
  const noMotion = shouldReduce ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } } : null;

  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <section className="relative py-20 md:py-32 px-6 bg-foreground overflow-hidden" aria-label="Hero masthead">
      {/* Subtle cross-hatch texture */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} aria-hidden="true" />

      <motion.div style={shouldReduce ? {} : { y, opacity }} className="relative z-10 max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
          {/* Left Column — Masthead */}
          <div className="md:col-span-8">
            <motion.div
              variants={noMotion || staggerContainer}
              initial="hidden"
              animate="visible"
            >
              <motion.p
                variants={noMotion || fadeInUp}
                transition={{ duration: 0.6 }}
                className="text-[10px] tracking-[0.4em] uppercase text-primary font-semibold mb-8"
              >
                Interactive Web &middot; Skill Stack Architecture
              </motion.p>

              <motion.h1
                variants={noMotion || fadeInUp}
                transition={{ duration: 0.6 }}
                className="font-['Georgia',_serif] text-4xl md:text-6xl lg:text-[5.5rem] font-bold text-background leading-[1.05] mb-8"
              >
                Skill Stack
                <br />
                <span className="text-primary">Architecture</span>
                <br />
                Blueprint
              </motion.h1>

              <motion.div
                variants={noMotion || fadeInUp}
                transition={{ duration: 0.6 }}
                className="h-px bg-background/15 mb-8 max-w-sm"
              />

              <motion.p
                variants={noMotion || fadeInUp}
                transition={{ duration: 0.6 }}
                className="text-base md:text-lg text-background/50 max-w-md leading-relaxed mb-2"
              >
                16 skills. 4 tiers. 5 design options. 1 design algorithm.
              </motion.p>
              <motion.p
                variants={noMotion || fadeInUp}
                transition={{ duration: 0.6 }}
                className="text-sm text-background/35 font-mono"
              >
                <MagneticButton
                  href="#marketplace"
                  strength={0.25}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 -mx-3 -my-1.5 rounded-sm border border-background/15 hover:border-primary/60 hover:bg-background/5 transition-colors font-mono text-sm"
                  aria-label="Browse the skill marketplace"
                >
                  <span className="text-primary/80">$</span>
                  <TextScramble
                    text="npx skills add"
                    trigger="hover"
                    speed={28}
                    className="text-background/70"
                  />
                </MagneticButton>
              </motion.p>
            </motion.div>
          </div>

          {/* Right Column — Stats */}
          <div className="md:col-span-4">
            <motion.div
              initial={shouldReduce ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="md:border-l md:border-background/10 md:pl-8"
            >
              <motion.div
                variants={noMotion || staggerContainer}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-2 gap-x-8 gap-y-8"
              >
                {[
                  { value: "16", label: "Skills" },
                  { value: "4", label: "Tiers" },
                  { value: "5", label: "Options" },
                  { value: "7", label: "Dimensions" },
                ].map((stat) => (
                  <motion.div
                    key={stat.label}
                    variants={noMotion || fadeInUp}
                    whileHover={shouldReduce ? undefined : { scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <div className="font-['Georgia',_serif] text-3xl md:text-4xl font-bold text-primary">
                      {stat.value}
                    </div>
                    <div className="text-[9px] tracking-[0.3em] uppercase text-background/30 mt-1.5">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
