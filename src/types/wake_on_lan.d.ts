declare module 'wake_on_lan' {
  export function wake(mac: string, callback: (error: Error | null) => void): void;
}
