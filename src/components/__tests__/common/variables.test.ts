import {
  DATE_OPTIONS,
  SHORT_DATE_OPTIONS,
  FORM_DEFAULT_VALUES,
  FORM_FILL_VALUES,
  FILE_UPLOAD_CONFIG
} from '~/lib/variables';
import { UploadType } from '~/enums/base-enum';

describe('Variables', () => {
  describe('DATE_OPTIONS', () => {
    it('should have correct date format options', () => {
      expect(DATE_OPTIONS).toEqual({
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    });
  });

  describe('SHORT_DATE_OPTIONS', () => {
    it('should have correct short date format options', () => {
      expect(SHORT_DATE_OPTIONS).toEqual({
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    });
  });

  describe('FORM_DEFAULT_VALUES', () => {
    it('should have correct default values for payment information', () => {
      expect(FORM_DEFAULT_VALUES.paymentInformation).toEqual({
        profilePicture: undefined,
        attachments: [],
      });
    });

    it('should have correct default values for PACS configuration', () => {
      expect(FORM_DEFAULT_VALUES.pacsConfiguration).toEqual({
        ipAddress: '',
        port: '',
        aeTitle: '',
      });
    });

    it('should have correct default values for room configuration', () => {
      expect(FORM_DEFAULT_VALUES.roomConfiguration).toEqual({
        name: '',
        description: '',
        ipAddress: '',
        port: '',
        aeTitle: '',
      });
    });

    it('should have correct default values for user form', () => {
      expect(FORM_DEFAULT_VALUES.userForm).toEqual({
        firstName: '',
        lastName: '',
        userId: '',
        email: '',
        password: '',
        confirmPassword: '',
        roleId: 4,
        profilePicture: undefined,
      });
    });

    it('should have correct default values for room name', () => {
      expect(FORM_DEFAULT_VALUES.roomName).toEqual({
        name: '',
        contextRoomValue: [],
      });
    });

    it('should have correct default values for USG configuration', () => {
      expect(FORM_DEFAULT_VALUES.usgConfiguration).toEqual({
        usgName: '',
        usgDescription: '',
        usgIp: '',
        usgPort: '',
        usgAeTitle: '',
        roomId: 0,
        usgId: 0,
      });
    });

    it('should have correct default values for blackbox configuration', () => {
      expect(FORM_DEFAULT_VALUES.blackboxConfiguration).toEqual({
        blackboxName: '',
        blackboxDescription: '',
        blackboxIp: '',
        blackboxPort: '',
        blackboxAeTitle: '',
        roomId: 0,
        blackboxId: 0,
      });
    });

    it('should have correct default values for login form', () => {
      expect(FORM_DEFAULT_VALUES.loginForm).toEqual({
        username: '',
        password: '',
      });
    });

    it('should have correct default values for role form', () => {
      expect(FORM_DEFAULT_VALUES.roleForm).toEqual({
        roleName: '',
        description: '',
        permissions: {},
      });
    });

    it('should have correct default values for workflow configuration', () => {
      expect(FORM_DEFAULT_VALUES.workflowConfiguration).toEqual({
        name: '',
        description: '',
        contextWorkFlowValue: [],
      });
    });
  });

  describe('FORM_FILL_VALUES', () => {
    it('should have correct fill values for payment information', () => {
      expect(FORM_FILL_VALUES.paymentInformation).toEqual({
        bankName: 'Bank of America',
        accountName: 'John Doe',
        email: 'john.doe@example.com',
        additionalNotes: 'This is a test note',
        profilePicture: 'https://via.placeholder.com/150',
        customInputs: [
          { key: 'customInput1', value: 'Custom Input 1' },
          { key: 'customInput2', value: 'Custom Input 2' },
        ],
        date: '2021-01-01',
      });
    });

  });

  describe('FILE_UPLOAD_CONFIG', () => {
    it('should have correct configuration for profile picture upload', () => {
      expect(FILE_UPLOAD_CONFIG[UploadType.PROFILE_PICTURE]).toEqual({
        maxSize: 5 * 1024 * 1024, // 5MB
        supportedTypes: ['image/jpeg', 'image/png','image/jpg'],
        maxFiles: 1,
      });
    });

    it('should have correct configuration for attachment upload', () => {
      expect(FILE_UPLOAD_CONFIG[UploadType.ATTACHMENT]).toEqual({
        maxSize: 5 * 1024 * 1024, // 5MB
        supportedTypes: [
          'image/jpeg',
          'image/png',
          'image/jpg',
          'application/pdf',
        ],
        maxFiles: 5
      });
    });
  });
}); 