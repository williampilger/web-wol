# Wake on LAN Web Application

```
⚠️ Aplicação desenvolvida pelo Github Copilot (*Cloud Sonnet 4*), revisada EM PARTES, e ajustada por mim.
```

Uma aplicação web simples para gerenciar Wake on LAN de máquinas em rede local, desenvolvida com Next.js e TypeScript.

## ⚠️ Aviso de Segurança

**Esta aplicação é destinada APENAS para desenvolvimento interno e uso em redes privadas seguras.**

- As senhas são armazenadas em texto simples no arquivo `config.json`
- Não há criptografia implementada
- **NUNCA** use esta aplicação em produção ou redes públicas
- **NUNCA** exponha esta aplicação na internet

## Funcionalidades

- ✅ Autenticação simples por usuário e senha
- ✅ Gestão de grupos de máquinas
- ✅ Controle de acesso baseado em grupos
- ✅ Ping automático para verificar status das máquinas
- ✅ Wake on LAN para ligar máquinas remotamente
- ✅ Interface web responsiva com status visual
- ✅ Timeout configurável para ping

## Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn
- Rede local com máquinas compatíveis com Wake on LAN
- Máquinas alvo configuradas para aceitar Wake on LAN

## Configuração

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar máquinas e usuários

Edite o arquivo `config.json` na raiz do projeto:

```json
{
  "timeout": 2000,
  "users": [
    {
      "id": "admin",
      "password": "sua_senha_aqui",
      "groups": ["escritorio", "servidores"]
    }
  ],
  "groups": [
    {
      "id": "escritorio",
      "name": "Escritório",
      "description": "Máquinas do escritório principal"
    }
  ],
  "machines": [
    {
      "id": "pc-01",
      "name": "PC Principal",
      "ip": "192.168.1.100",
      "mac": "00:11:22:33:44:55",
      "groups": ["escritorio"]
    }
  ]
}
```

### 3. Configuração das máquinas alvo

Para que o Wake on LAN funcione, as máquinas alvo devem ter:

- Wake on LAN habilitado na BIOS/UEFI
- Wake on LAN habilitado na placa de rede
- Estar conectadas à rede via cabo ethernet (Wi-Fi pode não funcionar)

#### Windows:
1. Painel de Controle → Gerenciador de Dispositivos
2. Adaptadores de rede → Propriedades da placa de rede
3. Aba "Gerenciamento de Energia" → Marcar "Permitir que este dispositivo desperte o computador"
4. Aba "Avançado" → Procurar por "Wake on Magic Packet" e definir como "Habilitado"

#### Linux:
```bash
# Verificar se está habilitado
sudo ethtool eth0 | grep Wake-on

# Habilitar (substitua eth0 pela sua interface)
sudo ethtool -s eth0 wol g
```

## Executar a aplicação

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm run build
npm start
```

A aplicação estará disponível em: http://localhost:3000

## Como usar

1. **Login**: Use as credenciais configuradas no `config.json`
2. **Dashboard**: Visualize todas as máquinas organizadas por grupos
3. **Status**: Os círculos coloridos mostram se as máquinas estão online (🟢) ou offline (🔴)
4. **Wake on LAN**: Clique em "⚡ Ligar" para enviar o comando Wake on LAN
5. **Atualizar**: Use o botão "🔄 Atualizar Status" para verificar novamente

### Usuários de exemplo (config.json padrão):
- **admin / admin123**: Acesso a todos os grupos
- **user1 / user123**: Acesso apenas ao grupo "escritorio"  
- **dev / dev123**: Acesso apenas ao grupo "desenvolvimento"

## Configurações

### timeout
Tempo limite em milissegundos para o ping (padrão: 2000ms)

### users
Lista de usuários com suas senhas e grupos de acesso

### groups
Definição dos grupos de máquinas

### machines
Lista de máquinas com IP, MAC e grupos associados

## Estrutura do projeto

```
web-wol/
├── config.json                 # Configuração de usuários e máquinas
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/login/      # API de autenticação
│   │   │   └── machines/        # APIs de máquinas (status e wake)
│   │   └── page.tsx             # Página principal
│   ├── components/
│   │   ├── Login.tsx            # Componente de login
│   │   └── Dashboard.tsx        # Dashboard principal
│   └── types/
│       ├── config.ts            # Tipos TypeScript
│       └── wake_on_lan.d.ts     # Tipos para biblioteca WoL
└── README.md
```

## Troubleshooting

### Wake on LAN não funciona
1. Verifique se a máquina alvo tem WoL habilitado na BIOS
2. Verifique se a placa de rede suporta WoL
3. Certifique-se que o cabo ethernet está conectado
4. Teste com ferramentas como `wakeonlan` no Linux

### Ping falha
1. Verifique se o IP está correto
2. Verifique se não há firewall bloqueando ICMP
3. Aumente o timeout no `config.json`

### Erro de permissão
No Linux, pode ser necessário executar com sudo para algumas funcionalidades de rede.

## Tecnologias utilizadas

- **Next.js 15** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Node.js** - Runtime
- **wake_on_lan** - Biblioteca para Wake on LAN
- **ping** - Biblioteca para ping

## Licença

Este projeto é para uso interno e educacional. Use por sua conta e risco.
