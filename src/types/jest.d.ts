import '@testing-library/jest-dom'

declare global {
  namespace jest {
    interface Mock<T = unknown> {
      mockResolvedValueOnce(value: T): this
      mockRejectedValueOnce(value: unknown): this
    }
  }
} 