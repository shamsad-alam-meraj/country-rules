# Contributing

Thanks for helping improve `country-rules`.

## Development setup

```bash
git clone https://github.com/shamsad-alam-meraj/country-rules.git
cd country-rules
npm install --legacy-peer-deps
```

## Scripts

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

## Contribution flow

1. Create a feature branch.
2. Make focused changes with tests when behavior changes.
3. Run the validation commands above.
4. Open a pull request with a clear explanation.

## Quality expectations

- Keep data provenance explicit.
- Prefer conservative and verified metadata over broad but unverified claims.
- Document any new country coverage additions and their verification sources.
- Preserve TypeScript safety and package compatibility.

## Commit message guidance

Use conventional and readable commit messages, for example:

- `feat: add locale formatting metadata`
- `fix: correct postal pattern normalization`
- `docs: add release and security guidance`
