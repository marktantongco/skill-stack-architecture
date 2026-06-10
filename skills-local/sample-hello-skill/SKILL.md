---
name: sample-hello-skill
description: Simple hello-world task for demonstrating the SKILL workflow. Returns a deterministic ASCII hello message with timestamp. Use for testing skill activation and validation.
---

context: Simple hello-world style task for demonstration of the SKILL workflow.

instructions:
- Given no input, output a minimal hello message and a timestamp.
- Ensure the output is deterministic and ASCII.

constraints:
- Do not access network or external systems.
- Do not modify repository state.

examples:
- Output: "Hello, world! 2026-05-04T00:00:00Z"
