# humanizer

## context
Use this skill every time you generate text that will be read by humans (emails, blog posts, marketing copy). It strips away detectable AI writing patterns — repetitive structures, overuse of "delve" and "unlock", formulaic transitions — and rewrites the content to sound as if a human wrote it.

## instructions
1. After drafting the final copy, append the command: "Humanize this text: [copy]".
2. The skill runs a Wikipedia‑trained classifier to identify AI‑hallmark phrases and structures.
3. It rewrites the text while preserving the meaning, but varying sentence length, introducing idioms, and adding natural imperfection.
4. Return the humanized version. If the original line count changes, preserve the key information, not verbatim length.

## constraints
- Never humanize code, data, or technical specifications.
- Do not alter factual claims; rewriting only affects style, not substance.
- Avoid making the text overly casual; match the original tone (professional, friendly, etc.).

## examples
1. Input: "We are pleased to announce that our innovative platform leverages advanced AI to unlock unprecedented growth for your business."  
   Output: "We just launched something that helps you grow — our new platform uses AI in a way that actually makes sense."