import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import VendasPage from './pages/VendasPage';
import ProdutosPage from './pages/ProdutosPage';
import EstoquePage from './pages/EstoquePage';
import RelatoriosPage from './pages/RelatoriosPage';
import VendasHistoricoPage from './pages/VendasHistoricoPage';
import PwaInstallBanner from './components/PwaInstallBanner';

export default function App() {
  const [autenticado, setAutenticado] = useState(() => !!localStorage.getItem('token'));

  if (!autenticado) {
    return <LoginPage onLogin={() => setAutenticado(true)} />;
  }

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<VendasPage />} />
          <Route path="/produtos" element={<ProdutosPage />} />
          <Route path="/estoque" element={<EstoquePage />} />
          <Route path="/relatorios" element={<RelatoriosPage />} />
          <Route path="/vendas" element={<VendasHistoricoPage />} />
        </Routes>
      </Layout>
      <PwaInstallBanner />
    </BrowserRouter>
  );
}
