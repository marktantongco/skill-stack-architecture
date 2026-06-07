"use client";

import { motion, AnimatePresence } from "framer-motion";
import { options } from "@/lib/skill-data";
import { useState, useEffect } from "react";
import Image from "next/image";

const optionImages = [
  { id: "opt1", src: "/option-autopoietic.png", alt: "The Autopoietic Canvas — self-evolving generative design" },
  { id: "opt2", src: "/option-kinetic.png", alt: "Kinetic Spatial — motion-first design language" },
  { id: "opt3", src: "/option-chromatic.png", alt: "Chromatic Minimal — precision through restraint" },
  { id: "opt4", src: "/option-glass.png", alt: "Glass Depth — architectural layered surfaces" },
  { id: "opt5", src: "/option-industrial.png", alt: "Neo-Industrial — raw structural power" },
];

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function VisualGallery() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const selected = selectedImage
    ? optionImages.find(img => img.id === selectedImage) || { id: "editorial", src: "/option-editorial.png", alt: "Editorial layout — the chosen design direction" }
    : null;

  // Close lightbox on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedImage(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <section id="visual-gallery" className="py-20 md:py-28 px-6" aria-label="Visual Asset Gallery">
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
              <span className="font-['Georgia',_serif] text-5xl md:text-6xl font-bold text-border leading-none" aria-hidden="true">11</span>
              <h2 className="font-['Georgia',_serif] text-2xl md:text-3xl font-bold text-foreground leading-tight">
                Visual Asset Gallery
              </h2>
            </div>
            <div className="editorial-pullquote ml-0 md:ml-20">
              AI-generated concept visuals for each design option. Each image captures the essence of the option&apos;s visual identity, color strategy, and spatial philosophy.
            </div>
          </div>
          <div className="md:col-span-4 flex items-end justify-end">
            <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
              Generated via AI Image Gen (S09)
            </p>
          </div>
        </motion.div>

        <hr className="editorial-rule-thick mb-10" />

        {/* Gallery Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {optionImages.map((img) => {
            const option = options.find(o => o.id === img.id);
            return (
              <motion.div
                key={img.id}
                variants={fadeInUp}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                onClick={() => setSelectedImage(img.id)}
                className="cursor-pointer group card-container"
                role="button"
                tabIndex={0}
                aria-label={`View ${option?.name || img.alt} full size`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedImage(img.id);
                  }
                }}
              >
                <div className="border border-border rounded overflow-hidden hover:border-foreground/30 transition-colors">
                  {/* Image */}
                  <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  {/* Caption */}
                  <div className="p-4 border-t border-border">
                    <div className="flex items-baseline justify-between mb-1">
                      <h3 className="font-['Georgia',_serif] text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                        {option?.name}
                      </h3>
                      <span className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground font-mono">
                        {option?.dominantSkill}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{option?.tagline}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Editorial Hero Image — spans full width */}
          <motion.div
            variants={fadeInUp}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="md:col-span-2 cursor-pointer group"
            onClick={() => setSelectedImage("editorial")}
            role="button"
            tabIndex={0}
            aria-label="View Editorial Direction full size"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setSelectedImage("editorial");
              }
            }}
          >
            <div className="border border-border rounded overflow-hidden hover:border-foreground/30 transition-colors">
              <div className="relative aspect-[21/9] overflow-hidden bg-muted">
                <Image
                  src="/option-editorial.png"
                  alt="Editorial layout — the chosen design direction"
                  fill
                  className="object-cover group-hover:scale-[1.01] transition-transform duration-500"
                  sizes="100vw"
                />
              </div>
              <div className="p-4 border-t border-border">
                <div className="flex items-baseline justify-between mb-1">
                  <h3 className="font-['Georgia',_serif] text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                    Editorial Direction — Selected
                  </h3>
                  <span className="text-[10px] tracking-[0.15em] uppercase text-primary font-semibold">
                    Active Design
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Ink & Vermillion palette, Georgia serif, 12-column grid, horizontal rules, pull quotes
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Lightbox */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-foreground/90 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setSelectedImage(null)}
              role="dialog"
              aria-modal="true"
              aria-label="Image lightbox"
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="relative max-w-4xl w-full"
              >
                <div className="relative aspect-[16/9] bg-muted rounded overflow-hidden">
                  <Image
                    src={selected.src}
                    alt={selected.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1200px) 100vw, 1200px"
                  />
                </div>
                <div className="absolute top-3 right-3">
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="min-w-[44px] min-h-[44px] bg-foreground/80 text-background rounded-full flex items-center justify-center text-lg hover:bg-foreground transition-colors cursor-pointer"
                    aria-label="Close lightbox"
                  >
                    &times;
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
