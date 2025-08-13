# Infina AI advisor system overview

## Vision

Build an agentic AI that serves as an intelligent personal financial advisor—actively planning, executing, and adjusting your financial strategy in real time.

## Main blocks

- Core (Brain): Act as brain of an AI advisor powered by LLM provider like OpenAI, Gemini, includes prompts and logic to do prompt orchestration

- Context (Memory): Store chat history, user information, user financial overview and state management

- Services (Hands): Get the plans, commands from core, execute and return the result for core. Includes: Function calls definition, MCPs

- Tools: Independent tools or services like budgeting, goal, debt management, notification, sending email

- APIs gateway: Authentication, expose APIs for external partners to use

- Jobs (Daily research): Schedule jobs to get data like gold, stocks, etc

- Web (I/O): UI to get input from user and visualize the output of the AI advisor

## Main components

### Web application

Tech stacks: NextJS (React), Ghost (Blogs), SWR, Clerk
Blocks: Web (I/O)

### AI service

Tech stacks: Python, n8n, FastAPIs
Blocks: Core, Services, Context (memory)

### Financial service

Tech stacks: NestJS (NodeJS), PrismaORM, Clerk
Blocks: Authentication, APIs gateway, Tools (Budgeting, Goal, Debt, etc)

### Utilities service

Tech stacks: n8n
Blocks: Tools like sending emails, notification
