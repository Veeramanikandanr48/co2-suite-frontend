interface Service {
  id: number;
  code: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  demoUrl: string;
  isActive: boolean;
  createdOn?: string;
}

interface OrganizationService {
  id: number;
  organizationId: number;
  serviceId: number;
  subscribedBy?: number;
  isActive: boolean;
  subscribedOn?: string;
  service: Service;
}

interface AssignServicesPayload {
  serviceIds: number[];
}

export type { Service, OrganizationService, AssignServicesPayload };
