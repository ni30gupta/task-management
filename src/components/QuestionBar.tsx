import { Box, Typography, Stack } from '@mui/material';
import type { Test } from '../types';

type QuestionBarProps = {
    test: Test | null;
    activeQuestion: number;
    onSwitchQuestion: (index: number) => void;
    filledStatus: boolean[];
};

const QuestionBar = ({ test, activeQuestion, onSwitchQuestion, filledStatus }: QuestionBarProps) => {
    return (
        <Box
            sx={{
                width: 200,
                bgcolor: 'white',
                borderRight: '1px solid #e0e0e0',
                p: 1,
            }}
        >
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, fontSize: 14 }}>
                Question creation
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
                Total Questions: {test?.total_questions || 0}
            </Typography>

            <Stack spacing={1.5}>
                {Array.from({ length: test?.total_questions || 0 }, (_, index) => {
                    const filled = filledStatus[index] ?? false;
                    const isActive = index === activeQuestion;
                    return (
                        <Box
                            key={index}
                            onClick={() => onSwitchQuestion(index)}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                                p: 1.5,
                                borderRadius: 1,
                                bgcolor: filled ? '#f0fdf4' : isActive ? '#ede9fe' : 'transparent',
                                border: filled ? '1.5px solid #4caf50' : isActive ? '1.5px solid #6366f1' : '1.5px solid transparent',
                                cursor: 'pointer',
                                '&:hover': { bgcolor: filled ? '#e7fbe9' : isActive ? '#ede9fe' : '#f5f5f5' },
                            }}
                        >
                            <Box
                                sx={{
                                    width: 22,
                                    height: 22,
                                    borderRadius: '50%',
                                    bgcolor: filled ? '#4caf50' : isActive ? '#6366f1' : 'transparent',
                                    border: filled || isActive ? 'none' : '2px solid #bbb',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: 12,
                                    flexShrink: 0,
                                }}
                            >
                                {filled ? '✓' : ''}
                            </Box>
                            <Typography
                                variant="body2"
                                sx={{ fontWeight: isActive ? 700 : 500, color: isActive ? '#6366f1' : 'inherit' }}
                            >
                                {`Question ${index + 1}`}
                            </Typography>
                        </Box>
                    );
                })}
            </Stack>
        </Box>
    )
}

export default QuestionBar