import { useEffect, useMemo, useState } from 'react';
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
import DashboardFilters, {
  type DashboardFilterOptions,
  type DashboardFilterState,
} from '../../components/DashboardFilters';

const initialFilters: DashboardFilterState = {
  statuses: [],
  types: [],
  subjects: [],
  topics: [],
  subTopics: [],
  fromDate: '',
  toDate: '',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { signal } = useAbortController();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<ApiErrorResponse | null>(null);
  const [filters, setFilters] = useState<DashboardFilterState>(initialFilters);

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

  const filterOptions: DashboardFilterOptions = useMemo(() => {
    const unique = (values: Array<string | null | undefined>) =>
      [...new Set(values.filter((value): value is string => Boolean(value)))].sort((a, b) =>
        a.localeCompare(b),
      );

    return {
      statuses: unique(tests.map((test) => test.status)),
      types: unique(tests.map((test) => test.type)),
      subjects: unique(tests.map((test) => test.subject)),
      topics: unique(tests.flatMap((test) => test.topics ?? [])),
      subTopics: unique(tests.flatMap((test) => test.sub_topics ?? [])),
    };
  }, [tests]);

  const filteredTests = useMemo(() => {
    return tests.filter((test) => {
      if (filters.statuses.length && !filters.statuses.includes(test.status)) return false;
      if (filters.types.length && !filters.types.includes(test.type)) return false;
      if (filters.subjects.length && !filters.subjects.includes(test.subject)) return false;

      if (filters.topics.length) {
        const testTopics = test.topics ?? [];
        if (!filters.topics.some((topic) => testTopics.includes(topic))) return false;
      }

      if (filters.subTopics.length) {
        const testSubTopics = test.sub_topics ?? [];
        if (!filters.subTopics.some((subTopic) => testSubTopics.includes(subTopic))) return false;
      }

      const createdAt = new Date(test.created_at);
      if (filters.fromDate) {
        const fromDate = new Date(`${filters.fromDate}T00:00:00`);
        if (createdAt < fromDate) return false;
      }
      if (filters.toDate) {
        const toDate = new Date(`${filters.toDate}T23:59:59.999`);
        if (createdAt > toDate) return false;
      }

      return true;
    });
  }, [tests, filters]);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          All Tests
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/test-creation')}>
          Create New Test
        </Button>
      </Box>

      <DashboardFilters
        filters={filters}
        options={filterOptions}
        onChange={setFilters}
        onClear={() => setFilters(initialFilters)}
      />

      {/* Loading */}
      {loading && <Loader message="Loading tests..." />}

      {/* Error */}
      <ApiErrorDisplay error={apiError} onClose={() => setApiError(null)} />

      {/* Empty State */}
      {!loading && !apiError && filteredTests.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <AssignmentIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No tests found
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
            {tests.length === 0 ? 'Create your first test to get started.' : 'No tests match the selected filters.'}
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/test-creation')}>
            Create New Test
          </Button>
        </Box>
      )}

      {/* Tests Table */}
      {!loading && !apiError && filteredTests.length > 0 && (
        <TableContainer component={Paper} elevation={1}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 700 }}>Test Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Subject</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Created Date</TableCell>
                <TableCell sx={{ fontWeight: 700, minWidth: 250 }} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTests.map((test) => (
                <TableRow key={test.id} hover>
                  <TableCell>
                    <Typography sx={{ fontWeight: 500 }}>{test.name}</Typography>
                  </TableCell>
                  <TableCell>{test.subject}</TableCell>
                  <TableCell>
                    <Chip label={statusLabel(test.status)} color={statusColor(test.status)} size="small" />
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
