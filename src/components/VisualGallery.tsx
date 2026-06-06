"use client";

import { motion } from "framer-motion";
import { options } from "@/lib/skill-data";
import { useState } from "react";
import Image from "next/image";

const optionImages = [
  { id: "opt1", src: "/option-autopoietic.png", alt: "The Autopoietic Canvas — self-evolving generative design" },
  { id: "opt2", src: "/option-kinetic.png", alt: "Kinetic Spatial — motion-first design language" },
  { id: "opt3", src: "/option-chromatic.png", alt: "Chromatic Minimal — precision through restraint" },
  { id: "opt4", src: "/option-glass.png", alt: "Glass Depth — architectural layered surfaces" },
  { id: "opt5", src: "/option-industrial.png", alt: "Neo-Industrial — raw structural power" },
];

export function VisualGallery() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const selected = selectedImage ? optionImages.find(img => img.id === selectedImage) : null;

  return (
    <section id="visual-gallery" className="py-20 md:py-28 px-6">
      <div className="max-w-[1200px] mx-auto">
        {/* Section Header */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-14">
          <div className="md:col-span-8">
            <div className="flex items-baseline gap-4 mb-3">
              <span className="font-['Georgia',_serif] text-5xl md:text-6xl font-bold text-border leading-none">11</span>
              <h2 className="font-['Georgia',_serif] text-2xl md:text-3xl font-bold text-foreground leading-tight">
                Visual Asset Gallery
              </h2>
            </div>
            <div className="editorial-pullquote ml-0 md:ml-20">
              AI-generated concept visuals for each design option. Each image captures the essence of the option's visual identity, color strategy, and spatial philosophy.
            </div>
          </div>
          <div className="md:col-span-4 flex items-end justify-end">
            <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
              Generated via AI Image Gen (S09)
            </p>
          </div>
        </div>

        <hr className="editorial-rule-thick mb-10" />

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {optionImages.map((img, i) => {
            const option = options.find(o => o.id === img.id);
            return (
              <motion.div
                key={img.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                onClick={() => setSelectedImage(img.id)}
                className="cursor-pointer group"
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
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="md:col-span-2 cursor-pointer group"
            onClick={() => setSelectedImage("editorial")}
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
        </div>

        {/* Lightbox */}
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
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
                  className="w-8 h-8 bg-foreground/80 text-background rounded-full flex items-center justify-center text-lg hover:bg-foreground transition-colors"
                >
                  &times;
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
