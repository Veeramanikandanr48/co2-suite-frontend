import { describe, it, expect } from '@jest/globals';
import {
    LoginFormSchema,
    UserFormSchema,
} from '~/lib/schemas';

describe('LoginFormSchema', () => {
    it('validates a correct login payload', () => {
        const result = LoginFormSchema.safeParse({
            username: 'admin@example.com',
            password: 'Password123!',
        });
        expect(result.success).toBe(true);
    });

    it('fails when username is invalid email', () => {
        const result = LoginFormSchema.safeParse({
            username: 'invalid-email',
            password: 'Password123!',
        });
        expect(result.success).toBe(false);
    });

    it('fails when password is missing', () => {
        const result = LoginFormSchema.safeParse({
            username: 'admin@example.com',
            password: '',
        });
        expect(result.success).toBe(false);
    });
});

describe('UserFormSchema', () => {
    it('validates a correct user payload', () => {
        const result = UserFormSchema.safeParse({
            name: 'John Doe',
            email: 'john@example.com',
            roleId: 1,
            description: 'Sample description',
        });
        expect(result.success).toBe(true);
    });

    it('fails when name is missing', () => {
        const result = UserFormSchema.safeParse({
            name: '',
            email: 'john@example.com',
            roleId: 1,
        });
        expect(result.success).toBe(false);
    });
});