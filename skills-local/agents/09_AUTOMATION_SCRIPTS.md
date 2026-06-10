# 🤖 AUTOMATION SCRIPTS

**Copy, paste, run. Production-ready helpers.**

---

## SCRIPT 1: Python — Skill Router

```python
# skill_router.py
# Auto-detect and load appropriate skill

from anthropic import Anthropic
import json
from typing import Optional

class SkillRouter:
    def __init__(self):
        self.client = Anthropic()
        self.universal_prompt = open('UNIVERSAL_PROMPT.md').read()
        self.skills = {
            'conversational': open('SKILL_01.md').read(),
            'design': open('SKILL_02.md').read(),
            'code': open('SKILL_03.md').read(),
            'agentic': open('SKILL_04.md').read(),
        }
        self.conversation_history = []
    
    def detect_skill(self, message: str) -> str:
        """Auto-detect which skill to use."""
        msg_lower = message.lower()
        
        # Design keywords
        if any(w in msg_lower for w in ['design', 'ui', 'component', 'visual', 'landing page']):
            return 'design'
        
        # Code keywords
        elif any(w in msg_lower for w in ['code', 'debug', 'api', 'function', 'refactor', 'test']):
            return 'code'
        
        # Agentic keywords
        elif any(w in msg_lower for w in ['automate', 'orchestrate', 'agent', 'workflow', 'parallel']):
            return 'agentic'
        
        # Default
        else:
            return 'conversational'
    
    def get_system_prompt(self, skill: str) -> str:
        """Combine universal + skill."""
        return self.universal_prompt + '\n\n' + self.skills[skill]
    
    def call_claude(self, message: str, skill: Optional[str] = None) -> str:
        """Call Claude with appropriate skill."""
        skill = skill or self.detect_skill(message)
        system = get_system_prompt(skill)
        
        # Add to history
        self.conversation_history.append({
            'role': 'user',
            'content': message
        })
        
        # Call API
        response = self.client.messages.create(
            model="claude-opus-4-7",
            max_tokens=4096,
            effort="xhigh" if skill in ['code', 'agentic'] else "high",
            system=system,
            messages=self.conversation_history
        )
        
        # Extract response
        assistant_message = response.content[0].text
        
        # Add to history
        self.conversation_history.append({
            'role': 'assistant',
            'content': assistant_message
        })
        
        return {
            'skill': skill,
            'response': assistant_message,
            'tokens_used': response.usage.output_tokens
        }

# Usage
router = SkillRouter()

result = router.call_claude("Design a landing page for insurance")
print(f"Skill: {result['skill']}")
print(f"Response: {result['response'][:200]}...")
print(f"Tokens: {result['tokens_used']}")
```

---

## SCRIPT 2: Python — Monitoring Dashboard

