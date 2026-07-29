export interface UserFormData {
  id?: number;
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  roleId?: number;
  [key: string]: any;
}

export interface CompanyModalData {
  id?: number;
  name: string;
  code?: string;
  country?: string;
  contactEmail: string;
  contactPhone?: string;
  emailDomain?: string;
  allowedDomains?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  taxId?: string;
  industry?: string;
  timezone?: string;
  [key: string]: any;
}

export interface UserCardData {
  id: number;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
  facilities: string;
  status: 'Active' | 'Inactive';
  role: string;
  roleId: number;
  isProtected?: boolean;
  [key: string]: any;
}
