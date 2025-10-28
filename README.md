# ALD System

**Version**: 1.3.1
**Status**: ✅ Production Ready

## 🎯 O que é o ALD System?

**ALD (Autonomous Learning & Development)** é um sistema completo de desenvolvimento assistido por IA com 155 políticas validadas, gerenciamento de memória persistente, coordenação de sprints, validação E2E, e aprendizado contínuo.

## ⭐ Principais Features

- 🧠 **Memory System** - Contexto persistente entre conversas
- 📜 **155 Policies** - Políticas validadas em 17 categorias
- 🎯 **Sprint Management** - Isolamento de escopo e rastreamento
- ✅ **E2E Testing** - Validação como usuário final
- 🔄 **Continuous Learning** - Sistema auto-evolutivo
- 👨‍💻 **Code Review** - Revisão com validação de políticas
- 🔍 **Policy Finder** - Busca inteligente de políticas
- 🎭 **Orchestrator** - Coordenação de workflows

## 🚀 Instalação

```bash
/plugin install https://github.com/dirgogoo/ald-system
```

## 📚 Skills Incluídas

1. **ald-memory** - Memória contextual persistente
2. **ald-policies** - 155 políticas em 17 categorias
3. **ald-curator** - Detecção de padrões e aprendizado
4. **ald-tester** - Validação E2E como usuário
5. **ald-orchestrator** - Coordenação de workflows
6. **ald-sprint** - Gerenciamento de sprints
7. **ald-policy-finder** - Busca inteligente de políticas
8. **ald-code-reviewer** - Revisão de código

## 📖 Documentação

- [CLAUDE.md](./CLAUDE.md) - Controlador do sistema
- [MIGRATION.md](./docs/MIGRATION.md) - Guia de migração
- [HOW_TO_ENFORCE_ALD.md](./docs/HOW_TO_ENFORCE_ALD.md) - Como enforçar

## 🔧 Como Usar

### 1. Instalação
```bash
/plugin install https://github.com/dirgogoo/ald-system
```

### 2. Começar Desenvolvimento

O ALD ativa automaticamente quando você pede uma tarefa de desenvolvimento:

```
Você: "Crie um endpoint de usuários com validação"

Claude:
🚀 PRE-FLIGHT CHECK - API de usuários

- [✅] 1. Desenvolvimento? SIM
- [✅] 2. Memory carregado: seu-projeto.json
- [✅] 3. Policies carregadas (9 policies):
      - security.md
      - api-design.md
      - database.md
...

[Implementação seguindo policies]

CLAUDE.MD ATIVO
```

### 3. Cobrar Workflow (Importante!)

Se Claude não mostrar o pre-flight check:

```
Você: "Cadê o pre-flight check?"

Claude: [Executa retroativamente e corrige se necessário]
```

Veja [HOW_TO_ENFORCE_ALD.md](./docs/HOW_TO_ENFORCE_ALD.md) para detalhes.

## 📊 155 Políticas em 17 Categorias

### Database (13 policies)
- Explicit PKs, indexes on FKs
- RLS policies obrigatórias
- Migrations com rollback

### UI/UX (14 policies)
- Component composition
- Accessibility
- Performance

### Code Quality (17 policies)
- DRY, SOLID
- Error handling
- Documentation

### Security (13 policies)
- Server-side validation
- Authentication patterns
- Data protection

### API Design (10 policies)
- RESTful naming
- Status codes
- Versioning

### Testing (8 policies)
- Unit, integration, E2E
- Coverage requirements

### Performance (8 policies)
- Optimization patterns
- Caching strategies

### Git/CI-CD (8 policies)
- Commit conventions
- PR workflows

### Logging/Monitoring (6 policies)
- Structured logging
- Metrics tracking

### External Integrations (11 policies)
- API documentation
- SDK usage
- Error recovery

### MCP Usage (4 policies)
- Priority: MCP > SDK > HTTP
- Auto-detection

### Error Recovery (6 policies)
- Graceful degradation
- Retry strategies

### State Management (7 policies)
- Client state patterns
- Cache invalidation

### Data Fetching (6 policies)
- Loading states
- Error boundaries

### File Uploads (5 policies)
- Validation
- Storage patterns

### Forms/Validation (7 policies)
- Client + server validation
- User feedback

### Sprint Scope Isolation (12 policies)
- Boundary enforcement
- Regression prevention

## 🔄 Workflow ALD

```
0. 🏃 SPRINT CHECK (opcional mas recomendado)
   ↓
1. 🧠 LOAD MEMORY (contexto do projeto)
   ↓
2. 📜 LOAD POLICIES (policies relevantes)
   ↓
3. 🎯 ORCHESTRATE
   ├─→ ANALYZE (decomposição)
   ├─→ EXECUTE (implementação)
   ├─→ TEST (validação E2E)
   ├─→ Loop se falhar
   └─→ CURATE (aprendizado)
```

## 🎯 Sprint Management

Crie sprints para features complexas:

```
Você: "Vou implementar checkout com Stripe"

Claude: "Deseja criar sprint para 'checkout'?"

[Após confirmar]

Sprint criada: sprint-008-checkout
- Goal: Checkout completo com Stripe
- Scope: app/checkout/**, lib/stripe.ts
- Off-limits: app/auth/**, app/products/**

[Toda implementação subsequente valida contra scope]
```

## 🧪 Code Review com Policies

```
Você: "Revise com ald-code-reviewer"

Claude:
# 🔍 Code Review: Checkout Implementation

## 🏛️ ALD Policies Compliance
- ✅ 9/10 policies applied correctly
- ❌ Policy 4.1: Missing server-side validation
  Fix: Add Zod schema to route.ts:12

## 🎯 Superpowers Review
[Standard code review output]

## ⚡ Priority Actions
1. [CRITICAL] Add validation
2. [IMPORTANT] Add file header
```

## 🤝 Integra com

- **Nexus Orchestrator** - Master workflow coordinator
- **Superpowers** - Structured workflows
- **Claude Code** - Plugin system

## 🔧 Exemplo Real

```
Você: "Adiciona tabela de produtos no banco"

Claude:
🚀 PRE-FLIGHT CHECK - Schema produtos

- [✅] SPRINT CHECK: Dentro do escopo
- [✅] Memory: erp-project.json carregado
- [✅] Policies: database.md (13 policies)

📖 Implementando migration:

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_created ON products(created_at);

-- RLS policies
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY products_read ON products FOR SELECT USING (true);

[Validação completa]

✅ Pronto! Policies seguidas:
- Policy 1.1: Explicit PK
- Policy 1.2: Index on common queries
- Policy 4.7: RLS enabled

CLAUDE.MD ATIVO
```

## 📝 License

MIT License - see [LICENSE](./LICENSE)

## 🙏 Créditos

Desenvolvido por **dirgogoo** com amor ❤️

---

**Instalação**:
```bash
/plugin install https://github.com/dirgogoo/ald-system
```

**Documentação**: [docs/](./docs/)
**Issues**: [GitHub Issues](https://github.com/dirgogoo/ald-system/issues)

CLAUDE.MD ATIVO
