import { describe, it, expect } from '@jest/globals';
import {
    FORM_DEFAULT_VALUES,
    FORM_FILL_VALUES,
    REGEX,
} from '~/lib/variables';

describe('FORM_DEFAULT_VALUES', () => {
    it('contains default login form values', () => {
        expect(FORM_DEFAULT_VALUES.loginForm).toBeDefined();
        expect(FORM_DEFAULT_VALUES.loginForm.username).toBe('');
        expect(FORM_DEFAULT_VALUES.loginForm.password).toBe('');
    });

    it('contains default user form values', () => {
        expect(FORM_DEFAULT_VALUES.userForm).toBeDefined();
        expect(FORM_DEFAULT_VALUES.userForm.name).toBe('');
    });
});

describe('FORM_FILL_VALUES', () => {
    it('contains test user login fill values', () => {
        expect(FORM_FILL_VALUES.userLogin.username).toBeDefined();
    });
});

describe('REGEX', () => {
    it('validates email regex', () => {
        expect(REGEX.email.test('test@example.com')).toBe(true);
        expect(REGEX.email.test('invalid-email')).toBe(false);
    });

    it('validates mobileNumber regex', () => {
        expect(REGEX.mobileNumber.test('9876543210')).toBe(true);
        expect(REGEX.mobileNumber.test('12345')).toBe(false);
    });
});