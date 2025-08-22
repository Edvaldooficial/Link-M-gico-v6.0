# Guia de Deployment - LinkMágico Chatbot v6.0

## 🚀 Visão Geral do Deployment

Este guia fornece instruções detalhadas para fazer o deploy do LinkMágico Chatbot v6.0 em diferentes ambientes, desde desenvolvimento local até produção em larga escala.

## 📋 Pré-requisitos

### Requisitos Mínimos do Sistema

#### Desenvolvimento Local
- **CPU**: 2 cores
- **RAM**: 4GB
- **Disco**: 2GB livres
- **Node.js**: 18.x ou superior
- **NPM**: 9.x ou superior

#### Produção (Pequeno/Médio Porte)
- **CPU**: 4 cores
- **RAM**: 8GB
- **Disco**: 10GB livres (SSD recomendado)
- **Bandwidth**: 100Mbps
- **OS**: Ubuntu 20.04+ / CentOS 8+ / Amazon Linux 2

#### Produção (Grande Porte)
- **CPU**: 8+ cores
- **RAM**: 16GB+
- **Disco**: 50GB+ SSD
- **Bandwidth**: 1Gbps+
- **Load Balancer**: Nginx/HAProxy
- **Database**: PostgreSQL/MongoDB (opcional)

### Software Necessário

```bash
# Node.js (via NodeSource)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 (Process Manager)
sudo npm install -g pm2

# Nginx (Proxy Reverso)
sudo apt-get install -y nginx

# Certbot (SSL)
sudo apt-get install -y certbot python3-certbot-nginx
```

## 🏠 Deployment Local (Desenvolvimento)

### 1. Clonagem e Configuração

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/linkmagico-chatbot-v6.git
cd linkmagico-chatbot-v6

# Instale as dependências
npm install

# Copie o arquivo de ambiente
cp .env.example .env
```

### 2. Configuração do Ambiente

Edite o arquivo `.env`:

```env
# Configuração Local
NODE_ENV=development
PORT=3000

# APIs (Opcional para desenvolvimento)
OPENROUTER_API_KEY=sua_chave_aqui
OPENAI_API_KEY=sua_chave_aqui

# Cache
CACHE_TTL=3600000
CONVERSATION_TTL=7200000

# Logs
LOG_LEVEL=debug
LOG_FILE=./logs/chatbot_dev.log

# Desenvolvimento
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### 3. Execução

```bash
# Desenvolvimento (com hot reload)
npm run dev

# Produção local
npm start

# Com PM2
pm2 start ecosystem.config.js --env development
```

### 4. Verificação

```bash
# Teste de saúde
curl http://localhost:3000/health

# Teste de funcionalidade
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Olá","url":"https://example.com"}'
```

## ☁️ Deployment em VPS/Cloud

### 1. Preparação do Servidor

#### Ubuntu 20.04/22.04

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependências
sudo apt install -y curl wget git build-essential

# Configurar firewall
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# Criar usuário para aplicação
sudo adduser linkmagico
sudo usermod -aG sudo linkmagico
```

#### CentOS 8/Rocky Linux

```bash
# Atualizar sistema
sudo dnf update -y

# Instalar dependências
sudo dnf groupinstall -y "Development Tools"
sudo dnf install -y curl wget git

# Configurar firewall
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload
```

### 2. Instalação da Aplicação

```bash
# Mudar para usuário da aplicação
sudo su - linkmagico

# Clonar repositório
git clone https://github.com/seu-usuario/linkmagico-chatbot-v6.git
cd linkmagico-chatbot-v6

# Instalar dependências de produção
npm ci --only=production

# Configurar ambiente
cp .env.example .env
nano .env
```

### 3. Configuração de Produção

```env
# Produção
NODE_ENV=production
PORT=3000

# APIs
OPENROUTER_API_KEY=sk-or-v1-sua-chave-real
OPENAI_API_KEY=sk-sua-chave-real

# Cache
CACHE_TTL=3600000
CONVERSATION_TTL=7200000

# Logs
LOG_LEVEL=info
LOG_FILE=/var/log/linkmagico/chatbot.log

# Segurança
ALLOWED_ORIGINS=https://seudominio.com,https://www.seudominio.com
SESSION_SECRET=sua_chave_secreta_super_forte_aqui

