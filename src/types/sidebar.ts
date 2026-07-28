import { MasterRole } from "@/enums/base-enum";

interface SidebarChildItem {
  name: string;
  href: string;
  roles?: MasterRole[];
}
  
type SidebarItemType = {
  name: string;
  href: string;
  icon?: string | null;
  isActive?: boolean;
  roles?: MasterRole[];
  child?: SidebarItemType[];
  parentHref?: string;
};

interface SidebarItemProps {
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

export type {
  SidebarChildItem,
  SidebarItemType,
  SidebarItemProps
};