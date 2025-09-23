import { Config, MachineStatus } from '@/types/config';
import fs from 'fs';
import { NextResponse } from 'next/server';
import path from 'path';
import ping from 'ping';

export async function GET() {
  try {
    // Carregar configuração
    const configPath = path.join(process.cwd(), 'config.json');
    const configData = fs.readFileSync(configPath, 'utf-8');
    const config: Config = JSON.parse(configData);

    // Verificar status de todas as máquinas
    const statusPromises = config.machines.map(async (machine): Promise<MachineStatus> => {
      try {
        // Primeiro, tentar pingar o IP configurado
        const ipResult = await ping.promise.probe(machine.ip, {
          timeout: config.timeout / 1000, // ping espera em segundos
          min_reply: 1
        });
        
        if (ipResult.alive) {
          return {
            id: machine.id,
            online: true,
            lastChecked: new Date()
          };
        }

        // Se o ping do IP falhou, tentar pingar pelo nome.local
        const hostname = `${machine.name}.local`;
        console.log(`IP ${machine.ip} falhou para ${machine.name}, tentando ${hostname}...`);
        
        const hostnameResult = await ping.promise.probe(hostname, {
          timeout: config.timeout / 1000,
          min_reply: 1
        });

        if (hostnameResult.alive) {
          // Se encontrou pelo nome, verificar se o IP é diferente
          const resolvedIp = hostnameResult.numeric_host;
          const isDifferentIp = resolvedIp && resolvedIp !== machine.ip;
          
          return {
            id: machine.id,
            online: true,
            lastChecked: new Date(),
            resolvedIp: isDifferentIp ? resolvedIp : undefined,
            warning: isDifferentIp 
              ? `⚠️ IP real (${resolvedIp}) diferente do configurado (${machine.ip})`
              : undefined
          };
        }

        // Se ambos falharam, máquina está offline
        return {
          id: machine.id,
          online: false,
          lastChecked: new Date()
        };

      } catch (error) {
        console.error(`Erro ao pingar ${machine.name} (${machine.ip}):`, error);
        return {
          id: machine.id,
          online: false,
          lastChecked: new Date(),
          warning: `Erro ao verificar conectividade: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
        };
      }
    });

    const statuses = await Promise.all(statusPromises);

    return NextResponse.json({ 
      machines: config.machines,
      groups: config.groups,
      statuses 
    });

  } catch (error) {
    console.error('Erro ao verificar status das máquinas:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
