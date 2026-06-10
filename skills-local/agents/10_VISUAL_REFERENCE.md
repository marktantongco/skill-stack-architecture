# 🎨 VISUAL REFERENCE

**Diagrams, decision trees, workflows. See the whole system.**

---

## SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLAUDE AI SYSTEM ARCHITECTURE                │
└─────────────────────────────────────────────────────────────────┘

                        USER INPUT
                            ↓
        ┌───────────────────────────────────────┐
        │   SILENT PROTOCOL (Invisible)         │
        │  1. What do they actually need?       │
        │  2. What's the one blind spot?        │
        │  3. What's the simplest answer?       │
        └───────────────────────────────────────┘
                            ↓
        ┌───────────────────────────────────────┐
        │   ROUTING DECISION TREE               │
        │  Stated = Actual?                     │
        │  ├─ Yes → Simple answer?              │
        │  │        ├─ Yes → SPEED MODE         │
        │  │        └─ No → DEPTH MODE          │
        │  └─ No → Critical blind spot?         │
        │         ├─ Yes → SURFACE FIRST       │
        │         └─ No → HYBRID MODE           │
        └───────────────────────────────────────┘
                            ↓
    ┌───────────────────────────────────────────────────┐
    │         CONTEXT DETECTION: Which Skill?           │
    ├───────────────────────────────────────────────────┤
    │ Design keywords     → SKILL_02 (Design)           │
    │ Code keywords       → SKILL_03 (Code)             │
    │ Agentic keywords    → SKILL_04 (Agentic)          │
    │ Else                → SKILL_01 (Conversational)    │
    └───────────────────────────────────────────────────┘
                            ↓
    ┌───────────────────────────────────────────────────┐
    │           LOAD SYSTEM PROMPT                       │
    │                                                   │
    │    UNIVERSAL (3,100 tokens)                       │
    │    + SKILL_XX (1,300-3,000 tokens)                │
    │    = 4,400-6,100 tokens total                     │
    │                                                   │
    │    ✓ Under 6.5k threshold (Opus 4.7 safe)        │
    └───────────────────────────────────────────────────┘
                            ↓
    ┌───────────────────────────────────────────────────┐
    │       EXECUTE IN SKILL CONTEXT                    │
    │                                                   │
    │  Apply skill-specific rules:                      │
    │  • Quality gates (40 items for code)             │
    │  • Depth-seeking (5 layers)                       │
    │  • Closing pattern (⚡ + ✨ + 🔗)                │
    │  • Voice principle (empowerment + faith)          │
    └───────────────────────────────────────────────────┘
                            ↓
    ┌───────────────────────────────────────────────────┐
    │           QUALITY CHECK                           │
    │                                                   │
    │  ✓ Works on first execution?                      │
    │  ✓ No placeholders or TODOs?                      │
    │  ✓ Assumptions stated?                            │
    │  ✓ Edge cases considered?                         │
    │  ✓ Tests included?                                │
    └───────────────────────────────────────────────────┘
                            ↓
                        OUTPUT
                            ↓
        ┌───────────────────────────────────────┐
        │   CONTINUITY PROTOCOL (Auto-carry)    │
        │  If context switch:                   │
        │  1. Review prior 10 messages           │
        │  2. Carry context forward              │
        │  3. Announce switch visibly            │
        │  4. Quick-Feedback Prompt              │
        └───────────────────────────────────────┘
```

---

## SKILL ROUTING MATRIX

```
┌────────────────────────────────────────────────────────────────┐
│                   WHICH SKILL TO USE?                          │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  SKILL_01: CONVERSATIONAL                                      │
│  ├─ Context: Mobile, chatting, exploration                    │
│  ├─ Keywords: ask, explore, think about, feedback             │
│  ├─ Effort: high                                              │
│  ├─ Response time: 2-10 seconds                               │
│  ├─ Tokens: 4,400 total                                       │
│  └─ Output: Conversational, warm, thought-partner             │
│                                                                │
│  SKILL_02: DESIGN + BUILD                                     │
│  ├─ Context: Desktop, visual, UI/UX, artifacts                │
│  ├─ Keywords: design, UI, component, visual, landing page     │
│  ├─ Effort: high                                              │
│  ├─ Response time: 5-60 seconds                               │
│  ├─ Tokens: 5,600 total                                       │
│  └─ Output: 3 options, beautiful, brand-aligned               │
│                                                                │
│  SKILL_03: CODE + API                                         │
│  ├─ Context: Desktop, production code, APIs, debugging        │
│  ├─ Keywords: code, debug, api, function, refactor, test      │
│  ├─ Effort: xhigh                                             │
│  ├─ Response time: 5-90 seconds                               │
│  ├─ Tokens: 6,100 total                                       │
│  └─ Output: Algorithm → Code → Tests → Edge cases             │
│                                                                │
│  SKILL_04: AGENTIC                                            │
│  ├─ Context: Autonomous, orchestration, subagents             │
│  ├─ Keywords: automate, orchestrate, agent, workflow          │
│  ├─ Effort: xhigh                                             │
│  ├─ Response time: 30s - 15 minutes                           │
│  ├─ Tokens: 6,000 total                                       │
│  └─ Output: Task decomposition, parallel execution, state     │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## DECISION TREE (What to Ask)

