# Guia Técnico - LinkMágico Chatbot v6.0

## 🏗️ Arquitetura do Sistema

### Visão Geral da Arquitetura

O LinkMágico Chatbot v6.0 foi projetado com uma arquitetura modular e escalável, seguindo os princípios de Clean Architecture e Domain-Driven Design.

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Client)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ index_v6.html│  │   CSS/JS    │  │   Modals    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Node.js)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Routes    │  │ Middlewares │  │   Services  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ AI Engine   │  │Web Extractor│  │    Cache    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 External Services                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ OpenRouter  │  │   Websites  │  │   APIs      │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

### Componentes Principais

#### 1. Server Core (`server_v6.js`)
- **Express.js**: Framework web principal
- **Middlewares**: Helmet, CORS, compression, body-parser
- **Rotas**: Definição de endpoints RESTful
- **Error Handling**: Tratamento centralizado de erros
- **Logging**: Sistema de logs estruturados com Winston

#### 2. AI Engine (`services/ai_engine.js`)
- **Análise de Intenção**: Classificação automática de mensagens
- **Estratégias de Vendas**: Padrões de resposta por tipo de produto
- **Copywriting**: Técnicas de persuasão integradas
- **Context Management**: Manutenção de contexto conversacional
- **Response Generation**: Geração de respostas personalizadas

#### 3. Web Extractor (`services/web_extractor.js`)
- **Multi-Method**: 4 métodos de extração diferentes
- **Auto-Detection**: Seleção automática do melhor método
- **Fallback System**: Tentativas sequenciais em caso de falha
- **Content Processing**: Limpeza e estruturação de dados
- **Error Recovery**: Recuperação inteligente de erros

#### 4. Cache System
- **In-Memory Cache**: Map nativo do JavaScript
- **TTL Management**: Time-to-live configurável
- **Automatic Cleanup**: Limpeza automática de dados expirados
- **Hit Rate Tracking**: Monitoramento de eficiência

## 🔧 Detalhamento Técnico

### AI Engine - Análise Conversacional

```javascript
// Estrutura de análise de intenção
const intentAnalysis = {
  intent: 'purchase_interest',
  confidence: 0.85,
  entities: ['produto', 'preço', 'desconto'],
  sentiment: 'positive',
  urgency: 'medium',
  objections: ['preço_alto'],
  stage: 'consideration'
};

// Estratégias de resposta
const salesStrategies = {
  awareness: {
    focus: 'educação',
    tone: 'informativo',
    cta: 'saiba_mais'
  },
  consideration: {
    focus: 'benefícios',
    tone: 'persuasivo',
    cta: 'demonstração'
  },
  decision: {
    focus: 'urgência',
    tone: 'direto',
    cta: 'comprar_agora'
  }
};
```

### Web Extractor - Métodos de Extração

#### 1. Axios (Método Básico)
```javascript
const axiosExtraction = async (url) => {
  const response = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; LinkMagico/6.0)',
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8'
    },
    timeout: 10000
  });
  
  return processHTML(response.data);
};
```

#### 2. CloudScraper (Anti-Bot)
```javascript
const cloudscraperExtraction = async (url) => {
  const response = await cloudscraper.get({
    uri: url,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });
  
  return processHTML(response);
};
```

#### 3. Puppeteer (JavaScript Rendering)
```javascript
const puppeteerExtraction = async (url) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (compatible; LinkMagico/6.0)');
  await page.goto(url, { waitUntil: 'networkidle2' });
  
  const content = await page.content();
  await browser.close();
  
  return processHTML(content);
};
```

#### 4. Playwright (Advanced SPAs)
```javascript
const playwrightExtraction = async (url) => {
  const browser = await playwright.chromium.launch();
  const page = await browser.newPage();
  
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000); // Aguarda JavaScript
  
  const content = await page.content();
  await browser.close();
  
  return processHTML(content);
};
```

### Sistema de Cache

```javascript
class CacheManager {
  constructor() {
    this.dataCache = new Map();
    this.conversationCache = new Map();
    this.defaultTTL = 3600000; // 1 hora
  }
  
  set(key, value, ttl = this.defaultTTL) {
    const expiry = Date.now() + ttl;
    this.dataCache.set(key, { value, expiry });
    this.scheduleCleanup(key, ttl);
  }
  
  get(key) {
    const item = this.dataCache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.dataCache.delete(key);
      return null;
    }
    
    return item.value;
  }
  
  scheduleCleanup(key, ttl) {
    setTimeout(() => {
      this.dataCache.delete(key);
    }, ttl);
  }
}
```

### Deep Linking System