# Performance
MAX_CONCURRENT_EXTRACTIONS=20
REQUEST_TIMEOUT=30000
```

### 4. Configuração do PM2

Crie o arquivo `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'linkmagico-chatbot-v6',
    script: 'server_v6.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/linkmagico/err.log',
    out_file: '/var/log/linkmagico/out.log',
    log_file: '/var/log/linkmagico/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
```

### 5. Inicialização com PM2

```bash
# Criar diretório de logs
sudo mkdir -p /var/log/linkmagico
sudo chown linkmagico:linkmagico /var/log/linkmagico

# Iniciar aplicação
pm2 start ecosystem.config.js --env production

# Salvar configuração PM2
pm2 save

# Configurar inicialização automática
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u linkmagico --hp /home/linkmagico
```

## 🌐 Configuração do Nginx

### 1. Instalação e Configuração Básica

```bash
# Instalar Nginx
sudo apt install -y nginx

# Criar configuração do site
sudo nano /etc/nginx/sites-available/linkmagico
```

### 2. Configuração do Virtual Host

```nginx
server {
    listen 80;
    server_name seudominio.com www.seudominio.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seudominio.com www.seudominio.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/seudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seudominio.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
    
    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=chat:10m rate=5r/s;
    
    # Static Files
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # API Endpoints with Rate Limiting
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    # Chat Endpoint with Stricter Rate Limiting
    location /chat {
        limit_req zone=chat burst=10 nodelay;
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    # Main Application
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    # Health Check (sem rate limiting)
    location /health {
        proxy_pass http://127.0.0.1:3000;
        access_log off;
    }
}
```

### 3. Ativação da Configuração

```bash
# Ativar site
sudo ln -s /etc/nginx/sites-available/linkmagico /etc/nginx/sites-enabled/

# Remover configuração padrão
sudo rm /etc/nginx/sites-enabled/default

# Testar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## 🔒 Configuração SSL com Let's Encrypt

### 1. Instalação do Certbot

```bash
# Ubuntu/Debian
sudo apt install -y certbot python3-certbot-nginx

# CentOS/Rocky Linux
sudo dnf install -y certbot python3-certbot-nginx
```

### 2. Obtenção do Certificado

```bash
# Obter certificado SSL
sudo certbot --nginx -d seudominio.com -d www.seudominio.com

# Configurar renovação automática
sudo crontab -e
# Adicionar linha:
0 12 * * * /usr/bin/certbot renew --quiet
```

### 3. Verificação

```bash
# Testar renovação
sudo certbot renew --dry-run

# Verificar status
sudo certbot certificates
```

## 🐳 Deployment com Docker

### 1. Dockerfile

```dockerfile
FROM node:18-alpine

# Instalar dependências do sistema
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Configurar Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S linkmagico -u 1001

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production && npm cache clean --force

# Copiar código da aplicação
COPY --chown=linkmagico:nodejs . .

# Criar diretório de logs
RUN mkdir -p /app/logs && chown linkmagico:nodejs /app/logs

# Mudar para usuário não-root
USER linkmagico

# Expor porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node healthcheck.js

# Comando de inicialização
CMD ["npm", "start"]
```

### 2. Docker Compose

```yaml
version: '3.8'

services:
  linkmagico-chatbot:
    build: .
    container_name: linkmagico-chatbot-v6
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - CACHE_TTL=3600000
      - CONVERSATION_TTL=7200000
      - LOG_LEVEL=info
    volumes:
      - ./logs:/app/logs
      - ./data:/app/data
    networks:
      - linkmagico-network
    depends_on:
      - redis
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  redis:
    image: redis:7-alpine
    container_name: linkmagico-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    networks:
      - linkmagico-network
    command: redis-server --appendonly yes

  nginx:
    image: nginx:alpine
    container_name: linkmagico-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
      - /etc/letsencrypt:/etc/letsencrypt
    networks:
      - linkmagico-network
    depends_on:
      - linkmagico-chatbot

volumes:
  redis-data:

networks:
  linkmagico-network:
    driver: bridge
```

### 3. Comandos Docker

```bash
# Build da imagem
docker build -t linkmagico-chatbot-v6 .

# Executar com Docker Compose
docker-compose up -d

# Verificar logs
docker-compose logs -f linkmagico-chatbot

# Parar serviços
docker-compose down

# Atualizar aplicação
docker-compose pull
docker-compose up -d --force-recreate
```

## ☁️ Deployment em Cloud Providers

### AWS (Amazon Web Services)

#### 1. EC2 Instance

```bash
# Criar instância EC2 (t3.medium recomendado)
# Ubuntu 20.04 LTS
# Security Group: HTTP (80), HTTPS (443), SSH (22)

# Conectar via SSH
ssh -i sua-chave.pem ubuntu@ip-da-instancia

# Seguir passos de VPS deployment
```

#### 2. Elastic Beanstalk

```json
{
  "AWSEBDockerrunVersion": "1",
  "Image": {
    "Name": "seu-usuario/linkmagico-chatbot-v6:latest",
    "Update": "true"
  },
  "Ports": [
    {
      "ContainerPort": "3000"
    }
  ],
  "Environment": [
    {
      "Name": "NODE_ENV",
      "Value": "production"
    },
    {
      "Name": "PORT",
      "Value": "3000"
    }
  ]
}
```

#### 3. ECS (Fargate)

```json
{
  "family": "linkmagico-chatbot-v6",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "linkmagico-chatbot",
      "image": "seu-usuario/linkmagico-chatbot-v6:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/linkmagico-chatbot-v6",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

### Google Cloud Platform

#### 1. Compute Engine

```bash
# Criar VM
gcloud compute instances create linkmagico-chatbot-v6 \
    --zone=us-central1-a \
    --machine-type=e2-medium \
    --image-family=ubuntu-2004-lts \
    --image-project=ubuntu-os-cloud \
    --boot-disk-size=20GB \
    --tags=http-server,https-server

# Conectar
gcloud compute ssh linkmagico-chatbot-v6 --zone=us-central1-a
```

#### 2. Cloud Run

```yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: linkmagico-chatbot-v6
  annotations:
    run.googleapis.com/ingress: all
spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/maxScale: "10"
        run.googleapis.com/cpu-throttling: "false"
    spec:
      containerConcurrency: 100
      timeoutSeconds: 300
      containers:
      - image: gcr.io/seu-projeto/linkmagico-chatbot-v6:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "3000"
        resources:
          limits:
            cpu: "1"
            memory: "2Gi"
```

### DigitalOcean

#### 1. Droplet

```bash
# Criar Droplet via CLI
doctl compute droplet create linkmagico-chatbot-v6 \
    --size s-2vcpu-4gb \
    --image ubuntu-20-04-x64 \
    --region nyc1 \
    --ssh-keys sua-chave-ssh

# Conectar
ssh root@ip-do-droplet
```

#### 2. App Platform

```yaml
name: linkmagico-chatbot-v6
services:
- name: web
  source_dir: /
  github:
    repo: seu-usuario/linkmagico-chatbot-v6
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  env:
  - key: NODE_ENV
    value: "production"
  - key: PORT
    value: "3000"
  - key: OPENROUTER_API_KEY
    value: "sua-chave"
    type: SECRET
```

## 📊 Monitoramento e Logs

### 1. Configuração de Logs

```bash
# Criar diretório de logs
sudo mkdir -p /var/log/linkmagico
sudo chown linkmagico:linkmagico /var/log/linkmagico

# Configurar logrotate
sudo nano /etc/logrotate.d/linkmagico
```

```
/var/log/linkmagico/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 linkmagico linkmagico
    postrotate
        pm2 reload linkmagico-chatbot-v6
    endscript
}
```

### 2. Monitoramento com PM2

```bash
# Monitoramento em tempo real
pm2 monit

