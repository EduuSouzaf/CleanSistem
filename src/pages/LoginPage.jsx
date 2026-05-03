import React, { useState, useEffect } from 'react';
import { KeyRound, Fingerprint, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import {
  loginComSenha,
  loginComBiometria,
  registrarBiometria,
  isBiometriaSuportada,
  isBiometriaAtiva,
} from '../services/authService';

// ── Modal "Ativar biometria?" ────────────────────────────────────────────────
function BiometriaSetupModal({ onAtivado, onPular }) {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  const handleAtivar = async () => {
    setLoading(true);
    setErro(null);
    try {
      await registrarBiometria();
      onAtivado();
    } catch (e) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end lg:items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 space-y-4">
        <div className="flex flex-col items-center gap-3 py-2">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center">
            <Fingerprint size={28} className="text-indigo-600" />
          </div>
          <h2 className="text-lg font-black text-slate-900 text-center">Ativar login com biometria?</h2>
          <p className="text-sm text-slate-500 text-center">
            Use Face ID, Touch ID ou digital para entrar rapidamente da próxima vez.
          </p>
        </div>

        {erro && <p className="text-sm text-red-500 font-medium text-center">{erro}</p>}

        <div className="flex gap-3">
          <button
            onClick={onPular}
            className="flex-1 py-3 rounded-2xl border border-slate-200 font-semibold text-slate-500 hover:bg-slate-50 transition-colors"
          >
            Depois
          </button>
          <button
            onClick={handleAtivar}
            disabled={loading}
            className="flex-1 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold transition-all disabled:opacity-40 flex items-center justify-center gap-2"
          >
            <Fingerprint size={16} />
            {loading ? 'Ativando...' : 'Ativar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Tela principal de login ──────────────────────────────────────────────────
export default function LoginPage({ onLogin }) {
  const [senha, setSenha] = useState('');
  const [mostrar, setMostrar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);
  const [bioAtiva, setBioAtiva] = useState(false);
  const [mostrarSetupBio, setMostrarSetupBio] = useState(false);

  useEffect(() => {
    setBioAtiva(isBiometriaAtiva() && isBiometriaSuportada());
  }, []);

  const salvarTokenEEntrar = (token, mostrarSetup = false) => {
    localStorage.setItem('token', token);
    if (mostrarSetup) {
      setMostrarSetupBio(true);
    } else {
      onLogin();
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!senha.trim()) return;
    setErro(null);
    setLoading(true);
    try {
      const token = await loginComSenha(senha);
      const podeMostrarSetup = isBiometriaSuportada() && !isBiometriaAtiva();
      salvarTokenEEntrar(token, podeMostrarSetup);
    } catch (e) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBiometria = async () => {
    setErro(null);
    setLoading(true);
    try {
      const token = await loginComBiometria();
      salvarTokenEEntrar(token, false);
    } catch (e) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-sm space-y-6">

          {/* Logo */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
              <ShieldCheck size={30} className="text-white" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">PDV</h1>
              <p className="text-sm text-slate-400">CleanSistemas</p>
            </div>
          </div>

          {/* Formulário */}
          <form onSubmit={handleLogin} className="space-y-3">
            <div className="relative">
              <input
                type={mostrar ? 'text' : 'password'}
                value={senha}
                onChange={e => setSenha(e.target.value)}
                placeholder="Digite sua senha"
                className="w-full px-4 py-3.5 pr-12 rounded-2xl border-2 border-slate-100 focus:border-indigo-400 focus:outline-none text-slate-900 text-base"
                inputMode="numeric"
              />
              <button
                type="button"
                onClick={() => setMostrar(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {mostrar ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {erro && (
              <p className="text-sm text-red-500 font-medium pl-1">{erro}</p>
            )}

            <button
              type="submit"
              disabled={loading || !senha.trim()}
              className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-base transition-all disabled:opacity-40 flex items-center justify-center gap-2"
            >
              <KeyRound size={18} />
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          {/* Biometria */}
          {bioAtiva && (
            <>
              <div className="flex items-center gap-3">
                <hr className="flex-1 border-slate-100" />
                <span className="text-xs text-slate-400 font-medium">ou</span>
                <hr className="flex-1 border-slate-100" />
              </div>

              <button
                onClick={handleBiometria}
                disabled={loading}
                className="w-full py-3.5 rounded-2xl border-2 border-indigo-100 bg-indigo-50 hover:bg-indigo-100 active:scale-95 text-indigo-600 font-bold text-base transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              >
                <Fingerprint size={20} />
                Entrar com biometria
              </button>
            </>
          )}
        </div>
      </div>

      {mostrarSetupBio && (
        <BiometriaSetupModal
          onAtivado={() => { setMostrarSetupBio(false); onLogin(); }}
          onPular={() => { setMostrarSetupBio(false); onLogin(); }}
        />
      )}
    </>
  );
}
