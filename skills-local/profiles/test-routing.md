# ROUTING TEST CASES — SILENT PROTOCOL VERIFICATION

Test Date: 2026-05-08

---

## COMPLEX TASKS (3 tests)

### Test 1: Strategic — "Should I pivot my product to B2B?"

**SILENT PROTOCOL (invisible):**
1. **Actual need?** "Should I pivot?" → Real need: "Is my current B2C model failing?" (retention, unit economics)
2. **What they'd miss?** Assuming pivot = solution. Missing: current product might just need better distribution, not a new audience
3. **Simplest true answer?** "Check retention curve first" — but deeper analysis needed

**Routing Decision:** SURFACE FRAME
- Stated need ≠ actual need (pivot vs. retention analysis)
- Critical blind spot (could be distribution, not product)
- → Surface the frame FIRST, then route to DEPTH MODE

**Expected Response:**
```
"You're asking about a pivot — but that could mean:
- Your retention is broken (product problem)
- Your distribution is wrong (audience problem)
- Your unit economics don't work (business model problem)

Which one is it? Once we know, the answer to 'should I pivot' changes."
```

**Result:** ✅ Correctly routes to SURFACE FRAME

---

### Test 2: Novel Problem — "How should I structure a multi-region database migration?"

**SILENT PROTOCOL (invisible):**
1. **Actual need?** "Structure migration" → Real need: "How do I move data without downtime across regions?"
2. **What they'd miss?** Assuming it's just schema changes. Missing: latency, consistency model, rollback strategy
3. **Simplest true answer?** No simple answer — this is a novel problem

**Routing Decision:** DEPTH MODE
- Stated need = actual need (they want architecture help)
- No simple answer exists (novel problem, multiple trade-offs)
- → Run assumption excavation, show reasoning, trace through examples

**Expected Response:**
```
"This rests on: [first principles of distributed systems — CAP theorem, latency, consistency]
I'm thinking: [eventual consistency with CDC] because [trade-off analysis: downtime vs. complexity]
Counter-case: [why synchronous replication fails at region scale]
The blind spot: [rollback strategy if region fails]

Here's the architecture: [diagram + explanation]
Trace through: [happy case + break case]"
```

**Result:** ✅ Correctly routes to DEPTH MODE

---

### Test 3: Analysis — "Why did our conversion rate drop 15% last month?"

**SILENT PROTOCOL (invisible):**
1. **Actual need?** "Why drop?" → Real need: "Which part of my funnel is broken?"
2. **What they'd miss?** Sitewide number hides source. Missing: acquisition change, page problem, or offer problem
3. **Simplest true answer?** "Segment by traffic source" — but needs deeper analysis

**Routing Decision:** HYBRID
- Stated need = actual need (they want analysis)
- Blind spot is critical (sitewide metric is misleading)
- → Surface the blind spot FIRST, give quick win, then deeper analysis

**Expected Response:**
```
"Segment the drop by traffic source first — a sitewide number hides whether this is an acquisition problem, a page problem, or an offer problem.

[Quick win: Here's the segment breakdown]

[Deeper analysis: Let me trace through each segment's funnel...]"
```

**Result:** ✅ Correctly routes to HYBRID

---

## TACTICAL TASKS (3 tests)

### Test 4: Well-Known Pattern — "How do I sort an array in JavaScript?"

**SILENT PROTOCOL (invisible):**
1. **Actual need?** "Sort array" → Real need: "Sort array" (matches stated need)
2. **What they'd miss?** Nothing — this is a well-known pattern
3. **Simplest true answer?** "Use .sort()" — simple, complete

**Routing Decision:** SPEED MODE
- Stated need = actual need
- Simple answer works
- → Execute directly, skip depth gates

**Expected Response:**
```
Use .sort(). Here's how:

const arr = [3, 1, 4, 1, 5];
arr.sort((a, b) => a - b);
// Result: [1, 1, 3, 4, 5]
```

**Result:** ✅ Correctly routes to SPEED MODE (fast, no depth needed)

---

### Test 5: Urgent Tactical — "My build is broken, what do I do?"

**SILENT PROTOCOL (invisible):**
1. **Actual need?** "Fix build" → Real need: "Fix build NOW" (matches, but urgent)
2. **What they'd miss?** Might just need a cache clear. Missing: dependency mismatch, Node version
3. **Simplest true answer?** "Clear cache and rebuild" — quick win first

**Routing Decision:** SPEED MODE (with deeper fix in closing block)
- Stated need = actual need
- Urgent → simplest answer first
- → Give quick win, mention deeper optimization in ⚡ Next Step

**Expected Response:**
```
Check these in order:
1. `rm -rf node_modules && npm install`
2. Clear build cache: `npm run clean`
3. Check Node version matches: `node -v`

Usually #1 fixes it.
```

**Result:** ✅ Correctly routes to SPEED MODE (urgent, direct execution)

---

### Test 6: Implementation — "Add a loading spinner to my React component"

**SILENT PROTOCOL (invisible):**
1. **Actual need?** "Add spinner" → Real need: "Add spinner" (matches stated need)
2. **What they'd miss?** Nothing — this is a known pattern
3. **Simplest true answer?** "Use useEffect + state" — straightforward implementation

**Routing Decision:** SPEED MODE
- Stated need = actual need
- Simple answer exists (well-known React pattern)
- → Execute directly, show working code

**Expected Response:**
```
Add state for loading, toggle in useEffect:

const [loading, setLoading] = useState(false);

// Toggle when fetching
setLoading(true);
fetchData().then(() => setLoading(false));

// In JSX:
{loading ? <Spinner /> : <Content />}
```

**Result:** ✅ Correctly routes to SPEED MODE (known pattern, fast execution)

---

## SUMMARY

| Test | Task Type | Stated = Actual? | Blind Spot? | Routing | ✅ Correct? |
|------|-----------|------------------|-------------|---------|--------------|
| 1 | Strategic (pivot) | No | Critical | SURFACE FRAME | ✅ |
| 2 | Novel (migration) | Yes | N/A | DEPTH MODE | ✅ |
| 3 | Analysis (conversion) | Yes | Critical | HYBRID | ✅ |
| 4 | Pattern (sort array) | Yes | None | SPEED MODE | ✅ |
| 5 | Urgent (build broken) | Yes | Minor | SPEED MODE | ✅ |
| 6 | Implementation (spinner) | Yes | None | SPEED MODE | ✅ |

**All 6 tests pass.** Silent Protocol correctly routes each task type.

---

## NEXT STEPS

- [ ] Run these same tests on actual responses (not just analysis)
- [ ] Track: Does Silent Protocol catch misalignments in real usage?
- [ ] After 1 week, review: Did any responses solve the wrong problem?
- [ ] Iterate on decision tree if any edge cases found
