# Como Garantir que Claude Siga o Workflow ALD

Este guia ensina como **cobrar** o Claude para seguir o sistema ALD corretamente.

## 🚨 Problema

Claude pode "esquecer" de consultar policies/memory antes de implementar, mesmo tendo o CLAUDE.md.

## ✅ Solução: Cobrança Ativa

### 1. Antes de Começar uma Tarefa

**Você pergunta:**
```
"Antes de implementar, mostre o pre-flight check"
```

**Claude DEVE responder:**
```
🚀 PRE-FLIGHT CHECK - [nome da tarefa]

- [ ] 1. Tarefa é de desenvolvimento?
- [ ] 2. Carregar ald-memory
- [ ] 3. Carregar policies relevantes
- [ ] 4. Confirmar entendimento
- [ ] 5. Implementar
...
```

### 2. Se Claude Implementar Sem Mostrar o Checklist

**Você pergunta:**
```
"Você seguiu o workflow ALD? Consultou as policies?"
```

ou simplesmente:

```
"Cadê o pre-flight check?"
```

**Claude DEVE:**
1. ✅ Admitir que pulou
2. ✅ Executar checklist retroativamente
3. ✅ Revisar código contra policies
4. ✅ Corrigir se encontrar violações
5. ✅ Registrar no curator

### 3. Frases-Gatilho para Cobrar

Use qualquer uma dessas:

- ❓ **"Você consultou as policies antes?"**
- ❓ **"Seguiu o workflow ALD?"**
- ❓ **"Cadê o pre-flight check?"**
- ❓ **"Carregou a memória do projeto?"**
- ❓ **"Quais policies você aplicou?"**

### 4. No Meio da Implementação

Se Claude está implementando e você suspeita que não consultou policies:

**Você pergunta:**
```
"Pause. Que policies você está seguindo? Mostre-as."
```

**Claude DEVE:**
- Parar
- Ir buscar policies relevantes (Read tool)
- Mostrar trechos específicos
- Revisar o que já fez

## 📋 Checklist para Você (Usuário)

```
Quando pedir uma tarefa de desenvolvimento:

- [ ] Claude mostrou o pre-flight check?
      ❌ Não → Cobrar: "Cadê o pre-flight?"
      ✅ Sim → Continuar

- [ ] Claude carregou memory/policies?
      ❌ Não → Cobrar: "Consultou as policies?"
      ✅ Sim → Continuar

- [ ] Claude validou após implementar?
      ❌ Não → Cobrar: "Rodou os testes?"
      ✅ Sim → Continuar

- [ ] Claude terminou com "CLAUDE.MD ATIVO"?
      ❌ Não → Cobrar: "Faltou o sufixo!"
      ✅ Sim → OK!
```

## 🎯 Quando Usar Cada Cobrança

| Situação | Frase para Cobrar |
|----------|-------------------|
| Começando tarefa | "Mostre o pre-flight check primeiro" |
| Claude já implementou | "Você seguiu o workflow ALD?" |
| Claude implementou rápido demais | "Consultou as policies antes?" |
| Parece que pulou validação | "Rodou os testes? Cadê o ald-tester?" |
| **⭐ Após completar feature** | **"Revise o código com ald-code-reviewer"** |
| Fim da lista de tarefas | "Já curou os aprendizados? Invoque ald-curator" |
| Esqueceu sufixo | "Faltou terminar com CLAUDE.MD ATIVO" |

## 🔍 Code Review Integration (NOVO)

### O que é ald-code-reviewer?

O **ald-code-reviewer** é um skill que integra Superpowers com ALD:
- Valida código contra 155 políticas ALD
- Invoca superpowers:code-reviewer para revisão completa
- Retorna relatório unificado com violações de políticas + issues de código

### Quando Cobrar Code Review

**Após completar implementação:**
```
Você: "Revise com ald-code-reviewer"
```

**Antes de criar PR/merge:**
```
Você: "Está pronto para merge? Rode ald-code-reviewer"
```

**Se Claude não sugerir automaticamente:**
```
Você: "Já fez code review das policies?"
```

### O que Esperar do ald-code-reviewer

Claude DEVE:

1. **Carregar contexto** (ald-memory)
2. **Identificar políticas relevantes** (ald-policy-finder automático)
3. **Validar código contra políticas** (155 políticas)
4. **Invocar superpowers:code-reviewer** (revisão completa)
5. **Mesclar relatórios** (ALD + Superpowers)

