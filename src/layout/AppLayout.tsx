import { useState, type ReactNode } from 'react';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import TopBar from './TopBar';
import Sidebar from './Sidebar';


interface AppLayoutProps {
  children: ReactNode;
}

const DRAWER_WIDTH = 240;
const MINI_WIDTH = 64;

export default function AppLayout({ children }: AppLayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'), { noSsr: true });
  const [sidebarOpen, setSidebarOpen] = useState(() => !isMobile);

  // sidebarWidth drives the Sidebar Drawer's paper width via its own props
  void (isMobile ? 0 : sidebarOpen ? DRAWER_WIDTH : MINI_WIDTH);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '97vh', overflow: 'hidden' }}>
      <TopBar onToggle={() => setSidebarOpen(p => !p)} />
      <Toolbar /> {/* spacer for fixed AppBar */}
      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        <Sidebar open={sidebarOpen} isMobile={isMobile} onClose={() => setSidebarOpen(false)} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            minWidth: 0,
            // p: 3,
            // bgcolor: '#f5f6fa',
            overflowY: 'auto',
            transition: 'margin 0.2s',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
