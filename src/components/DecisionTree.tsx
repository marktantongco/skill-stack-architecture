"use client";

import { motion, useReducedMotion } from "framer-motion";
import { staggerContainer, fadeInUp } from "@/lib/animation-variants";
import { useState } from "react";

interface DecisionNode {
  id: string;
  question: string;
  options: { label: string; next: string; description: string }[];
}

interface DecisionResult {
  optionId: string;
  optionName: string;
  tagline: string;
  reason: string;
}

const decisionTree: Record<string, DecisionNode> = {
  start: {
    id: "start",
    question: "What is your primary design priority?",
    options: [
      { label: "Motion & Animation", next: "motion", description: "Fluid, choreographed interactions are central to the experience" },
      { label: "Restraint & Precision", next: "restraint", description: "Less is more — every element must earn its place" },
      { label: "Spatial Depth", next: "depth", description: "Layered, immersive 3D-like surfaces and glass effects" },
      { label: "Raw Power", next: "power", description: "Bold, industrial confidence with visible structure" },
      { label: "Self-Evolution", next: "evolution", description: "The design should build and refine itself iteratively" },
    ],
  },
  motion: {
    id: "motion",
    question: "How should motion express hierarchy?",
    options: [
      { label: "Choreographed multi-tier timing", next: "result-kinetic", description: "Macro/Meso/Micro timing with spring physics" },
      { label: "Organic, spring-based refinement", next: "result-autopoietic", description: "Progressive refinement through iterative loops" },
    ],
  },
  restraint: {
    id: "restraint",
    question: "What level of animation is acceptable?",
    options: [
      { label: "Maximum 3 types per page", next: "result-chromatic", description: "Strict cubic-bezier, fixed durations, minimal motion" },
      { label: "Mechanical, step-based", next: "result-industrial", description: "Snap transitions, typewriter reveals, grid-based" },
    ],
  },
  depth: {
    id: "depth",
    question: "How should depth be expressed on mobile?",
    options: [
      { label: "Reduced 2-3 layers with parallax", next: "result-glass", description: "Accelerometer tilt, gradient-over-blur fallback" },
      { label: "Snap-lock with visible grids", next: "result-industrial", description: "Press-and-release, structural clarity" },
    ],
  },
  power: {
    id: "power",
    question: "What visual language conveys authority?",
    options: [
      { label: "Monospace + safety-color accents", next: "result-industrial", description: "JetBrains Mono, bold yellow/red on near-black" },
      { label: "Depth-driven premium surfaces", next: "result-glass", description: "Frosted glass, blur gradients, immersive feel" },
    ],
  },
  evolution: {
    id: "evolution",
    question: "How should the system evolve?",
    options: [
      { label: "Autonomous iterative loops", next: "result-autopoietic", description: "Baton-passing generation cycles, self-reading state" },
      { label: "Choreographed animation sequences", next: "result-kinetic", description: "Motion-first design with progressive enhancement" },
    ],
  },
};

const results: Record<string, DecisionResult> = {
  "result-kinetic": { optionId: "opt2", optionName: "Kinetic Spatial", tagline: "Motion-First Design Language", reason: "Your priority on choreographed motion and spatial hierarchy makes Kinetic Spatial the ideal match. Framer Motion Animator dominates at 40%, with UI/UX Pro Max providing the design governance layer at 25%. Every interaction is a designed motion sequence." },
  "result-chromatic": { optionId: "opt3", optionName: "Chromatic Minimal", tagline: "Precision Through Restraint", reason: "Your commitment to restraint and precision aligns with Chromatic Minimal. UI/UX Pro Max dominates at 40%, enforcing a two-color system and maximum 3 animation types per page. The absence of decoration IS the design statement." },
  "result-glass": { optionId: "opt4", optionName: "Glass Depth", tagline: "Architectural Layered Surfaces", reason: "Your preference for spatial depth and layered surfaces points to Glass Depth. The 21st.dev Registry dominates at 35%, providing the frosted glass component library. Parallax, 3D transforms, and depth-gradient palettes create immersive premium experiences." },
  "result-industrial": { optionId: "opt5", optionName: "Neo-Industrial", tagline: "Raw Structural Power", reason: "Your desire for raw, structural power matches Neo-Industrial. UI/UX Pro Max and Framer Motion share dominance at 35% and 30%, creating mechanical step-based animations with monospace typography and safety-color accents." },
  "result-autopoietic": { optionId: "opt1", optionName: "The Autopoietic Canvas", tagline: "Self-Evolving Design System", reason: "Your vision of self-evolving design aligns with The Autopoietic Canvas. Stitch Design dominates at 40%, enabling autonomous iterative generation cycles where the interface builds and refines itself through baton-passing loops." },
};

