import { momentFormat, parseJson, formatNumberWithCommas } from '~/lib/helpers';

type MockMomentTimezone = {
  default: {
    utc: jest.Mock;
  };
  __esModule: boolean;
  mockFormat: jest.Mock;
  mockTz: jest.Mock;
  mockUtc: jest.Mock;
};

jest.mock('moment-timezone', () => {
  const mockFormat = jest.fn().mockReturnValue('formatted time');
  const mockTz = jest.fn(() => ({ format: mockFormat }));
  const mockUtc = jest.fn(() => ({ tz: mockTz }));
  return {
    default: {
      utc: mockUtc,
    },
    __esModule: true,
    mockFormat,
    mockTz,
    mockUtc,
  };
});

// Suppress console errors during tests
beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

// Mock Intl.DateTimeFormat
const mockTimeZone = 'America/New_York';
jest.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions').mockReturnValue({
  timeZone: mockTimeZone,
} as Intl.ResolvedDateTimeFormatOptions);

describe('Helpers', () => {
  const { mockUtc, mockTz, mockFormat } = jest.requireMock<MockMomentTimezone>('moment-timezone');

  describe('momentFormat', () => {
    it('should format time with default format', () => {
      const result = momentFormat('2024-01-01T12:00:00Z');
      
      expect(mockUtc).toHaveBeenCalledWith('2024-01-01T12:00:00Z');
      expect(mockTz).toHaveBeenCalledWith(mockTimeZone);
      expect(mockFormat).toHaveBeenCalledWith('h:mm A');
      expect(result).toBe('formatted time');
    });

    it('should format time with custom format', () => {
      const result = momentFormat('2024-01-01T12:00:00Z', 'YYYY-MM-DD HH:mm:ss');
      
      expect(mockUtc).toHaveBeenCalledWith('2024-01-01T12:00:00Z');
      expect(mockTz).toHaveBeenCalledWith(mockTimeZone);
      expect(mockFormat).toHaveBeenCalledWith('YYYY-MM-DD HH:mm:ss');
      expect(result).toBe('formatted time');
    });
  });

  describe('formatNumberWithCommas', () => {
    it('should format whole numbers with commas and two decimal places', () => {
      const result = formatNumberWithCommas(1234567);
      expect(result).toBe('1,234,567.00');
      expect(formatNumberWithCommas(1000)).toBe('1,000.00');
      expect(formatNumberWithCommas(0)).toBe('0.00');
    });

    it('should format decimal numbers with commas and two decimal places', () => {
      expect(formatNumberWithCommas(1234567.89)).toBe('1,234,567.89');
      expect(formatNumberWithCommas(1000.1)).toBe('1,000.10');
      expect(formatNumberWithCommas(0.99)).toBe('0.99');
    });

    it('should handle negative numbers', () => {
      expect(formatNumberWithCommas(-1234567)).toBe('-1,234,567.00');
      expect(formatNumberWithCommas(-1000.1)).toBe('-1,000.10');
    });
  });

  describe('parseJson', () => {
    it('should parse valid JSON string', () => {
      const jsonString = '{"name": "John", "age": 30}';
      const result = parseJson(jsonString);
      
      expect(result).toEqual({ name: 'John', age: 30 });
    });

    it('should return original data if not a string', () => {
      const data = { name: 'John', age: 30 };
      const result = parseJson(data);
      
      expect(result).toEqual(data);
    });

    it('should handle invalid JSON string', () => {
      const invalidJson = '{name: John}';
      const result = parseJson(invalidJson);
      
      expect(result).toBe(invalidJson);
    });

    it('should handle empty string', () => {
      const result = parseJson('');
      
      expect(result).toBe('');
    });
  });
}); 