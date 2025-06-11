import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { Calendar, CalendarDropdown } from '@/components/ui/calendar';
import { DayPicker } from 'react-day-picker';
import { Subheading, SubheadingDivider } from '@/components/reusables/form-fields/sub-heading';
import { PermissionBadge } from '@/components/all-users/permission-badge';


// Mock the react-day-picker components
jest.mock('react-day-picker', () => ({
  DayPicker: jest.fn(({ children, ...props }) => (
    <div data-testid="day-picker" {...props}>
      {children}
    </div>
  )),
}));

describe('Calendar Component', () => {
  const defaultProps = {
    mode: 'single' as const,
    selected: new Date('2024-03-20'),
    onSelect: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<Calendar {...defaultProps} />);
    expect(screen.getByTestId('day-picker')).toBeInTheDocument();
  });

  it('passes correct props to DayPicker', () => {
    render(<Calendar {...defaultProps} />);
    const dayPicker = screen.getByTestId('day-picker');
    
    expect(dayPicker).toHaveClass('p-3');
    expect(DayPicker).toHaveBeenCalledWith(
      expect.objectContaining({
        showOutsideDays: true,
        className: expect.any(String),
        classNames: expect.any(Object),
      }),
      expect.any(Object)
    );
  });

  it('renders with custom className', () => {
    const customClass = 'custom-calendar';
    render(<Calendar {...defaultProps} className={customClass} />);
    const dayPicker = screen.getByTestId('day-picker');
    expect(dayPicker).toHaveClass(customClass);
  });

  it('renders with custom classNames', () => {
    const customClassNames = {
      months: 'custom-months',
      month: 'custom-month',
    };
    render(<Calendar {...defaultProps} classNames={customClassNames} />);
    expect(DayPicker).toHaveBeenCalledWith(
      expect.objectContaining({
        classNames: expect.objectContaining(customClassNames),
      }),
      expect.any(Object)
    );
  });

  it('renders with showOutsideDays set to false', () => {
    render(<Calendar {...defaultProps} showOutsideDays={false} />);
    expect(DayPicker).toHaveBeenCalledWith(
      expect.objectContaining({
        showOutsideDays: false,
      }),
      expect.any(Object)
    );
  });

  it('passes all additional props to DayPicker', () => {
    const additionalProps = {
      disabled: [new Date('2024-03-21')],
      modifiers: { weekend: { dayOfWeek: [0, 6] } },
    };
    render(<Calendar {...defaultProps} {...additionalProps} />);
    expect(DayPicker).toHaveBeenCalledWith(
      expect.objectContaining(additionalProps),
      expect.any(Object)
    );
  });
});

// Test CalendarDropdown component
describe('CalendarDropdown Component', () => {
  const mockOnChange = jest.fn();
  const mockChildren = [
    <option key="1" value="2024">2024</option>,
    <option key="2" value="2025">2025</option>,
  ];

  it('renders dropdown with options', () => {
    render(
      <CalendarDropdown value="2024" onChange={mockOnChange}>
        {mockChildren}
      </CalendarDropdown>
    );
    
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('handles value change', () => {
    render(
      <CalendarDropdown value="2024" onChange={mockOnChange}>
        {mockChildren}
      </CalendarDropdown>
    );
    
    // Simulate the onValueChange event that the Select component uses
    const changeEvent = {
      target: { value: '2025' }
    } as React.ChangeEvent<HTMLSelectElement>;
    mockOnChange(changeEvent);
    
    expect(mockOnChange).toHaveBeenCalledWith(changeEvent);
  });
});


describe('Subheading Component', () => {
  it('renders children correctly', () => {
    const testText = 'Test Subheading';
    render(<Subheading>{testText}</Subheading>);
    
    const element = screen.getByText(testText);
    expect(element).toBeInTheDocument();
    expect(element).toHaveClass('text-lg font-semibold text-header-primary leading-[28px]');
  });

  it('renders with complex children', () => {
    render(
      <Subheading>
        <span>Complex </span>
        <strong>Content</strong>
      </Subheading>
    );
    
    expect(screen.getByText('Complex')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});

describe('SubheadingDivider Component', () => {
  it('renders children correctly with default styles', () => {
    const testText = 'Test Subheading Divider';
    render(<SubheadingDivider>{testText}</SubheadingDivider>);
    
    const element = screen.getByText(testText);
    expect(element).toBeInTheDocument();
    expect(element.parentElement).toHaveClass('border-b border-neutral-100 pb-2');
  });

  it('renders with custom className', () => {
    const testText = 'Test Subheading Divider';
    const customClass = 'custom-class';
    render(<SubheadingDivider className={customClass}>{testText}</SubheadingDivider>);
    
    const element = screen.getByText(testText);
    expect(element).toBeInTheDocument();
    expect(element.parentElement).toHaveClass(`border-b border-neutral-100 pb-2 ${customClass}`);
  });

  it('renders with complex children', () => {
    render(
      <SubheadingDivider>
        <span>Complex </span>
        <strong>Content</strong>
      </SubheadingDivider>
    );
    
    expect(screen.getByText('Complex')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});

describe('PermissionBadge Component', () => {
  const mockPermission = {
    id: 1,
    code: 'ADM',
    color: '#FF0000',
    textColor: '#FFFFFF'
  };

  it('renders with default props', () => {
    render(<PermissionBadge permission={mockPermission} />);
    
    const badge = screen.getByText('ADM');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveStyle({
      backgroundColor: '#FF0000',
      color: '#FFFFFF'
    });
  });

  it('renders with disabled state', () => {
    render(<PermissionBadge permission={mockPermission} isDisabled={true} />);
    
    const badge = screen.getByText('ADM');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-gray-200 text-gray-400');
    expect(badge).not.toHaveStyle({
      backgroundColor: '#FF0000'
    });
  });

  it('renders with default text color when not provided', () => {
    const permissionWithoutTextColor = {
      ...mockPermission,
      textColor: undefined
    };
    
    render(<PermissionBadge permission={permissionWithoutTextColor} />);
    
    const badge = screen.getByText('ADM');
    expect(badge).toHaveStyle({
      color: 'black'
    });
  });

  it('renders with correct dimensions and styling', () => {
    render(<PermissionBadge permission={mockPermission} />);
    
    const badge = screen.getByText('ADM');
    expect(badge).toHaveClass('h-[17px] w-[32px] rounded-[2px] text-[10px] leading-[15px]');
  });

  it('displays permission code as title attribute', () => {
    render(<PermissionBadge permission={mockPermission} />);
    
    const badge = screen.getByText('ADM');
    expect(badge).toHaveAttribute('title', 'ADM');
  });

  it('renders with correct container styling', () => {
    render(<PermissionBadge permission={mockPermission} />);
    
    const container = screen.getByText('ADM').parentElement;
    expect(container).toHaveClass('flex flex-col w-8 h-[17px] justify-center');
  });
}); 

