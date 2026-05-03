import React, { useState } from 'react';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import SaveIcon from '@mui/icons-material/Save';

const empty = { nome: '', codigoBarras: '', precoCusto: '', precoVenda: '' };

export default function ProductForm({ onSubmit, loading }) {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.nome.trim()) e.nome = 'Obrigatório';
    if (!form.codigoBarras.trim()) e.codigoBarras = 'Obrigatório';
    if (!form.precoCusto || isNaN(form.precoCusto) || Number(form.precoCusto) < 0)
      e.precoCusto = 'Valor inválido';
    if (!form.precoVenda || isNaN(form.precoVenda) || Number(form.precoVenda) <= 0)
      e.precoVenda = 'Valor inválido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    await onSubmit({
      nome: form.nome.trim(),
      codigoBarras: form.codigoBarras.trim(),
      precoCusto: Number(form.precoCusto),
      precoVenda: Number(form.precoVenda),
    });
    setForm(empty);
    setErrors({});
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h6" fontWeight={700}>Novo Produto</Typography>

      <TextField
        label="Nome do produto"
        value={form.nome}
        onChange={set('nome')}
        error={!!errors.nome}
        helperText={errors.nome}
      />
      <TextField
        label="Código de barras"
        value={form.codigoBarras}
        onChange={set('codigoBarras')}
        error={!!errors.codigoBarras}
        helperText={errors.codigoBarras}
        inputMode="text"
      />
      <TextField
        label="Preço de custo (R$)"
        value={form.precoCusto}
        onChange={set('precoCusto')}
        error={!!errors.precoCusto}
        helperText={errors.precoCusto}
        type="number"
        inputProps={{ min: 0, step: '0.01' }}
      />
      <TextField
        label="Preço de venda (R$)"
        value={form.precoVenda}
        onChange={set('precoVenda')}
        error={!!errors.precoVenda}
        helperText={errors.precoVenda}
        type="number"
        inputProps={{ min: 0, step: '0.01' }}
      />

      <Button
        variant="contained"
        color="primary"
        startIcon={<SaveIcon />}
        onClick={handleSubmit}
        disabled={loading}
        fullWidth
      >
        {loading ? 'Salvando...' : 'Salvar Produto'}
      </Button>
    </Stack>
  );
}
