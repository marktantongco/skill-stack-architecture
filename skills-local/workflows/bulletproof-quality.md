# Bulletproof Quality Workflow

Testing and quality assurance pipeline that challenges every assumption and tests every scenario.

## Pipeline

```
chain-of-thought → socratic-method → devils-advocate → simulation-sandbox → 
audit-analyzer → output-formatter
```

## Steps

### Phase 1: Reasoning (Chain-of-Thought)
1. Restate the problem in your own words
2. Identify and state all assumptions explicitly
3. Decompose into smallest verifiable sub-problems
4. Solve each step showing work
5. Cross-check and validate
6. Flag uncertainties with confidence ratings

### Phase 2: Inquiry (Socratic Method)
1. Assess current understanding
2. Ask clarifying questions
3. Probe hidden assumptions
4. Shift perspectives (teacher → learner → critic)
5. Synthesize new understanding
6. Close with reflection

### Phase 3: Challenge (Devil's Advocate)
1. Identify the strongest counterargument
2. Challenge every assumption rigorously
3. Find flaws in logical chains
4. Propose alternative solutions
5. Test against edge cases

### Phase 4: Simulation (Sandbox)
1. Define scope and parameters
2. Build scenario models
3. Run baseline scenario
4. Run best/worst case scenarios
5. Run edge case scenarios
6. Record all outcomes and produce formal report
7. Label outputs as [SIMULATED]

### Phase 5: Audit (Analyzer)
1. Discover audit signals (performance, accessibility, monitoring)
2. Classify into categories
3. Prioritize by impact/effort (80/20)
4. Propose concrete patches with test steps
5. Apply or stage for review

### Phase 6: Report (Output Formatter)
1. Format results as structured output
2. Generate JSON/table/markdown
3. Include confidence ratings
4. Add recommendations
5. Compress for handoff if needed

## Trigger

Say "bulletproof quality" or "/quality" to start this workflow.