import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../../ui/button';
import { Calendar } from '../../ui/calendar';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '../../ui/command';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../../ui/dropdown-menu';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../../ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
import { ScrollArea } from '../../ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastAction, ToastClose } from '../../ui/toast';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../../ui/tooltip';

const TestForm = () => {
  const form = useForm();
  return (
    <Form {...form}>
      <FormField
        name="username"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Username</FormLabel>
            <FormControl>
              <input {...field} />
            </FormControl>
            <FormDescription>Enter your username</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </Form>
  );
};

// Mock ResizeObserver
class ResizeObserver {
  observe() {
    // implementation for mock data
  }
  unobserve() {
    // implementation for mock data
  }
  disconnect() {
    // implementation for mock data
  }
}

beforeAll(() => {
  Element.prototype.scrollIntoView = jest.fn();
  window.ResizeObserver = ResizeObserver;
});

describe('UI Components', () => {
  describe('Calendar', () => {
    it('should render calendar with default props', () => {
      render(<Calendar mode="single" />);
      expect(screen.getByRole('grid')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /previous month/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /next month/i })).toBeInTheDocument();
    });

    it('should handle date selection', async () => {
      const onSelect = jest.fn();
      render(<Calendar mode="single" onSelect={onSelect} />);
      
      // Get the first available date button (skip navigation buttons)
      const dateButtons = screen.getAllByRole('button').filter(button => 
        !button.getAttribute('name')?.includes('month')
      );
      
      if (dateButtons.length > 0) {
        fireEvent.click(dateButtons[0]);
        await waitFor(() => {
          expect(onSelect).toHaveBeenCalled();
        });
      }
    });

    it('should handle month navigation', () => {
      render(<Calendar mode="single" />);
      const nextMonthButton = screen.getByRole('button', { name: /next month/i });
      fireEvent.click(nextMonthButton);
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });

  });

  describe('Command', () => {
    it('should render command dialog', async () => {
      render(
        <CommandDialog open>
          <CommandInput placeholder="Type a command..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Suggestions">
              <CommandItem>Calendar</CommandItem>
              <CommandItem>Search</CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Settings">
              <CommandItem>Profile</CommandItem>
              <CommandItem>Settings</CommandItem>
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      );
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Type a command...')).toBeInTheDocument();
      });
    });
  });

  describe('Dialog', () => {
    it('should render dialog with content', () => {
      render(
        <Dialog>
          <DialogTrigger>Open Dialog</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dialog Title</DialogTitle>
              <DialogDescription>Dialog Description</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
      const trigger = screen.getByText('Open Dialog');
      fireEvent.click(trigger);
      expect(screen.getByText('Dialog Title')).toBeInTheDocument();
      expect(screen.getByText('Dialog Description')).toBeInTheDocument();
    });
  });

  describe('DropdownMenu', () => {
    it('should render dropdown menu with items', async () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
      
      await waitFor(() => {
        expect(screen.getByText('My Account')).toBeInTheDocument();
        expect(screen.getByText('Profile')).toBeInTheDocument();
      });
    });

    it('should handle menu item click', async () => {
      const onSelect = jest.fn();
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={onSelect}>Click Me</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
      
      await waitFor(() => {
        const menuItem = screen.getByText('Click Me');
        fireEvent.click(menuItem);
        expect(onSelect).toHaveBeenCalled();
      });
    });

  });

  describe('Form', () => {
    it('should render form with fields', () => {
      render(<TestForm />);
      expect(screen.getByLabelText('Username')).toBeInTheDocument();
      expect(screen.getByText('Enter your username')).toBeInTheDocument();
    });
  });

  describe('Popover', () => {
    it('should render popover with content', () => {
      render(
        <Popover>
          <PopoverTrigger>Open Popover</PopoverTrigger>
          <PopoverContent>Popover Content</PopoverContent>
        </Popover>
      );
      const trigger = screen.getByText('Open Popover');
      fireEvent.click(trigger);
      expect(screen.getByText('Popover Content')).toBeInTheDocument();
    });
  });

  describe('ScrollArea', () => {
    it('should render scroll area with content', () => {
      render(
        <ScrollArea className="h-[200px] w-[350px] rounded-md border p-4">
          <div className="space-y-4">
            <h4 className="text-sm font-medium leading-none">Scroll Area</h4>
            <p className="text-sm text-muted-foreground">
              This is a scroll area component.
            </p>
          </div>
        </ScrollArea>
      );
      expect(screen.getByText('Scroll Area')).toBeInTheDocument();
    });
  });

  describe('Select', () => {
    it('should render select with options', async () => {
      render(
        <Select>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1" data-testid="option-1">Option 1</SelectItem>
            <SelectItem value="option2" data-testid="option-2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      );
      const trigger = screen.getByTestId('select-trigger');
      fireEvent.click(trigger);
      
      await waitFor(() => {
        expect(screen.getByTestId('option-1')).toBeInTheDocument();
        expect(screen.getByTestId('option-2')).toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('should handle disabled options', async () => {
      render(
        <Select>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1" disabled data-testid="disabled-option">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );
      const trigger = screen.getByTestId('select-trigger');
      fireEvent.click(trigger);
      
      await waitFor(() => {
        const option = screen.getByTestId('disabled-option');
        expect(option).toHaveAttribute('data-disabled');
        expect(option).toHaveClass('data-[disabled]:pointer-events-none');
      });
    });

    it('should handle custom trigger size', () => {
      render(
        <Select>
          <SelectTrigger size="sm" data-testid="select-trigger">
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );
      
      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toHaveAttribute('data-size', 'sm');
    });
  });

  describe('Tooltip', () => {
    it('renders tooltip with trigger and content', async () => {
      render(
        <TooltipProvider>
          <Tooltip defaultOpen>
            <TooltipTrigger>Hover me</TooltipTrigger>
            <TooltipContent data-testid="tooltip-content-1">Tooltip content 1</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      expect(screen.getByText('Hover me')).toBeInTheDocument();
      expect(screen.getByTestId('tooltip-content-1')).toBeInTheDocument();
    });

    it('renders with custom className', async () => {
      render(
        <TooltipProvider>
          <Tooltip defaultOpen>
            <TooltipTrigger>Hover me</TooltipTrigger>
            <TooltipContent className="custom-class" data-testid="tooltip-content-2">
              Tooltip content 2
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      const tooltipContent = screen.getByTestId('tooltip-content-2');
      expect(tooltipContent).toHaveClass('custom-class');
    });

    it('renders with custom sideOffset', async () => {
      render(
        <TooltipProvider>
          <Tooltip defaultOpen>
            <TooltipTrigger>Hover me</TooltipTrigger>
            <TooltipContent 
              sideOffset={10} 
              data-testid="tooltip-content-3"
              className="test-tooltip"
            >
              Tooltip content 3
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      const tooltipContent = screen.getByTestId('tooltip-content-3');
      expect(tooltipContent).toHaveClass('animate-in');
      expect(tooltipContent).toHaveClass('fade-in-0');
      expect(tooltipContent).toHaveClass('zoom-in-95');
    });

    it('renders trigger with children', () => {
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <button data-testid="tooltip-trigger-button">Click me</button>
            </TooltipTrigger>
            <TooltipContent>Content</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      const button = screen.getByTestId('tooltip-trigger-button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Click me');
    });

    it('renders content with children', async () => {
      const uniqueId = 'unique-tooltip-content';
      const uniqueText = 'Unique tooltip text content';
      render(
        <TooltipProvider>
          <Tooltip defaultOpen>
            <TooltipTrigger>Hover me</TooltipTrigger>
            <TooltipContent data-testid={uniqueId}>
              <span data-testid="tooltip-text-content">{uniqueText}</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      const tooltipContent = screen.getByTestId(uniqueId);
      const textElements = within(tooltipContent).getAllByTestId('tooltip-text-content');
      expect(textElements.length).toBeGreaterThan(0);
      expect(textElements[0]).toHaveTextContent(uniqueText);
    });

    it('renders with arrow', async () => {
      render(
        <TooltipProvider>
          <Tooltip defaultOpen>
            <TooltipTrigger>Hover me</TooltipTrigger>
            <TooltipContent data-testid="tooltip-content-4">
              Tooltip content 4
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      const tooltipContent = screen.getByTestId('tooltip-content-4');
      const arrow = tooltipContent.querySelector('.bg-primary');
      expect(arrow).toBeInTheDocument();
    });

    it('applies default styling classes', async () => {
      render(
        <TooltipProvider>
          <Tooltip defaultOpen>
            <TooltipTrigger>Hover me</TooltipTrigger>
            <TooltipContent data-testid="tooltip-content-5">
              Tooltip content 5
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      const tooltipContent = screen.getByTestId('tooltip-content-5');
      expect(tooltipContent).toHaveClass('bg-primary');
      expect(tooltipContent).toHaveClass('text-primary-foreground');
      expect(tooltipContent).toHaveClass('rounded-md');
      expect(tooltipContent).toHaveClass('px-3');
      expect(tooltipContent).toHaveClass('py-1.5');
      expect(tooltipContent).toHaveClass('text-xs');
    });
  });
});

describe('Toast Variants', () => {
  const ToastWrapper = ({ children }: { children: React.ReactNode }) => (
    <ToastProvider>
      {children}
      <ToastViewport data-testid="toast-viewport" />
    </ToastProvider>
  );

  beforeEach(() => {
    // Clear any existing toasts
    document.body.innerHTML = '';
  });

  it('should show success toast', async () => {
    render(
      <ToastWrapper>
        <Toast data-testid="success-toast" variant="default">
          <ToastTitle>Operation successful</ToastTitle>
        </Toast>
      </ToastWrapper>
    );

    const toast = screen.getByTestId('success-toast');
    expect(toast).toBeInTheDocument();
    expect(toast).toHaveClass('border-l-2');
    expect(screen.getByText('Operation successful')).toBeInTheDocument();
  });

  it('should show error toast', async () => {
    render(
      <ToastWrapper>
        <Toast data-testid="error-toast" variant="destructive">
          <ToastTitle>Operation failed</ToastTitle>
        </Toast>
      </ToastWrapper>
    );

    const toast = screen.getByTestId('error-toast');
    expect(toast).toBeInTheDocument();
    expect(toast).toHaveClass('bg-destructive');
    expect(toast).toHaveClass('text-destructive-foreground');
    expect(screen.getByText('Operation failed')).toBeInTheDocument();
  });

  it('should show warning toast', async () => {
    render(
      <ToastWrapper>
        <Toast data-testid="warning-toast" variant="warning">
          <ToastTitle>Warning message</ToastTitle>
        </Toast>
      </ToastWrapper>
    );

    const toast = screen.getByTestId('warning-toast');
    expect(toast).toBeInTheDocument();
    expect(toast).toHaveClass('bg-warning');
    expect(toast).toHaveClass('text-warning-foreground');
    expect(screen.getByText('Warning message')).toBeInTheDocument();
  });

  it('should handle toast with description', () => {
    render(
      <ToastWrapper>
        <Toast data-testid="toast-with-description">
          <ToastTitle>Title</ToastTitle>
          <ToastDescription>Description text</ToastDescription>
        </Toast>
      </ToastWrapper>
    );

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description text')).toBeInTheDocument();
  });

  it('should handle toast with action', () => {
    const handleAction = jest.fn();
    render(
      <ToastWrapper>
        <Toast data-testid="toast-with-action">
          <ToastTitle>Action Toast</ToastTitle>
          <ToastAction 
            onClick={handleAction} 
            data-testid="toast-action"
            altText="Perform action"
          >
            Action
          </ToastAction>
        </Toast>
      </ToastWrapper>
    );

    const actionButton = screen.getByTestId('toast-action');
    fireEvent.click(actionButton);
    expect(handleAction).toHaveBeenCalled();
  });

  it('should handle toast close', () => {
    const handleOpenChange = jest.fn();
    render(
      <ToastWrapper>
        <Toast 
          data-testid="toast-with-close" 
          onOpenChange={handleOpenChange}
        >
          <ToastTitle>Closeable Toast</ToastTitle>
          <ToastClose data-testid="toast-close" />
        </Toast>
      </ToastWrapper>
    );

    const closeButton = screen.getByTestId('toast-close');
    fireEvent.click(closeButton);
    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });

}); 