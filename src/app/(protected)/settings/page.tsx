import { Metadata } from 'next';
import { SettingsView } from '@/components/settings/settings-view';

export const metadata: Metadata = {
  title: 'Settings | CO2 Suite',
  description: 'Manage application preferences, carbon accounting standards, and notifications.',
};

export default function SettingsPage() {
  return <SettingsView />;
}
