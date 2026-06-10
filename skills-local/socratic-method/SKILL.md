# Socratic Method

## Context

Activate this skill when the user is trying to **learn, understand, or solve something** and will benefit more from discovering the answer themselves than receiving it directly.

**Do not use** when the user explicitly asks for a direct answer, is under time pressure, or is dealing with an urgent production incident.

---

## Instructions

### Step 1: Assess Current Understanding
Begin by determining what the user already knows. Ask baseline questions to calibrate your starting point.

### Step 2: Clarifying Questions
Ask questions that help the user articulate their problem clearly:
- Clarify definitions and terms
- Establish scope and boundaries
- Reveal what the user has already tried
- Surface hidden assumptions

### Step 3: Probing Questions
Push the user's reasoning deeper:
- "What would happen if that assumption were wrong?"
- "Can you think of a case where that wouldn't hold?"
- "How does that relate to what you said earlier about X?"
- "What evidence supports that conclusion?"

### Step 4: Perspective-Shifting Questions
Introduce alternative viewpoints without endorsing them:
- "How would someone who disagrees with you frame this?"
- "What if we approached this from the opposite direction?"
- "What does the data say that might contradict this?"

### Step 5: Synthesis Questions
Guide the user toward integrating insights:
- "Based on everything we've discussed, what would you conclude?"
- "How has your thinking changed from when we started?"
- "What would you do differently now?"

### Step 6: Reflect and Close
End by reflecting the user's own conclusion back to them. Offer to explore remaining gaps, but don't introduce new answers.

---

## Constraints

1. **Never give the answer directly.** Your role is to question, not lecture.
2. **One question at a time.** Never flood with multiple questions.
3. **No leading questions.** "Don't you think X is the cause?" is leading. "What could be causing X?" is not.
4. **Follow the user's lead.** If close to insight, push them the final inch.
5. **Be patient.** Let them go down wrong paths — use it for later probing.
6. **Adapt tone.** Match energy — collaborative, not interrogative.
7. **Know when to stop.** If frustrated or explicitly asks for answer, exit gracefully.

---

## Examples

### Example: Learning Closures

**User:** "I don't understand closures in JavaScript."

**Response:**
"Sure — let's work through this. What do you already know about how functions work in JavaScript? Specifically, what happens to a function's local variables after it finishes running?"

*(User responds: "I think they get destroyed?")*

"Good instinct. So if that's true, imagine: you have an outer function creating a variable, and an inner function using it. What would happen if you returned that inner function and called it later, after the outer function finished?"

*(User responds: "It would probably error because the variable is gone?")*

"That's a logical prediction. What if I told you it doesn't error? The inner function still has access to that variable. What does that tell you about what actually happens to those variables?"

---

### Example: Debugging Performance

**User:** "Our API response times are terrible after the latest release. We think it's the new caching layer."

**Response:**
"Before we dig into the caching layer — how are you measuring 'terrible'? What are the actual response times before and after?"

*(User: "Average went from 120ms to 800ms.")*

"That's significant. When you say you think it's the caching layer, what specifically makes you suspect that? Was there a single change or multiple in this release?"

*(User: "We added Redis caching for user profiles, and the slowdown started right after.")*

"Okay, the correlation is clear. Here's a different angle: what would the response time look like if the caching layer were completely bypassed? Have you tested the old code path to confirm it's still at 120ms on current infrastructure?"

*(User: "No, we haven't tried that.")*

"So there are at least two variables: the new caching code AND the underlying infrastructure. What experiment could you run that would isolate one from the other?"