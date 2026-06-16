import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  CircularProgress,
  Alert,
  Typography,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  FormHelperText,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Stack,
  Divider,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Tabs,
  Tab,
  Grid,
  IconButton,
} from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { getTopicsBySubject, getSubTopicsByTopics } from '../../api/subjects';
import { createTest, updateTest, getTestById } from '../../api/tests';
import type { Topic, SubTopic } from '../../types';
import BreadcrumbsComponent from '../../components/Breadcrumbs';
import { useSubjects } from '../../hooks/useSubjects';

import { useTestFlow } from '../../context/TestFlowContext';

interface FormValues {
  name: string;
  subject: string;
  type: string;
  difficulty: string;
  correct_marks: string;
  wrong_marks: string;
  unattempt_marks: string;
  total_time: string;
  total_marks: string;
  total_questions: string;
  topics: string[];
  sub_topics: string[];
}

interface FormErrors {
  name?: string;
  subject?: string;
  type?: string;
  difficulty?: string;
  correct_marks?: string;
  total_time?: string;
  total_marks?: string;
}

const status = ['live', 'unpublished', 'scheduled', 'expired', 'draft']
const INITIAL_FORM: FormValues = {
  name: '',
  subject: '',
  type: '',
  difficulty: '',
  correct_marks: '',
  wrong_marks: '',
  unattempt_marks: '',
  total_time: '',
  total_marks: '',
  total_questions: '',
  topics: [],
  sub_topics: [],
};

const DIFFICULTIES = ['easy', 'medium', 'f'];