```python
# monitor_system.py
# Track metrics, detect anomalies, send alerts

import json
import time
from datetime import datetime, timedelta
from collections import defaultdict

class SystemMonitor:
    def __init__(self):
        self.metrics = defaultdict(list)
        self.alerts = []
    
    def log_interaction(self, skill: str, input_tokens: int, output_tokens: int, 
                       response_time: float, error: Optional[str] = None):
        """Log an interaction."""
        self.metrics['interactions'].append({
            'timestamp': datetime.now().isoformat(),
            'skill': skill,
            'input_tokens': input_tokens,
            'output_tokens': output_tokens,
            'response_time': response_time,
            'error': error
        })
    
    def check_health(self) -> dict:
        """Check system health."""
        interactions = self.metrics['interactions'][-100:]  # Last 100
        
        if not interactions:
            return {'status': 'no_data'}
        
        # Calculate metrics
        error_count = sum(1 for i in interactions if i['error'])
        error_rate = (error_count / len(interactions)) * 100
        
        avg_time = sum(i['response_time'] for i in interactions) / len(interactions)
        
        skills_used = defaultdict(int)
        for i in interactions:
            skills_used[i['skill']] += 1
        
        health = {
            'total_interactions': len(interactions),
            'error_rate': error_rate,
            'avg_response_time': avg_time,
            'skills_used': dict(skills_used),
            'status': 'healthy' if error_rate < 1 else 'warning' if error_rate < 3 else 'critical'
        }
        
        return health
    
    def check_alerts(self):
        """Check for alert conditions."""
        health = self.check_health()
        
        alerts = []
        
        if health['error_rate'] > 3:
            alerts.append({
                'severity': 'critical',
                'message': f"Error rate {health['error_rate']:.1f}% > 3%"
            })
        elif health['error_rate'] > 1:
            alerts.append({
                'severity': 'warning',
                'message': f"Error rate {health['error_rate']:.1f}% > 1%"
            })
        
        if health['avg_response_time'] > 20:
            alerts.append({
                'severity': 'warning',
                'message': f"Avg response time {health['avg_response_time']:.1f}s > 20s"
            })
        
        return alerts
    
    def weekly_report(self) -> str:
        """Generate weekly report."""
        health = self.check_health()
        alerts = self.check_alerts()
        
        report = f"""
WEEKLY SYSTEM REPORT
Generated: {datetime.now().isoformat()}

METRICS
├─ Total interactions: {health['total_interactions']}
├─ Error rate: {health['error_rate']:.2f}%
├─ Avg response time: {health['avg_response_time']:.2f}s
├─ Skills used: {health['skills_used']}
└─ Status: {health['status'].upper()}

ALERTS
"""
        if alerts:
            for alert in alerts:
                report += f"├─ [{alert['severity'].upper()}] {alert['message']}\n"
        else:
            report += "└─ No alerts\n"
        
        return report

# Usage
monitor = SystemMonitor()

# Log some interactions
for i in range(10):
    monitor.log_interaction('design', 500, 1200, 15.5)
    monitor.log_interaction('code', 600, 2000, 22.3)

# Check health
health = monitor.check_health()
print(json.dumps(health, indent=2))

# Check for alerts
alerts = monitor.check_alerts()
if alerts:
    for alert in alerts:
        print(f"[{alert['severity'].upper()}] {alert['message']}")

# Generate report
report = monitor.weekly_report()
print(report)
```

---

## SCRIPT 3: Python — Quality Gate Checker

```python
# quality_gates.py
# Verify response quality before shipping

class QualityGateChecker:
    def __init__(self, skill: str):
        self.skill = skill
    
    def check_code(self, code: str) -> dict:
        """Check code quality."""
        checks = {
            'has_imports': 'import' in code or 'from' in code,
            'has_main_logic': len(code.split('\n')) > 5,
            'has_error_handling': 'try' in code or 'except' in code,
            'has_types': ':' in code,  # Type hints
            'no_todos': 'TODO' not in code and 'FIXME' not in code,
            'has_docstring': '"""' in code or "'''" in code,
            'is_executable': not any(x in code for x in ['...', '[INSERT', 'TODO'])
        }
        
        passed = sum(1 for v in checks.values() if v)
        total = len(checks)
        
        return {
            'checks': checks,
            'passed': passed,
            'total': total,
            'quality_score': (passed / total) * 100,
            'approved': passed >= 6  # 6+ out of 7
        }
    
    def check_design(self, design: str) -> dict:
        """Check design quality."""
        checks = {
            'has_colors': '#' in design or 'color' in design.lower(),
            'has_typography': 'font' in design.lower() or 'typeface' in design.lower(),
            'has_layout': 'grid' in design.lower() or 'layout' in design.lower(),
            'has_components': 'button' in design.lower() or 'card' in design.lower(),
            'no_placeholders': '[INSERT' not in design and '...' not in design,
            'has_rationale': 'because' in design.lower() or 'why' in design.lower(),
            'is_actionable': 'you can' in design.lower() or 'implement' in design.lower()
        }
        
        passed = sum(1 for v in checks.values() if v)
        total = len(checks)
        
        return {
            'checks': checks,
            'passed': passed,
            'total': total,
            'quality_score': (passed / total) * 100,
            'approved': passed >= 6  # 6+ out of 7
        }
    
    def check_response(self, response: str) -> dict:
        """Generic response checks."""
        checks = {
            'is_substantive': len(response) > 200,
            'has_structure': '\n' in response,  # Multiple lines
            'addresses_query': response[0].isupper(),  # Starts with capital
            'no_filler': not any(x in response for x in ['I think', 'I believe', 'might be']),
            'has_examples': '```' in response or 'example' in response.lower(),
            'actionable': 'you should' in response.lower() or 'next step' in response.lower()
        }
        
        passed = sum(1 for v in checks.values() if v)
        total = len(checks)
        
        return {
            'checks': checks,
            'passed': passed,
            'total': total,
            'quality_score': (passed / total) * 100,
            'approved': passed >= 4  # 4+ out of 6
        }

