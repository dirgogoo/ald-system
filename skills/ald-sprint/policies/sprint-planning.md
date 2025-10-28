# Sprint Planning Policies

Políticas para definir sprints com goals claros e scope bem delimitado.

---

## Policy 10.1 — Sprint Goal Definition

**MUST**: Todo sprint deve ter um goal claro, específico e mensurável.

**Format**: SMART goal
- **Specific**: O que exatamente será entregue?
- **Measurable**: Como saber que está completo?
- **Achievable**: É possível completar?
- **Relevant**: Está alinhado com objetivos do projeto?

**Rationale**: Goal claro previne scope creep e mantém foco.

**Implementation**:
```markdown
# ✅ Good - Clear SMART goals

"Implementar autenticação completa com Supabase"
→ Specific: Auth com Supabase
→ Measurable: Login + Signup + Logout funcionando
→ Achievable: Supabase tem docs, é factível
→ Relevant: Auth é crítico para app

"Criar CRUD de produtos para vendedores"
→ Specific: CRUD (Create, Read, Update, Delete) de products
→ Measurable: 4 operações funcionando + testes
→ Achievable: Schema já existe, é implementação direta
→ Relevant: Core feature do marketplace

"Adicionar checkout com Stripe"
→ Specific: Integração Stripe para pagamentos
→ Measurable: Usuário consegue completar compra
→ Achievable: Stripe tem SDK, é viável
→ Relevant: Monetização essencial

# ❌ Bad - Vague goals

"Melhorar o sistema" ← O quê especificamente?
"Fazer algumas features" ← Quais features?
"Trabalhar no projeto" ← Muito genérico
"Corrigir bugs" ← Quais bugs? Onde?
```

**Goal Format**:
```
"[Verbo] [O Quê] [Como/Onde]"

Exemplos:
- Implementar [checkout] [com Stripe]
- Criar [CRUD de produtos] [para vendedores]
- Adicionar [autenticação] [com Supabase]
- Refatorar [sistema de emails] [usando templates]
```

---

## Policy 10.2 — Task Breakdown Strategy

**MUST**: Quebrar sprint goal em lista clara de deliverables.

**Rationale**: Tasks concretas facilitam tracking e validação de completude.

**Guidelines**:
- 3-10 tasks por sprint (ideal)
- Cada task deve ter deliverable claro
- Tasks devem ser independentes quando possível
- Listar arquivos que serão modificados

**Implementation**:
```markdown
# ✅ Good - Clear deliverables

Sprint: "Implementar checkout com Stripe"

Tasks:
1. Criar schema de orders
   - Files: db/schema/orders.ts
   - Deliverable: Tabela orders criada no banco

2. Integrar Stripe SDK
   - Files: lib/stripe.ts
   - Deliverable: Funções createPayment, confirmPayment

3. Criar UI de checkout
   - Files: app/checkout/page.tsx, components/checkout-form.tsx
   - Deliverable: Formulário de pagamento funcional

4. Adicionar testes E2E
   - Files: e2e/checkout.spec.ts
   - Deliverable: Fluxo completo testado

# ❌ Bad - Vague tasks

Sprint: "Melhorar checkout"

Tasks:
1. "Fazer coisas no banco" ← Quais coisas?
2. "Adicionar Stripe" ← Como? Onde?
3. "UI" ← Qual UI?
4. "Testar" ← Testar o quê?
```

**Task Structure**:
```json
{
  "id": "task-1",
  "title": "Clear, actionable title",
  "deliverable": "What concrete output is expected",
  "files": ["list", "of", "files.ts"],
  "status": "pending"
}
```

**Scope Definition**:

Junto com task breakdown, definir scope boundaries:

```json
{
  "scope": {
    "in_scope": [
      "app/checkout/**",
      "components/checkout/**",
      "lib/stripe.ts",
      "db/schema/orders.ts"
    ],
    "off_limits": [
      "app/auth/**",
      "app/products/**",
      "db/schema/users.ts"
    ]
  }
}
```

**Rationale**:
- `in_scope`: Arquivos que podem ser modificados livremente
- `off_limits`: Arquivos que NÃO devem ser tocados (proteção)

---

## Anti-Patterns to Avoid

❌ **Vague sprint goal** ("Trabalhar no projeto")
❌ **Too many tasks** (> 15 tasks = múltiplas sprints)
❌ **Too few tasks** (1 task = não precisa sprint)
❌ **No scope definition** (o que pode/não pode modificar?)
❌ **Tasks sem deliverable claro**
❌ **Mixing unrelated features** (auth + checkout + products em uma sprint)

---

**Last Updated**: 2025-10-23
**Policy Count**: 2