# Logs em tempo real
pm2 logs linkmagico-chatbot-v6

# Métricas
pm2 show linkmagico-chatbot-v6

# Web dashboard (opcional)
pm2 web
```

### 3. Alertas e Notificações

```javascript
// ecosystem.config.js - Configuração de alertas
module.exports = {
  apps: [{
    name: 'linkmagico-chatbot-v6',
    script: 'server_v6.js',
    // ... outras configurações
    
    // Alertas
    min_uptime: '10s',
    max_restarts: 5,
    
    // Notificações (webhook)
    webhook_url: 'https://hooks.slack.com/services/...',
    
    // Monitoramento de CPU/Memória
    max_memory_restart: '1G',
    
    // Auto-restart em caso de erro
    autorestart: true,
    watch: false,
    
    // Configurações de cluster
    instances: 'max',
    exec_mode: 'cluster'
  }]
};
```

## 🔧 Troubleshooting de Deployment

### Problemas Comuns

#### 1. Erro de Permissões

```bash
# Problema: EACCES permission denied
# Solução:
sudo chown -R linkmagico:linkmagico /home/linkmagico/linkmagico-chatbot-v6
chmod +x server_v6.js
```

#### 2. Porta em Uso

```bash
# Problema: EADDRINUSE port 3000 already in use
# Solução:
sudo lsof -i :3000
sudo kill -9 PID_DO_PROCESSO
```

#### 3. Erro de Dependências

```bash
# Problema: Module not found
# Solução:
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

