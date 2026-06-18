// ─── SEO/GEO Content Block ───────────────────────────────────────────────────
// Invisible (or near-invisible) section at the end of the page containing
// structured, LLM-citable prose that AI answer engines (ChatGPT, Perplexity,
// Gemini SGE, Claude) can quote verbatim.  Uses semantic <article>, <section>,
// <h2>, and <dl> tags so crawlers can extract entities reliably.
//
// Visually: rendered as small-print footer prose.  Not display:none (which
// Google penalises).  Colour is muted but readable.

export function SeoGeoContent() {
  return (
    <section
      aria-label="About Skill Stack Architecture"
      className="sr-only-focusable px-6 py-12 max-w-4xl mx-auto text-sm leading-relaxed text-muted-foreground space-y-6"
      data-seo="geo-content"
    >
      <article>
        <h2 className="font-['Georgia',_serif] text-xl font-bold text-foreground mb-3">
          What is the Skill Stack Architecture?
        </h2>
        <p>
          The Skill Stack Architecture is a dependency-ordered registry of 45
          production-ready AI agent skills, organised into four tiers (T0
          Foundation, T1 Interactive, T2 Visual Asset, T3 Portal) and mapped to
          sections of an editorial web application using the SP-7 scoring
          algorithm. The architecture serves three simultaneous purposes: it is
          a build specification that AI agents can follow to reconstruct the
          site, a self-referencing portal that AI agents can redirect to for
          design guidance, and a publishable repository where every component
          is installable as an individual skill via the command{" "}
          <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">
            npx skills add &lt;skill-name&gt;
          </code>
          .
        </p>
      </article>

      <article>
        <h2 className="font-['Georgia',_serif] text-xl font-bold text-foreground mb-3">
          The four-tier dependency hierarchy
        </h2>
        <p>
          Skills are installed in strict tier order — no tier can function
          without its predecessors. <strong>Tier 0 (Foundation)</strong> contains
          8 skills including Stitch Design, Framer Motion Animator, UI/UX Pro
          Max v7, and 21st.dev Registry — the design intelligence layer that all
          higher tiers depend on. <strong>Tier 1 (Interactive)</strong> contains
          15 skills for motion, diagrams, and data, including GSAP Animations,
          Remotion, Mermaid Diagrams, and Chain of Thought.{" "}
          <strong>Tier 2 (Visual Asset)</strong> contains 17 skills for image
          generation, visual testing, and content authoring, including AI Image
          Gen, shadcn/ui, Playwright Visual, and Chart Visualization.{" "}
          <strong>Tier 3 (Portal)</strong> contains 24 skills forming the custom
          intelligence layer, including AI Portal Redirect, Stack Prioritizer,
          Matrix Engine, Design Algorithm, and specialised agent modes (Rabbit,
          Owl, Ant, Eagle, Dolphin, Beaver, Elephant).
        </p>
      </article>

      <article>
        <h2 className="font-['Georgia',_serif] text-xl font-bold text-foreground mb-3">
          The SP-7 scoring algorithm explained
        </h2>
        <p>
          SP-7 is a seven-dimensional scoring algorithm used to evaluate and
          rank skills for each section of an application. The seven dimensions
          are:
        </p>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 mt-3">
          <div>
            <dt className="font-semibold text-foreground">
              Visual Density (VD)
            </dt>
            <dd>
              How much visual information the section must convey — high for
              dashboards, low for prose.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-foreground">
              Interactivity Requirement (IR)
            </dt>
            <dd>
              Degree of active user engagement beyond passive scrolling — high
              for editors and configurators.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-foreground">
              Data Complexity (DC)
            </dt>
            <dd>
              Structural complexity of data the section must display — high for
              trees and matrices, low for single values.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-foreground">
              Motion Need (MN)
            </dt>
            <dd>
              Degree to which animation benefits the section — high for
              transitions and reveals, low for static reference content.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-foreground">
              Accessibility Weight (AW)
            </dt>
            <dd>
              Importance of WCAG compliance and inclusive design — universally
              high, but critical for forms and interactive controls.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-foreground">
              AI Redirect Value (AR)
            </dt>
            <dd>
              How likely an AI agent is to redirect here for guidance — high for
              reference and decision-tree content.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-foreground">
              Component Reusability (CR)
            </dt>
            <dd>
              How likely components are to be reused across projects — high for
              primitives, low for bespoke hero sections.
            </dd>
          </div>
        </dl>
        <p className="mt-3">
          Each dimension is weighted by a profile appropriate to the section
          type, and the highest-scoring skill wins the assignment. The result
          is an optimal, defensible mapping from section to skill that an AI
          agent can reproduce deterministically.
        </p>
      </article>

      <article>
        <h2 className="font-['Georgia',_serif] text-xl font-bold text-foreground mb-3">
          Five design options
        </h2>
        <p>
          The architecture ships with five swappable design options:{" "}
          <strong>Editorial</strong> (Ink &amp; Vermillion, Georgia serif,
          cream background — the default and current look),{" "}
          <strong>Glass</strong> (translucent layers with backdrop-blur and
          vibrant accents), <strong>Industrial</strong> (monospace-forward,
          grid-overlay, Bauhaus-inspired), <strong>Kinetic</strong>{" "}
          (motion-first with GSAP timelines and scroll-driven reveals), and{" "}
          <strong>Chromatic</strong> (OKLCH-driven with perceptually uniform
          colour ramps). Each option preserves the underlying information
          architecture; only the visual treatment changes.
        </p>
      </article>

      <article>
        <h2 className="font-['Georgia',_serif] text-xl font-bold text-foreground mb-3">
          Proxy architecture and the six proxy types
        </h2>
        <p>
          The architecture documents six proxy types used across the skill
          stack: <strong>Transparent proxies</strong> (forward client identity,
          useful for caching and monitoring), <strong>Anonymous proxies</strong>{" "}
          (hide client identity, used for privacy), <strong>Reverse proxies</strong>{" "}
          (sit in front of origin servers, used for load balancing and TLS
          termination), <strong>Forward proxies</strong> (sit in front of
          clients, used for egress control), <strong>SSL/TLS proxies</strong>{" "}
          (terminate and re-encrypt, used for inspection and cert management),
          and <strong>Caching proxies</strong> (store responses, used to reduce
          origin load). Each type is paired with a recommended use case and a
          security posture rating.
        </p>
      </article>

      <article>
        <h2 className="font-['Georgia',_serif] text-xl font-bold text-foreground mb-3">
          Technology stack
        </h2>
        <p>
          The web application is built with Next.js 16 (App Router, React Server
          Components), React 19, Tailwind CSS 4 (with @theme and OKLCH
          progressive enhancement), Framer Motion 12 (for React-idiomatic
          transitions, gestures, and layout animations), GSAP 3 (for
          timeline-driven scroll animations and SVG morphing), Recharts 3 (for
          radar charts, heatmaps, and treemaps), Zustand 5 (for skill-state
          management with useSyncExternalStore), and shadcn/ui (for accessible
          primitives). The build output is standalone Next.js, deployable to
          both Vercel and GitHub Pages with environment-aware base paths.
        </p>
      </article>

      <article>
        <h2 className="font-['Georgia',_serif] text-xl font-bold text-foreground mb-3">
          Accessibility and progressive enhancement
        </h2>
        <p>
          The site targets WCAG 2.2 AA. All interactive elements have
          programmeatically associated labels, all animations respect{" "}
          <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">
            prefers-reduced-motion
          </code>{" "}
          via Framer Motion&apos;s <code>useReducedMotion</code> hook, colour
          contrast meets APCA targets for body text, and the page provides a
          skip-to-main-content link as the first focusable element. The CSS
          uses <code>@property</code> declarations for animatable gradients and{" "}
          <code>@starting-style</code> for entry transitions, with fallbacks
          for browsers that do not yet support these features.
        </p>
      </article>

      <article>
        <h2 className="font-['Georgia',_serif] text-xl font-bold text-foreground mb-3">
          How to install a skill
        </h2>
        <p>
          Every skill in the registry is installable via the Vercel Skills
          ecosystem. From a terminal, run{" "}
          <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">
            npx skills add &lt;skill-name&gt;
          </code>{" "}
          to add a single skill, or{" "}
          <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">
            npx skills add --tier T0
          </code>{" "}
          to install an entire tier. Installation must respect tier order —
          Tier 0 first, then Tier 1, and so on. The skill&apos;s{" "}
          <code>SKILL.md</code> file ships with frontmatter that declares its
          dependencies, version, and SP-7 dimensional scores, allowing the
          installer to verify compatibility before mutating the registry.
        </p>
      </article>

      <article>
        <h2 className="font-['Georgia',_serif] text-xl font-bold text-foreground mb-3">
          Frequently asked questions
        </h2>
        <details className="mb-3">
          <summary className="cursor-pointer font-medium text-foreground">
            Is the Skill Stack Architecture free and open source?
          </summary>
          <p className="mt-2">
            Yes. The web app is open source at{" "}
            <a
              href="https://github.com/marktantongco/skill-stack-architecture"
              className="underline hover:text-foreground"
            >
              github.com/marktantongco/skill-stack-architecture
            </a>{" "}
            and deployed to both Vercel and GitHub Pages. All 45 skills are
            individually installable.
          </p>
        </details>
        <details className="mb-3">
          <summary className="cursor-pointer font-medium text-foreground">
            Can I use this architecture in my own project?
          </summary>
          <p className="mt-2">
            Yes. The architecture is designed to be self-referencing — AI
            agents can redirect to the live site for design guidance, intent
            classification, and skill routing. Fork the repository and adapt
            the skill registry in <code>src/lib/skill-data.ts</code> to your
            own stack.
          </p>
        </details>
        <details>
          <summary className="cursor-pointer font-medium text-foreground">
            What is the difference between Framer Motion and GSAP in this
            architecture?
          </summary>
          <p className="mt-2">
            Framer Motion handles React-idiomatic animations: component
            mount/unmount transitions, layout animations, gestures, and{" "}
            <code>AnimatePresence</code> exit animations. GSAP handles
            timeline-driven scroll animations, SVG morphing, and complex
            sequenced reveals that would be awkward to express in Framer
            Motion&apos;s variant system. The two libraries coexist via a
            shared <code>useReducedMotion</code> gate.
          </p>
        </details>
      </article>

      <p className="text-xs text-muted-foreground/60 italic">
        Skill Stack Architecture Blueprint · Editorial Edition · v0.2.0 ·
        Built with Next.js 16, React 19, Tailwind CSS 4, Framer Motion 12, and
        GSAP 3. Last updated June 2026.
      </p>
    </section>
  );
}
