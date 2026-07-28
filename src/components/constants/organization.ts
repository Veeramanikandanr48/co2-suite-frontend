import { OnboardOrganizationPayload, EditOrganizationPayload } from "@/types/organizations";

export const INITIAL_ONBOARD_FORM: OnboardOrganizationPayload = {
  name: '',
  code: '',
  contactEmail: '',
  emailDomain: '',
  adminUserName: '',
  adminEmail: '',
  adminPassword: '',
  adminFirstName: '',
  adminLastName: '',
};

export const INITIAL_EDIT_FORM: EditOrganizationPayload = {
  name: '',
  code: '',
  contactEmail: '',
  emailDomain: '',
  phone: '',
  website: '',
  address: '',
  city: '',
  state: '',
  country: '',
  postalCode: '',
  taxId: '',
  industry: '',
  timezone: 'UTC',
  isActive: true,
};
