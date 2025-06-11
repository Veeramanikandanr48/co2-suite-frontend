import { describe, it, expect } from '@jest/globals';
import {
    fieldValidators,
    PacsConfigurationSchema,
    RoomConfigurationSchema,
    UsgConfigurationSchema,
    EditUserFormSchema,
    UploadResourceSchema,
    WorkflowConfigurationSchema,
    AnnotationAcronymSchema,
    LoginFormSchema,
    CreateRoleSchema
} from '~/lib/schemas';

// Add at the top with other imports
const TEST_PASSWORD = process.env.TEST_PASSWORD;
const TEST_PRIVATE_IP = process.env.TEST_PRIVATE_IP;
const TEST_PASSWORD_NO_UPPERCASE = process.env.TEST_PASSWORD_NO_UPPERCASE ?? 'test123!@#';
const TEST_PASSWORD_NO_LOWERCASE = process.env.TEST_PASSWORD_NO_LOWERCASE ?? 'TEST123!@#';
const TEST_PASSWORD_NO_NUMBER = process.env.TEST_PASSWORD_NO_NUMBER ?? 'Test!@#';
const TEST_PASSWORD_NO_SPECIAL = process.env.TEST_PASSWORD_NO_SPECIAL ?? 'Test123';
// Mock File and window for attachment/attachments tests
class MockFile {
    fileBits: BlobPart[];
    name: string;
    size: number;
    type: string;
    lastModified: number;
    webkitRelativePath: string = '';
    constructor(fileBits: BlobPart[] = [], fileName: string = 'mock.txt', options: { type?: string; lastModified?: number } = {}) {
        this.fileBits = fileBits;
        this.name = fileName;
        this.size = 0;
        this.type = options?.type ?? '';
        this.lastModified = options?.lastModified ?? Date.now();
    }
    slice() { return this; }
}

type FileConstructor = {
    new (fileBits: BlobPart[], fileName: string, options?: FilePropertyBag): File;
    prototype: File;
};

if (typeof globalThis.File === 'undefined') {
    globalThis.File = MockFile as unknown as FileConstructor;
}
if (typeof globalThis.window === 'undefined') {
    (globalThis as unknown as { window: Record<string, unknown> }).window = {};
}

describe('Field Validators', () => {
    describe('name', () => {
        it('should validate valid name', () => {
            expect(() => fieldValidators.name.parse('John')).not.toThrow();
        });

        it('should reject too short name', () => {
            expect(() => fieldValidators.name.parse('J')).toThrow();
        });

        it('should reject too long name', () => {
            expect(() => fieldValidators.name.parse('J'.repeat(51))).toThrow();
        });
    });

    describe('email', () => {
        it('should validate valid email', () => {
            expect(() => fieldValidators.email.parse('test@example.com')).not.toThrow();
        });

        it('should reject invalid email format', () => {
            expect(() => fieldValidators.email.parse('invalid-email')).toThrow();
        });

        it('should reject too short email', () => {
            expect(() => fieldValidators.email.parse('a@b')).toThrow();
        });
    });

    describe('password', () => {
        it('should validate valid password', () => {
            expect(() => fieldValidators.password.parse('Test123!@#')).not.toThrow();
        });

        it('should accept asterisk password', () => {
            expect(() => fieldValidators.password.parse('********')).not.toThrow();
        });

        it('should reject password without uppercase', () => {
            expect(() => fieldValidators.password.parse('test123!@#')).toThrow();
        });

        it('should reject password without lowercase', () => {
            expect(() => fieldValidators.password.parse('TEST123!@#')).toThrow();
        });

        it('should reject password without number', () => {
            expect(() => fieldValidators.password.parse('Test!@#')).toThrow();
        });

        it('should reject password without special character', () => {
            expect(() => fieldValidators.password.parse('Test123')).toThrow();
        });
    });
});

describe('PACS Configuration Schema', () => {

    it('should reject invalid IP address', () => {
        const invalidConfig = {
            ipAddress: TEST_PRIVATE_IP,
            port: '8080',
            aeTitle: 'TEST_AE'
        };
        expect(() => PacsConfigurationSchema.parse(invalidConfig)).toThrow();
    });

    it('should reject invalid port', () => {
        const invalidConfig = {
            ipAddress: TEST_PRIVATE_IP,
            port: '70000',
            aeTitle: 'TEST_AE'
        };
        expect(() => PacsConfigurationSchema.parse(invalidConfig)).toThrow();
    });
});

