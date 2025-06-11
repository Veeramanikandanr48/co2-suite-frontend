import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import FormCustomInput from '@/components/reusables/form-fields/form-custom-input';

type FormValues = {
  [key: string]: string | number | boolean | null;
};

const FormWrapper = ({ children, defaultValues = {} }: { children: React.ReactNode; defaultValues?: FormValues }) => {
  const methods = useForm({ defaultValues });
  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('FormCustomInput Component', () => {
  it('renders with default props', () => {
    const removeField = jest.fn();
    render(
      <FormWrapper>
        <FormCustomInput
          index={0}
          location="customFields"
          removeField={removeField}
        />
      </FormWrapper>
    );

    expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Value')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders with custom class names', () => {
    const removeField = jest.fn();
    render(
      <FormWrapper>
        <FormCustomInput
          index={0}
          location="customFields"
          removeField={removeField}
          keyClassName="custom-key-class"
          valueClassName="custom-value-class"
        />
      </FormWrapper>
    );

    const keyInput = screen.getByPlaceholderText('Name');
    const valueInput = screen.getByPlaceholderText('Value');

    expect(keyInput).toHaveClass('custom-key-class');
    expect(valueInput).toHaveClass('custom-value-class');
  });

  it('calls removeField when delete button is clicked', () => {
    const removeField = jest.fn();
    render(
      <FormWrapper>
        <FormCustomInput
          index={0}
          location="customFields"
          removeField={removeField}
        />
      </FormWrapper>
    );

    const deleteButton = screen.getByRole('button');
    fireEvent.click(deleteButton);

    expect(removeField).toHaveBeenCalledWith(0);
  });

  it('renders with correct form field names', () => {
    const removeField = jest.fn();
    render(
      <FormWrapper>
        <FormCustomInput
          index={1}
          location="customFields"
          removeField={removeField}
        />
      </FormWrapper>
    );

    const keyInput = screen.getByPlaceholderText('Name');
    const valueInput = screen.getByPlaceholderText('Value');

    expect(keyInput).toHaveAttribute('name', 'customFields[1].key');
    expect(valueInput).toHaveAttribute('name', 'customFields[1].value');
  });
}); 