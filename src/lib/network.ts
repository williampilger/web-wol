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
    const ip = xForwardedFor.split(',')[0].trim();
    return normalizeIp(ip);
  }

  const xRealIp = request.headers.get('x-real-ip');
  if (xRealIp) {
    return normalizeIp(xRealIp);
  }

  // Fallback para desenvolvimento local
  return '127.0.0.1';
}

/**
 * Normaliza um IP removendo prefixos IPv6 desnecessários
 */
function normalizeIp(ip: string): string {
  // Se for IPv4 mapeado em IPv6, extrair o IPv4
  if (ip.startsWith('::ffff:')) {
    return ip.replace('::ffff:', '');
  }
  
  return ip;
}

/**
 * Verifica se um IP está em qualquer uma das redes locais configuradas
 */
export function isLocalNetwork(ip: string, localNetworks: string[]): boolean {
  // IPs especiais sempre considerados locais
  if (ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') {
    return true;
  }

  // Tratar IPv4 mapeado em IPv6 (::ffff:192.168.0.1)
  let cleanIp = ip;
  if (ip.startsWith('::ffff:')) {
    cleanIp = ip.replace('::ffff:', '');
  }

  // Verificar se o IP está em alguma das redes configuradas
  return localNetworks.some(network => {
    try {
      return isIpInCidr(cleanIp, network);
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
