context: Transform input data from one shape to another (e.g., CSV to JSON) in a deterministic, testable way.

instructions:
- Accept an input payload (structured) and output the transformed payload.
- Validate with a simple unit-like test: ensure fields exist and types are correct.
- Do not perform external I/O in this sample.

constraints:
- Deterministic behavior only; no non-deterministic randomness.
- No external network access.

examples:
- Input: {"a":1, "b":"x"} Output: {"alpha":1, "beta":"x"}
