# 🚀 Deploy no Render - Link Mágico Chatbot IA

## Passos

1. Suba este repositório no GitHub.
2. No Render, crie um novo Web Service e conecte ao repo.
3. Defina as variáveis de ambiente (pode usar `.env.example` como base).
4. Configure:
   - Build Command: (deixe em branco)
   - Start Command: `node server.js`
   - Root Directory: raiz do projeto
5. Deploy!

## Variáveis

```
PORT=10000
ORIGIN=*
NODE_ENV=production
```

## Pós-deploy checklist

- [ ] Testar URL principal (index.html carrega?)
- [ ] Testar extração (`📊 Dados Extraídos` mostra resumo até 3 linhas?)
- [ ] Testar botão 🚀 Ativar Chatbot (leva ao chat?)
- [ ] Testar chat (mensagem cliente → resposta bot)
- [ ] Conferir responsividade no celular
