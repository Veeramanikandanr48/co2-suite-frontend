interface SidebarChildItem {
  name: string;
  href: string;
}
  
type SidebarItemType = {
  name: string;
  href: string;
  icon?: string | null;
  isActive?: boolean;
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