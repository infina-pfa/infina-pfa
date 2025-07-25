# Infina Personal Financial Advisor Architecture

## Main components

- Front-end: Web application
- Back-end: NestJS application
- AI service: Python

### Web application

Tech stack: NextJS
Authentication: Supabase authentication

Responsibilities:

- Display information
- Receive users interaction and responses
- Interact with AI service and BE application

#### Landing page & Blogs

- Intro about the application, contact, company info, etc
- SEO
- Display blogs

#### AI chat

- Main component, there is where user interacts with AI advisor through chat, voice (later)
- Provide interactive components like forms, suggestions, videos to help user easy to use
- Interact with AI service send request and receive responses from AI advisor

#### Normal UI pages

- Provide GUI components as usual web application to allow user interact with system
- Directly interact with BE application to help user manage their financial data

### Back-end application

Tech stack: NestJS, Prisma (DB ORM), Redis (Caching)
Architecture: DDD - Clean architecture
Authentication: JWT
Database: PostgresSQL (Host in Supabase)

Responsibilities:

- Interact with DB to persist user's data like budgets, spending, income, etc
- Handle business logic
- Provide APIs for FE and AI service
- Handle schedule, cron jobs

Main modules:

- common: Base entity, repositories, guards, interceptor, decorators, use-cases, utils, etc
- budgeting: Handle user's budgets, expenses logics and manage their data
- user: Manage user information
- goal: Manage user's goal
- debt: Manage user debt (later)

Each module has some layers follow Clean architecture

- domain: Define business logics, rules, object through entities, value-objects, aggregate, services, etc to be reusable and consistent in the whole system.
- infrastructure: Interact directly to database, other partner services
- use-case: Define use cases, use domain services to solve the use case
- controller: Expose use cases as APIs that can be used in other services or applications

### AI service

Tech stack: Python, OpenAI
Database: ?

Responsibilities:

- Get request and make the most of AI agent to solve user's problems, then response
- Manage system prompts, user's context to personalize user experience
- Interact with BE application through APIs to get user's financial information
- Provide APIs for other system to use AI core service.
