import { Box, CircularProgress, Typography } from '@mui/material';

type LoaderProps = {
  message?: string;
};

export default function Loader({ message }: LoaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        py: 10,
      }}
    >
      <CircularProgress size={36} sx={{ color: '#6366f1' }} />
      {message && (
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      )}
    </Box>
  );
}
