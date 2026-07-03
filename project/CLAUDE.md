@AGENTS.md

# Page conventions

Use the root skill `.claude/skills/next-page-pattern/SKILL.md` when creating or refactoring pages.

Route folder names must always be in English. User-facing copy can stay in pt-BR.

# Authentication

Every route, CRUD, and server action — including REST API route handlers — must be authenticated. Always verify the session (e.g. `const session = await auth()` and `redirect("/login")` when absent) before returning data or performing mutations. Also scope access to the current user's resources (check workspace ownership) so authenticated users cannot reach data that isn't theirs.