describe('Room Configuration Schema', () => {

    it('should reject missing required fields', () => {
        const invalidConfig = {
            name: 'Test Room'
        };
        expect(() => RoomConfigurationSchema.parse(invalidConfig)).toThrow('Required');
    });

    it('should reject invalid IP address', () => {
        const invalidConfig = {
            name: 'Test Room',
            description: 'Test Description',
            ipAddress: '256.256.256.256',
            port: '8080',
            aeTitle: 'TEST_AE'
        };
        expect(() => RoomConfigurationSchema.parse(invalidConfig)).toThrow('Invalid IP address format');
    });

    it('should reject invalid port', () => {
        const invalidConfig = {
            name: 'Test Room',
            description: 'Test Description',
            ipAddress: '0.0.0.0',
            port: '70000',
            aeTitle: 'TEST_AE'
        };
        expect(() => RoomConfigurationSchema.parse(invalidConfig)).toThrow('Port must be between 1 and 65535');
    });
});

describe('USG Configuration Schema', () => {
    it('should reject invalid IP address', () => {
        const invalidConfig = {
            usgName: 'Test USG',
            usgDescription: 'Test Description',
            usgIp: '256.256.256.256',
            usgPort: '8080',
            usgAeTitle: 'TEST_AE',
            roomId: 1
        };
        expect(() => UsgConfigurationSchema.parse(invalidConfig)).toThrow();
    });

    it('should reject invalid port', () => {
        const invalidConfig = {
            usgName: 'Test USG',
            usgDescription: 'Test Description',
            usgIp: TEST_PRIVATE_IP,
            usgPort: '70000',
            usgAeTitle: 'TEST_AE',
            roomId: 1
        };
        expect(() => UsgConfigurationSchema.parse(invalidConfig)).toThrow();
    });

    it('should reject missing required fields', () => {
        const invalidConfig = {
            usgName: 'Test USG',
            usgDescription: 'Test Description',
            roomId: 1
        };
        expect(() => UsgConfigurationSchema.parse(invalidConfig)).toThrow();
    });
});

describe('Edit User Form Schema', () => {
    it('should validate user data without password change', () => {
        const validUser = {
            firstName: 'John',
            lastName: 'Doe',
            userId: 'JD123',
            email: 'john@example.com',
            roleId: 1
        };
        expect(() => EditUserFormSchema.parse(validUser)).not.toThrow();
    });

    it('should validate user data with matching passwords', () => {
        const validUser = {
            firstName: 'John',
            lastName: 'Doe',
            userId: 'JD123',
            email: 'john@example.com',
            roleId: 1,
            password: TEST_PASSWORD,
            confirmPassword: TEST_PASSWORD
        };
        expect(() => EditUserFormSchema.parse(validUser)).not.toThrow();
    });

    it('should validate empty password fields', () => {
        const validUser = {
            firstName: 'John',
            lastName: 'Doe',
            userId: 'JD123',
            email: 'john@example.com',
            roleId: 1,
            password: '',
            confirmPassword: ''
        };
        expect(() => EditUserFormSchema.parse(validUser)).not.toThrow();
    });

    it('should reject password without uppercase', () => {
        const invalidUser = {
            firstName: 'John',
            lastName: 'Doe',
            userId: 'JD123',
            email: 'john@example.com',
            roleId: 1,
            password: TEST_PASSWORD_NO_UPPERCASE,
            confirmPassword: TEST_PASSWORD_NO_UPPERCASE
        };
        expect(() => EditUserFormSchema.parse(invalidUser)).toThrow('Password must contain at least one uppercase letter');
    });

    it('should reject password without lowercase', () => {
        const invalidUser = {
            firstName: 'John',
            lastName: 'Doe',
            userId: 'JD123',
            email: 'john@example.com',
            roleId: 1,
            password: TEST_PASSWORD_NO_LOWERCASE,
            confirmPassword: TEST_PASSWORD_NO_LOWERCASE
        };
        expect(() => EditUserFormSchema.parse(invalidUser)).toThrow('Password must contain at least one lowercase letter');
    });

    it('should reject password without number', () => {
        const invalidUser = {
            firstName: 'John',
            lastName: 'Doe',
            userId: 'JD123',
            email: 'john@example.com',
            roleId: 1,
            password: TEST_PASSWORD_NO_NUMBER,
            confirmPassword: TEST_PASSWORD_NO_NUMBER
        };
        expect(() => EditUserFormSchema.parse(invalidUser)).toThrow('Password must contain at least one number');
    });

    it('should reject password without special character', () => {
        const invalidUser = {
            firstName: 'John',
            lastName: 'Doe',
            userId: 'JD123',
            email: 'john@example.com',
            roleId: 1,
            password: TEST_PASSWORD_NO_SPECIAL,
            confirmPassword: TEST_PASSWORD_NO_SPECIAL
        };
        expect(() => EditUserFormSchema.parse(invalidUser)).toThrow('Password must contain at least one special character');
    });

    it('should reject mismatched passwords', () => {
        const invalidUser = {
            firstName: 'John',
            lastName: 'Doe',
            userId: 'JD123',
            email: 'john@example.com',
            roleId: 1,
            password: TEST_PASSWORD_NO_UPPERCASE,
            confirmPassword: TEST_PASSWORD_NO_LOWERCASE
        };
        expect(() => EditUserFormSchema.parse(invalidUser)).toThrow("Passwords don't match");
    });
});

