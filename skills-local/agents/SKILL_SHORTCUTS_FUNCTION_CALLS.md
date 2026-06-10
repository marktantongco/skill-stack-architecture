# ✨ SKILL SHORTCUTS & FUNCTION CALLS

**Quick navigation between skills. Beautiful syntax. Zero friction.**

---

## 🎯 SKILL SHORTCUTS (Claude.ai)

Press these key combinations to instantly load the corresponding skill.

```
┌─────────────────────────────────────────────────────────────┐
│                    SKILL SHORTCUTS                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ⌘ + 1   →  Load SKILL_01 (Conversational)                │
│             Mobile, chatting, exploration, asking          │
│             (Default on startup)                           │
│                                                             │
│  ⌘ + 2   →  Load SKILL_02 (Design + Build)                │
│             Desktop, visual, UI/UX, components             │
│             (Auto-detects "design", "UI", "build")        │
│                                                             │
│  ⌘ + 3   →  Load SKILL_03 (Code + API)                    │
│             Desktop, production code, debugging             │
│             (Auto-detects "code", "debug", "build API")   │
│                                                             │
│  ⌘ + 4   →  Load SKILL_04 (Agentic)                       │
│             Autonomous, orchestration, subagents           │
│             (Auto-detects "automate", "orchestrate")      │
│                                                             │
│  ⌘ + U   →  Load UNIVERSAL only                           │
│             Reset to router, no specialized skill          │
│             (For troubleshooting)                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### How to Set Up Shortcuts (Mac)

1. **System Preferences** → **Keyboard** → **Shortcuts** → **App Shortcuts**
2. Add custom shortcuts for Claude.ai
3. Set:
   ```
   Shortcut: ⌘ + 1
   Action: Paste & Replace System Prompt with [UNIVERSAL + SKILL_01]
   ```

**Alternative (Easier):** Use text expander (Alfred, TextExpander, BetterTouchTool)

```
Trigger: ?1
Expansion: [Paste UNIVERSAL + SKILL_01]

Trigger: ?2
Expansion: [Paste UNIVERSAL + SKILL_02]

Trigger: ?3
Expansion: [Paste UNIVERSAL + SKILL_03]

Trigger: ?4
Expansion: [Paste UNIVERSAL + SKILL_04]
```

---

## 🔄 CONTEXT SWITCH SYNTAX

When switching skills in conversation, use this syntax to trigger automatic context switching.

### Explicit Skill Switch

```
User says:
"@skill_02 actually let's design this landing page instead"

System recognizes: @skill_02 directive
Action: Loads UNIVERSAL + SKILL_02
Response: "Switching to Design mode — I've noted your [prior context]"
```

### Keyword-Based Auto-Detection

```
User says:
"I need to debug this function"

System recognizes: "debug" + "function" keywords
Auto-routes to: SKILL_03 (Code mode)
No directive needed. Automatic.
```

### Manual Override

```
User says:
"?3 help me with this Python code"

System recognizes: ?3 override prefix
Action: Force-load SKILL_03 regardless of keywords
Useful when: Auto-detection is wrong
```

---

## 💻 FUNCTION CALLS (Programmatic)

Use these function signatures to load skills programmatically.

### JavaScript / Node.js

```javascript
// Load a skill dynamically
function loadSkill(skillName) {
  const skills = {
    conversational: require('./SKILL_01_CONVERSATIONAL.md'),
    design: require('./SKILL_02_DESIGN_BUILD.md'),
    code: require('./SKILL_03_CODE_API.md'),
    agentic: require('./SKILL_04_AGENTIC.md')
  };
  
  const universal = require('./UNIVERSAL_PROMPT.md');
  return universal + '\n\n' + skills[skillName];
}

// Usage
const systemPrompt = loadSkill('design');
// Returns: UNIVERSAL + SKILL_02
```

### Python

```python
def load_skill(skill_name: str) -> str:
    """Load skill and return combined system prompt."""
    
    skills = {
        'conversational': open('./SKILL_01_CONVERSATIONAL.md').read(),
        'design': open('./SKILL_02_DESIGN_BUILD.md').read(),
        'code': open('./SKILL_03_CODE_API.md').read(),
        'agentic': open('./SKILL_04_AGENTIC.md').read()
    }
    
    universal = open('./UNIVERSAL_PROMPT.md').read()
    return universal + '\n\n' + skills[skill_name]

