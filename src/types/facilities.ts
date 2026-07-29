export interface FacilityData {
  id?: number | string;
  name: string;
  latitude?: number | string;
  longitude?: number | string;
  address?: string;
  unLocode?: string;
  postCode?: string;
  countryCode?: string;
  createdOn?: string | Date;
  [key: string]: any;
}
