import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Link from '@mui/material/Link';
import InputLabel from '@mui/material/InputLabel';
import loginSideImage from '../../assets/login_side_image.png';
import logoImage from '../../assets/logo.png';
import { login as loginApi } from '../../api/auth';
import { useAuth } from '../../hooks/useAuth';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError('');

    if (!userId.trim() || !password.trim()) {
      setError('Both fields are required.');
      return;
    }

    try {
      setLoading(true);
      const { token, user } = await loginApi(userId, password);
      login(token, user);
      navigate('/dashboard', { replace: true });
    } catch {
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ height: '100vh',display: 'flex', bgcolor: '#fff' }}>
      <Box
        sx={{
          flex: 1,
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#f7f9fc',
          p: 6,
        }}
      >
        <Box
          component="img"
          src={loginSideImage}
          alt="login side iamge"
          sx={{ width: '100%', maxWidth: 600, height: 'auto' }}
        />

      </Box>

      <Box
        sx={{
          width: { xs: '100%', md: '45%' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 3, sm: 5 },
          borderLeft: { md: '1px solid #eaecf0' },
        }}
      >
        <Box
          sx={{
            width: '100%',
            // maxWidth: 420,
            p: { xs: 3, sm: 4.5 },
            bgcolor: '#fff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
          }}
        >
          {/* Logo */}
          <Box component="img" src={logoImage} alt="Preproute" sx={{ width:134, mb: 3 }} />

          <Typography variant="h6" sx={{ color: '#1a1a2e', mb: 0.5 }}>
            Login
          </Typography>
          <Typography variant="body1" sx={{ color: '#888', mb: 3.5 }}>
            Use your company provided Login credentials
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ width: '100%' }} component="form" onSubmit={handleSubmit} noValidate>
            <InputLabel shrink sx={{ fontWeight: 600, color: '#1a1a2e', mb: 0.5, fontSize: '0.9rem' }}>
              User ID
            </InputLabel>
            <TextField
              placeholder="Enter User ID"
              value={userId}
              onChange={e => setUserId(e.target.value)}
              fullWidth
              autoFocus
              disabled={loading}
              size="small"
              sx={{
                mb: 2.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& fieldset': { borderColor: '#d0d5dd' },
                },
              }}
            />

            <InputLabel shrink sx={{ fontWeight: 600, color: '#1a1a2e', mb: 0.5, fontSize: '0.9rem' }}>
              Password
            </InputLabel>
            <TextField
              placeholder="Enter Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              fullWidth
              disabled={loading}
              size="small"
              sx={{
                mb: 1.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& fieldset': { borderColor: '#d0d5dd' },
                },
              }}
            />

            <Box sx={{ mb: 3 }}>
              <Link href="#" underline="hover" sx={{ fontSize: '0.85rem', color: '#4a7bf7' }}>
                Forgot password?
              </Link>
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                py: 1.3,
                bgcolor: '#5b8def',
                boxShadow: 'none',
                '&:hover': { bgcolor: '#4a7bf7', boxShadow: 'none' },
              }}
            >
              {loading ? <CircularProgress size={22} color="inherit" /> : 'Login'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
