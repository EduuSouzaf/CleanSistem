import React from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MoneyIcon from '@mui/icons-material/AttachMoney';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import QrCodeIcon from '@mui/icons-material/QrCode2';

export default function PaymentButtons({ onPay, disabled, loading }) {
  return (
    <Stack spacing={1.5}>
      <Button
        variant="contained"
        color="success"
        startIcon={<MoneyIcon sx={{ fontSize: 28 }} />}
        onClick={() => onPay('DINHEIRO')}
        disabled={disabled || loading}
        fullWidth
        sx={{ fontSize: '1.2rem', minHeight: 68 }}
      >
        DINHEIRO
      </Button>

      <Button
        variant="contained"
        color="primary"
        startIcon={<CreditCardIcon sx={{ fontSize: 28 }} />}
        onClick={() => onPay('CARTAO')}
        disabled={disabled || loading}
        fullWidth
        sx={{ fontSize: '1.2rem', minHeight: 68 }}
      >
        CARTÃO
      </Button>

      <Button
        variant="contained"
        startIcon={<QrCodeIcon sx={{ fontSize: 28 }} />}
        onClick={() => onPay('PIX')}
        disabled={disabled || loading}
        fullWidth
        sx={{ bgcolor: '#6A0DAD', '&:hover': { bgcolor: '#5A0B9A' }, fontSize: '1.2rem', minHeight: 68 }}
      >
        PIX
      </Button>
    </Stack>
  );
}
