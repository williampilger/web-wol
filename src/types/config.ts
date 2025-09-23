/**
 * AVISO DE SEGURANÇA: 
 * Este sistema de autenticação é temporário e deve ser usado APENAS para desenvolvimento interno.
 * As senhas estão armazenadas em texto simples, o que é uma prática insegura.
 * Em produção, implemente hash de senhas e autenticação adequada.
 */

export interface User {
  id: string;
  password: string; // TEMPORÁRIO: senha em texto simples - INSEGURO!
  groups: string[];
}

export interface Group {
  id: string;
  name: string;
  description: string;
}

export interface Machine {
  id: string;
  name: string;
  ip: string;
  mac: string;
  groups: string[];
}

export interface Config {
  timeout: number;
  users: User[];
  groups: Group[];
  machines: Machine[];
}

export interface MachineStatus {
  id: string;
  online: boolean;
  lastChecked: Date;
  resolvedIp?: string; // IP real encontrado se diferente do configurado
  warning?: string; // Aviso sobre IP diferente ou outros problemas
}
