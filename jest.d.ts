/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

declare namespace jest {
  interface Matchers<R> {
    toBeInTheDocument(): R
    toHaveValue(value: string | string[] | number): R
    toBeVisible(): R
    toBeDisabled(): R
    toHaveClass(className: string): R
    toHaveAttribute(attr: string, value?: string): R
  }
} 