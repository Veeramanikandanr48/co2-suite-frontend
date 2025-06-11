import '@testing-library/jest-dom';
import { render, screen, fireEvent, act } from '@testing-library/react';
import FormTextarea from '~/components/reusables/form-fields/form-textarea';
import { APP_NAME, SRS_ID, generateTestId } from '~/components/test-ids/utc-global';
import { FormProvider, useForm, FieldValues, UseFormReturn } from 'react-hook-form';
import React from 'react';

describe(`${APP_NAME}-${SRS_ID.ACTION_TEMPLATE}: FormTextarea`, () => {
  const defaultProps = {
    name: 'test-textarea',
    label: 'Test Label',
    placeholder: 'Enter text here',
    'data-testid': 'form-textarea'
  };

  const TestWrapper = ({ children }: { children: React.ReactNode }) => {
    const methods = useForm<FieldValues>({
      defaultValues: {
        'test-textarea': ''
      }
    });
    return React.createElement(FormProvider, { ...methods, children } as UseFormReturn<FieldValues> & { children: React.ReactNode }, children);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it(`${generateTestId(SRS_ID.ACTION_TEMPLATE, 35)}: renders with label`, () => {
    render(
      React.createElement(TestWrapper, null,
        React.createElement(FormTextarea, defaultProps)
      )
    );
    expect(screen.getByText('Test Label:')).toBeInTheDocument();
  });

  it(`${generateTestId(SRS_ID.ACTION_TEMPLATE, 36)}: renders with placeholder`, () => {
    render(
      React.createElement(TestWrapper, null,
        React.createElement(FormTextarea, defaultProps)
      )
    );
    expect(screen.getByPlaceholderText('Enter text here')).toBeInTheDocument();
  });

  it(`${generateTestId(SRS_ID.ACTION_TEMPLATE, 37)}: renders with label helper`, () => {
    const labelHelper = 'Helper text';
    render(
      React.createElement(TestWrapper, null,
        React.createElement(FormTextarea, { ...defaultProps, labelHelper })
      )
    );
    expect(screen.getByText(labelHelper)).toBeInTheDocument();
  });

  it(`${generateTestId(SRS_ID.ACTION_TEMPLATE, 38)}: handles value changes`, async () => {
    const TestComponent = () => {
      const methods = useForm<FieldValues>({
        defaultValues: {
          'test-textarea': ''
        }
      });

      return React.createElement(FormProvider, { ...methods, children: React.createElement(FormTextarea, defaultProps) } as UseFormReturn<FieldValues> & { children: React.ReactNode });
    };

    render(React.createElement(TestComponent));

    const textarea = screen.getByTestId('form-textarea');
    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'Test input' } });
    });

    expect(textarea).toHaveValue('Test input');
  });

  it(`${generateTestId(SRS_ID.ACTION_TEMPLATE, 39)}: applies custom className`, () => {
    const customClass = 'custom-class';
    render(
      React.createElement(TestWrapper, null,
        React.createElement(FormTextarea, { ...defaultProps, className: customClass })
      )
    );
    const textarea = screen.getByTestId('form-textarea');
    expect(textarea).toHaveClass(customClass);
  });

  it(`${generateTestId(SRS_ID.ACTION_TEMPLATE, 40)}: handles disabled state`, () => {
    render(
      React.createElement(TestWrapper, null,
        React.createElement(FormTextarea, { ...defaultProps, disabled: true })
      )
    );
    const textarea = screen.getByTestId('form-textarea');
    expect(textarea).toBeDisabled();
  });

  it(`${generateTestId(SRS_ID.ACTION_TEMPLATE, 41)}: handles required state`, () => {
    render(
      React.createElement(TestWrapper, null,
        React.createElement(FormTextarea, { ...defaultProps, required: true })
      )
    );
    const textarea = screen.getByTestId('form-textarea');
    expect(textarea).toBeRequired();
  });

  it(`${generateTestId(SRS_ID.ACTION_TEMPLATE, 42)}: handles maxLength prop`, () => {
    const maxLength = 10;
    render(
      React.createElement(TestWrapper, null,
        React.createElement(FormTextarea, { ...defaultProps, maxLength })
      )
    );
    const textarea = screen.getByTestId('form-textarea');
    expect(textarea).toHaveAttribute('maxLength', maxLength.toString());
  });

  it(`${generateTestId(SRS_ID.ACTION_TEMPLATE, 43)}: handles form submission`, async () => {
    const onSubmit = jest.fn();
    
    const TestForm = () => {
      const methods = useForm<FieldValues>({
        defaultValues: {
          'test-textarea': ''
        }
      });

      return React.createElement(FormProvider, { ...methods, children: React.createElement('form', { onSubmit: methods.handleSubmit(onSubmit) },
        React.createElement(FormTextarea, defaultProps),
        React.createElement('button', { type: 'submit' }, 'Submit')
      )} as UseFormReturn<FieldValues> & { children: React.ReactNode });
    };

    render(React.createElement(TestForm));

    const textarea = screen.getByTestId('form-textarea');
    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'Test input' } });
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Submit'));
    });

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        'test-textarea': 'Test input'
      }),
      expect.anything()
    );
  });
});