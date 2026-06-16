import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import NoteAddOutlinedIcon from '@mui/icons-material/NoteAddOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import { useNavigate, useLocation } from 'react-router-dom';

const DRAWER_WIDTH = 240;
const MINI_WIDTH = 64;
const TOPBAR_HEIGHT = 64;

const navItems = [
  { label: 'Dashboard', icon: <DashboardOutlinedIcon />, path: '/dashboard' },
  { label: 'Test Creation', icon: <NoteAddOutlinedIcon />, path: '/test-creation' },
  // { label: 'Test Tracking', icon: <AssignmentOutlinedIcon />, path: '/tracking' },
  { label: 'Preview', icon: <AssignmentOutlinedIcon />, path: '/preview' },
];

const paperSx = (open: boolean) => ({
  width: open ? DRAWER_WIDTH : MINI_WIDTH,
  overflowX: 'hidden',
  transition: 'width 0.2s',
  boxSizing: 'border-box' as const,
  bgcolor: '#fff',
  borderRight: '1px solid #e0e0e0',
  top: TOPBAR_HEIGHT,
  height: `calc(100vh - ${TOPBAR_HEIGHT}px)`,
});

interface SidebarProps {
  open: boolean;
  isMobile: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, isMobile, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const navList = (
    <List dense sx={{ pt: 1 }}>
      {navItems.map(({ label, icon, path }) => {
        const active = pathname.startsWith(path);
        return (
          <Tooltip key={path} title={!isMobile && !open ? label : ''} placement="right">
            <ListItemButton
              onClick={() => { navigate(path); if (isMobile) onClose(); }}
              selected={active}
              sx={{
                mx: 1,
                my: 0.5,
                borderRadius: 2,
                justifyContent: open || isMobile ? 'initial' : 'center',
                '&.Mui-selected': {
                  bgcolor: '#e8f0fe',
                  color: '#1976d2',
                  '& .MuiListItemIcon-root': { color: '#1976d2' },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: open || isMobile ? 40 : 'unset', color: active ? '#1976d2' : 'inherit' }}>
                {icon}
              </ListItemIcon>
              {(open || isMobile) && (
                <ListItemText primary={label} sx={{ '& .MuiListItemText-primary': { fontSize: 14, fontWeight: active ? 600 : 400 } }} />
              )}
            </ListItemButton>
          </Tooltip>
        );
      })}
    </List>
  );

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            bgcolor: '#fff',
            borderRight: '1px solid #e0e0e0',
            top: TOPBAR_HEIGHT,
            height: `calc(100vh - ${TOPBAR_HEIGHT}px)`,
          },
        }}
      >
        <Divider />
        {navList}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? DRAWER_WIDTH : MINI_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': paperSx(open),
      }}
    >
      <Divider />
      {navList}
    </Drawer>
  );
}
