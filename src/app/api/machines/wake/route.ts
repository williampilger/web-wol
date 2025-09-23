import { Config } from '@/types/config';
import fs from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import wol from 'wake_on_lan';

export async function POST(request: NextRequest) {
  try {
    const { machineId, userGroups } = await request.json();

    if (!machineId || !userGroups) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    // Carregar configuração
    const configPath = path.join(process.cwd(), 'config.json');
    const configData = fs.readFileSync(configPath, 'utf-8');
    const config: Config = JSON.parse(configData);

    // Encontrar a máquina
    const machine = config.machines.find(m => m.id === machineId);
    if (!machine) {
      return NextResponse.json({ error: 'Máquina não encontrada' }, { status: 404 });
    }

    // Verificar se o usuário tem acesso a pelo menos um grupo da máquina
    const hasAccess = machine.groups.some(group => userGroups.includes(group));
    if (!hasAccess) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Enviar Wake on LAN
    return new Promise<NextResponse>((resolve) => {
      wol.wake(machine.mac, (error: Error | null) => {
        if (error) {
          console.error(`Erro ao enviar WoL para ${machine.name}:`, error);
          resolve(NextResponse.json({ error: 'Erro ao enviar Wake on LAN' }, { status: 500 }));
        } else {
          console.log(`Wake on LAN enviado para ${machine.name} (${machine.mac})`);
          resolve(NextResponse.json({ 
            success: true, 
            message: `Wake on LAN enviado para ${machine.name}` 
          }));
        }
      });
    });

  } catch (error) {
    console.error('Erro ao enviar Wake on LAN:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
