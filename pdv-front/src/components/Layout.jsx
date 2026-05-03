import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Package, Boxes, BarChart3, Receipt } from 'lucide-react';

const tabs = [
  { path: '/',           icon: ShoppingCart, label: 'Caixa'      },
  { path: '/produtos',   icon: Package,      label: 'Produtos'   },
  { path: '/estoque',    icon: Boxes,        label: 'Estoque'    },
  { path: '/relatorios', icon: BarChart3,    label: 'Relatórios' },
  { path: '/vendas',     icon: Receipt,      label: 'Vendas'     },
];

export default function Layout({ children }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isActive = (path) =>
    path === '/' ? pathname === '/' : pathname.startsWith(path);

  return (
    <div className="flex flex-col bg-slate-50" style={{ height: '100dvh' }}>
      <div className="flex-1 overflow-hidden">
        {children}
      </div>

      <nav className="shrink-0 bg-white border-t border-slate-200" style={{ boxShadow: '0 -2px 12px rgba(0,0,0,0.06)' }}>
        <div className="flex">
          {tabs.map(({ path, icon: Icon, label }) => {
            const active = isActive(path);
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 relative transition-colors ${
                  active ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-600 rounded-full" />
                )}
                <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                <span className="text-[10px] font-semibold">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
