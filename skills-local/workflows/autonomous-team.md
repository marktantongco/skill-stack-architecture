# Autonomous Team Workflow

Self-expanding skill library with AI-powered sub-agents that learn and improve.

## Pipeline

```
skill-finder → mcp-builder → superpowers (orchestrates) → 
context-compressor (handoffs) → nvidia-build (AI capabilities)
```

## Steps

### Phase 1: Discovery (Skill Finder)
1. Define skill requirement
2. Search internal skills library first
3. Search external sources if needed
4. Evaluate candidates with 50-point scorecard
5. Security vet before installation
6. Install or document gap

### Phase 2: Build (MCP Builder)
1. Research and planning phase
2. Implementation phase with TypeScript/Python
3. Define tools, resources, prompts
4. Add error handling and metadata
5. Review and testing phase
6. Deploy MCP server

### Phase 3: Orchestrate (Superpowers)
1. Generate specification
2. Break work into sub-agent tasks
3. Assign to UI Agent, API Agent, etc.
4. Test-first for each step
5. Integrate and verify
6. Release with notes

### Phase 4: Handoff (Context Compressor)
1. Identify key decisions
2. Extract actions taken
3. Note constraints imposed
4. Preserve key entities
5. Extract metrics and dates
6. Create compressed narrative for next agent

### Phase 5: AI Capabilities (NVIDIA Build)
1. Configure NVIDIA NIM API
2. Define prompt templates
3. Set up streaming if needed
4. Handle errors (400, 401, 429, 500)
5. Integrate into workflow
6. Monitor usage

## Trigger

Say "autonomous team" or "/team" to start this workflow.