context: Simple API wrapper that calls a hypothetical external service and returns a normalized response.

instructions:
- Implement a function that accepts input payload, maps to API call, and normalizes the response.
- Include error handling for common HTTP errors.
- No actual network calls in demo; illustrate with mock data.

constraints:
- No external credentials required for sample.
- No real network access in this template.

examples:
- Input: {"endpoint":"/status"} Output: {"status":"ok","code":200}
