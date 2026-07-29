import { Metadata } from 'next';
import { FacilitiesView } from '@/components/facilities/facilities-view';

export const metadata: Metadata = {
  title: 'Manage Account - Facilities | CO2 Suite',
  description: 'Manage and monitor all your facilities in one place.',
};

export default function ManageAccountPage() {
  return <FacilitiesView />;
}
