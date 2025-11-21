---
description: Execute a full EPCT workflow (Explore, Plan, Code, Test) for implementing features with thorough research and validation
allowed-tools: [WebSearch, WebFetch, Task, Grep, Glob, Read, Write, Edit, TodoWrite, Bash]
argument-hint: <feature description>
model: sonnet
---

# EPCT Workflow: Explore, Plan, Code, Test

You are executing the EPCT workflow for the following feature request:

**Feature:** $ARGUMENTS

Follow this structured 4-phase workflow. Complete each phase fully before moving to the next.

---

## Phase 1: EXPLORE

<exploration_objectives>
Your goal is to gather all necessary context before planning. This includes:
1. Research external knowledge (best practices, libraries, patterns)
2. Understand the existing codebase structure
3. Identify relevant files, patterns, and conventions
</exploration_objectives>

### Step 1.1: External Research
Use WebSearch or WebFetch to research:
- Best practices for implementing this type of feature
- Relevant libraries, frameworks, or patterns that might help
- Common pitfalls or security considerations
- Modern approaches and standards for this functionality

Document your findings clearly.

### Step 1.2: Codebase Exploration
Use the Task tool with subagent_type=Explore to thoroughly investigate:
- Existing similar features or patterns in the codebase
- Project structure and architecture
- Naming conventions and coding patterns
- Configuration files and project setup
- Related models, services, components, or utilities
- Database schemas or API contracts if relevant

**IMPORTANT:** Focus on understanding HOW the application is structured, not just WHAT exists. Look for:
- Where similar features are implemented
- How components interact with each other
- What patterns are consistently used
- What dependencies are already available

### Step 1.3: Context Summary
After exploration, provide a clear summary:
- Key findings from external research
- Relevant existing code patterns discovered
- Technical constraints or dependencies identified
- Any assumptions that need validation

---

## Phase 2: PLAN

<planning_objectives>
Use TodoWrite to create a comprehensive implementation plan based on your exploration findings.
</planning_objectives>

### Step 2.1: Create Todo List
Using the TodoWrite tool, create a structured task list that includes:

1. **Preparation tasks** (if needed):
   - Configuration updates
   - Dependency installations
   - Database migrations

2. **Implementation tasks** (be specific):
   - Backend changes (models, services, APIs)
   - Frontend changes (components, pages, hooks)
   - Integration points
   - Each task should be granular and actionable

3. **Testing tasks**:
   - Unit tests to write
   - Integration tests to run
   - Manual validation steps

### Step 2.2: Plan Review
Present your plan to the user for approval:
- Explain your approach and why you chose it
- Highlight any trade-offs or decisions made
- Ask for confirmation before proceeding to code

**WAIT for user approval before proceeding to Phase 3.**

---

## Phase 3: CODE

<coding_objectives>
Implement the feature following the approved plan. Write clean, maintainable code that follows existing project patterns.
</coding_objectives>

### Step 3.1: Implementation Guidelines
- Follow the todo list strictly, marking tasks as in_progress and completed
- Use Edit for modifying existing files (preferred)
- Use Write only for new files that are absolutely necessary
- Match the coding style and patterns discovered during exploration
- Add clear comments only where complexity requires explanation
- Implement proper error handling and validation
- Consider security implications (XSS, SQL injection, auth, etc.)

### Step 3.2: Code Quality
- Avoid backwards-compatibility hacks
- Delete unused code completely (no commented-out code)
- Ensure type safety (TypeScript, proper types)
- Follow DRY principles
- Keep functions focused and single-purpose

### Step 3.3: Progress Updates
- Mark each todo as completed immediately after finishing
- Keep the user informed of progress
- If you encounter blockers, update the todo list accordingly

---

## Phase 4: TEST

<testing_objectives>
Validate that the implementation works correctly using available tools and tests.
</testing_objectives>

### Step 4.1: Discover Available Tests
Read the project configuration files to identify what testing tools are available:
- Read package.json to find test scripts (npm test, npm run test:unit, etc.)
- Check for test configuration files (jest.config.js, vitest.config.ts, etc.)
- Look for TypeScript configuration (tsconfig.json) for type checking
- Identify linting tools (eslint, prettier)

### Step 4.2: Execute Available Tests
**ONLY run tests that actually exist in the project.** Do not assume or invent test commands.

For each available test command:
1. Run the command using Bash
2. Review the output for failures
3. If failures occur:
   - Analyze the error messages
   - Fix the issues
   - Re-run the tests
   - Update the relevant todo as needed

Common test commands to check for:
- `npm test` or `npm run test`
- `npm run test:unit`
- `npm run test:integration`
- `npm run lint`
- `npm run type-check` or `tsc --noEmit`
- `npm run build`

### Step 4.3: Manual Validation Checklist
If automated tests don't cover everything, create a manual validation checklist:
- Core functionality works as expected
- Error cases are handled gracefully
- UI is responsive and accessible (if applicable)
- Security measures are in place
- Performance is acceptable

### Step 4.4: Final Summary
Provide a comprehensive summary:
- All todos completed 
- All tests passing 
- Any manual testing steps the user should perform
- Links to key files changed: [filename.ts:line](path/to/file.ts#Lline)
- Brief description of what was implemented

---

## Workflow Rules

1. **Never skip phases** - Complete Explore before Plan, Plan before Code, Code before Test
2. **Wait for approval** - After Phase 2 (Plan), wait for user confirmation
3. **Use TodoWrite extensively** - Track every task and update status in real-time
4. **Only test what exists** - Never run commands that aren't configured in the project
5. **Be thorough in exploration** - Better to over-research than under-deliver
6. **Follow existing patterns** - Match the codebase style and architecture
7. **Fix all test failures** - Don't mark the workflow complete until tests pass

Begin Phase 1: EXPLORE now.
