import { SyntheticEvent } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

export type DashboardFilterState = {
  statuses: string[];
  types: string[];
  subjects: string[];
  topics: string[];
  subTopics: string[];
  fromDate: string;
  toDate: string;
};

export type DashboardFilterOptions = {
  statuses: string[];
  types: string[];
  subjects: string[];
  topics: string[];
  subTopics: string[];
};

type Props = {
  filters: DashboardFilterState;
  options: DashboardFilterOptions;
  onChange: (next: DashboardFilterState) => void;
  onClear: () => void;
};

function MultiSelectField({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <Autocomplete
      multiple
      options={options}
      value={value}
      onChange={(_: SyntheticEvent, nextValue) => onChange(nextValue)}
      renderInput={(params) => <TextField {...params} label={label} placeholder={`Select ${label}`} />}
      size="small"
      fullWidth
    />
  );
}

export default function DashboardFilters({ filters, options, onChange, onClear }: Props) {
  const update = (patch: Partial<DashboardFilterState>) => onChange({ ...filters, ...patch });

  return (
    <Paper sx={{ p: 2, mb: 3 }} variant="outlined">
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Filters
          </Typography>
          <Button size="small" onClick={onClear}>
            Clear all
          </Button>
        </Box>

        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <MultiSelectField
              label="Status"
              options={options.statuses}
              value={filters.statuses}
              onChange={(statuses) => update({ statuses })}
            />
            <MultiSelectField
              label="Type"
              options={options.types}
              value={filters.types}
              onChange={(types) => update({ types })}
            />
            <MultiSelectField
              label="Subject"
              options={options.subjects}
              value={filters.subjects}
              onChange={(subjects) => update({ subjects })}
            />
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <MultiSelectField
              label="Topics"
              options={options.topics}
              value={filters.topics}
              onChange={(topics) => update({ topics })}
            />
            <MultiSelectField
              label="Sub Topics"
              options={options.subTopics}
              value={filters.subTopics}
              onChange={(subTopics) => update({ subTopics })}
            />
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              label="Created From"
              type="date"
              value={filters.fromDate}
              onChange={(e) => update({ fromDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              size="small"
              fullWidth
            />
            <TextField
              label="Created To"
              type="date"
              value={filters.toDate}
              onChange={(e) => update({ toDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              size="small"
              fullWidth
            />
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  );
}