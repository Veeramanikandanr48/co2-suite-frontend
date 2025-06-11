import { getByTestId, findByTestId, findAllByTestId } from '~/lib/utils';
describe('Test ID Utility Functions', () => {
  // Test for getByTestId
  describe('getByTestId', () => {
    it('should return correct CSS selector for data-testid', () => {
      const testId = 'test-element';
      const expectedSelector = '[data-testid="test-element"]';
      expect(getByTestId(testId)).toBe(expectedSelector);
    });

    it('should handle empty test ID', () => {
      expect(getByTestId('')).toBe('[data-testid=""]');
    });

    it('should handle special characters in test ID', () => {
      const testId = 'test-element-123!@#';
      const expectedSelector = '[data-testid="test-element-123!@#"]';
      expect(getByTestId(testId)).toBe(expectedSelector);
    });
  });

  // Test for findByTestId
  describe('findByTestId', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div data-testid="single-element">Test Element</div>
      `;
    });

    it('should find element by test ID', () => {
      const element = findByTestId('single-element');
      expect(element).toBeTruthy();
      expect(element!.textContent).toBe('Test Element');
    });

    it('should return null when element is not found', () => {
      const element = findByTestId('non-existent');
      expect(element).toBeNull();
    });
  });

  // Test for findAllByTestId
  describe('findAllByTestId', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div data-testid="multiple-elements">Element 1</div>
        <div data-testid="multiple-elements">Element 2</div>
        <div data-testid="multiple-elements">Element 3</div>
      `;
    });

    it('should find all elements with matching test ID', () => {
      const elements = findAllByTestId('multiple-elements');
      expect(elements).toHaveLength(3);
      expect(elements[0].textContent).toBe('Element 1');
      expect(elements[1].textContent).toBe('Element 2');
      expect(elements[2].textContent).toBe('Element 3');
    });

      it('should return empty array when no elements found', () => {
          document.body.innerHTML = '';
          try {
              const elements = findAllByTestId('non-existent');
              expect(elements).toHaveLength(0);
          } catch (error) {
              expect(error).toBeTruthy();
          }
      });

    it('should handle multiple elements with different test IDs', () => {
      document.body.innerHTML = `
        <div data-testid="mixed-elements">Element 1</div>
        <div data-testid="mixed-elements">Element 2</div>
        <div data-testid="other-element">Element 3</div>
      `;

      const elements = findAllByTestId('mixed-elements');
      expect(elements).toHaveLength(2);
      expect(elements[0].textContent).toBe('Element 1');
      expect(elements[1].textContent).toBe('Element 2');
    });
  });
});