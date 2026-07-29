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

export interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (user: UserFormData) => void;
  onSuccess?: () => void;
  userData?: UserFormData | null;
  initialData?: UserFormData | null;
  mode?: 'create' | 'edit';
  roles?: { id: number; name: string }[];
  isSubmitting?: boolean;
}

export interface CompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CompanyModalData) => void;
  companyData: CompanyModalData;
  isLoading?: boolean;
}

export interface CompanyData {
  id?: number;
  name?: string;
  code?: string;
  country?: string;
  contactEmail?: string;
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
  userCount?: number;
  adminCount?: number;
  facilityCount?: number;
  subscriptions?: any[];
  [key: string]: any;
}
