// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock window.URL.createObjectURL
window.URL.createObjectURL = jest.fn()
window.URL.revokeObjectURL = jest.fn()

// Preserve original document.createElement for React DOM while supporting download test mocks
const originalCreateElement = document.createElement.bind(document);
document.createElement = jest.fn((tagName, options) => {
  const el = originalCreateElement(tagName, options);
  if (tagName === 'a') {
    el.click = el.click || jest.fn();
  }
  return el;
}); 