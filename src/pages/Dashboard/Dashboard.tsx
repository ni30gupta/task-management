import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { getAllTests } from '../../api/tests';
import type { Test } from '../../types';
import { parseApiError } from '../../types';
import type { ApiErrorResponse } from '../../types';
import Loader from '../../components/Loader';
import ApiErrorDisplay from '../../components/ApiErrorDisplay';
import { useAbortController, isAbortError } from '../../hooks/useAbortController';

export default function Dashboard() {
  const navigate = useNavigate();
  const { signal } = useAbortController();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<ApiErrorResponse | null>(null);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        setLoading(true);
        setApiError(null);
        const res = await getAllTests(signal);
        setTests(res.data.data);
      } catch (err) {
        if (!isAbortError(err)) setApiError(parseApiError(err));
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    };
    fetchTests();
  }, []);

  const handleDelete = (id: string) => {
    // TODO: wire up DELETE API
    console.log('Delete test:', id);
  };

  const statusColor = (status: Test['status']) => {
    if (status === 'live') return 'success';
    if (status === 'draft') return 'warning';
    return 'default';
  };

  const statusLabel = (status: Test['status']) => {
    if (status === 'live') return 'Live';
    if (status === 'draft') return 'Draft';
    return 'Not Published';
  };

  const formatDate = (dateStr?: string) =>
    dateStr ? new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          All Tests
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/test-creation')}
        >
          Create New Test
        </Button>
      </Box>

      {/* Loading */}
      {loading && <Loader message="Loading tests..." />}

      {/* Error */}
      <ApiErrorDisplay error={apiError} onClose={() => setApiError(null)} />

      {/* Empty State */}
      {!loading && !apiError && tests.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <AssignmentIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No tests yet
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
            Create your first test to get started.
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/test-creation')}>
            Create New Test
          </Button>
        </Box>
      )}

      {/* Tests Table */}
      {!loading && !apiError && tests.length > 0 && (
        <TableContainer component={Paper} elevation={1}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 700 }}>Test Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Subject</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Created Date</TableCell>
                <TableCell sx={{ fontWeight: 700, minWidth:250 }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tests.map((test) => (
                <TableRow key={test.id} hover>
                  <TableCell>
                    <Typography sx={{ fontWeight: 500 }}>{test.name}</Typography>
                  </TableCell>
                  <TableCell>{test.subject}</TableCell>
                  <TableCell>
                    <Chip
                      label={statusLabel(test.status)}
                      color={statusColor(test.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatDate(test.created_at)}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Preview">
                      <IconButton size="small" color="primary" onClick={() => navigate(`/preview/${test.id}`)}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton size="small" color="info" onClick={() => navigate(`/test-creation/${test.id}`)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => handleDelete(test.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