#### 4. Erro de SSL

```bash
# Problema: SSL certificate error
# Solução:
sudo certbot renew
sudo nginx -t
sudo systemctl reload nginx
```

#### 5. Performance Lenta

```bash
# Verificar recursos
htop
df -h
free -m

# Verificar logs
tail -f /var/log/linkmagico/chatbot.log

# Verificar PM2
pm2 monit
```

### Scripts de Manutenção

#### 1. Script de Backup

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/linkmagico"
APP_DIR="/home/linkmagico/linkmagico-chatbot-v6"

mkdir -p $BACKUP_DIR

# Backup da aplicação
tar -czf $BACKUP_DIR/app_$DATE.tar.gz $APP_DIR

# Backup dos logs
tar -czf $BACKUP_DIR/logs_$DATE.tar.gz /var/log/linkmagico

# Limpeza de backups antigos (manter 7 dias)
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup concluído: $DATE"
```

#### 2. Script de Atualização

```bash
#!/bin/bash
# update.sh

APP_DIR="/home/linkmagico/linkmagico-chatbot-v6"
cd $APP_DIR

# Backup antes da atualização
./backup.sh

# Parar aplicação
pm2 stop linkmagico-chatbot-v6

# Atualizar código
git pull origin main

# Instalar dependências
npm ci --only=production

# Reiniciar aplicação
pm2 restart linkmagico-chatbot-v6

# Verificar saúde
sleep 10
curl -f http://localhost:3000/health || echo "ERRO: Aplicação não está respondendo"

echo "Atualização concluída"
```

#### 3. Script de Health Check

```bash
#!/bin/bash
# healthcheck.sh

HEALTH_URL="http://localhost:3000/health"
WEBHOOK_URL="https://hooks.slack.com/services/..."

response=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ $response != "200" ]; then
    echo "ERRO: Aplicação não está respondendo (HTTP $response)"
    
    # Tentar reiniciar
    pm2 restart linkmagico-chatbot-v6
    
    # Enviar alerta
    curl -X POST -H 'Content-type: application/json' \
        --data '{"text":"🚨 LinkMágico Chatbot v6.0 está com problemas!"}' \
        $WEBHOOK_URL
else
    echo "OK: Aplicação está funcionando normalmente"
fi
```

## 📈 Otimização de Performance

### 1. Configurações de Sistema

```bash
# Aumentar limites de arquivo
echo "linkmagico soft nofile 65536" >> /etc/security/limits.conf
echo "linkmagico hard nofile 65536" >> /etc/security/limits.conf

# Otimizar TCP
echo "net.core.somaxconn = 65536" >> /etc/sysctl.conf
echo "net.ipv4.tcp_max_syn_backlog = 65536" >> /etc/sysctl.conf
sysctl -p
```

### 2. Configurações Node.js

```bash
# Variáveis de ambiente para performance
export NODE_OPTIONS="--max-old-space-size=2048"
export UV_THREADPOOL_SIZE=128
```

### 3. Configurações PM2

```javascript
// ecosystem.config.js - Otimizado para performance
module.exports = {
  apps: [{
    name: 'linkmagico-chatbot-v6',
    script: 'server_v6.js',
    instances: 'max',
    exec_mode: 'cluster',
    max_memory_restart: '2G',
    node_args: '--max-old-space-size=2048',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
      UV_THREADPOOL_SIZE: 128
    }
  }]
};
```

---

Este guia de deployment fornece todas as informações necessárias para colocar o LinkMágico Chatbot v6.0 em produção com segurança e performance otimizada. Para suporte adicional, consulte a documentação técnica ou entre em contato com a equipe de desenvolvimento.

