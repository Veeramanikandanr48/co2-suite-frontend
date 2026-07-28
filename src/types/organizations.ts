interface Organization {
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

interface TableOrganization extends Omit<Organization, 'id'> {
  id: string;
  rawId: number;
}

interface OnboardOrganizationPayload {
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

interface EditOrganizationPayload {
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

export type {
  Organization,
  TableOrganization,
  OnboardOrganizationPayload,
  EditOrganizationPayload,
};
