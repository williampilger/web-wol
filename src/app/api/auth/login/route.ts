import { Config } from '@/types/config';
import fs from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Carregar configuração
    const configPath = path.join(process.cwd(), 'config.json');
    const configData = fs.readFileSync(configPath, 'utf-8');
    const config: Config = JSON.parse(configData);

    // Verificar credenciais (TEMPORÁRIO - inseguro!)
    const user = config.users.find(u => u.id === username && u.password === password);

    if (!user) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
    }

    // Retornar dados do usuário (sem a senha)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;
    
    return NextResponse.json({ 
      user: userWithoutPassword,
      success: true 
    });

  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