# Usage
system_prompt = load_skill('code')
# Returns: UNIVERSAL + SKILL_03
```

### Smart Context Detection (Python)

```python
def detect_skill(user_message: str) -> str:
    """Infer which skill based on user intent."""
    
    message_lower = user_message.lower()
    
    # Design keywords
    if any(word in message_lower for word in 
           ['design', 'ui', 'component', 'landing page', 'visual']):
        return 'design'
    
    # Code keywords
    elif any(word in message_lower for word in 
             ['code', 'debug', 'api', 'function', 'refactor', 'test']):
        return 'code'
    
    # Agentic keywords
    elif any(word in message_lower for word in 
             ['automate', 'orchestrate', 'workflow', 'agent', 'parallel']):
        return 'agentic'
    
    # Default
    else:
        return 'conversational'

# Usage
skill = detect_skill("help me build a React component")
# Returns: 'code' (or 'design' depending on interpretation)
system_prompt = load_skill(skill)
```

### API Call with Skill Switching

```python
import anthropic

def call_claude_with_skill(
    user_message: str,
    skill_override: str = None
) -> str:
    """Call Claude with auto-detected or specified skill."""
    
    # Determine skill
    skill = skill_override or detect_skill(user_message)
    system_prompt = load_skill(skill)
    
    # Create client and call
    client = anthropic.Anthropic()
    response = client.messages.create(
        model="claude-opus-4-7",
        max_tokens=4096,
        effort="xhigh" if skill in ['code', 'agentic'] else "high",
        system=system_prompt,
        messages=[
            {"role": "user", "content": user_message}
        ]
    )
    
    return response.content[0].text

# Usage
response = call_claude_with_skill("Design a landing page")
# Auto-detects: 'design'
# Loads: UNIVERSAL + SKILL_02
# Sets: effort="high"
# Returns: Design-mode response

response = call_claude_with_skill(
    "Debug this function",
    skill_override="code"
)
# Explicit skill: 'code'
# Loads: UNIVERSAL + SKILL_03
# Sets: effort="xhigh"
# Returns: Code-mode response
```

### React Component (Frontend)

```javascript
import { useState } from 'react';
import { callClaudeAPI } from './api';

export function SkillSwitcher() {
  const [activeSkill, setActiveSkill] = useState('conversational');
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const skills = [
    { id: 'conversational', label: '💬 Conversational', shortcut: '⌘1' },
    { id: 'design', label: '🎨 Design', shortcut: '⌘2' },
    { id: 'code', label: '⚙️ Code', shortcut: '⌘3' },
    { id: 'agentic', label: '🤖 Agentic', shortcut: '⌘4' }
  ];

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await callClaudeAPI(message, activeSkill);
      setResponse(result);
    } finally {
      setLoading(false);
    }
  }

  // Keyboard shortcut handler
  React.useEffect(() => {
    function handleKeyPress(e) {
      if (e.metaKey) {
        if (e.key === '1') setActiveSkill('conversational');
        if (e.key === '2') setActiveSkill('design');
        if (e.key === '3') setActiveSkill('code');
        if (e.key === '4') setActiveSkill('agentic');
      }
    }
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div className="skill-switcher">
      {/* Skill buttons */}
      <div className="skills">
        {skills.map(skill => (
          <button
            key={skill.id}
            className={`skill-btn ${activeSkill === skill.id ? 'active' : ''}`}
            onClick={() => setActiveSkill(skill.id)}
            title={skill.shortcut}
          >
            {skill.label}
          </button>
        ))}
      </div>

      {/* Message input */}
      <form onSubmit={handleSubmit}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask anything. Skill auto-switches based on context."
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Send'}
        </button>
      </form>

      {/* Response */}
      {response && (
        <div className="response">
          <p><strong>Active skill:</strong> {activeSkill}</p>
          <div>{response}</div>
        </div>
      )}
    </div>
  );
}
```

---

## 📋 SKILL CALL REFERENCE TABLE

| Skill | Trigger | Keyboard | Function Call | Auto-Detect Keywords |
|-------|---------|----------|----------------|--------------------|
| **SKILL_01** | Default | `⌘1` | `loadSkill('conversational')` | chat, ask, explore, question |
| **SKILL_02** | `?2` or `@design` | `⌘2` | `loadSkill('design')` | design, ui, component, visual, landing |
| **SKILL_03** | `?3` or `@code` | `⌘3` | `loadSkill('code')` | code, debug, api, function, refactor |
| **SKILL_04** | `?4` or `@automate` | `⌘4` | `loadSkill('agentic')` | automate, orchestrate, agent, workflow |

---

## 🎨 BEAUTIFUL SKILL INDICATORS

Use these visual indicators when skills are active.

### In Chat Response Headers

```
┌──────────────────────────────────────────┐
│  💬 CONVERSATIONAL MODE                  │
│  Chatting, exploring, light questions    │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│  🎨 DESIGN MODE                          │
│  Proposing 3 directions, visual clarity  │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│  ⚙️ CODE MODE                            │
│  effort=xhigh, quality gates, algorithm  │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│  🤖 AGENTIC MODE                         │
│  Orchestrating subagents, tracking state │
└──────────────────────────────────────────┘
```

### Context Switch Announcement

```
💬 → 🎨 SWITCHING TO DESIGN MODE
"I've noted your product positioning. 
Now designing the landing page with:
- Navy + gold color system
- Empowerment-forward messaging
- 3 visual directions for you to choose"
```

---

## ⚡ QUICK COMMAND REFERENCE

Type these in your message to trigger instant skill changes.

```
?1         Force load SKILL_01 (Conversational)
?2         Force load SKILL_02 (Design)
?3         Force load SKILL_03 (Code)
?4         Force load SKILL_04 (Agentic)

