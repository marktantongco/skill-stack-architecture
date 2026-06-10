## 📊 DEPTH-SEEKING AUDIT

### What the Prompt Currently Does (Speed Mode)

| Rule | Output | Problem |
|------|--------|---------|
| "Rank by impact" | Jumps to solution | Skips why other solutions failed |
| "Never ask to repeat context" | Uses conversation history | Doesn't verify assumptions are still valid |
| "Assume expert-level" | Skips foundational thinking | Builds on fragile logic |
| "Structure First — outline silently" | Shows finished thinking | Hides the reasoning |
| "Skip closing block on: one-liners" | Fast replies | Misses depth in simple problems |

**Result**: Correct answers delivered fast. But *why* they're correct? Often opaque.

---

## 🔬 WHAT "DEPTH-SEEKING" MEANS

Depth isn't "longer answers." It's:

1. **Assumption excavation** — What belief does this question rest on? Is it true?
2. **Counter-argument engagement** — What could prove you wrong? What would change the answer?
3. **First-principles thinking** — What are you reducing to? What are the primitives?
4. **Trace logic** — How did you get here? Not just "here's the answer."
5. **Constraint mapping** — What are the hard edges? What doesn't fit the model?
6. **Long-game framing** — How does this decision compound in 6 months? 2 years?

---

## ⚙️ OPTIMIZATION STRATEGY

### Layer 1: Add Depth Gating (Before Solution)

```markdown
🔍 BEFORE SOLVING, ALWAYS:

1. Name the implicit assumption (what must be true for this to matter?)
2. State the frame (what problem are you actually solving?)
3. Test the frame (what would break it?)
4. Only then → propose solution
```

**Why**: Most "wrong" answers come from solving the wrong problem, not bad execution.

---

### Layer 2: Make Reasoning Visible

```markdown
🧠 SHOW YOUR WORK

Never: "Here's the solution: X"
Always: "I'm thinking X because [assumption] + [evidence] + [constraint]. 
Counter-case: [why this fails]. Still holds? Then X."

For code: "This works because [why the logic is sound] and fails on [edge cases]."
```

**Why**: Lets you catch your own logic gaps before they ship.

---

### Layer 3: Replace "Assume Expert" with Calibration

```markdown
CHANGE:
"Assume expert-level unless told otherwise"

TO:
"Ask once: Is this discovery work or implementation? 
New problem or known pattern? Building or fixing?"
Then calibrate depth floor to the answer."
```

**Why**: Depth needs context. "Expert" without context breeds arrogance.

---

### Layer 4: Extend the Closing Block

```markdown
Current: ⚡⚡ Next Step + ✨ 3 Suggestions

Add: 🔗 Hidden Assumption
"The logic above assumes: ___. 
If that's wrong, the answer changes to: ___"

This forces you to see what you're betting on.
```

**Why**: Single point of failure detection.

---

### Layer 5: Build in the Contrarian Loop

```markdown
For complex problems, ALWAYS ask:
"What would I have to believe to be wrong about this?"

Then answer it. If you can't, you haven't thought deep enough.
```

**Why**: Depth = resisting your own conclusions.

---

## 🛠️ OPTIMIZED PROMPT CHANGES

Here's what to **add** (keep everything else):

```markdown
---

🔬 DEPTH-SEEKING MODE (All Complex Tasks)

BEFORE ANSWERING:

1. Surface the Frame — What problem are you solving?
   "This assumes: [X must be true]"
2. Test the Frame — What would falsify it?
   "It breaks if: [Y changes]"
3. Build the Model — What are the parts? How do they connect?
   "This rests on: [first principles]"
4. Show Reasoning — Why this way, not that way?
   "I chose X over Y because [trade-off analysis]"
5. Name the Risk — What could go wrong?
   "The blind spot: [what I might be missing]"

THEN execute the solution.

---

🔗 EXTEND CLOSING BLOCK

Add after ✨ 3 Suggestions:

**Hidden Assumption**
State the core belief your answer rests on.
What would change the answer if false?

**Inverse Test**
If the opposite were true, what would you do?
(Forces you to see the reasoning, not just the conclusion.)

---

🧠 SHOW YOUR WORK

For CODE:
- State the algorithm before the code
- Explain the trade-off (speed vs. memory vs. readability)
- Trace through an example (happy + break case)

For STRATEGY:
- Lay out the decision tree
- Show what evidence would change the recommendation
- Name the long-term impact (3 months, 1 year, 3 years)

For ANALYSIS:
- Show the data path (what you looked at, in order)
- Explain alternative interpretations
- Name the gap (what data would flip the conclusion)

---

DEPTH HIERARCHY (Use This to Decide):

Shortcut: "Do X"
Shallow: "Do X because Y"
Depth: "Do X because Y; but Z is true if [condition], changing answer to W"
Master: Traces the logic AND shows you could reach a different conclusion with different data.

Seek Master level on: code architecture, product strategy, long-term bets.
Accept Shallow on: tactical tasks, urgent decisions, well-established patterns.
```

---

## 📋 THE DELTA (What Changes)

| Before | After |
|--------|-------|
| "Here's the solution" | "Here's why I think this is the solution — AND what would break it" |
| Outline silently | Outline visibly (in thinking block or plain text) |
| Assume expert → skip basics | Ask context once → calibrate depth accordingly |
| Close with next step | Close with next step + hidden assumption + inverse test |
| Speed bias | Depth bias (but still no fluff) |

---

## 🚨 CRITICAL: Don't Over-Optimize

**Wrong way**: Add depth requirements to everything. Now every one-liner takes 10 minutes.

**Right way**: 
- Use depth-seeking mode on: strategy, architecture, novel problems
- Keep speed mode on: well-known patterns, tactical execution, fast feedback loops
- Let the problem type decide

```markdown
Quick decision tree:

"Have I solved this exact problem before?" 
→ Yes: Speed mode. Execute.
→ No: Depth mode. Reason first.

"Is this reversible?"
→ Yes: Speed mode. Ship, learn, iterate.
→ No: Depth mode. Get it right the first time.
```

---

⚡⚡ **Recommended Next Step**  
Add the "🔬 DEPTH-SEEKING MODE" section to your prompt. Then test it on ONE strategic task (not tactical). See if the quality of reasoning improves without ballooning the response time.

✨ **3 Suggestions**
- **Tactical** — Create a checklist: "Frame named? Tested? First principles shown?" Run through it before closing any complex answer. Catches shallow thinking in 30 seconds.
- **Strategic** — The real leverage isn't longer answers — it's *better* questions. Add a "Questions I should ask before answering" section. Often the depth comes from asking the right thing, not explaining thoroughly.
- **Reframe** — Speed and depth aren't opposites. A 2-minute answer with visible logic beats a 20-minute ramble every time. Your depth problem isn't length — it's hiding the reasoning. Make the logic transparent, not longer.
