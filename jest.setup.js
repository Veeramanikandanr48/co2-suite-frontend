// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock window.URL.createObjectURL
window.URL.createObjectURL = jest.fn()
window.URL.revokeObjectURL = jest.fn()

const originalCreateElement = document.createElement.bind(document);
document.createElement = jest.fn((tagName, options) => {
  const element = originalCreateElement(tagName, options);
  if (tagName && tagName.toLowerCase() === 'a') {
    element.click = jest.fn();
  }
  return element;
}); 