import * as React from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Controller } from 'react-hook-form';
import dayjs from 'dayjs';

export default function MyDatePickerField(props) {
    const { label, control, name } = props;

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Controller
                name={name}
                control={control}
                render={({ field: { onChange, value } }) => (
                    <DatePicker
                        label={label}
                        value={value ? dayjs(value) : null} // Ensure value is a Dayjs object
                        onChange={(date) => onChange(date ? dayjs(date) : null)} // Convert selected date to Dayjs
                    />
                )}
            />
        </LocalizationProvider>
    );
}