@conv      Load SKILL_01
@design    Load SKILL_02
@code      Load SKILL_03
@automate  Load SKILL_04

!reset     Load UNIVERSAL only (troubleshooting)
!status    Show current active skill + token count
!route     Show routing decision for this message
```

### Example Usage in Chat

```
You: "?2 let me design a landing page"
Claude: [Switches to SKILL_02, loads design mode, shows 3 options]

You: "?3 now implement this in React"
Claude: [Switches to SKILL_03, loads code mode, shows algorithm + code]

You: "!status"
Claude: [Reports: Active skill: SKILL_03, Tokens: 6,100/6,500]
```

---

## 🔗 CONTINUITY PROTOCOL (Auto-Switching)

When switching skills automatically, this is what happens:

```
USER INPUT
    ↓
SILENT PROTOCOL
  ├─ Detect stated need
  ├─ Detect actual need
  └─ Detect simplest answer
    ↓
ROUTING DECISION
  ├─ Is this a design question?    → SKILL_02
  ├─ Is this a code question?      → SKILL_03
  ├─ Is this an automation task?   → SKILL_04
  └─ Else?                         → SKILL_01
    ↓
LOAD SKILL
  ├─ Load UNIVERSAL
  ├─ Load appropriate SKILL
  └─ Set effort parameter
    ↓
CONTINUITY CHECK
  ├─ Review prior 10 messages
  ├─ Carry context forward
  └─ Announce switch: "Switching to [Skill] — noted [prior context]"
    ↓
EXECUTE IN SKILL MODE
  ├─ Apply skill-specific rules
  ├─ Apply skill-specific quality gates
  └─ Use skill-specific closing pattern
    ↓
QUICK-FEEDBACK PROMPT
  └─ "Was that transition smooth? (Y/N)"
