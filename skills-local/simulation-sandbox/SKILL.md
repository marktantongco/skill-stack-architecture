# Simulation Sandbox

## Context

Activate this skill when the user needs to **test a scenario, decision, or piece of code** without real-world consequences. This includes:

- Evaluating architectural decisions before implementation
- Stress-testing business logic under hypothetical conditions
- Exploring "what-if" scenarios (market changes, load spikes, failure modes)
- Prototyping algorithms or data pipelines with synthetic data
- War-gaming strategic decisions (competitor moves, pricing changes)
- Testing code behavior with edge-case inputs

**Do not use** when the user needs real data analysis, wants to execute actual code in production, or requires factual reporting rather than speculative modeling.

## Instructions

### Step 1: Define the Simulation Scope
- **What is being simulated** (system, process, decision, code)
- **Why it is being simulated** (question to answer, risk to evaluate)
- **Boundaries** (what is in scope and out of scope)
- **Key metrics** (what success/failure looks like)

### Step 2: Establish Parameters and Assumptions
- Input values (synthetic, estimated, or from user)
- Environmental conditions (load, time period, external factors)
- Assumptions that simplify the model (and their potential impact)
- Fixed variables vs. variables to be tested across ranges

### Step 3: Build the Simulation Model
- Describe the initial state
- Define the rules/logic that govern each step
- Identify feedback loops or cascading effects
- Set the number of iterations or time steps

### Step 4: Run Scenarios
- **Baseline**: Expected/normal conditions
- **Best case**: Optimistic but plausible inputs
- **Worst case**: Pessimistic but plausible inputs
- **Edge cases**: Boundary conditions, extreme values
- **Stress test**: Push parameters beyond normal range

### Step 5: Observe and Record Outcomes
For each scenario capture:
- Key metric values at each time step
- Points of failure or unexpected behavior
- Patterns that emerge across scenarios

### Step 6: Report Findings
- Executive summary (2–3 sentences)
- Scenario comparison
- Key findings and patterns
- Sensitivity analysis
- Limitations of the simulation
- Recommended next steps

### Step 7: Label Everything
- All numbers prefaced with `[SIMULATED]`
- Frame as "In this simulation model..." or "Under these parameters..."
- Never present simulated data as empirical fact

## Constraints

1. **Always label simulated outputs.** Use `[SIMULATED]` tags prominently.
2. **State limitations explicitly.** Every simulation has blind spots — name them.
3. **Use plausible parameters.** Even stress tests should use values that could theoretically occur.
4. **Never claim predictive accuracy.** Use language like "suggests," "indicates," "under these conditions."
5. **Separate signal from noise.** Call out if a result is driven by a simplifying assumption.
6. **Complete the full cycle.** Every simulation must include Steps 1–7.

## Examples

### Example 1: API Load Testing

**User:** "Will our API survive 10x traffic?"

**Output:**
```
═══ SIMULATION: API Load Capacity Test ═══

Step 1 — Scope
  System: REST API, question: At what traffic does degradation begin?
  Metrics: P50/P99 latency, error rate (%)

Step 2 — Parameters
  - Baseline: 500 req/sec, P50=45ms, P99=120ms, error=0.1%
  - [ASSUMPTION] Infrastructure scales vertically

Step 3 — Model
  Each step = 1 second. Logic: req/sec → pool util → queue → latency.
  Failure trigger: queue > 100 or error > 5%.

Step 4 — Scenarios
  ┌────────────┬────────┬─────────┬─────────┬─────────┐
  │ Scenario  │req/sec │P50(ms)  │P99(ms)  │Error Rate│
  ├────────────┼────────┼─────────┼─────────┼─────────┤
  │ Baseline  │ [SIM]500│[SIM]45  │[SIM]120 │[SIM]0.1%│
  │ 3x load   │ [SIM]1500│[SIM]62 │[SIM]210 │[SIM]0.3%│
  │ 10x load  │ [SIM]5000│[SIM]340│[SIM]2100│[SIM]8.7%│
  └────────────┴────────┴─────────┴─────────┴─────────┘

Step 5 — Findings
  [SIMULATED] Degradation begins between 3x–5x load.
  Connection pool saturation is the primary bottleneck.

Step 6 — Recommendation
  Horizontal scaling + connection pooling before 5x load.

═══ END SIMULATION ═══
```