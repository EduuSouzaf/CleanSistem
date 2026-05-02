import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

export default function ReportCard({ label, value, color = 'primary.main' }) {
  return (
    <Card sx={{ textAlign: 'center', borderRadius: 3 }}>
      <CardContent sx={{ py: 3 }}>
        <Typography variant="body2" color="text.secondary" sx={{ letterSpacing: 1, textTransform: 'uppercase', mb: 1 }}>
          {label}
        </Typography>
        <Typography variant="h3" fontWeight={700} color={color}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}