# Usage
checker = QualityGateChecker('code')
result = checker.check_code(code_response)
print(f"Quality: {result['quality_score']:.0f}%")
print(f"Approved: {result['approved']}")
if not result['approved']:
    print("Failed checks:")
    for check, passed in result['checks'].items():
        if not passed:
            print(f"  - {check}")
```

---

## SCRIPT 4: JavaScript — Skill Switcher (Web)

```javascript
// skillSwitcher.js
// Quick skill switching in browser

class SkillSwitcher {
  constructor() {
    this.currentSkill = 'conversational';
    this.skills = ['conversational', 'design', 'code', 'agentic'];
    this.setupKeyboardShortcuts();
    this.renderUI();
  }

  setupKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      if (e.metaKey || e.ctrlKey) {
        if (e.key === '1') this.switchSkill('conversational');
        if (e.key === '2') this.switchSkill('design');
        if (e.key === '3') this.switchSkill('code');
        if (e.key === '4') this.switchSkill('agentic');
      }
    });
  }

  switchSkill(skill) {
    console.log(`Switching to ${skill}`);
    this.currentSkill = skill;
    this.updateUI();
    
    // Send to Claude
    this.sendToClaudeAPI(skill);
  }

  sendToClaudeAPI(skill) {
    // Implementation depends on your setup
    const systemPrompt = this.getSystemPrompt(skill);
    console.log(`Loaded prompt for ${skill}`);
  }

  getSystemPrompt(skill) {
    const skillMap = {
      'conversational': 'UNIVERSAL + SKILL_01',
      'design': 'UNIVERSAL + SKILL_02',
      'code': 'UNIVERSAL + SKILL_03',
      'agentic': 'UNIVERSAL + SKILL_04'
    };
    
    return skillMap[skill];
  }

  renderUI() {
    const container = document.getElementById('skill-switcher');
    
    const buttons = this.skills.map(skill => {
      const button = document.createElement('button');
      button.textContent = this.getSkillLabel(skill);
      button.className = `skill-btn ${skill === this.currentSkill ? 'active' : ''}`;
      button.onclick = () => this.switchSkill(skill);
      button.title = this.getKeyboardShortcut(skill);
      return button;
    });
    
    container.innerHTML = '';
    buttons.forEach(btn => container.appendChild(btn));
  }

  updateUI() {
    document.querySelectorAll('.skill-btn').forEach((btn, i) => {
      btn.classList.toggle('active', this.skills[i] === this.currentSkill);
    });
  }

  getSkillLabel(skill) {
    const labels = {
      'conversational': '💬 Conversational',
      'design': '🎨 Design',
      'code': '⚙️ Code',
      'agentic': '🤖 Agentic'
    };
    return labels[skill];
  }

  getKeyboardShortcut(skill) {
    const shortcuts = {
      'conversational': '⌘1',
      'design': '⌘2',
      'code': '⌘3',
      'agentic': '⌘4'
    };
    return shortcuts[skill];
  }
}

// Initialize
const switcher = new SkillSwitcher();