describe('Upload Resource Schema', () => {
    it('should validate valid resource data', () => {
        const validResource = {
            name: 'Test Resource',
            description: 'Test Description',
            tags: ['test', 'resource', 'example'],
            attachments: [new File([], 'test.txt')]
        };
        expect(() => UploadResourceSchema.parse(validResource)).not.toThrow();
    });

    it('should reject resource without tags', () => {
        const invalidResource = {
            name: 'Test Resource',
            description: 'Test Description',
            tags: [],
            attachments: [new File([], 'test.txt')]
        };
        expect(() => UploadResourceSchema.parse(invalidResource)).toThrow();
    });

    it('should reject resource with too many tags', () => {
        const invalidResource = {
            name: 'Test Resource',
            description: 'Test Description',
            tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6'],
            attachments: [new File([], 'test.txt')]
        };
        expect(() => UploadResourceSchema.parse(invalidResource)).toThrow();
    });

    it('should reject resource with invalid name format', () => {
        const invalidResource = {
            name: '',  // Empty name should fail
            description: 'Test Description',
            tags: ['test'],
            attachments: [new File([], 'test.txt')]
        };
        expect(() => UploadResourceSchema.parse(invalidResource)).toThrow('Name is required');
    });

    it('should reject resource with name too long', () => {
        const invalidResource = {
            name: 'a'.repeat(101),  // Name longer than 100 characters
            description: 'Test Description',
            tags: ['test'],
            attachments: [new File([], 'test.txt')]
        };
        expect(() => UploadResourceSchema.parse(invalidResource)).toThrow('Name too long');
    });

    it('should reject resource with too many attachments', () => {
        const invalidResource = {
            name: 'Test Resource',
            description: 'Test Description',
            tags: ['test'],
            attachments: [new File([], 'test1.txt'), new File([], 'test2.txt')]
        };
        expect(() => UploadResourceSchema.parse(invalidResource)).toThrow('Maximum 1 files allowed');
    });
});

describe('Workflow Configuration Schema', () => {
    it('should validate valid workflow data', () => {
        const validWorkflow = {
            name: 'Test Workflow',
            description: 'Test Description',
            contextWorkFlowValue: []
        };
        expect(() => WorkflowConfigurationSchema.parse(validWorkflow)).not.toThrow();
    });

    it('should reject workflow with too short name', () => {
        const invalidWorkflow = {
            name: '',
            description: 'Test Description',
            contextWorkFlowValue: []
        };
        expect(() => WorkflowConfigurationSchema.parse(invalidWorkflow)).toThrow();
    });

    it('should reject workflow with too long description', () => {
        const invalidWorkflow = {
            name: 'Test Workflow',
            description: 'T'.repeat(256),
            contextWorkFlowValue: []
        };
        expect(() => WorkflowConfigurationSchema.parse(invalidWorkflow)).toThrow();
    });

    it('should reject workflow with invalid name format', () => {
        const invalidWorkflow = {
            name: 'Test@Workflow',
            description: 'Test Description',
            contextWorkFlowValue: []
        };
        expect(() => WorkflowConfigurationSchema.parse(invalidWorkflow)).toThrow('Workflow Name only contain letters, numbers, space or an underscore');
    });

    it('should reject workflow with duplicate name', () => {
        const invalidWorkflow = {
            name: 'Test Workflow',
            description: 'Test Description',
            contextWorkFlowValue: ['test workflow']
        };
        expect(() => WorkflowConfigurationSchema.parse(invalidWorkflow)).toThrow('Workflow name already exists');
    });
});

describe('Annotation Acronym Schema', () => {
    it('should validate valid acronym', () => {
        expect(() => AnnotationAcronymSchema.parse({ acronym: 'TEST123' })).not.toThrow();
    });

    it('should reject acronym with lowercase letters', () => {
        expect(() => AnnotationAcronymSchema.parse({ acronym: 'Test123' })).toThrow();
    });

    it('should reject acronym with special characters', () => {
        expect(() => AnnotationAcronymSchema.parse({ acronym: 'TEST@123' })).toThrow();
    });
});

