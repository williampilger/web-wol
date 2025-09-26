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
          
          // Enviar para múltiplas portas para maior compatibilidade
          const ports = [7, 9]; // Portas padrão Wake on LAN
          let sentCount = 0;
          let lastError: Error | null = null;

          const sendToPort = (port: number) => {
            client.send(packet, port, '255.255.255.255', (error) => {
              sentCount++;
              
              if (error) {
                lastError = error;
                console.error(`Erro ao enviar WoL na porta ${port}:`, error.message);
              } else {
                console.log(`Magic Packet enviado com sucesso para ${macAddress} na porta ${port}`);
              }

              // Quando tentamos todas as portas
              if (sentCount === ports.length) {
                clearTimeout(timeout);
                client.close();
                
                if (lastError && sentCount === ports.length) {
                  // Se todas falharam
                  reject(new Error(`Falha ao enviar WoL em todas as portas: ${lastError.message}`));
                } else {
                  // Se pelo menos uma funcionou
                  resolve();
                }
              }
            });
          };

          // Tentar ambas as portas
          ports.forEach(sendToPort);
          
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
