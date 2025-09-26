import { NextRequest } from 'next/server';

/**
 * Converte um IP string para número
 */
function ipToNumber(ip: string): number {
  const parts = ip.split('.').map(part => parseInt(part, 10));
  return (parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3];
}

/**
 * Verifica se um IP está dentro de um CIDR
 */
function isIpInCidr(ip: string, cidr: string): boolean {
  const [network, prefixLength] = cidr.split('/');
  const mask = ~((1 << (32 - parseInt(prefixLength, 10))) - 1);
  
  const ipNum = ipToNumber(ip);
  const networkNum = ipToNumber(network);
  
  return (ipNum & mask) === (networkNum & mask);
}

/**
 * Obtém o IP real do cliente considerando proxies
 */
export function getClientIp(request: NextRequest): string {
  // Tentar headers de proxy primeiro
  const xForwardedFor = request.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }

  const xRealIp = request.headers.get('x-real-ip');
  if (xRealIp) {
    return xRealIp;
  }

  // Fallback para desenvolvimento local
  return '127.0.0.1';
}

/**
 * Verifica se um IP está em qualquer uma das redes locais configuradas
 */
export function isLocalNetwork(ip: string, localNetworks: string[]): boolean {
  // IPs especiais sempre considerados locais
  if (ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') {
    return true;
  }

  // Verificar se o IP está em alguma das redes configuradas
  return localNetworks.some(network => {
    try {
      return isIpInCidr(ip, network);
    } catch (error) {
      console.error(`Erro ao verificar CIDR ${network}:`, error);
      return false;
    }
  });
}

/**
 * Valida se uma string é um IP válido
 */
export function isValidIp(ip: string): boolean {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  
  if (!ipv4Regex.test(ip)) {
    return false;
  }
  
  const parts = ip.split('.').map(part => parseInt(part, 10));
  return parts.every(part => part >= 0 && part <= 255);
}
