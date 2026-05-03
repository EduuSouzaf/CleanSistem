import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import VendasPage from './pages/VendasPage';
import ProdutosPage from './pages/ProdutosPage';
import EstoquePage from './pages/EstoquePage';
import RelatoriosPage from './pages/RelatoriosPage';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<VendasPage />} />
          <Route path="/produtos" element={<ProdutosPage />} />
          <Route path="/estoque" element={<EstoquePage />} />
          <Route path="/relatorios" element={<RelatoriosPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
