import React, { useEffect, useRef, useState } from 'react';
import api from '../services/api';

export default function ConnectionScreen({ onConnected }) {
  const [status, setStatus] = useState('connecting');
  const attemptRef = useRef(0);

  const tryConnect = React.useCallback(async () => {
    setStatus('connecting');
    attemptRef.current = 0;

    const attempt = async () => {
      try {
        await api.get('/health');
        onConnected();
      } catch {
        attemptRef.current += 1;
        if (attemptRef.current < 25) {
          setTimeout(attempt, 3000);
        } else {
          setStatus('error');
        }
      }
    };

    attempt();
  }, [onConnected]);

  useEffect(() => {
    tryConnect();
  }, [tryConnect]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-xs w-full text-center space-y-6">
        <div className="w-20 h-20 bg-blue-600 rounded-3xl mx-auto flex items-center justify-center text-4xl">
          🛒
        </div>

        <div>
          <h1 className="text-2xl font-black text-slate-900">PDV Clean</h1>
          <p className="text-sm text-slate-400 mt-1">Sistema de Caixa</p>
        </div>

        {status === 'connecting' && (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2.5 text-blue-600">
              <svg className="animate-spin h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              <span className="text-sm font-semibold">Conectando ao sistema...</span>
            </div>
            <p className="text-xs text-slate-400">
              Aguarde, o servidor pode demorar alguns instantes para iniciar.
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-3">
            <p className="text-sm text-red-600 font-semibold">
              Não foi possível conectar ao servidor.
            </p>
            <button
              onClick={tryConnect}
              className="w-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white py-3 rounded-2xl font-bold text-sm transition-all"
            >
              Tentar novamente
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
