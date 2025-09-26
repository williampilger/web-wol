import { getClientIp, isLocalNetwork } from '@/lib/network';
import { Config } from '@/types/config';
import fs from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    // Carregar configuração
    const configPath = path.join(process.cwd(), 'config.json');
    const configData = fs.readFileSync(configPath, 'utf-8');
    const config: Config = JSON.parse(configData);

    // Obter IP do cliente
    const clientIp = getClientIp(request);
    console.log(`Verificando acesso local para IP: ${clientIp}`);

    // Verificar se está na rede local
    const isLocal = isLocalNetwork(clientIp, config.localNetworks);

    if (isLocal) {
      console.log(`IP ${clientIp} identificado como rede local - login automático como usuário Local`);
      
      return NextResponse.json({
        isLocal: true,
        user: {
          id: config.localUser.id,
          groups: config.localUser.groups
        },
        clientIp
      });
    } else {
      console.log(`IP ${clientIp} não está na rede local - requer autenticação`);
      
      return NextResponse.json({
        isLocal: false,
        clientIp
      });
    }

  } catch (error) {
    console.error('Erro ao verificar rede local:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
