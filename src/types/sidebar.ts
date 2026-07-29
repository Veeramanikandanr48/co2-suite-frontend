import { MasterRole } from "@/types/enums";

export interface WorkspaceLogo {
  id: string;
  name: string;
  plan: string;
  iconBg: string;
  icon: React.ReactNode;
}

export interface SidebarChildItem {
  name: string;
  href: string;
  roles?: MasterRole[];
}

export type SidebarItemType = {
  name: string;
  href: string;
  icon?: string | null;
  isActive?: boolean;
  roles?: MasterRole[];
  child?: SidebarItemType[];
  parentHref?: string;
};

export interface SidebarItemProps {
  item: {
    name: string;
    href: string;
    icon?: string | null;
    child?: { name: string; href: string }[];
  };
  isOpen: boolean;
  setOpenMenu: React.Dispatch<React.SetStateAction<string | null>>;
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}