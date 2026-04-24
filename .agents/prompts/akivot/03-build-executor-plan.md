# Prompt: Build A Narrow Plan For Executor

```text
Use akivot-project-constitution.
Use akivot-product-enforcer.

I want to turn the following idea into a narrow execution plan for Claude Code
using akivot-code-executor.

Idea / goal:
[PASTE IDEA OR GOAL HERE]

Requirements:
1. First run the Product Guardrail Check.
2. If the decision is Proceed or Reduce scope, write an execution plan.
3. The plan must be focused and include:
   - goal
   - expected files
   - implementation steps
   - out of scope
   - verification
   - risks
4. Do not propose schema changes, billing-core changes, auth changes,
   production DB writes, deployment changes, or new top-level screens unless
   they are necessary and explicitly stated.
5. At the end, give me copy-paste text ready to send to Claude Code.
6. Do not write code here.
```
