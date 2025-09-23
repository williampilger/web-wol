'use client';

import { Group, Machine, MachineStatus } from '@/types/config';
import { useEffect, useState } from 'react';

interface DashboardProps {
  username: string;
  userGroups: string[];
  onLogout: () => void;
}

export default function Dashboard({ username, userGroups, onLogout }: DashboardProps) {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [statuses, setStatuses] = useState<MachineStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [wakingMachine, setWakingMachine] = useState<string | null>(null);

  const loadMachinesStatus = async () => {
    try {
      const response = await fetch('/api/machines/status');
      const data = await response.json();
      
      if (response.ok) {
        setMachines(data.machines);
        setGroups(data.groups);
        setStatuses(data.statuses);
      }
    } catch (error) {
      console.error('Erro ao carregar status das máquinas:', error);
    } finally {
      setLoading(false);
    }
  };

  const wakeUpMachine = async (machineId: string) => {
    setWakingMachine(machineId);
    
    try {
      const response = await fetch('/api/machines/wake', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          machineId,
          userGroups,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ ${data.message}`);
        // Recarregar status após alguns segundos
        setTimeout(() => {
          loadMachinesStatus();
        }, 3000);
      } else {
        alert(`❌ Erro: ${data.error}`);
      }
    } catch (error) {
      alert('❌ Erro de conexão');
      console.error('Erro ao enviar Wake on LAN:', error);
    } finally {
      setWakingMachine(null);
    }
  };

  const getMachineStatus = (machineId: string): boolean => {
    const status = statuses.find(s => s.id === machineId);
    return status?.online || false;
  };

  const getMachineWarning = (machineId: string): string | undefined => {
    const status = statuses.find(s => s.id === machineId);
    return status?.warning;
  };

  const getMachineResolvedIp = (machineId: string): string | undefined => {
    const status = statuses.find(s => s.id === machineId);
    return status?.resolvedIp;
  };

  const userHasAccessToMachine = (machine: Machine): boolean => {
    return machine.groups.some(group => userGroups.includes(group));
  };

  const getMachinesByGroup = () => {
    const machinesByGroup: { [groupId: string]: Machine[] } = {};
    
    groups.forEach(group => {
      machinesByGroup[group.id] = machines.filter(machine => 
        machine.groups.includes(group.id)
      );
    });

    return machinesByGroup;
  };

  useEffect(() => {
    loadMachinesStatus();
    
    // Atualizar status a cada 30 segundos
    const interval = setInterval(loadMachinesStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando status das máquinas...</p>
        </div>
      </div>
    );
  }

  const machinesByGroup = getMachinesByGroup();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Wake on LAN Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Olá, <strong>{username}</strong>
              </span>
              <button
                onClick={onLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <button
              onClick={loadMachinesStatus}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
            >
              🔄 Atualizar Status
            </button>
          </div>

          {groups.map(group => {
            const groupMachines = machinesByGroup[group.id] || [];
            
            if (groupMachines.length === 0) return null;

            return (
              <div key={group.id} className="mb-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  {group.name}
                  <span className="text-sm text-gray-500 ml-2">({group.description})</span>
                </h2>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {groupMachines.map(machine => {
                    const isOnline = getMachineStatus(machine.id);
                    const hasAccess = userHasAccessToMachine(machine);
                    const isWaking = wakingMachine === machine.id;
                    const warning = getMachineWarning(machine.id);
                    const resolvedIp = getMachineResolvedIp(machine.id);

                    return (
                      <div
                        key={machine.id}
                        className="bg-white overflow-hidden shadow rounded-lg"
                      >
                        <div className="p-5">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className={`w-3 h-3 rounded-full ${
                                isOnline ? 'bg-green-500' : 'bg-red-500'
                              }`}></div>
                            </div>
                            <div className="ml-3 w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {machine.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {machine.ip}
                                {resolvedIp && resolvedIp !== machine.ip && (
                                  <span className="ml-2 text-orange-600">
                                    → {resolvedIp}
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-gray-400">
                                {machine.mac}
                              </p>
                            </div>
                          </div>
                          
                          {warning && (
                            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                              {warning}
                            </div>
                          )}
                          
                          <div className="mt-3">
                            <div className="flex items-center justify-between">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                isOnline 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {isOnline ? '🟢 Online' : '🔴 Offline'}
                              </span>
                              {hasAccess ? (
                                <button
                                  onClick={() => wakeUpMachine(machine.id)}
                                  disabled={isWaking || isOnline}
                                  className={`inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded ${
                                    isOnline
                                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                      : isWaking
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                                  }`}
                                >
                                  {isWaking ? '⏳ Ligando...' : '⚡ Ligar'}
                                </button>
                              ) : (
                                <span className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-500 bg-gray-50">
                                  🔒 Sem acesso
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