```javascript
const generateDeepLink = (platform, content, userAgent) => {
  const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
  const isIOS = /iPhone|iPad/.test(userAgent);
  const isAndroid = /Android/.test(userAgent);
  
  const links = {
    whatsapp: {
      mobile: `whatsapp://send?text=${encodeURIComponent(content)}`,
      web: `https://web.whatsapp.com/send?text=${encodeURIComponent(content)}`
    },
    instagram: {
      mobile: `instagram://share?text=${encodeURIComponent(content)}`,
      web: `https://www.instagram.com/`
    },
    // ... outros platforms
  };
  
  if (isMobile && links[platform].mobile) {
    return {
      primary: links[platform].mobile,
      fallback: links[platform].web
    };
  }
  
  return {
    primary: links[platform].web,
    fallback: links[platform].web
  };
};
```

## 📊 APIs e Endpoints

### Documentação Completa da API

#### 1. Extração de Dados
```http
GET /extract?url={url}&method={method}
```

**Parâmetros:**
- `url` (required): URL para extrair dados
- `method` (optional): auto|axios|cloudscraper|puppeteer|playwright

**Resposta:**
```json
{
  "success": true,
  "data": {
    "title": "Título da página",
    "description": "Descrição extraída",
    "content": "Conteúdo principal...",
    "images": ["url1.jpg", "url2.jpg"],
    "metadata": {
      "author": "Autor",
      "keywords": ["palavra1", "palavra2"],
      "price": "R$ 99,90"
    }
  },
  "method": "puppeteer",
  "cached": false,
  "extractionTime": 2.5
}
```

#### 2. Chat com IA
```http
POST /chat
Content-Type: application/json
```

**Body:**
```json
{
  "message": "Mensagem do usuário",
  "url": "https://exemplo.com",
  "conversationId": "user123",
  "context": {
    "previousMessages": [],
    "userProfile": {}
  }
}
```

**Resposta:**
```json
{
  "success": true,
  "response": "Resposta da IA...",
  "analysis": {
    "intent": "purchase_interest",
    "confidence": 0.85,
    "sentiment": "positive",
    "stage": "consideration"
  },
  "suggestions": [
    "Gostaria de saber mais sobre o produto?",
    "Posso ajudar com alguma dúvida específica?"
  ],
  "conversationId": "user123"
}
```

#### 3. Deep Linking
```http
POST /generate-deeplink
Content-Type: application/json
```

**Body:**
```json
{
  "platform": "whatsapp",
  "content": "Confira este produto incrível!",
  "userAgent": "Mozilla/5.0...",
  "customParams": {
    "phone": "+5511999999999"
  }
}
```

**Resposta:**
```json
{
  "success": true,
  "links": {
    "primary": "whatsapp://send?phone=5511999999999&text=...",
    "fallback": "https://web.whatsapp.com/send?phone=...",
    "qrCode": "data:image/png;base64,..."
  },
  "platform": "whatsapp",
  "deviceType": "mobile"
}
```

#### 4. Analytics
```http
GET /analytics?period={period}&detailed={boolean}
```

**Parâmetros:**
- `period` (optional): hour|day|week|month
- `detailed` (optional): true|false

**Resposta:**
```json
{
  "success": true,
  "analytics": {
    "totalExtractions": 1250,
    "totalConversations": 890,
    "cacheHitRate": "78%",
    "averageResponseTime": "1.2s",
    "successRate": "96%",
    "topDomains": [
      {"domain": "exemplo.com", "count": 45},
      {"domain": "teste.com.br", "count": 32}
    ],
    "intentDistribution": {
      "purchase_interest": 45,
      "information_seeking": 30,
      "support_request": 25
    },
    "timestamp": "2025-08-03T15:30:22.315Z"
  }
}
```

#### 5. Health Check
```http
GET /health
```

**Resposta:**
```json
{
  "status": "healthy",
  "version": "6.0.0",
  "timestamp": "2025-08-03T15:30:17.797Z",
  "uptime": 227.946996407,
  "memory": {
    "rss": 108584960,
    "heapTotal": 43278336,
    "heapUsed": 41264944,
    "external": 3791231,
    "arrayBuffers": 211682
  },
  "cache": {
    "dataCache": 15,
    "conversationCache": 8,
    "hitRate": "85%"
  },
  "services": {
    "aiEngine": "operational",
    "webExtractor": "operational",
    "cache": "operational"
  }
}
```

## 🔒 Segurança e Validação

### Middleware de Segurança

```javascript
// Helmet.js - Proteção de headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS configurado
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
```

### Validação de Entrada

```javascript
const validateChatInput = (req, res, next) => {
  const { message, url, conversationId } = req.body;
  
  // Validação de mensagem
  if (!message || typeof message !== 'string' || message.length > 1000) {
    return res.status(400).json({
      success: false,
      error: 'Mensagem inválida ou muito longa'
    });
  }
  
  // Validação de URL
  if (url && !isValidURL(url)) {
    return res.status(400).json({
      success: false,
      error: 'URL inválida'
    });
  }
  
  // Sanitização
  req.body.message = sanitizeInput(message);
  req.body.url = sanitizeURL(url);
  
  next();
};
```

### Rate Limiting (Implementável)

```javascript
const rateLimit = require('express-rate-limit');

const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: {
    success: false,
    error: 'Muitas tentativas. Tente novamente em 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/chat', chatLimiter);
