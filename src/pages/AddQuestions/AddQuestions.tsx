import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  TextField,
  Paper,
  Stack,
  Chip,
  Radio,
  RadioGroup,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Delete,
  DeleteForever,
} from '@mui/icons-material';
import { getTestById, updateTest } from '../../api/tests';
import { getSubTopicsByTopics } from '../../api/subjects';
import type { Question, Test, ApiErrorResponse } from '../../types';
import { parseApiError } from '../../types';
import type { NamedRef } from '../../context/TestFlowContext';
import { bulkCreateQuestions } from '../../api/questions';
import BreadcrumbsComponent from '../../components/Breadcrumbs';

import { useTestFlow } from '../../context/TestFlowContext';
import QuillEditor from '../../components/QuillEditor/QuillEditor';
import TestInfoHeader from '../../components/TestInfoHeader';
import QuestionBar from '../../components/QuestionBar';
import PublishIfo from '../../components/PublishIfo';
import Loader from '../../components/Loader';
import ApiErrorDisplay from '../../components/ApiErrorDisplay';
import { useAbortController, isAbortError } from '../../hooks/useAbortController';
const STORAGE_KEY = (testId: string) => `questions_draft_${testId}`;




type QuestionDraft = {
  questionText: string;
  options: string[];
  correctOption: string;
  solution: string;
  difficulty: string;
  topic: string;
  subTopic: string;
};

const emptyDraft = (): QuestionDraft => ({
  questionText: '',
  options: ['', '', '', ''],
  correctOption: '',
  solution: '',
  difficulty: '',
  topic: '',
  subTopic: '',
});

