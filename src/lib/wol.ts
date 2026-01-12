import dgram from 'dgram';

export function sendWakeOnLan(macAddress: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // Remover separadores do MAC (: ou -)
      const cleanMac = macAddress.replace(/[:-]/g, '').toLowerCase();
      
      // Validar MAC address
      if (cleanMac.length !== 12 || !/^[0-9a-f]{12}$/.test(cleanMac)) {
        throw new Error(`MAC address inválido: ${macAddress}`);
      }

      // Converter MAC para bytes
      const macBytes = [];
      for (let i = 0; i < cleanMac.length; i += 2) {
        macBytes.push(parseInt(cleanMac.substr(i, 2), 16));
      }

      // Criar Magic Packet
      // 6 bytes FF + 16 repetições do MAC (total: 102 bytes)
      const packet = Buffer.alloc(102);
      
      // Primeiros 6 bytes: FF FF FF FF FF FF
      for (let i = 0; i < 6; i++) {
        packet[i] = 0xFF;
      }
      
      // 16 repetições do MAC address
      for (let i = 0; i < 16; i++) {
        for (let j = 0; j < 6; j++) {
          packet[6 + i * 6 + j] = macBytes[j];
        }
      }

      // Criar socket UDP
      const client = dgram.createSocket('udp4');
      
      // Configurar timeout
      const timeout = setTimeout(() => {
        client.close();
        reject(new Error('Timeout ao enviar Wake on LAN'));
      }, 5000);

      client.on('error', (error) => {
        clearTimeout(timeout);
        client.close();
        reject(error);
      });
      
      // Habilitar broadcast
      client.bind(() => {
        try {
          client.setBroadcast(true);
          
          // Enviar para múltiplas portas e endereços de broadcast
          const ports = [7, 9]; // Portas padrão Wake on LAN
          const broadcastAddresses = [
            '255.255.255.255',  // Broadcast geral
            '192.168.0.255',    // Broadcast específico da rede 192.168.0.x
          ];
          
          let sentCount = 0;
          const totalSends = ports.length * broadcastAddresses.length;
          let lastError: Error | null = null;
          let successCount = 0;

          const sendToPortAndAddress = (port: number, address: string) => {
            client.send(packet, port, address, (error) => {
              sentCount++;
              
              if (error) {
                lastError = error;
                console.error(`Erro ao enviar WoL para ${address}:${port}:`, error.message);
              } else {
                successCount++;
                console.log(`Magic Packet enviado com sucesso para ${macAddress} em ${address}:${port}`);
              }

              // Quando tentamos todas as combinações
              if (sentCount === totalSends) {
                clearTimeout(timeout);
                client.close();
                
                if (successCount === 0) {
                  // Se todas falharam
                  reject(new Error(`Falha ao enviar WoL em todas as tentativas: ${lastError?.message || 'Erro desconhecido'}`));
                } else {
                  // Se pelo menos uma funcionou
                  resolve();
                }
              }
            });
          };

          // Tentar todas as combinações de porta e endereço
          ports.forEach(port => {
            broadcastAddresses.forEach(address => {
              sendToPortAndAddress(port, address);
            });
          });
          
        } catch (error) {
          clearTimeout(timeout);
          client.close();
          reject(error);
        }
      });

    } catch (error) {
      reject(error);
    }
  });
}
