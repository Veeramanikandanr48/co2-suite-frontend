import { Metadata } from 'next';
import { ProfileView } from '@/components/profile/profile-view';

export const metadata: Metadata = {
  title: 'Profile | CO2 Suite',
  description: 'Manage your user profile and account preferences.',
};

export default function ProfilePage() {
  return <ProfileView />;
}
