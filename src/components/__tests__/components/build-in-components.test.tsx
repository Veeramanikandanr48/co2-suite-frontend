import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import BaseButton from '../../reusables/base-button';
import React from 'react';
import { baseButtonTestIds } from '../../test-ids/common.ids';

describe('BaseButton Component', () => {
  it('should render button with default props', () => {
    render(<BaseButton>Click me</BaseButton>);
    const button = screen.getByTestId(baseButtonTestIds.button);
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('flex gap-2 font-bold rounded-sm h-[38px] text-sm px-8 py-[7px]');
  });

  it('should render button with custom className', () => {
    render(<BaseButton className="custom-class">Click me</BaseButton>);
    const button = screen.getByTestId(baseButtonTestIds.button);
    expect(button).toHaveClass('custom-class');
  });

  it('should render loading state', () => {
    render(<BaseButton loading>Click me</BaseButton>);
    const button = screen.getByTestId(baseButtonTestIds.button);
    expect(button).toBeDisabled();
    expect(screen.getByTestId(baseButtonTestIds.loadingText)).toHaveTextContent('Loading');
    expect(screen.getByTestId(baseButtonTestIds.loadingSpinner)).toBeInTheDocument();
  });

  it('should render loading state with custom text', () => {
    render(<BaseButton loading loadingText="Please wait...">Click me</BaseButton>);
    expect(screen.getByTestId(baseButtonTestIds.loadingText)).toHaveTextContent('Please wait...');
  });

  it('should handle click events', () => {
    const handleClick = jest.fn();
    render(<BaseButton onClick={handleClick}>Click me</BaseButton>);
    const button = screen.getByTestId(baseButtonTestIds.button);
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should render different button types', () => {
    const { rerender } = render(<BaseButton type="submit">Submit</BaseButton>);
    expect(screen.getByTestId(baseButtonTestIds.button)).toHaveAttribute('type', 'submit');

    rerender(<BaseButton type="reset">Reset</BaseButton>);
    expect(screen.getByTestId(baseButtonTestIds.button)).toHaveAttribute('type', 'reset');

    rerender(<BaseButton type="button">Button</BaseButton>);
    expect(screen.getByTestId(baseButtonTestIds.button)).toHaveAttribute('type', 'button');
  });

}); 