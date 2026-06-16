import TimerIcon from '../assets/timer.svg?react';
import QuizIcon from '../assets/quiz.svg?react';
import LeaderBoardIcon from '../assets/leaderboard.svg?react';

import {
    Box,
    Typography,
    Stack,
    Chip,
    IconButton,
    SvgIcon,
} from '@mui/material';



import type { Test } from '../types';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';
import { useTestFlow, type NamedRef } from '../context/TestFlowContext';



const TestInfoHeader = ({ activeTab, testId, test }: { activeTab: string, testId: string |undefined, test: Test|null }) => {
    const { getMeta } = useTestFlow();
    const navigate = useNavigate();

    const meta = getMeta(testId);
    const subject = meta?.subject || { name: 'N/A' };
    const topics = meta?.topics;
    const sub_topics = meta?.sub_topics;
    const totalMarks = meta?.total_marks;
    const totalTime = meta?.total_time;
    const totalQuestions = meta?.total_questions;

    return (
        <Box sx={{ mb: 2, border: '1px solid #bbb', px: 2.5, pt:2, borderRadius: 2, bgcolor: '#fafafa' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: "space-between", gap: 1, mb: 2 }}>
                <Chip label={activeTab} size="small" sx={{ bgcolor: '#1a1a2e', color: 'white' }} />
                <IconButton onClick={() => navigate(`/test-creation/${testId}`)} size="small">
                    <EditIcon sx={{ fontSize: 16 }} />
                </IconButton>
            </Box>

            <Box sx={{background:"", display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Chapter 1
                </Typography>
                <Chip label={test?.difficulty} size="small" sx={{ bgcolor: '#2AB7A9', color: 'white', px:3 }} />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 1.5, mb: 2 }}>

                <Stack spacing={1}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Typography variant="body2" sx={{ minWidth: 80 }}>Subject</Typography>
                        <>
                            :<Typography variant="body2"> {subject?.name}</Typography>
                        </>
                    </Box>
                    <Box sx={{ py: 1, display: 'flex', gap: 2 }}>
                        <Typography variant="body2" sx={{ minWidth: 80 }}>Topic</Typography>
                        <>:
                            {
                                topics?.map((t: NamedRef) => (
                                    <Box key={t.id} sx={{ px: 1, py: 0.5, borderRadius: 3, border: '1px solid #FFC82C' }}>
                                        <Typography variant="body2" sx={{ color: '#FFC82C ' }}>{t.name}</Typography>
                                    </Box>
                                ))
                            }
                        </>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, }}>
                        <Typography variant="body2" sx={{ minWidth: 80 }}>Sub Topics:</Typography>
                        <>:
                            {
                                sub_topics?.map((st: NamedRef) => (
                                    <Box key={st.id} sx={{ px: 1, py: 0.5, borderRadius: 3, border: '1px solid #FFC82C' }}>
                                        <Typography variant="body2" sx={{ color: '#FFC82C ' }}>{st?.name}</Typography>
                                    </Box>
                                ))
                            }
                        </>
                    </Box>
                </Stack>

                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        border: '1px solid #e0e0e0',
                        borderRadius: 2,
                        px: 1,
                        // py: 0.2,
                        width: 'fit-content',
                        gap: 0,
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 1.5, color: '#555' }}>
                        <SvgIcon sx={{ position: 'relative', top: 3 }} component={TimerIcon} color="primary" fontSize="large" />
                        <Typography variant="body2" sx={{ color: '#555' }}>{totalTime} Min</Typography>
                    </Box>
                    <Box sx={{ width: '1px', height: 18, bgcolor: '#ddd' }} />

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 1.5, color: '#555' }}>
                        <SvgIcon sx={{ position: 'relative', top: 5 }} component={QuizIcon} color="primary" fontSize="large" />
                        <Typography variant="body2" sx={{ color: '#555' }}>{totalQuestions} Q's</Typography>
                    </Box>
                    <Box sx={{ width: '1px', height: 18, bgcolor: '#ddd' }} />

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 1.5, color: '#555' }}>
                        <SvgIcon component={LeaderBoardIcon} color="primary" fontSize="large" />
                        <Typography variant="body2" sx={{ color: '#555' }}>{totalMarks} Marks</Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

export default TestInfoHeader