```
START: I need help with...

├─ Exploring / thinking / feedback?
│  └─ YES → Use SKILL_01 (Conversational)
│           "Let me think through this with you..."
│
├─ Visual / design / UI / components?
│  └─ YES → Use SKILL_02 (Design)
│           "I'll show you 3 design directions..."
│
├─ Code / debugging / API / algorithms?
│  └─ YES → Use SKILL_03 (Code)
│           "Algorithm first: 1. X, 2. Y, 3. Z. Here's code..."
│
├─ Automating / orchestrating / workflows?
│  └─ YES → Use SKILL_04 (Agentic)
│           "Task decomposition: Task A, B, C (parallel)..."
│
└─ ELSE → Ambiguous. Use SKILL_01, ask for clarity
          "Mind if I clarify: are you asking about..."

DECISION TIME: <5 seconds
KEYBOARD: ⌘1, ⌘2, ⌘3, ⌘4
TEXT COMMAND: ?1, ?2, ?3, ?4
```

---

## CONTINUITY PROTOCOL FLOW

```
MESSAGE 1: "Let's design an insurance landing page"
           ↓ [Auto-route to SKILL_02]
           Claude in DESIGN mode: "3 design directions..."
           
MESSAGE 2: "I like direction #2. Now code it."
           ↓ [User asks for code. CONTINUITY triggers.]
           
CONTINUITY PROTOCOL:
├─ System reviews Message 1 + Design output
├─ System loads UNIVERSAL + SKILL_03
├─ System generates announcement:
│  "Switching to Code mode — I've noted your 
│   design choice (direction #2). 
│   Building React component matching those specs..."
├─ Code output appears
└─ Quick-Feedback: "Was that transition smooth? (Y/N)"
           ↓
           If YES: CONTINUITY working ✓
           If NO: Check if context carried correctly

KEY: Context doesn't just carry = it's ANNOUNCED.
     User sees what's happening.
```

---

## WEEKLY HEALTH CHECK FLOW

```
EVERY MONDAY MORNING

┌─────────────────────────────┐
│ RUN HEALTH CHECK            │
│ (5 minutes)                 │
├─────────────────────────────┤
│                             │
│ ✓ Routing accuracy >90%?    │ ← YES → Continue
│ ✓ CONTINUITY >90%?          │ ← YES → Continue
│ ✓ Error rate <1%?           │ ← YES → Continue
│ ✓ Thinking normal?          │ ← YES → Continue
│ ✓ User satisfaction >80%?   │ ← YES → Continue
│                             │
└─────────────────────────────┘
           ↓ ALL YES
┌─────────────────────────────┐
│ ✅ SYSTEM HEALTHY           │
│ No action needed            │
│ Business as usual           │
└─────────────────────────────┘

IF ANY NO:
┌─────────────────────────────┐
│ ⚠️  INVESTIGATE              │
│ 1. Which metric failed?     │
│ 2. Why?                     │
│ 3. What's the fix?          │
│ 4. Implement fix            │
│ 5. Re-test                  │
└─────────────────────────────┘
```

---

## DEPLOYMENT TIMELINE

```
WEEK 1: Foundation
┌──────────────────────────────────────────┐
│ Mon    Deploy UNIVERSAL + SKILL_01       │
│ Tue-Wed Verification tests (4 messages)  │
│ Thu-Fri 3 test conversations logged      │
│ Status: LIVE ✓                           │
└──────────────────────────────────────────┘

WEEK 2: Testing
┌──────────────────────────────────────────┐
│ Mon-Fri Build SKILL_02/03/04             │
│         Test 6 conversations total       │
│         Log all results                  │
│ Status: TESTING                          │
└──────────────────────────────────────────┘

WEEK 3: Decision
┌──────────────────────────────────────────┐
│ Friday  Analyze Week 1-2 data            │
│         Make go/no-go decision           │
│ Decision options:                        │
│   A) All skills ship (Week 2 passed)     │
│   B) Iterate SKILL_01 (minor issues)     │
│   C) Major refactor (critical issues)    │
└──────────────────────────────────────────┘

WEEK 4+: Production
┌──────────────────────────────────────────┐
│ All 4 skills in production               │
│ Monitor weekly metrics                   │
│ Plan Phase 2 optimizations               │
│ Status: OPERATING NORMALLY ✓             │
└──────────────────────────────────────────┘
```

---

## QUALITY GATES (Code Example)

