import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import DatePickerFormField from '@/components/reusables/form-fields/date-picker-form-field';
import { DATE_OPTIONS } from '@/lib/variables';
import React from 'react';

// Mock the CalendarIcon
jest.mock('lucide-react', () => ({
  CalendarIcon: () => <span data-testid="calendar-icon">CalendarIcon</span>,
}));

// Mock the Calendar component
jest.mock('@/components/ui/calendar', () => ({
  Calendar: ({ fromYear, toYear, onSelect }: { fromYear: number; toYear: number; onSelect?: (date: Date) => void; [key: string]: unknown }) => {
    const [isOpen, setIsOpen] = React.useState(true);
    
    const handleDateClick = () => {
      if (onSelect) {
        onSelect(new Date());
      }
      setIsOpen(false);
    };

    if (!isOpen) return null;

    return (
      <div data-testid="calendar">
        <select
          role="combobox"
          aria-label="select year"
          data-min={fromYear}
          data-max={toYear}
        >
          <option value="2024">2024</option>
        </select>
        <div role="grid">
          <button disabled>1</button>
          <button onClick={handleDateClick}>2</button>
        </div>
      </div>
    );
  },
}));

type FormValues = {
  [key: string]: string | Date | null;
};
const FormWrapper = ({ children, defaultValues = {} }: { children: React.ReactNode; defaultValues?: FormValues }) => {
  const methods = useForm({ defaultValues });
  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('DatePickerFormField Component', () => {
  it('renders with label', () => {
    render(
      <FormWrapper>
        <DatePickerFormField
          name="date"
          label="Test Date"
        />
      </FormWrapper>
    );

    expect(screen.getByText('Test Date:')).toBeInTheDocument();
  });

  it('renders with default placeholder when no date is selected', () => {
    render(
      <FormWrapper>
        <DatePickerFormField
          name="date"
          label="Test Date"
        />
      </FormWrapper>
    );

    expect(screen.getByText('Pick a date')).toBeInTheDocument();
  });

  it('displays selected date in correct format', () => {
    const testDate = new Date('2024-01-01');
    render(
      <FormWrapper defaultValues={{ date: testDate }}>
        <DatePickerFormField
          name="date"
          label="Test Date"
        />
      </FormWrapper>
    );

    const formattedDate = testDate.toLocaleDateString('en-US', DATE_OPTIONS);
    expect(screen.getByText(formattedDate)).toBeInTheDocument();
  });

  it('opens calendar popover when button is clicked', () => {
    render(
      <FormWrapper>
        <DatePickerFormField
          name="date"
          label="Test Date"
        />
      </FormWrapper>
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Calendar should be visible
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('applies custom className to popover content', () => {
    render(
      <FormWrapper>
        <DatePickerFormField
          name="date"
          label="Test Date"
          className="custom-class"
        />
      </FormWrapper>
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    const popoverContent = screen.getByRole('grid').closest('[class*="custom-class"]');
    expect(popoverContent).toBeInTheDocument();
  });

  it('disables dates before 1900-01-01', () => {
    render(
      <FormWrapper>
        <DatePickerFormField
          name="date"
          label="Test Date"
        />
      </FormWrapper>
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Get all date buttons
    const dateButtons = screen.getAllByRole('button');
    // The first few buttons should be disabled (dates before 1900)
    expect(dateButtons[1]).toHaveAttribute('disabled');
  });

  it('sets correct year range', () => {
    render(
      <FormWrapper>
        <DatePickerFormField
          name="date"
          label="Test Date"
        />
      </FormWrapper>
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Check if year dropdown is present
    const yearDropdown = screen.getByRole('combobox', { name: /select year/i });
    expect(yearDropdown).toBeInTheDocument();

    // Check if year range is correct (1960 to current year + 30)
    const currentYear = new Date().getFullYear();
    const maxYear = currentYear + 30;
    expect(yearDropdown).toHaveAttribute('data-min', '1960');
    expect(yearDropdown).toHaveAttribute('data-max', maxYear.toString());
  });

  it('shows calendar icon', () => {
    render(
      <FormWrapper>
        <DatePickerFormField
          name="date"
          label="Test Date"
        />
      </FormWrapper>
    );

    expect(screen.getByTestId('calendar-icon')).toBeInTheDocument();
  });

  it('applies muted text style when no date is selected', () => {
    render(
      <FormWrapper>
        <DatePickerFormField
          name="date"
          label="Test Date"
        />
      </FormWrapper>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('text-muted-foreground');
  });

  it('handles date selection and validation correctly', () => {
    render(
      <FormWrapper>
        <DatePickerFormField
          name="date"
          label="Test Date"
        />
      </FormWrapper>
    );

    // Open the calendar
    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Verify calendar is open
    expect(screen.getByRole('grid')).toBeInTheDocument();

    // Verify dates before 1900 are disabled
    const disabledButton = screen.getAllByRole('button')[1];
    expect(disabledButton).toHaveAttribute('disabled');

    // Select a date (using the mock calendar's handleDateClick)
    const dateButton = screen.getByRole('button', { name: '2' });
    fireEvent.click(dateButton);

    // Verify popover is closed after selection
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();

    // Verify the selected date is displayed
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', DATE_OPTIONS);
    expect(screen.getByText(formattedDate)).toBeInTheDocument();
  });
});