### Formato de Output Esperado

```markdown
# 🔍 Code Review: [Nome da Implementação]

## 📋 Summary
- Files: X files
- Policies: Y validated
- Critical Issues: Z

## 🏛️ ALD Policies Compliance

### ❌ MUST Violations (Critical)
- Policy 4.1: Server-side validation missing
  File: app/api/route.ts:12
  Fix: Add Zod schema

### ⚠️ SHOULD Violations (Important)
- Policy 3.17: Missing policy documentation
  File: app/api/route.ts:1
  Fix: Add file header

### ✅ Policies Correctly Applied (8/10)
- ✅ Policy 5.1: RESTful naming
- ✅ Policy 5.2: HTTP status codes
...

## 🎯 Standard Code Review (Superpowers)
[Superpowers output]

## ⚡ Priority Action Items
1. [CRITICAL] Fix X
2. [IMPORTANT] Fix Y
...
```

### Cobrança se Claude Pular

**Se Claude não rodar code review:**
```
Você: "Cadê o code review? Use ald-code-reviewer"

Claude: Vou executar agora:

[Executa ald-code-reviewer]

- Carregando memory...
- Identificando policies com policy-finder...
- Validando contra 9 policies...
- Invocando superpowers:code-reviewer...
- Mesclando relatórios...

[Retorna relatório unificado]

✅ Code review completo!
```

### Quando NÃO Usar

❌ Código ainda não implementado (nada para revisar)
❌ Apenas planejamento (use brainstorming)
❌ Quick syntax check (use linter)

✅ Feature completa e funcionando
✅ Antes de merge/PR
✅ Após completar sprint task

## 🔧 Exemplo Real de Cobrança

### ❌ Claude Errou

```
Claude: Criei o schema do banco! [implementação sem checklist]

Você: Você seguiu o workflow ALD? Consultou as policies antes?

Claude: Não, pulei o workflow. Vou executar agora:

🚀 PRE-FLIGHT CHECK (RETROATIVO) - Schema
- [❌→✅] Carregando database.md...
- [⚠️] Encontrei violação: faltam RLS policies!
- [🔧] Corrigindo...

[Aplica correção]

✅ Corrigido. Registrei a falha no curator.
```

### ✅ Claude Acertou

```
Claude: Vou implementar a API de produtos.

🚀 PRE-FLIGHT CHECK - API de produtos

- [✅] 1. Desenvolvimento? SIM
- [✅] 2. Memory carregado: marketplace-pecas-industriais.json
- [✅] 3. Policies carregadas:
      - database.md (8 policies)
      - security.md (10 policies)
      - code-quality.md (10 policies)
- [✅] 4. Entendimento confirmado

Agora implementando...

[Implementação seguindo policies]

CLAUDE.MD ATIVO
```

## 💡 Dicas

1. **Seja direto**: "Cadê o pre-flight?" é mais efetivo que explicações longas

2. **Cobre no início**: Muito mais fácil que corrigir depois

3. **Use sempre a mesma frase**: Cria padrão (ex: sempre "Cadê o pre-flight?")

4. **Não tenha medo de cobrar**: Isso MELHORA o sistema (curator aprende)

5. **Se Claude errar 3x seguidas**: Peça pra ele reler o CLAUDE.md todo

## 📊 Sistema de Score (Opcional)

Você pode acompanhar:

```
Session Score: 3/5 tarefas com pre-flight correto (60%)

Falhas:
- Tarefa 1: ❌ Pulou pre-flight (corrigido retroativo)
- Tarefa 2: ✅ Pre-flight completo
- Tarefa 3: ✅ Pre-flight completo
- Tarefa 4: ❌ Pulou validation (corrigido)
- Tarefa 5: ✅ Pre-flight completo

Objetivo: 100% nas próximas 10 tarefas
```

## 🎓 O Que o Sistema Aprende

Cada vez que você cobra:
1. Claude registra no `ald-curator/feedback.json`
2. Padrão de falha é identificado
3. Sistema melhora (teoricamente... na prática você precisa cobrar sempre 😅)

---

**Resumo**: Não confie que Claude vai seguir automaticamente. **Cobre sempre.**

A frase mágica é: **"Cadê o pre-flight check?"**
