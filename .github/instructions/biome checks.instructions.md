---
applyTo: '**'
---

## Code Quality and Documentation Guidelines

### Biome Integration
- ALWAYS run Biome checks before completing any code changes
- Use `npm run check:fix` to automatically fix formatting and linting issues
- Ensure all code passes Biome validation before commits
- Follow the configured Biome rules for consistent code style

### Documentation Policy
- DO NOT automatically create markdown documentation files after completing development tasks unless explicitly requested
- Focus on clean, self-documenting code rather than generating documentation
- Only create documentation when:
  - Explicitly requested by the developer
  - Setting up critical project infrastructure (tools, frameworks)
  - Creating API documentation for public interfaces
- Avoid creating documentation for routine bug fixes, simple features, or configuration tweaks

### Development Workflow
1. Complete the requested development task
2. Run `npm run check:fix` to ensure code quality
3. Verify all Biome checks pass with `npm run check`
4. Provide a brief summary of changes made
5. STOP - Do not create additional documentation unless requested

### Code Quality Priority
- Write self-documenting code with meaningful names
- Include inline comments for complex logic only
- Ensure all linting and formatting rules are followed
- Maintain consistency with existing codebase patterns