```

## 📈 Performance e Otimização

### Métricas de Performance

```javascript
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      requests: 0,
      responses: 0,
      errors: 0,
      averageResponseTime: 0,
      cacheHits: 0,
      cacheMisses: 0
    };
  }
  
  recordRequest(startTime) {
    const duration = Date.now() - startTime;
    this.metrics.requests++;
    this.updateAverageResponseTime(duration);
  }
  
  recordCacheHit() {
    this.metrics.cacheHits++;
  }
  
  recordCacheMiss() {
    this.metrics.cacheMisses++;
  }
  
  getCacheHitRate() {
    const total = this.metrics.cacheHits + this.metrics.cacheMisses;
    return total > 0 ? (this.metrics.cacheHits / total * 100).toFixed(1) + '%' : '0%';
  }
}
```

### Otimizações Implementadas

#### 1. Compressão de Resposta
```javascript
const compression = require('compression');
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));
```

#### 2. Cache de Recursos Estáticos
```javascript
app.use(express.static('public', {
  maxAge: '1d',
  etag: true,
  lastModified: true
}));
```

#### 3. Connection Pooling (Para Banco de Dados)
```javascript
// Exemplo para futuras implementações com banco
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'linkmagico',
  user: 'user',
  password: 'password',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});
```

## 🧪 Testes e Qualidade

### Estrutura de Testes

```javascript
// Exemplo de teste unitário
describe('AI Engine', () => {
  describe('analyzeIntent', () => {
    it('should identify purchase intent correctly', () => {
      const message = 'Quero comprar este produto';
      const result = aiEngine.analyzeIntent(message);
      
      expect(result.intent).toBe('purchase_interest');
      expect(result.confidence).toBeGreaterThan(0.8);
    });
    
    it('should handle empty messages gracefully', () => {
      const result = aiEngine.analyzeIntent('');
      
      expect(result.intent).toBe('unknown');
      expect(result.confidence).toBe(0);
    });
  });
});

// Teste de integração
describe('Web Extractor', () => {
  it('should extract data from valid URL', async () => {
    const url = 'https://example.com';
    const result = await webExtractor.extract(url);
    
    expect(result.success).toBe(true);
    expect(result.data.title).toBeDefined();
    expect(result.data.content).toBeDefined();
  });
});
```

### Cobertura de Testes

```bash
# Executar testes
npm test

# Cobertura de código
npm run test:coverage

# Testes de performance
npm run test:performance
```

## 🚀 Deploy e Produção

### Configuração para Produção

```javascript
// Configurações de produção
if (process.env.NODE_ENV === 'production') {
  // Logs apenas para erros
  logger.level = 'error';
  
  // Desabilitar stack traces
  app.set('showStackError', false);
  
  // Configurar proxy reverso
  app.set('trust proxy', 1);
  
  // Configurar HTTPS redirect
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

### Docker Configuration

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

USER node

CMD ["npm", "start"]
```

### Environment Variables

```env
# Produção
NODE_ENV=production
PORT=3000

# APIs
OPENROUTER_API_KEY=sk-or-v1-...
OPENAI_API_KEY=sk-...

# Cache
CACHE_TTL=3600000
CONVERSATION_TTL=7200000

# Logs
LOG_LEVEL=info
LOG_FILE=./logs/chatbot_v6.log

# Segurança
ALLOWED_ORIGINS=https://meusite.com,https://www.meusite.com
SESSION_SECRET=sua_chave_secreta_aqui

# Performance
MAX_CONCURRENT_EXTRACTIONS=10
REQUEST_TIMEOUT=30000
```

## 🔧 Troubleshooting

### Problemas Comuns

#### 1. Erro de Extração
```
Error: Extraction failed for all methods
```

**Solução:**
- Verificar conectividade de rede
- Validar URL fornecida
- Verificar se o site não está bloqueando bots
- Aumentar timeout nas configurações

#### 2. Erro de IA
```
Error: OpenRouter API key not configured
```

**Solução:**
- Configurar `OPENROUTER_API_KEY` no `.env`
- Verificar se a chave é válida
- Sistema funciona sem IA (modo fallback)

#### 3. Performance Lenta
```
Warning: Average response time > 5s
```

**Solução:**
- Verificar cache hit rate
- Otimizar consultas de banco (se aplicável)
- Aumentar recursos do servidor
- Implementar CDN para assets

### Logs de Debug

```javascript
// Habilitar logs detalhados
LOG_LEVEL=debug npm start

// Logs específicos
DEBUG=linkmagico:* npm start
```

### Monitoramento

```javascript
// Health check endpoint
app.get('/health', (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: require('./package.json').version
  };
  
  res.json(health);
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
  const metrics = performanceMonitor.getMetrics();
  res.json(metrics);
});
```

---

Este guia técnico fornece uma visão completa da implementação do LinkMágico Chatbot v6.0. Para dúvidas específicas ou contribuições, consulte a documentação adicional ou entre em contato com a equipe de desenvolvimento.

