import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  spacing: 10,
  palette: {
    primary: { main: '#1565C0' },
    success: { main: '#2E7D32' },
    error: { main: '#C62828' },
    background: { default: '#F5F5F5', paper: '#FFFFFF' },
  },
  typography: {
    fontSize: 18,
    fontFamily: '"Roboto", "Helvetica", sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 700 },
    h2: { fontSize: '3rem', fontWeight: 700 },
    h3: { fontSize: '2rem', fontWeight: 600 },
    h6: { fontSize: '1.1rem', fontWeight: 600 },
    body1: { fontSize: '1.2rem' },
    body2: { fontSize: '1.1rem' },
    button: { fontSize: '1.1rem', fontWeight: 700, textTransform: 'none' },
  },
  components: {
    MuiButton: {
      defaultProps: { size: 'large', variant: 'contained' },
      styleOverrides: {
        root: {
          padding: '16px 24px',
          borderRadius: 12,
          minHeight: 64,
          fontSize: '1.1rem',
          fontWeight: 700,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        },
        sizeLarge: { minHeight: 64 },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined', size: 'medium', fullWidth: true },
      styleOverrides: {
        root: {
          '& input': { fontSize: '1.3rem', padding: '16px' },
          '& label': { fontSize: '1.1rem' },
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: { height: 70, borderTop: '1px solid #E0E0E0' },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: { minWidth: 70 },
        label: { fontSize: '0.8rem !important', marginTop: 4 },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: { paddingTop: 12, paddingBottom: 12 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' },
      },
    },
    MuiAlert: {
      styleOverrides: {
        message: { fontSize: '1.1rem' },
      },
    },
  },
});

export default theme;