describe('Login Form Schema', () => {

    it('should reject invalid email format', () => {
        const invalidLogin = {
            username: 'invalid-email',
            password: TEST_PASSWORD
        };
        expect(() => LoginFormSchema.parse(invalidLogin)).toThrow('Please enter a valid username');
    });

    it('should reject missing password', () => {
        const invalidLogin = {
            username: 'test@example.com'
        };
        expect(() => LoginFormSchema.parse(invalidLogin)).toThrow('Required');
    });

});

describe('Create Role Schema', () => {
    it('should validate valid role data', () => {
        const validRole = {
            roleName: 'Test Role',
            description: 'Test Description',
            permissions: [1, 2, 3]
        };
        expect(() => CreateRoleSchema.parse(validRole)).not.toThrow();
    });

    it('should reject role with too long name', () => {
        const invalidRole = {
            roleName: 'T'.repeat(21),
            description: 'Test Description',
            permissions: [1, 2, 3]
        };
        expect(() => CreateRoleSchema.parse(invalidRole)).toThrow();
    });

    it('should reject role with too long description', () => {
        const invalidRole = {
            roleName: 'Test Role',
            description: 'T'.repeat(256),
            permissions: [1, 2, 3]
        };
        expect(() => CreateRoleSchema.parse(invalidRole)).toThrow();
    });

    it('should reject role without permissions', () => {
        const invalidRole = {
            roleName: 'Test Role',
            description: 'Test Description'
        };
        expect(() => CreateRoleSchema.parse(invalidRole)).toThrow();
    });
});

describe('Other Field Validators', () => {
    it('should validate quantity > 0', () => {
        expect(() => fieldValidators.quantity.parse(1)).not.toThrow();
        expect(() => fieldValidators.quantity.parse(0)).toThrow();
    });
    it('should validate unitPrice > 0 and <= MAX_SAFE_INTEGER', () => {
        expect(() => fieldValidators.unitPrice.parse(1)).not.toThrow();
        expect(() => fieldValidators.unitPrice.parse(0)).toThrow();
        expect(() => fieldValidators.unitPrice.parse(Number.MAX_SAFE_INTEGER + 1)).toThrow();
    });
    it('should validate string', () => {
        expect(fieldValidators.string.parse('abc')).toBe('abc');
    });
    it('should validate stringMin1', () => {
        expect(() => fieldValidators.stringMin1.parse('')).toThrow();
        expect(fieldValidators.stringMin1.parse('a')).toBe('a');
    });
    it('should coerce stringToNumber', () => {
        expect(fieldValidators.stringToNumber.parse('123')).toBe(123);
    });
    it('should validate stringToNumberWithMax', () => {
        expect(fieldValidators.stringToNumberWithMax.parse('100')).toBe(100);
        expect(() => fieldValidators.stringToNumberWithMax.parse('1000001')).toThrow();
    });
    it('should allow stringOptional to be undefined or string', () => {
        expect(fieldValidators.stringOptional.parse(undefined)).toBeUndefined();
        expect(fieldValidators.stringOptional.parse('abc')).toBe('abc');
    });
    it('should validate nonNegativeNumber', () => {
        expect(fieldValidators.nonNegativeNumber.parse('0')).toBe(0);
        expect(() => fieldValidators.nonNegativeNumber.parse('-1')).toThrow();
    });
    it('should transform numWithCommas', () => {
        expect(fieldValidators.numWithCommas.parse('1234567')).toBe('1,234,567.00');
    });
    it('should validate termsAccepted', () => {
        expect(() => fieldValidators.termsAccepted.parse(true)).not.toThrow();
        expect(() => fieldValidators.termsAccepted.parse(false)).toThrow();
    });
    it('should validate paymentMethod', () => {
        expect(() => fieldValidators.paymentMethod.parse(1)).not.toThrow();
        expect(() => fieldValidators.paymentMethod.parse(0)).toThrow();
    });
    it('should validate roleId', () => {
        expect(() => fieldValidators.roleId.parse(1)).not.toThrow();
        expect(() => fieldValidators.roleId.parse(0)).toThrow();
    });
    it('should validate customInput as array of {key, value}', () => {
        expect(fieldValidators.customInput.parse([{ key: 'a', value: 'b' }])).toEqual([{ key: 'a', value: 'b' }]);
        expect(fieldValidators.customInput.parse(undefined)).toBeUndefined();
    });
    it('should validate attachment and attachments (with File mock)', () => {
        const file = new File([], 'test.txt');
        expect(fieldValidators.attachment.parse(file)).toBeInstanceOf(File);
        expect(fieldValidators.attachments.parse([file])).toEqual([file]);
    });
}); 