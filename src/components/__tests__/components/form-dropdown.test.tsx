import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import FormDropdown from '../../reusables/form-fields/form-dropdown';
import { ReactNode } from 'react';

interface TestFormProps {
  children: ReactNode;
  defaultValues?: Record<string, string | number | boolean | null | undefined>;
}

const TestForm = ({ children, defaultValues = {} }: TestFormProps) => {
  const methods = useForm({ defaultValues });
  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('FormDropdown Component', () => {
  const mockOptions = [
    { id: 1, label: 'Option 1' },
    { id: 2, label: 'Option 2' },
    { id: 3, label: 'Option 3' }
  ];

  const defaultProps = {
    name: 'testField',
    options: mockOptions,
    placeholder: 'Select an option'
  };

  it('should render with label', () => {
    render(
      <TestForm>
        <FormDropdown {...defaultProps} label="Test Label" />
      </TestForm>
    );

    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('should render in vertical layout', () => {
    render(
      <TestForm>
        <FormDropdown {...defaultProps} label="Test Label" vertical />
      </TestForm>
    );

    const label = screen.getByText('Test Label');
    expect(label).toHaveClass('text-xs');
  });

  it('should handle disabled state', () => {
    render(
      <TestForm>
        <FormDropdown {...defaultProps} disabled />
      </TestForm>
    );

    const trigger = screen.getByRole('combobox');
    expect(trigger).toBeDisabled();
  });

  it('should handle option selection', async () => {
    // Mock scrollIntoView
    const originalScrollIntoView = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = jest.fn();

    render(
      <TestForm>
        <FormDropdown {...defaultProps} />
      </TestForm>
    );

    // Open dropdown
    const trigger = screen.getByRole('combobox');
    await act(async () => {
      fireEvent.click(trigger);
    });

    // Select option
    const option = screen.getByText('Option 1');
    await act(async () => {
      fireEvent.click(option);
    });

    // Check if value is updated
    await waitFor(() => {
      expect(trigger).toHaveTextContent('Option 1');
    });

    // Restore original scrollIntoView
    Element.prototype.scrollIntoView = originalScrollIntoView;
  });

  it('should handle search functionality', async () => {
    // Mock scrollIntoView
    const originalScrollIntoView = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = jest.fn();

    render(
      <TestForm>
        <FormDropdown {...defaultProps} search />
      </TestForm>
    );

    // Open dropdown
    const trigger = screen.getByRole('combobox');
    await act(async () => {
      fireEvent.click(trigger);
    });

    // Type in search
    const searchInput = screen.getByPlaceholderText('Search...');
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'Option 1' } });
    });

    // Check if filtering works
    await waitFor(() => {
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.queryByText('Option 2')).not.toBeInTheDocument();
    });

    // Restore original scrollIntoView
    Element.prototype.scrollIntoView = originalScrollIntoView;
  });

  it('should show no results message when search has no matches', async () => {
    // Mock scrollIntoView
    const originalScrollIntoView = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = jest.fn();

    render(
      <TestForm>
        <FormDropdown {...defaultProps} search />
      </TestForm>
    );

    // Open dropdown
    const trigger = screen.getByRole('combobox');
    await act(async () => {
      fireEvent.click(trigger);
    });

    const searchInput = screen.getByPlaceholderText('Search...');
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'NonExistent' } });
    });

    await waitFor(() => {
      expect(screen.getByText('No results found')).toBeInTheDocument();
    });

    Element.prototype.scrollIntoView = originalScrollIntoView;
  });

  it('should handle custom className', () => {
    render(
      <TestForm>
        <FormDropdown {...defaultProps} className="custom-class" />
      </TestForm>
    );

    const trigger = screen.getByRole('combobox');
    expect(trigger).toHaveClass('custom-class');
  });

  it('should handle null/undefined values', () => {
    const defaultValues = {
      testField: null
    };

    render(
      <TestForm defaultValues={defaultValues}>
        <FormDropdown {...defaultProps} />
      </TestForm>
    );

    const trigger = screen.getByRole('combobox');
    expect(trigger).toHaveTextContent('Select an option');
  });

}); 