```

---

## 📊 EFFORT PARAMETER BY SKILL

These are automatically set when you load each skill.

```javascript
function setEffortLevel(skill: string): string {
  const efforts = {
    'conversational': 'high',      // Normal thinking, no overthinking
    'design': 'high',              // Creative, visual thinking
    'code': 'xhigh',               // Deep reasoning, algorithm first
    'agentic': 'xhigh'             // Large thinking budget for orchestration
  };
  
  return efforts[skill] || 'high';
}
```

**What this means:**
- `high`: Claude thinks carefully, balances speed/quality
- `xhigh`: Claude uses extended thinking, shows full reasoning

---

## 🛠️ TROUBLESHOOTING SKILL SWITCHES

**Problem: Skill didn't switch**
```
Solution: Use explicit command
Before:   "Help me debug this"
After:    "?3 help me debug this"
Result:   Forces SKILL_03 (Code) to load
```

**Problem: Lost context during switch**
```
Solution: Check CONTINUITY PROTOCOL
Command:  "!status" to see current skill
Action:   Manually reference prior decision
Example:  "I said I wanted X. With that context, code this."
```

**Problem: Wrong skill auto-selected**
```
Solution: Override with explicit command
Before:   "Design and code this component"
After:    "?2 design this first, then ?3 code it"
Result:   Explicit control, two messages, clear separation
```

**Problem: Token count too high**
```
Solution: Check active skill and trim context
Command:  "!status" to see tokens
Action:   If >6k, load UNIVERSAL only (?!reset)
Result:   Reset to 3.1k, then reload with single skill
```

---

## 🎯 BEST PRACTICES

### ✅ DO

```
✓ Use keyboard shortcuts for speed (⌘2 for design)
✓ Use explicit commands when context is ambiguous (?3 for code)
✓ Let CONTINUITY work (context carries automatically)
✓ Give feedback on transitions ("Was that smooth? Y/N")
✓ Use skill indicators to confirm mode is active
```

### ❌ DON'T

```
✗ Manually paste system prompts (use shortcuts instead)
✗ Assume auto-detection is always right (override when unsure)
✗ Mix skills without announcing (always announce switches)
✗ Ignore CONTINUITY announcements (they're showing context carry)
✗ Stay in wrong skill (switch immediately if detected)
```

---

## 📱 MOBILE (Claude.ai App)

Shortcuts don't work on mobile (no keyboard shortcuts).

**Instead, use explicit commands:**

```
Mobile chat: "?1 I have a quick question"
Result: SKILL_01 (Conversational) loads

Mobile chat: "?2 let me design this"
Result: SKILL_02 (Design) loads

Mobile chat: "?3 I need to code this"
Result: SKILL_03 (Code) loads

Mobile chat: "?4 automate this workflow"
Result: SKILL_04 (Agentic) loads
```

Or just type naturally; auto-detection works:

```
Mobile chat: "debug this function"
System detects: "debug" keyword
Auto-loads: SKILL_03 (Code)
No command needed
```

---

## 🚀 POWER USER SETUP

For maximum speed, combine multiple tools:

**Setup 1: Text Expander + Keyboard (Mac)**
```
Trigger:  ?1
Expand:   [Paste UNIVERSAL + SKILL_01]

Trigger:  ?2
Expand:   [Paste UNIVERSAL + SKILL_02]

(etc.)

Then: Press ⌘V to paste (1 keystroke)
     Type ?1, press space (2 more keystrokes)
Total: 3 keystrokes to switch skills
```

**Setup 2: Claude API + Auto-Detect**
```python
# No manual switching needed
# API automatically detects skill from message
# Loads appropriate skill + sets effort level
# Zero friction

response = call_claude_with_skill("Design landing page")
# Automatically: 
#   - Detects "design" keyword
#   - Loads SKILL_02
#   - Sets effort="high"
#   - Returns design-mode response
```

**Setup 3: React App + UI Buttons**
```
Click buttons to switch:
  [💬 Conversational]  [🎨 Design]  [⚙️ Code]  [🤖 Agentic]

Or use keyboard:
  ⌘1, ⌘2, ⌘3, ⌘4

Auto-routes based on message content
```

---

## 📞 QUICK SUPPORT

**Stuck? Run this:**

```
Command: "!status"
Output:  
  Active skill: SKILL_02 (Design)
  Tokens: 5,600 / 6,500
  Effort: high
  Last context: [summary]

Command: "!route"
Output:
  Your message would trigger: SKILL_03 (Code)
  Because: Keywords ['code', 'debug', 'function']
  Confidence: 95%

Command: "!reset"
Output:
  Loaded: UNIVERSAL only
  Tokens: 3,100
  Ready for manual skill selection
```

---

## 🎪 THE FULL PICTURE

```
┌──────────────────────────────────────────────────────────────┐
│                    SKILL SWITCHING                           │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  KEYBOARD SHORTCUTS (Mac)                                   │
│  ⌘1 / ⌘2 / ⌘3 / ⌘4 → Load skills instantly               │
│                                                              │
│  TEXT COMMANDS                                              │
│  ?1 / ?2 / ?3 / ?4 → Force load skill in chat             │
│  @design / @code / @automate → Semantic triggers           │
│  !status / !route / !reset → Debugging commands            │
│                                                              │
│  AUTO-DETECTION                                             │
│  No command needed. Just talk naturally.                    │
│  System infers skill from message content.                  │
│                                                              │
│  FUNCTION CALLS (API)                                       │
│  loadSkill('design') → Returns UNIVERSAL + SKILL_02        │
│  detect_skill(message) → Infers skill from message         │
│  call_claude_with_skill(msg) → All-in-one              │
│                                                              │
│  CONTINUITY PROTOCOL                                        │
│  Automatic context carry between skill switches             │
│  Visual announcement when switching                         │
│  Quick-feedback to validate smooth transitions              │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

**Choose your preferred method. All work. All are beautiful. All are fast.**

Now switch skills with confidence. ⚡
