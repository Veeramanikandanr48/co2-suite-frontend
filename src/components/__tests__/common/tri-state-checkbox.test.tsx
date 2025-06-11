import '@testing-library/jest-dom';
import { render, screen, fireEvent, act } from '@testing-library/react';
import TriStateCheckbox from '~/components/reusables/form-fields/tri-state-checkbox';
import { ESelectedStatus } from '~/enums/workflow-customization-enum';
import { APP_NAME, SRS_ID, generateTestId } from '~/components/test-ids/utc-global';
import React from 'react';

describe(`${APP_NAME}-${SRS_ID.PROTOCOL_CHECKBOX}: TriStateCheckbox`, () => {
  const defaultProps = {
    state: ESelectedStatus.UNSELECTED,
    onChange: jest.fn(),
    'data-testid': 'tri-state-checkbox'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it(`${generateTestId(SRS_ID.PROTOCOL_CHECKBOX, 1)}: renders in unselected state`, () => {
    render(React.createElement(TriStateCheckbox, defaultProps));
    const checkbox = screen.getByTestId('tri-state-checkbox');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toHaveAttribute('aria-checked', 'true');
  });

  it(`${generateTestId(SRS_ID.PROTOCOL_CHECKBOX, 2)}: renders in selected state`, () => {
    render(React.createElement(TriStateCheckbox, { ...defaultProps, state: ESelectedStatus.SELECTED }));
    const checkbox = screen.getByTestId('tri-state-checkbox');
    expect(checkbox).toHaveAttribute('aria-checked', 'mixed');
  });

  it(`${generateTestId(SRS_ID.PROTOCOL_CHECKBOX, 3)}: renders in intermediate state`, () => {
    render(React.createElement(TriStateCheckbox, { ...defaultProps, state: ESelectedStatus.INTERMEDIATE }));
    const checkbox = screen.getByTestId('tri-state-checkbox');
    expect(checkbox).toHaveAttribute('aria-checked', 'false');
  });

  it(`${generateTestId(SRS_ID.PROTOCOL_CHECKBOX, 4)}: calls onChange when clicked`, async () => {
    render(React.createElement(TriStateCheckbox, defaultProps));
    const checkbox = screen.getByTestId('tri-state-checkbox');
    
    await act(async () => {
      fireEvent.click(checkbox);
    });

    expect(defaultProps.onChange).toHaveBeenCalled();
  });

  it(`${generateTestId(SRS_ID.PROTOCOL_CHECKBOX, 5)}: applies correct styles for each state`, () => {
    const { rerender } = render(React.createElement(TriStateCheckbox, defaultProps));
    const visualCheckbox = screen.getByTestId('tri-state-checkbox').nextElementSibling;
    expect(visualCheckbox).toHaveClass('bg-white');

    rerender(React.createElement(TriStateCheckbox, { ...defaultProps, state: ESelectedStatus.SELECTED }));
    const selectedVisualCheckbox = screen.getByTestId('tri-state-checkbox').nextElementSibling;
    expect(selectedVisualCheckbox).toHaveClass('bg-primary-500');

    rerender(React.createElement(TriStateCheckbox, { ...defaultProps, state: ESelectedStatus.INTERMEDIATE }));
    const intermediateVisualCheckbox = screen.getByTestId('tri-state-checkbox').nextElementSibling;
    expect(intermediateVisualCheckbox).toHaveClass('bg-primary-500');
  });

  it(`${generateTestId(SRS_ID.PROTOCOL_CHECKBOX, 6)}: handles state transitions correctly`, async () => {
    const onChange = jest.fn();
    render(React.createElement(TriStateCheckbox, { ...defaultProps, onChange }));
    const checkbox = screen.getByTestId('tri-state-checkbox');
    
    // Click to select
    await act(async () => {
      fireEvent.click(checkbox);
    });
    expect(onChange).toHaveBeenCalledTimes(1);

    // Click to unselect
    await act(async () => {
      fireEvent.click(checkbox);
    });
    expect(onChange).toHaveBeenCalledTimes(2);
  });
});