export default function CreateTest() {
  const navigate = useNavigate();
  const { testId } = useParams<{ testId: string }>();
  const isEditing = Boolean(testId);

  const [form, setForm] = useState<FormValues>(INITIAL_FORM);
  const [activeTab, setActiveTab] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subTopics, setSubTopics] = useState<SubTopic[]>([]);
  const [editSubTopicValues, setEditSubTopicValues] = useState<string[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [loadingSubTopics, setLoadingSubTopics] = useState(false);
  const [loadingTest, setLoadingTest] = useState(isEditing);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [savingDraft, setSavingDraft] = useState(false);
  const [savingNext, setSavingNext] = useState(false);

  // Load subjects on mount
  const { subjects, loadingSubjects } = useSubjects();

  // Load existing test for edit mode
  useEffect(() => {
    if (!testId || loadingSubjects) return;
    const fetchTest = async () => {
      setLoadingTest(true);
      try {
        const res = await getTestById(testId);
        const t = res.data.data;

        const subjectId = subjects.find((s) => s.name === t.subject)?.id ?? t.subject;
        setEditSubTopicValues(t.sub_topics ?? []);

        setForm({
          name: t.name ?? '',
          subject: subjectId ?? '',
          type: t.type ?? '',
          difficulty: t.difficulty ?? '',
          correct_marks: t.correct_marks?.toString() ?? '',
          wrong_marks: t.wrong_marks?.toString() ?? '',
          unattempt_marks: t.unattempt_marks?.toString() ?? '',
          total_time: t.total_time?.toString() ?? '',
          total_marks: t.total_marks?.toString() ?? '',
          total_questions: t.total_questions?.toString() ?? '',
          topics: t.topics ?? [],
          sub_topics: t.sub_topics ?? [],
        });
        setActiveTab(t.type ?? 'chapterwise');
      } catch {
        setSubmitError('Failed to load test data.');
      } finally {
        setLoadingTest(false);
      }
    };
    fetchTest();
  }, [testId, subjects, loadingSubjects]);



  // Clear submit error after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setSubmitError(null);
    }, 3000);

    return () => {
      clearTimeout(timer);
    }
  }, [submitError])


  // Fetch topics when subject changes
  useEffect(() => {
    if (!form.subject) {
      setTopics([]);
      setSubTopics([]);
      return;
    }
    const fetchTopics = async () => {
      setLoadingTopics(true);
      try {
        const res = await getTopicsBySubject(form.subject);
        setTopics(res.data.data);

        if (testId) {
          const topicIds = res.data.data
            .filter((top) => form.topics.includes(top.id) || form.topics.includes(top.name))
            .map((t) => t.id);

          setForm((prev) => ({ ...prev, topics: topicIds }));
        }
      } catch {
        setTopics([]);
      } finally {
        setLoadingTopics(false);
      }
    };
    fetchTopics();
  }, [form.subject]);

  // Fetch sub-topics when topics change
  useEffect(() => {
    if (!form.topics.length) {
      setSubTopics([]);
      return;
    }
    const fetchSubTopics = async () => {
      setLoadingSubTopics(true);
      try {
        const res = await getSubTopicsByTopics(form.topics);
        const fetchedSubTopics = res.data.data;
        setSubTopics(fetchedSubTopics);

        if (testId && editSubTopicValues.length) {
          const subTopicIds = fetchedSubTopics
            .filter((st) => editSubTopicValues.includes(st.id) || editSubTopicValues.includes(st.name))
            .map((st) => st.id);

          setForm((prev) => ({ ...prev, sub_topics: subTopicIds }));
          setEditSubTopicValues([]);
        }
      } catch {
        setSubTopics([]);
      } finally {
        setLoadingSubTopics(false);
      }
    };
    fetchSubTopics();
  }, [form.topics, testId, editSubTopicValues]);

  const handleChange = (field: keyof FormValues, value: string | string[]) => {
    console.log('field', field, 'value', value)
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      // Reset dependent fields
      if (field === 'subject') {
        next.topics = [];
        next.sub_topics = [];
      }
      if (field === 'topics') {
        next.sub_topics = [];
      }
      return next;
    });
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };


  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.name.trim()) errs.name = 'Test name is required';
    if (!form.subject) errs.subject = 'Subject is required';
    if (!form.type) errs.type = 'Test type is required';
    if (!form.difficulty) errs.difficulty = 'Difficulty is required';
    if (!form.correct_marks) errs.correct_marks = 'Correct marks are required';
    if (!form.total_time) errs.total_time = 'Total time is required';
    if (!form.total_marks) errs.total_marks = 'Total marks are required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const buildPayload = (status: 'draft' | 'live' | null) => ({
    name: form.name,
    subject: form.subject,
    type: activeTab,
    difficulty: form.difficulty,
    correct_marks: form.correct_marks ? Number(form.correct_marks) : undefined,
    wrong_marks: form.wrong_marks ? Number(form.wrong_marks) : undefined,
    unattempt_marks: form.unattempt_marks ? Number(form.unattempt_marks) : undefined,
    total_time: form.total_time ? Number(form.total_time) : undefined,
    total_marks: form.total_marks ? Number(form.total_marks) : undefined,
    total_questions: form.total_questions ? Number(form.total_questions) : undefined,
    topics: form.topics,
    sub_topics: form.sub_topics,
    status,
  });

  const handleSaveDraft = async () => {
    if (!validate()) return;
    setSavingDraft(true);
    setSubmitError(null);
    try {
      if (isEditing && testId) {
        await updateTest(testId, buildPayload('draft'));
      } else {
        await createTest(buildPayload(null));
      }
      navigate('/dashboard');
    } catch {
      setSubmitError('Failed to save draft. Please try again.');
    } finally {
      setSavingDraft(false);
    }
  };

  const processDataStore = (id: string) => {
    setMeta(id, {
      activeTab,
      subject: subjects.find((sub) => sub.id === form.subject) || '',
      topics: topics.filter((t) => form.topics.includes(t.id)) || [],
      sub_topics: subTopics.filter((st) => form.sub_topics.includes(st.id)),
      total_marks: Number(form.total_marks),
      total_time: Number(form.total_time),
      total_questions: Number(form.total_questions),
    });
  }

  const handleNext = async () => {
    // if (!validate()) return;
    setSavingNext(true);
    setSubmitError(null);
    try {
      let id = testId;
      if (isEditing && testId) {
        await updateTest(testId, buildPayload('draft'));
      } else {
        const res = await createTest(buildPayload('draft'));
        id = res.data.data.id;
      }
      processDataStore(id!)
      navigate(`/add-questions/${id}`);
    } catch {
      setSubmitError('Failed to save test. Please try again.');
    } finally {
      setSavingNext(false);
    }
  };

  const { setMeta } = useTestFlow();

  if (loadingTest) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p:3 }}>
      <BreadcrumbsComponent mode={testId?'Edit Test':'Create Test'} active_tab={activeTab} />

      {submitError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {submitError}
        </Alert>
      )}

      {/* Tabs */}
      <Grid container spacing={4} sx={{ my: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ border: 1, borderColor: 'divider', mb: 4, borderRadius: 4, width: 'fit-content' }}>
          <Tabs value={activeTab}
            onChange={(_, val) => {
              setActiveTab(val);
            }}>
            <Tab value={'chapterwise'} label="Chapter Wise" />
            <Tab value={'pyq'} label="PYQ" />
            <Tab value={'mock'} label="Mock Test" />
          </Tabs>
        </Box>
        

      </Grid>

      <Grid container spacing={8}>
        {/* Left Column */}
        <Grid size={6}>
          <Stack spacing={3}>
            {/* Subject */}
            <Box>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Subject
              </Typography>
              <FormControl fullWidth required error={Boolean(errors.subject)}>
                <Select
                  value={form.subject}
                  onChange={(e) => handleChange('subject', e.target.value)}
                  disabled={loadingSubjects}
                  displayEmpty
                  sx={{ color: form.subject ? 'inherit' : 'text.secondary' }}
                >
                  <MenuItem value="" disabled>
                    Choose from Drop-down
                  </MenuItem>
                  {loadingSubjects ? (
                    <MenuItem disabled>Loading…</MenuItem>
                  ) : (
                    subjects.map((s) => (
                      <MenuItem key={s.id} value={s.id}>
                        {s.name}
                      </MenuItem>
                    ))
                  )}
                </Select>
                {errors.subject && <FormHelperText>{errors.subject}</FormHelperText>}
              </FormControl>
            </Box>


            {/* Topic */}
            <Box>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Topic
              </Typography>
              <FormControl fullWidth disabled={!form.subject || loadingTopics}>
                <Select
                  multiple
                  value={form.topics}
                  onChange={(e) => handleChange('topics', e.target.value as string[])}
                  input={<OutlinedInput />}
                  displayEmpty
                  renderValue={(selected) => {
                    if ((selected as string[]).length === 0) {
                      return <span style={{ color: '#999' }}>Choose from Drop-down</span>;
                    }
                    return topics
                      .filter((t) => (selected as string[]).includes(t.id))
                      .map((t) => t.name)
                      .join(', ');
                  }}
                >
                  {loadingTopics ? (
                    <MenuItem disabled>Loading…</MenuItem>
                  ) : (
                    topics.map((t) => (
                      <MenuItem key={t.id} value={t.id}>
                        <Checkbox checked={form.topics.includes(t.id)} />
                        <ListItemText primary={t.name} />
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Box>

            {/* Duration */}
            <Box>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Duration (Minutes)
              </Typography>
              <TextField
                fullWidth
                type="number"
                value={form.total_time}
                onChange={(e) => handleChange('total_time', e.target.value)}
                placeholder="Enter the time"
                error={Boolean(errors.total_time)}
                helperText={errors.total_time}
                slotProps={{ htmlInput: { min: 1 } }}
              />
            </Box>

            <Box>
              <Typography variant="body2" sx={{ mb: 2, fontWeight: 600 }}>
                Marking Scheme:
              </Typography>
              <Grid container sx={{ display: 'flex', gap: 2 }}>
                {/* Wrong Answer */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ mb: 1, fontSize: '0.875rem' }}>
                    Wrong Answer
                  </Typography>
                  <Box >
                    <TextField
                      fullWidth
                      value={form.wrong_marks}
                      onChange={(e) => handleChange('wrong_marks', e.target.value)}
                      type="number"
                      slotProps={{ htmlInput: { min: 1 } }}
                      placeholder="Enter the time"

                    />

                  </Box>
                </Box>

                {/* Unattempted */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ mb: 1, fontSize: '0.875rem' }}>
                    Unattempted
                  </Typography>
                  <Box>
                    <TextField
                      fullWidth
                      value={form.unattempt_marks}
                      type="number"
                      placeholder="Enter the time"
                      error={Boolean(errors.total_marks)}
                      onChange={(e) => handleChange('unattempt_marks', e.target.value)}
                      helperText={errors.total_time}
                      slotProps={{ htmlInput: { min: 1 } }}

                    />

                  </Box>
                </Box>

                {/* Correct Answer */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ mb: 1, fontSize: '0.875rem' }}>
                    Correct Answer
                  </Typography>
                  <Box >

                    <TextField
                      fullWidth
                      value={form.correct_marks}
                      onChange={(e) => handleChange('correct_marks', e.target.value)}
                      type="number"
                      placeholder="Enter the time"
                      error={Boolean(errors.total_time)}
                      helperText={errors.total_time}
                      slotProps={{ htmlInput: { min: 1 } }}
                    />

                  </Box>
                </Box>

              </Grid>
            </Box>

          </Stack>
        </Grid>

        <Grid size={6}>
          <Stack spacing={3}>
            {/* Name of Test */}
            <Box>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Name of Test
              </Typography>
              <TextField
                fullWidth
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter name of Test"
                error={Boolean(errors.name)}
                helperText={errors.name}
              />
            </Box>

            {/* Sub Topic */}
            <Box>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Sub Topic
              </Typography>
              <FormControl fullWidth disabled={!form.topics.length || loadingSubTopics}>
                <Select
                  multiple
                  value={form.sub_topics}
                  onChange={(e) => handleChange('sub_topics', e.target.value as string[])}
                  input={<OutlinedInput />}
                  displayEmpty
                  renderValue={(selected) => {
                    if ((selected as string[]).length === 0) {
                      return <span style={{ color: '#999' }}>Choose from Drop-down</span>;
                    }
                    return subTopics
                      .filter((st) => (selected as string[]).includes(st.id))
                      .map((st) => st.name)
                      .join(', ');
                  }}
                >
                  {loadingSubTopics ? (
                    <MenuItem disabled>Loading…</MenuItem>
                  ) : (
                    subTopics.map((st) => (
                      <MenuItem key={st.id} value={st.id}>
                        <Checkbox checked={form.sub_topics.includes(st.id)} />
                        <ListItemText primary={st.name} />
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Box>

            {/* Test Difficulty Level */}
            <Box sx={{ alignItems: "center" }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Test Difficulty Level
              </Typography>
              <RadioGroup
                sx={{ position: 'relative', top: 10, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}
                row
                value={form.difficulty}
                onChange={(e) => handleChange('difficulty', e.target.value)}
              >
                <FormControlLabel value="easy" control={<Radio />} label="Easy" />
                <FormControlLabel value="medium" control={<Radio />} label="Medium" />
                <FormControlLabel value="difficult" control={<Radio />} label="Difficult" />
              </RadioGroup>
            </Box>


            <Grid container sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, position: 'relative', top: 50 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ mb: 1, fontSize: '0.875rem' }}>
                  No of Questions
                </Typography>
                <TextField
                  fullWidth
                  value={form.total_questions}
                  onChange={(e) => handleChange('total_questions', e.target.value)}
                  placeholder="Ex: 20 Questions"
                  type="number"
                  slotProps={{ htmlInput: { min: 1 } }}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ mb: 1, fontSize: '0.875rem' }}>
                  Total Marks
                </Typography>
                <TextField
                  fullWidth
                  value={form.total_marks}
                  onChange={(e) => handleChange('total_marks', e.target.value)}
                  placeholder="Ex:250 Marks"
                  type="number"
                  error={Boolean(errors.total_marks)}
                  helperText={errors.total_marks}
                  slotProps={{ htmlInput: { min: 1 } }}
                />
              </Box>
            </Grid>
          </Stack>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end', mt: 4 }}>
        <Button
          variant="text"
          onClick={() => navigate('/dashboard')}
          disabled={savingNext}
          sx={{px:6}}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={savingNext}
          sx={{ px: 6 }}

        >
          {savingNext ? <CircularProgress size={18} /> : 'Next'}
        </Button>
      </Stack>
    </Box>
  );
}
