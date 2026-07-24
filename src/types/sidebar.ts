interface SidebarChildItem {
  id?: number;
  itemKey?: string;
  name: string;
  href: string;
  group?: string;
  badge?: string;
  icon?: string | null;
  description?: string;
  itemType?: 'LINK' | 'MENU' | 'GROUP' | 'HEADER' | 'DIVIDER' | string;
  activeMatch?: string;
  disabled?: boolean;
  disabledReason?: string;
  target?: string;
}

type SidebarItemType = {
  id?: number;
  itemKey?: string;
  name: string;
  href: string;
  icon?: string | null;
  isActive?: boolean;
  badge?: string;
  child?: SidebarChildItem[];
  parentHref?: string;
  itemType?: 'LINK' | 'MENU' | 'GROUP' | 'HEADER' | 'DIVIDER' | string;
  activeMatch?: string;
  disabled?: boolean;
  disabledReason?: string;
  target?: string;
};

interface SidebarItemProps {
  item: SidebarItemType;
  isOpen: boolean;
  setOpenMenu: React.Dispatch<React.SetStateAction<string | null>>;
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>> | ((collapsed: boolean) => void);
}

export type {
  SidebarChildItem,
  SidebarItemType,
  SidebarItemProps
};