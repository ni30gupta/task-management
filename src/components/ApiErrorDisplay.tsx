import { Alert, Box, Collapse, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { ApiErrorResponse } from '../types';

type ApiErrorDisplayProps = {
  error: ApiErrorResponse | null;
  onClose?: () => void;
};

export default function ApiErrorDisplay({ error, onClose }: ApiErrorDisplayProps) {
  if (!error) return null;

  return (
    <Collapse in={!!error}>
      <Alert
        severity="error"
        sx={{ mb: 2, alignItems: 'flex-start' }}
        action={
          onClose && (
            <IconButton size="small" onClick={onClose} aria-label="close error">
              <CloseIcon fontSize="inherit" />
            </IconButton>
          )
        }
      >
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {error.message}
        </Typography>

        {error.errors && error.errors.length > 0 && (
          <Box sx={{ mt: 0.5 }}>
            {error.errors.map((e, i) => (
              <Typography key={i} variant="caption" sx={{ display: 'block', color: 'inherit' }}>
                <strong>{e.path}</strong> — {e.msg}
              </Typography>
            ))}
          </Box>
        )}
      </Alert>
    </Collapse>
  );
}
