import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '../hooks/useAuth';
import logoUrl from '../assets/logo.png';

interface TopBarProps {
  onToggle: () => void;
}

export default function TopBar({ onToggle }: TopBarProps) {
  const { user } = useAuth();

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: '100%',
        bgcolor: '#fff',
        borderBottom: '1px solid #e0e0e0',
        color: 'text.primary',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton size="small" onClick={onToggle} edge="start">
            <MenuIcon />
          </IconButton>
          <img src={logoUrl} alt="Logo" style={{ height: 36, display: 'block' }} />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, }}>
          <IconButton size={'small'} style={{ border: '1px solid grey', borderRadius: '50%', }}>
            <NotificationsNoneIcon fontSize='10' />
          </IconButton>
          <Avatar sx={{overflow:"visible", width: 48, height:48, bgcolor: '#ffd284', fontSize: 14 }}>
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
              {user?.userId ?? 'Admin'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Admin
            </Typography>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
