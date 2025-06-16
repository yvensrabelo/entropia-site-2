# 📱 Como Acessar no iPhone via Rede Local

## 🚀 Passos Rápidos

### 1. Iniciar o servidor para acesso na rede:
```bash
npm run dev:iphone
```

### 2. Descobrir o IP da sua máquina:

**No macOS:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Ou vá em:**
- Configurações do Sistema → Rede → Wi-Fi → Detalhes
- Procure por "Endereço IP" (algo como 192.168.1.XX)

### 3. No iPhone:
1. Certifique-se de estar na **mesma rede Wi-Fi** que seu Mac
2. Abra o Safari
3. Digite: `http://SEU_IP:3000`
   - Exemplo: `http://192.168.1.42:3000`

## 🔧 Configurações Aplicadas

### next.config.mjs
- Habilitado CORS para permitir acesso externo
- Configurado para aceitar conexões de qualquer origem

### package.json
- `npm run dev:network` - Inicia em todas as interfaces de rede
- `npm run dev:iphone` - Comando específico para teste no iPhone

## 🛡️ Notas de Segurança

⚠️ **IMPORTANTE**: Estas configurações são apenas para desenvolvimento local!

- O servidor estará acessível para qualquer dispositivo na sua rede
- Não use estas configurações em produção
- Para produção, configure CORS adequadamente

## 🐛 Troubleshooting

### Não consigo acessar?

1. **Firewall**: Verifique se o macOS não está bloqueando a porta 3000
   - Vá em Configurações → Segurança → Firewall
   - Permita conexões para o Node.js

2. **Porta em uso**: Se a porta 3000 estiver ocupada:
   ```bash
   npm run dev:iphone -- -p 3001
   ```

3. **IP correto**: Certifique-se de usar o IP da interface Wi-Fi, não Ethernet

4. **Mesma rede**: iPhone e Mac devem estar na mesma rede Wi-Fi

### Console do Safari no iPhone

Para debug:
1. No iPhone: Configurações → Safari → Avançado → Web Inspector (ON)
2. No Mac: Safari → Desenvolver → [Seu iPhone] → [localhost]

## 📱 Otimizações Mobile Aplicadas

- Layout responsivo clean
- Animações suaves
- Touch-friendly buttons
- Viewport meta tags configuradas
- Safe areas para notch do iPhone

## 🎯 Comandos Úteis

```bash
# Desenvolvimento normal
npm run dev

# Acesso via rede (iPhone, Android, etc)
npm run dev:iphone

# Build de produção
npm run build
npm start
```

---

**Dica**: Salve o IP do seu Mac nos favoritos do Safari para acesso rápido!