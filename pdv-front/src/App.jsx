import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ConnectionScreen from './components/ConnectionScreen';
import VendasPage from './pages/VendasPage';
import ProdutosPage from './pages/ProdutosPage';
import EstoquePage from './pages/EstoquePage';
import RelatoriosPage from './pages/RelatoriosPage';
import VendasHistoricoPage from './pages/VendasHistoricoPage';

export default function App() {
  const [connected, setConnected] = useState(false);

  if (!connected) {
    return <ConnectionScreen onConnected={() => setConnected(true)} />;
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
    </BrowserRouter>
  );
}
