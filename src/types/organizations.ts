export interface Organization {
  id: number;
  name: string;
  code: string;
  contactEmail: string;
  emailDomain?: string | null;
  phone?: string | null;
  website?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;
  taxId?: string | null;
  industry?: string | null;
  timezone?: string | null;
  isActive: boolean;
  createdBy?: number | null;
  createdOn?: string;
}

export interface TableOrganization extends Omit<Organization, 'id'> {
  id: string;
  rawId: number;
}

export interface OnboardOrganizationPayload {
  name: string;
  code: string;
  contactEmail: string;
  emailDomain?: string;
  adminUserName: string;
  adminEmail: string;
  adminPassword: string;
  adminFirstName?: string;
  adminLastName?: string;
}

export interface EditOrganizationPayload {
  name: string;
  code: string;
  contactEmail: string;
  emailDomain?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  taxId?: string;
  industry?: string;
  timezone?: string;
  isActive: boolean;
}

export interface OrgUser {
  id: number;
  firstName: string;
  lastName?: string;
  userName: string;
  email: string;
  roleId: number;
  roleName?: string;
  isActive: boolean;
  createdOn?: string;
}

export interface TableOrgUser extends Omit<OrgUser, 'id'> {
  id: string;
  rawId: number;
}

export interface FacilityItem {
  id: number | string;
  name: string;
  address?: string;
  countryCode?: string;
  postCode?: string;
  unLocode?: string;
  latitude?: string;
  longitude?: string;
  [key: string]: any;
}

export interface AddMemberFormState {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  password: string;
  roleId: number;
}

export interface FacilityFormState {
  name: string;
  address: string;
  countryCode: string;
  postCode: string;
  unLocode: string;
  latitude: string;
  longitude: string;
}
