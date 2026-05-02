import React from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

const fmt = (val) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

export default function TotalDisplay({ total, itemCount }) {
  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        textAlign: 'center',
        bgcolor: '#E3F2FD',
        borderRadius: 3,
        border: '2px solid #1565C0',
      }}
    >
      <Typography variant="body2" color="text.secondary" sx={{ letterSpacing: 2, textTransform: 'uppercase' }}>
        {itemCount > 0 ? `${itemCount} ${itemCount === 1 ? 'item' : 'itens'}` : 'Carrinho vazio'}
      </Typography>
      <Typography variant="h2" color="primary" fontWeight={700} lineHeight={1.2}>
        {fmt(total)}
      </Typography>
    </Paper>
  );
}
