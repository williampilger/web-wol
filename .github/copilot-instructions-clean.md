<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Wake on LAN Web Application

Esta aplicação Next.js com TypeScript permite gerenciar Wake on LAN de máquinas em rede local.

### Funcionalidades principais:
- Autenticação simples baseada em usuário/senha
- Gestão de grupos de máquinas 
- Controle de acesso por grupos
- Verificação de status via ping
- Envio de comandos Wake on LAN
- Interface web responsiva

### Configuração:
- Editar `config.json` com usuários, grupos e máquinas
- Configurar timeout para ping (padrão: 2000ms)
- Máquinas devem ter WoL habilitado na BIOS e placa de rede

### Segurança:
⚠️ **APENAS para desenvolvimento interno!** Senhas em texto simples.

### Acesso:
- Aplicação roda em http://localhost:3000
- Use credenciais do config.json para login
- Usuários padrão: admin/admin123, user1/user123, dev/dev123
