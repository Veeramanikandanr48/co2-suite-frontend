// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock window.URL.createObjectURL
window.URL.createObjectURL = jest.fn()
window.URL.revokeObjectURL = jest.fn()

// Mock document.createElement
document.createElement = jest.fn(() => ({
  href: '',
  download: '',
  click: jest.fn(),
})) 