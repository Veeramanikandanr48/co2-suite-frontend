import '@testing-library/jest-dom';
import { render, screen, within } from '@testing-library/react';
import React from 'react';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../../ui/tooltip';

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