export default function AddQuestions() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { getMeta } = useTestFlow();
  const { signal } = useAbortController();

  const [test, setTest] = useState<Test | null>(null);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [drafts, setDrafts] = useState<QuestionDraft[]>([]);
  const [showHints, setShowHints] = useState(false);
  const [allQuestionsComplete, setAllQuestionsComplete] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<ApiErrorResponse | null>(null);
  const [resolvedTopics, setResolvedTopics] = useState<NamedRef[]>([]);
  const [resolvedSubTopics, setResolvedSubTopics] = useState<NamedRef[]>([]);


  // Current question form state (mirrors drafts[activeQuestion])
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctOption, setCorrectOption] = useState('');
  const [solution, setSolution] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [topic, setTopic] = useState('');
  const [subTopic, setSubTopic] = useState('');
  const flowMeta = testId ? getMeta(testId) : undefined;
  const activeTab = flowMeta?.activeTab ?? test?.type ?? 'Test';
  const subject = flowMeta?.subject || { name: '' };
  // Use flowMeta topics if available (normal flow), else fall back to resolved from API
  const topics = (flowMeta?.topics?.length ? flowMeta.topics : resolvedTopics);
  const sub_topics = (flowMeta?.sub_topics?.length ? flowMeta.sub_topics : resolvedSubTopics);

  const totalTime = flowMeta?.total_time ?? test?.total_time ?? 0;
  const totalQuestions = flowMeta?.total_questions ?? test?.total_questions ?? 0;
  const totalMarks = flowMeta?.total_marks ?? test?.total_marks ?? 0;

  useEffect(() => {
    if (!testId) return;

    const fetchTest = async () => {
      setLoading(true);
      setApiError(null);
      try {
        const res = await getTestById(testId, signal);
        const testData: Test = res.data.data;
        setTest(testData);

        if (!flowMeta?.topics?.length && testData.topics?.length) {
          setResolvedTopics(testData.topics.map((id) => ({ id, name: id })));
          try {
            const stRes = await getSubTopicsByTopics(testData.topics, signal);
            const subTopicData = stRes.data.data;
            const testSubTopicIds = new Set(testData.sub_topics || []);
            const filtered = subTopicData
              .filter((st) => testSubTopicIds.has(st.id))
              .map((st) => ({ id: st.id, name: st.name }));
            setResolvedSubTopics(filtered.length ? filtered : subTopicData.map((st) => ({ id: st.id, name: st.name })));
          } catch (err) {
            if (!isAbortError(err)) console.error('Failed to fetch sub-topics', err);
          }
        }

        const stored = localStorage.getItem(STORAGE_KEY(testId));
        const total = testData.total_questions || 0;
        const loaded: QuestionDraft[] = stored ? JSON.parse(stored) : [];
        const padded = Array.from({ length: total }, (_, i) => loaded[i] ?? emptyDraft());
        setDrafts(padded);
        loadFormFromDraft(padded[0] ?? emptyDraft());
      } catch (err) {
        if (!isAbortError(err)) setApiError(parseApiError(err));
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    };

    fetchTest();
  }, [testId]);


  const loadFormFromDraft = (draft: QuestionDraft) => {
    setQuestionText(draft.questionText);
    setOptions(draft.options);
    setCorrectOption(draft.correctOption);
    setSolution(draft.solution);
    setDifficulty(draft.difficulty);
    setTopic(draft.topic);
    setSubTopic(draft.subTopic);
  };

  const currentDraftFromForm = (): QuestionDraft => ({
    questionText,
    options,
    correctOption,
    solution,
    difficulty,
    topic,
    subTopic,
  });

  const isDraftFilled = (d: QuestionDraft) =>
    d.questionText.trim() !== '' &&
    d.options.every((o) => o.trim() !== '') &&
    d.correctOption !== '';

  const saveDraftToStorage = (updated: QuestionDraft[]) => {
    if (!testId) return;
    localStorage.setItem(STORAGE_KEY(testId), JSON.stringify(updated));
  };


  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleNext = async () => {
    const updated = [...drafts];
    updated[activeQuestion] = currentDraftFromForm();
    setDrafts(updated);
    saveDraftToStorage(updated);

    const total = test?.total_questions || 0;
    const allFilled = updated.length === total && updated.every(isDraftFilled);

    if (allFilled) {
      // All questions filled — show publish UI first, save to API on confirm
      setAllQuestionsComplete(true);
    } else if (activeQuestion < total - 1) {
      // Move to next question
      setActiveQuestion(activeQuestion + 1);
      loadFormFromDraft(updated[activeQuestion + 1] ?? emptyDraft());
    }
  };

  const handlePublish = async () => {
    setApiError(null);
    try {
      setPublishing(true);

      const questions = drafts.map((d) => ({
        type: 'mcq' as const,
        question: d.questionText,
        option1: d.options[0],
        option2: d.options[1],
        option3: d.options[2],
        option4: d.options[3],
        correct_option: d.correctOption as Question['correct_option'],
        explanation: d.solution,
        difficulty: d.difficulty,
        test_id: testId,
        subject: test?.subject || '',
      }));

      const res = await bulkCreateQuestions(questions, signal);
      const questionIds: string[] = res.data.data.map((q) => q.id!);

      await updateTest(testId!, { questions: questionIds, status: 'live' }, signal);

      localStorage.removeItem(STORAGE_KEY(testId!));
      navigate(`/dashboard`);
    } catch (err) {
      if (!isAbortError(err)) {
        setApiError(parseApiError(err));
        setPublishing(false);
      }
    }
  };

  const deleteAllEdits = () => {
    if (!testId) return;
    setQuestionText('');
    setOptions(['', '', '', '']);
    setCorrectOption('');
    setSolution('');
    setDifficulty('');
    setTopic('');
    setSubTopic('');
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f8f9fa' }}>
      {/* Left Sidebar */}
      <QuestionBar
        test={test}
        activeQuestion={activeQuestion}
        onSwitchQuestion={(index) => {
          const updated = [...drafts];
          updated[activeQuestion] = currentDraftFromForm();
          setDrafts(updated);
          saveDraftToStorage(updated);
          setActiveQuestion(index);
          loadFormFromDraft(updated[index] ?? emptyDraft());
        }}
        filledStatus={drafts.map(isDraftFilled)}
      />

      {/* Main Content */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {/* Header */}
        <Box
          sx={{
            bgcolor: 'white',
            borderBottom: '1px solid #e0e0e0',
            px: 4,
            py: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >

          <BreadcrumbsComponent active_tab={activeTab} mode={testId ? 'Edit Test' : 'Create Test'} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="contained"
              sx={{
                bgcolor: '#6366f1',
                textTransform: 'none',
                px: 6,
                '&:hover': { bgcolor: '#5558e3' },
              }}
            >
              Publish
            </Button>

          </Box>
        </Box>

        {/* Content Area */}
        <Box sx={{ mx: 'auto' }}>
          {/* Global loader overlay */}
          {loading && <Loader message="Loading test..." />}

          {/* Global API error */}
          <ApiErrorDisplay error={apiError} onClose={() => setApiError(null)} />

          {!allQuestionsComplete && (
            <Paper
              sx={{
                p: 2,
                // border: '1px solid #e0e0e0',
                // borderRadius: 2,
                boxShadow: 'none',
              }}
            >
              {/* Test Info Header */}

              {testId && <TestInfoHeader activeTab={activeTab} testId={testId} test={test} />}

              {/* Question Header */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Question {activeQuestion + 1}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button size="small" variant="outlined" sx={{ textTransform: 'none' }}>
                    + MCQ
                  </Button>
                  <Button size="small" variant="outlined" sx={{ textTransform: 'none' }}>
                    CSV
                  </Button>
                </Box>
              </Box>

              <Typography
                variant="body2"
                sx={{ display: "flex", alignItems: 'flex-end', color: '#e91e63', mb: 2, cursor: 'pointer' }}
                onClick={deleteAllEdits}
              >
                <DeleteForever />
                Delete All Edits
              </Typography>

              {/* Rich Text Editor Toolbar */}
              <Box sx={{ mb: 3 }}>
                <QuillEditor
                  value={questionText}
                  onChange={setQuestionText}
                  placeholder="Type question here..."
                  minHeight={180}
                />
              </Box>

              {/* Question Input */}


              {/* Options Section */}
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Type the options below
              </Typography>

              <RadioGroup value={correctOption} onChange={(e) => setCorrectOption(e.target.value)}>
                <Stack spacing={2}>
                  {options.map((option, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        // bgcolor: '#fafafa',
                        p: 1.2,
                        borderRadius: 1,
                      }}
                    >
                      <FormControlLabel
                        value={`option${index + 1}`}
                        control={<Radio />}
                        label=""
                        sx={{ m: 0 }}
                      />
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Type Option here"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            bgcolor: 'white',
                          },
                        }}
                      />
                      <IconButton size="small">
                        <Delete sx={{ fontSize: 18, color: '#999' }} />
                      </IconButton>
                    </Box>
                  ))}
                </Stack>
              </RadioGroup>

              {/* Add Solution */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Add Solution
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  size="small"
                  placeholder="Type here"
                  value={solution}
                  onChange={(e) => setSolution(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: '#fafafa',
                    },
                  }}
                />
              </Box>

              <Divider sx={{ my: 4 }} />

              {/* Question Settings */}
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Question settings
              </Typography>

              <Stack spacing={2}>
                <FormControl fullWidth size="small">
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    Level of Difficulty
                  </Typography>
                  <Select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    displayEmpty
                    sx={{ bgcolor: '#fafafa' }}
                  >
                    <MenuItem value="">
                      <em style={{ color: 'grey' }}>Select from drop down</em>
                    </MenuItem>
                    <MenuItem value="easy">Easy</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="hard">Hard</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth size="small">
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    Topic
                  </Typography>
                  <Select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    displayEmpty
                    sx={{ bgcolor: '#fafafa' }}
                  >
                    <MenuItem value="">
                      <em style={{ color: 'grey' }} >Select from drop down</em>
                    </MenuItem>
                    {
                      topics.filter(t => t.id).map((t) => (
                        <MenuItem key={t.id} value={t.id}>
                          {t.name}
                        </MenuItem>
                      ))
                    }
                  </Select>
                </FormControl>

                <FormControl fullWidth size="small">
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    Sub-topic
                  </Typography>
                  <Select
                    value={subTopic}
                    onChange={(e) => setSubTopic(e.target.value)}
                    displayEmpty
                    sx={{ bgcolor: '#fafafa' }}
                  >
                    <MenuItem value="">
                      <em style={{ color: 'grey' }}>Select from drop down</em>
                    </MenuItem>
                    {
                      sub_topics.filter(st => st.id).map((st) => (
                        <MenuItem key={st.id} value={st.id}>
                          {st.name}
                        </MenuItem>
                      ))
                    }
                  </Select>
                </FormControl>
              </Stack>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  onClick={() => navigate('/test-creation')}
                  variant="outlined"
                  sx={{
                    color: '#ef5350',
                    borderColor: '#ef5350',
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: '#d32f2f',
                      bgcolor: '#ffebee',
                    },
                  }}
                >
                  Exit Test Creation
                </Button>
                <Button
                  onClick={handleNext}
                  variant="contained"
                  sx={{
                    bgcolor: '#6366f1',
                    textTransform: 'none',
                    px: 4,
                    '&:hover': { bgcolor: '#5558e3' },
                  }}
                >
                  {activeQuestion < (test?.total_questions || 1) - 1 ? 'Save & Next' : 'Save & Submit'}
                </Button>
              </Box>
            </Paper>
          )}

          {/* Publish Component - shown after all questions complete */}
          {allQuestionsComplete && (
            <Paper
              sx={{
                mt: 3,
                p: 4,
                border: '2px solid #2196f3',
                borderRadius: 2,
                boxShadow: 'none',
              }}
            >
              {/* Test Created Banner */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  mb: 3,
                  pb: 2,
                  borderBottom: '1px solid #e0e0e0',
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Test created
                </Typography>
                <Chip
                  icon={<Box sx={{ color: '#4caf50', fontSize: 16 }}>✓</Box>}
                  label={`All ${test?.total_questions || 0} Questions done`}
                  sx={{
                    bgcolor: '#e8f5e9',
                    color: '#2e7d32',
                    fontWeight: 500,
                  }}
                />
              </Box>

              {/* Test Details Card */}
              <TestInfoHeader activeTab={activeTab} testId={testId!} test={test} />

              {/* Publish Tabs */}
              <PublishIfo
                onConfirm={handlePublish}
                onCancel={() => setAllQuestionsComplete(false)}
                publishing={publishing}
              />
              {/* Action Buttons */}
            </Paper>
          )}
        </Box>
      </Box>
    </Box>
  );
}