export function DecisionTree() {
  const [currentNode, setCurrentNode] = useState("start");
  const [path, setPath] = useState<string[]>(["start"]);
  const [result, setResult] = useState<DecisionResult | null>(null);
  const shouldReduce = useReducedMotion();

  const handleChoice = (next: string) => {
    if (next.startsWith("result-")) {
      setResult(results[next]);
      setPath([...path, next]);
    } else {
      setCurrentNode(next);
      setPath([...path, next]);
    }
  };

  const reset = () => {
    setCurrentNode("start");
    setPath(["start"]);
    setResult(null);
  };

  const goBack = () => {
    const newPath = path.slice(0, -1);
    setPath(newPath);
    const prev = newPath[newPath.length - 1];
    setCurrentNode(decisionTree[prev] ? prev : "start");
    setResult(null);
  };

  const node = decisionTree[currentNode];

  return (
    <section id="decision-tree" className="py-20 md:py-28 px-6" aria-label="Decision Tree">
      <div className="max-w-[1200px] mx-auto">
        {/* Section Header */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-14"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="md:col-span-8">
            <div className="flex items-baseline gap-4 mb-3">
              <span className="font-['Georgia',_serif] text-5xl md:text-6xl font-bold text-border leading-none" aria-hidden="true">09</span>
              <h2 className="font-['Georgia',_serif] text-2xl md:text-3xl font-bold text-foreground leading-tight">
                Decision Tree
              </h2>
            </div>
            <div className="editorial-pullquote ml-0 md:ml-20">
              Answer three questions to find your optimal design option. Each path maps to one of the five architectures with a specific skill dominance hierarchy.
            </div>
          </div>
        </motion.div>

        <hr className="editorial-rule-thick mb-10" />

        {/* Path Breadcrumb */}
        <div className="flex items-center gap-2 mb-8 text-[10px] tracking-[0.15em] uppercase text-muted-foreground font-mono" aria-label="Decision path">
          {path.map((p, i) => (
            <span key={i} className="flex items-center gap-2">
              {i > 0 && <span className="text-border" aria-hidden="true">&rarr;</span>}
              <span className={i === path.length - 1 ? "text-primary font-semibold" : ""}>
                {p === "start" ? "Start" : decisionTree[p]?.question.split("?")[0].slice(0, 20) || (results[p]?.optionName || p)}
              </span>
            </span>
          ))}
        </div>

        {result ? (
          /* Result Display */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-t-2 border-foreground pt-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-5">
                <p className="text-[10px] tracking-[0.25em] uppercase text-primary font-semibold mb-3">Your Match</p>
                <h3 className="font-['Georgia',_serif] text-3xl md:text-4xl font-bold text-foreground mb-2">
                  {result.optionName}
                </h3>
                <p className="text-sm text-muted-foreground italic">{result.tagline}</p>
              </div>
              <div className="md:col-span-7 md:border-l md:border-border md:pl-8">
                <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground font-semibold mb-3">Why This Option</p>
                <p className="text-base text-muted-foreground leading-relaxed mb-6">{result.reason}</p>
                <motion.button
                  onClick={reset}
                  whileHover={shouldReduce ? undefined : { scale: 1.02 }}
                  whileTap={shouldReduce ? undefined : { scale: 0.98 }}
                  className="min-h-[44px] text-[11px] tracking-[0.15em] uppercase text-primary border border-primary/30 px-4 py-2 rounded hover:bg-primary/5 font-medium cursor-pointer"
                  aria-label="Start decision tree over"
                >
                  Start Over
                </motion.button>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Question + Choices */
          <motion.div
            key={currentNode}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="border-t-2 border-foreground pt-8">
              <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground font-semibold mb-4">
                Question {path.length} of 3
              </p>
              <h3 className="font-['Georgia',_serif] text-2xl md:text-3xl font-bold text-foreground mb-8">
                {node.question}
              </h3>

              <div className="space-y-0 divide-y divide-border" role="radiogroup" aria-label={node.question}>
                {node.options.map((opt, i) => (
                  <motion.button
                    key={i}
                    onClick={() => handleChoice(opt.next)}
                    whileHover={shouldReduce ? undefined : { scale: 1.005, x: 4 }}
                    whileTap={shouldReduce ? undefined : { scale: 0.995 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="w-full text-left min-h-[44px] py-5 group flex items-start gap-4 hover:bg-muted/10 -mx-2 px-2 cursor-pointer"
                    role="radio"
                    aria-checked={false}
                    aria-label={opt.label}
                  >
                    <span className="font-['Georgia',_serif] text-xl font-bold text-border group-hover:text-primary transition-colors shrink-0 mt-0.5" aria-hidden="true">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <div>
                      <span className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                        {opt.label}
                      </span>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{opt.description}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {path.length > 1 && (
              <motion.button
                onClick={goBack}
                whileHover={shouldReduce ? undefined : { x: -2 }}
                whileTap={shouldReduce ? undefined : { scale: 0.98 }}
                className="mt-6 min-h-[44px] text-[11px] tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground font-medium cursor-pointer"
                aria-label="Go back to previous question"
              >
                &larr; Go Back
              </motion.button>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
}
