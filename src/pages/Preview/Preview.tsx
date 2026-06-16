import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Divider,
  Button,
  Stack,
  CircularProgress,
  Alert,
  Radio,
  RadioGroup,
  FormControlLabel,
  Snackbar,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import PublishIcon from '@mui/icons-material/Publish';
import QuizIcon from '@mui/icons-material/Quiz';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { getTestById, updateTest } from '../../api/tests';
import { fetchBulkQuestions } from '../../api/questions';
import type { Test, Question } from '../../types';
import TestInfoHeader from '../../components/TestInfoHeader';

const OPTION_LABELS: Record<string, string> = {
  option1: 'A',
  option2: 'B',
  option3: 'C',
  option4: 'D',
};

export default function Preview() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();

  const [test, setTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [snackbar, setSnackbar] = useState('');

  useEffect(() => {
    if (!testId) return;
    const load = async () => {
      try {
        setLoading(true);
        const testRes = await getTestById(testId);
        const testData = testRes.data.data;
        setTest(testData);

        if (testData.questions && testData.questions.length > 0) {
          const qRes = await fetchBulkQuestions(testData.questions);
          setQuestions(qRes.data.data);
        }
      } catch {
        setError('Failed to load test details.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [testId]);

  const handlePublish = async () => {
    if (!testId) return;
    try {
      setPublishing(true);
      await updateTest(testId, { status: 'live' });
      setSnackbar('Test published successfully!');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch {
      setError('Failed to publish test.');
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;
  }

  if (!test) return null;

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', px: { xs: 2, sm: 4 }, py: 4 }}>
      {/* Header */}
      <Stack direction="row" sx={{ mb: 3, justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {test.name}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
            <Chip label={test.subject} size="small" color="primary" variant="outlined" />
            {test.difficulty && <Chip label={test.difficulty} size="small" />}
            <Chip
              label={test.status === 'live' ? 'Live' : 'Draft'}
              size="small"
              color={test.status === 'live' ? 'success' : 'default'}
            />
          </Stack>
        </Box>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/test-creation/${testId}`)}
          >
            Edit Test
          </Button>
          <Button
            variant="outlined"
            startIcon={<QuizIcon />}
            onClick={() => navigate(`/add-questions/${testId}`)}
          >
            Edit Questions
          </Button>
          {test.status !== 'live' && (
            <Button
              variant="contained"
              color="success"
              startIcon={publishing ? <CircularProgress size={16} color="inherit" /> : <PublishIcon />}
              onClick={handlePublish}
              disabled={publishing}
            >
              Publish
            </Button>
          )}
        </Stack>
      </Stack>

      {/* Test Details */}
      <TestInfoHeader activeTab="Preview" testId={testId} test={test} />

      {/* Questions */}
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        Questions ({questions.length})
      </Typography>

      {questions.length === 0 ? (
        <Alert severity="info">No questions added yet.</Alert>
      ) : (
        <Stack spacing={3}>
          {questions.map((q, idx) => (
            <Paper key={q.id ?? idx} sx={{ p: 3 }}>
              <Stack direction="row" spacing={1} sx={{ mb: 1.5, alignItems: 'flex-start' }}>
                <Chip label={idx + 1} size="small" color="primary" sx={{ mt: 0.3, minWidth: 32 }} />
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {q.question}
                </Typography>
              </Stack>

              <RadioGroup value={q.correct_option}>
                {(['option1', 'option2', 'option3', 'option4'] as const).map(opt => (
                  <FormControlLabel
                    key={opt}
                    value={opt}
                    control={
                      <Radio
                        size="small"
                        sx={{
                          color: q.correct_option === opt ? 'success.main' : undefined,
                          '&.Mui-checked': { color: 'success.main' },
                        }}
                      />
                    }
                    label={
                      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                        <Typography
                          variant="body2"
                          sx={{
                            color: q.correct_option === opt ? 'success.main' : 'text.primary',
                            fontWeight: q.correct_option === opt ? 600 : 400,
                          }}
                        >
                          <strong>{OPTION_LABELS[opt]}.</strong> {q[opt]}
                        </Typography>
                        {q.correct_option === opt && (
                          <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                        )}
                      </Stack>
                    }
                  />
                ))}
              </RadioGroup>

              {q.explanation && (
                <>
                  <Divider sx={{ my: 1.5 }} />
                  <Typography variant="caption" color="text.secondary">
                    <strong>Explanation:</strong> {q.explanation}
                  </Typography>
                </>
              )}
            </Paper>
          ))}
        </Stack>
      )}

      <Snackbar
        open={!!snackbar}
        message={snackbar}
        autoHideDuration={3000}
        onClose={() => setSnackbar('')}
      />
    </Box>
  );
}
