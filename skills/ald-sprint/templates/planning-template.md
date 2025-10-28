# Sprint Planning Template

## Sprint Goal

**Format**: One clear sentence describing what will be delivered.

**Example**: "Implementar autenticação completa com Supabase"

**Your Goal**:
```
[Escrever aqui o sprint goal]
```

---

## Scope Definition

### IN_SCOPE (arquivos que serão modificados)

Lista de paths/patterns que fazem parte desta sprint:

```
- path/to/module/**
- specific/file.ts
- another/module/**
```

### OFF_LIMITS (arquivos que NÃO devem ser tocados)

Lista de paths que estão fora do escopo:

```
- unrelated/module/**
- shared/critical-file.ts (use apenas, não modifique)
```

---

## Deliverables (Tasks)

Lista de entregas concretas desta sprint:

- [ ] Task 1: [Descrição]
  - Files: `path/to/file.ts`

- [ ] Task 2: [Descrição]
  - Files: `path/to/another.ts`

- [ ] Task 3: [Descrição]
  - Files: `multiple/files/**`

---

## Pre-Sprint Checklist

Antes de começar a sprint:

- [ ] Sprint goal está claro e specific?
- [ ] Scope bem definido (in_scope + off_limits)?
- [ ] Rodar testes existentes (baseline): `npm test`
- [ ] Salvar baseline: `npm test > tests-baseline.txt`
- [ ] Criar `active/current-sprint.json` com estrutura completa

---

## Dependencies / Blockers Esperados

Lista de potenciais blockers ou dependências conhecidas:

```
- Precisa de API key de serviço X
- Dependência de feature Y estar pronta
- Necessita aprovação de design
```

---

**Policies Aplicadas**:
- Policy 10.1: Sprint Goal Definition
- Policy 10.2: Task Breakdown Strategy