```
BEFORE SHIPPING CODE:

┌─────────────────────────────────────┐
│ QUALITY CHECKLIST (40 items)        │
├─────────────────────────────────────┤
│                                     │
│ EXECUTION (Runs without errors)     │
│ ☑ Imports all available?            │
│ ☑ No syntax errors?                 │
│ ☑ Variable names sensible?          │
│ ☑ Functions decomposed?             │
│                                     │
│ CORRECTNESS (Does the right thing)  │
│ ☑ Algorithm correct?                │
│ ☑ Logic branches covered?           │
│ ☑ Off-by-one errors? None.          │
│ ☑ Type mismatches? None.            │
│                                     │
│ EDGE CASES (Handles weird inputs)   │
│ ☑ Empty input?                      │
│ ☑ Null values?                      │
│ ☑ Out of bounds?                    │
│ ☑ Concurrent access?                │
│                                     │
│ ... (25 more checks)                │
│                                     │
└─────────────────────────────────────┘
         ↓
    All checks pass?
    ↓ YES → Ship it ✓
    ↓ NO  → Fix, re-check
```

---

## PARALLEL EXECUTION TIMELINE

```
SEQUENTIAL (Slow):
Design: [============] 2 hours
  └─ Code: [============] 3 hours
       └─ Test: [========] 1 hour
TOTAL: 6 hours

PARALLEL (Fast):
Design: [============]
Code:   [============] ← Starts immediately, uses spec
Test:   [========]     ← Starts when both ready
TOTAL: 3 hours (50% faster!)

KEY: Code doesn't wait for design to finish.
     Specs are clear → Code starts immediately.
```

---

## MONTHLY METRICS DASHBOARD

```
╔═══════════════════════════════════════════════════════════╗
║           MONTHLY PERFORMANCE DASHBOARD                  ║
║                  May 2024                                 ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  ROUTING ACCURACY                                         ║
║  94% ████████████████░░  Target: >90% ✓                 ║
║                                                           ║
║  CONTINUITY SUCCESS                                       ║
║  92% ████████████████░░  Target: >90% ✓                 ║
║                                                           ║
║  ERROR RATE                                               ║
║  0.6% ░░░░░░░░░░░░░░░░  Target: <1% ✓                  ║
║                                                           ║
║  USER SATISFACTION                                        ║
║  92% ████████████████░░  Target: >80% ✓                 ║
║                                                           ║
║  THINKING TIME                                            ║
║  Normal ░░░░░░░░░░░░░░   Target: Normal ✓               ║
║                                                           ║
║  STATUS: ✅ EXCELLENT                                     ║
║  All metrics green. System healthy.                       ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

TREND ARROWS (Month over month):
Routing:    94% → 95% → 96% ↗
CONTINUITY: 88% → 91% → 92% ↗
Errors:     0.8% → 0.7% → 0.6% ↘
Satisfaction: 88% → 90% → 92% ↗

TRAJECTORY: All improving. Keep current approach.
```

---

## WORKFLOW EXAMPLES

### Example 1: Simple Question

```
User: "What's the best way to structure React components?"

System:
├─ SILENT PROTOCOL: Asks about actual need
├─ ROUTING: "structure", "components" → SKILL_01
├─ LOAD: UNIVERSAL + SKILL_01
├─ EXECUTE: Conversational explanation
├─ OUTPUT: Clear answer + examples
└─ CONTINUITY: None (no switch)

Time: 5 seconds
Tokens: 1,200
Result: User satisfied ✓
```

### Example 2: Design Task

```
User: "Design a landing page for insurance"

System:
├─ SILENT PROTOCOL: Design request
├─ ROUTING: "design", "landing page" → SKILL_02
├─ LOAD: UNIVERSAL + SKILL_02
├─ EXECUTE: 3 design directions shown
├─ OUTPUT: Visual mockups + rationale
└─ CONTINUITY: Ready for next skill switch

Time: 30 seconds
Tokens: 2,400
Result: User chooses direction, ready to code
```

### Example 3: Skill Chain

```
User (msg 1): "Research insurance market"
  → SKILL_01, gets market analysis

User (msg 2): "Design based on that research"
  → CONTINUITY carries context
  → Switch to SKILL_02, gets design

User (msg 3): "Now code the design"
  → CONTINUITY carries both prior contexts
  → Switch to SKILL_03, gets code

Result: Complete product in 3 messages
Time: ~5 minutes
```

---

## ERROR RATE TRAJECTORY (Good)

```
Week 1: 1.2% ███
Week 2: 0.9% ██
Week 3: 0.6% █
Week 4: 0.5% █
Week 5: 0.4% █

Trend: ↘ Decreasing (good)
Status: Getting better, not worse
Action: Continue current approach
```

---

## TOKEN USAGE BY SKILL

```
                    Input Tokens    Output Tokens    Total
SKILL_01             500-800         1,200-2,000     1,700-2,800
SKILL_02            1,000-1,500      1,500-2,500     2,500-4,000
SKILL_03            1,200-1,800      2,000-4,000     3,200-5,800
SKILL_04            1,500-2,000      2,500-5,000     4,000-7,000

Average response:   1,000            1,500           2,500 tokens
                    ↑                 ↑               ↑
                 SKILL_01+       SKILL_01+          Total
                 prompt          system             (safe)
```

---

**End of Visual Reference**

Use these diagrams to understand the whole system at a glance.
Print them. Reference them. Make them your own.
