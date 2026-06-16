
import { FormControlLabel, Radio, RadioGroup, Stack, TextField } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

type PublishIfoProps = {
    onConfirm: () => void;
    onCancel: () => void;
    publishing?: boolean;
};

const PublishIfo = ({ onConfirm, onCancel, publishing = false }: PublishIfoProps) => {
    const [liveUntil, setLiveUntil] = useState<string>('always');
    const [endDate, setEndDate] = useState('');
    const [endTime, setEndTime] = useState('');
    const [scheduleDate, setScheduleDate] = useState('');
    const [scheduleTime, setScheduleTime] = useState('');
    const [publishTab, setPublishTab] = useState<'now' | 'schedule'>('now');

    return (
        <>
            {/* Publish Now / Schedule tabs */}
            <Box sx={{ mb: 3, borderBottom: '1px solid #e0e0e0' }}>
                <Stack direction="row" spacing={3}>
                    <Button
                        onClick={() => setPublishTab('now')}
                        sx={{
                            textTransform: 'none',
                            fontWeight: 600,
                            color: publishTab === 'now' ? '#1976d2' : 'text.secondary',
                            borderBottom: publishTab === 'now' ? '2px solid #1976d2' : '2px solid transparent',
                            borderRadius: 0,
                            pb: 1.5,
                        }}
                    >
                        Publish Now
                    </Button>
                    <Button
                        onClick={() => setPublishTab('schedule')}
                        sx={{
                            textTransform: 'none',
                            fontWeight: 600,
                            color: publishTab === 'schedule' ? '#1976d2' : 'text.secondary',
                            borderBottom: publishTab === 'schedule' ? '2px solid #1976d2' : '2px solid transparent',
                            borderRadius: 0,
                            pb: 1.5,
                        }}
                    >
                        Schedule Publish
                    </Button>
                </Stack>
            </Box>

            {/* Schedule date/time — only shown for schedule tab */}
            {publishTab === 'schedule' && (
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                        Select Publish Date and Time
                    </Typography>
                    <Stack direction="row" spacing={2}>
                        <TextField
                            type="date"
                            label="Publish Date"
                            value={scheduleDate}
                            onChange={(e) => setScheduleDate(e.target.value)}
                            slotProps={{ inputLabel: { shrink: true } }}
                            fullWidth
                            sx={{ bgcolor: 'white' }}
                        />
                        <TextField
                            type="time"
                            label="Publish Time"
                            value={scheduleTime}
                            onChange={(e) => setScheduleTime(e.target.value)}
                            slotProps={{ inputLabel: { shrink: true } }}
                            fullWidth
                            sx={{ bgcolor: 'white' }}
                        />
                    </Stack>
                </Box>
            )}

            {/* Live Until section */}
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                Live Until
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                Choose how long this test should remain available on the platform.
            </Typography>

            <RadioGroup value={liveUntil} onChange={(e) => setLiveUntil(e.target.value)}>
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, minmax(220px, 1fr))',
                        columnGap: 12,
                        rowGap: 2,
                        mt: 2,
                    }}
                >
                    <FormControlLabel value="always" control={<Radio />} label="Always Available" />
                    <FormControlLabel value="3weeks" control={<Radio />} label="3 Weeks" />
                    <FormControlLabel value="1week" control={<Radio />} label="1 Week" />
                    <FormControlLabel value="1month" control={<Radio />} label="1 Month" />
                    <FormControlLabel value="2weeks" control={<Radio />} label="2 Weeks" />
                    <FormControlLabel value="custom" control={<Radio />} label="Custom Duration" />
                </Box>
            </RadioGroup>

            {/* End date/time — only shown when Custom Duration is selected */}
            {liveUntil === 'custom' && (
                <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                    <TextField
                        type="date"
                        label="Select End Date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        slotProps={{ inputLabel: { shrink: true } }}
                        fullWidth
                        sx={{ bgcolor: 'white' }}
                    />
                    <TextField
                        type="time"
                        label="Select End Time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        slotProps={{ inputLabel: { shrink: true } }}
                        fullWidth
                        sx={{ bgcolor: 'white' }}
                    />
                </Stack>
            )}

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
                <Button
                    onClick={onCancel}
                    variant="outlined"
                    disabled={publishing}
                    sx={{ textTransform: 'none', px: 3 }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={onConfirm}
                    variant="contained"
                    disabled={publishing}
                    sx={{
                        bgcolor: '#6366f1',
                        textTransform: 'none',
                        px: 4,
                        '&:hover': { bgcolor: '#5558e3' },
                    }}
                >
                    {publishing ? 'Publishing…' : 'Publish Test'}
                </Button>
            </Box>
        </>
    );
};

export default PublishIfo