// CSS to add
const style = `
.skill-btn {
  padding: 8px 16px;
  margin: 4px;
  border: 2px solid #ccc;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.skill-btn:hover {
  border-color: #000;
  background: #f9f9f9;
}

.skill-btn.active {
  border-color: #FFEA00;
  background: #FFEA00;
  color: black;
  font-weight: bold;
}
`;
```

---

## SCRIPT 5: Python — Weekly Report Generator

```python
# weekly_report.py
# Auto-generate weekly summary

from datetime import datetime, timedelta
import json

def generate_weekly_report(metrics_file: str) -> str:
    """Generate weekly report from metrics."""
    
    with open(metrics_file) as f:
        data = json.load(f)
    
    # Filter to past 7 days
    cutoff = datetime.now() - timedelta(days=7)
    week_data = [
        m for m in data['interactions']
        if datetime.fromisoformat(m['timestamp']) > cutoff
    ]
    
    # Calculate metrics
    total = len(week_data)
    errors = sum(1 for m in week_data if m['error'])
    error_rate = (errors / total * 100) if total > 0 else 0
    
    skills = {}
    for m in week_data:
        skill = m['skill']
        if skill not in skills:
            skills[skill] = {'count': 0, 'errors': 0}
        skills[skill]['count'] += 1
        if m['error']:
            skills[skill]['errors'] += 1
    
    # Generate report
    report = f"""
╔════════════════════════════════════════════╗
║        WEEKLY SYSTEM REPORT                ║
║        {datetime.now().strftime('%Y-%m-%d')}                    ║
╚════════════════════════════════════════════╝

SUMMARY
├─ Total interactions: {total}
├─ Errors: {errors}
├─ Error rate: {error_rate:.1f}%
└─ Status: {'✅ HEALTHY' if error_rate < 1 else '⚠️ WARNING' if error_rate < 3 else '🔴 CRITICAL'}

BY SKILL
"""
    
    for skill, data in skills.items():
        skill_error_rate = (data['errors'] / data['count'] * 100) if data['count'] > 0 else 0
        report += f"├─ {skill:15s}: {data['count']:3d} interactions, {skill_error_rate:5.1f}% error rate\n"
    
    report += """
RECOMMENDATIONS
"""
    
    if error_rate > 3:
        report += "├─ 🔴 ERROR RATE TOO HIGH - Debug immediately\n"
    elif error_rate > 1:
        report += "├─ ⚠️  ERROR RATE ELEVATED - Investigate trends\n"
    else:
        report += "├─ ✅ Error rate acceptable\n"
    
    report += """
NEXT STEPS
├─ Review error logs (if any)
├─ Check user feedback
├─ Plan optimizations (if needed)
└─ Archive this week's data

Generated: """ + datetime.now().isoformat()
    
    return report

# Usage
report = generate_weekly_report('metrics.json')
print(report)

# Save to file
with open('weekly_report.txt', 'w') as f:
    f.write(report)
```

---

## SCRIPT 6: Shell Script — Deploy System Prompt

```bash
#!/bin/bash
# deploy_system_prompt.sh
# Deploy to Claude.ai via clipboard

SKILL=$1  # 01, 02, 03, or 04

if [ -z "$SKILL" ]; then
  echo "Usage: ./deploy_system_prompt.sh [01|02|03|04]"
  echo "Example: ./deploy_system_prompt.sh 01"
  exit 1
fi

# Get the right files
UNIVERSAL="UNIVERSAL_PROMPT.md"
SKILL_FILE="SKILL_${SKILL}_*.md"

if [ ! -f "$UNIVERSAL" ]; then
  echo "Error: $UNIVERSAL not found"
  exit 1
fi

# Combine prompts
COMBINED=$(cat "$UNIVERSAL" && echo "" && cat $SKILL_FILE)

# Copy to clipboard (macOS)
echo "$COMBINED" | pbcopy

echo "✅ System prompt copied to clipboard (UNIVERSAL + SKILL_${SKILL})"
echo "📋 Paste into Claude.ai Settings → Custom Instructions"
```

---

**These scripts save hours. Automate everything you can.**

Copy them. Modify them. Make them yours. Automate ruthlessly.
