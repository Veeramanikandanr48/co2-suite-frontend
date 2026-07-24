import { useEffect, useState, useCallback } from "react";
import { apiService } from "@/lib/api-service";
import { API_LIST } from "@/lib/api-list";
import { sidebarList } from "@/components/constants/sidebar-list";
import { SidebarItemType } from "@/types/sidebar";
import { useAuth } from "@/context/auth-provider";

export interface ApiSidebarNode {
  id: number;
  itemKey: string;
  title: string;
  path?: string;
  icon?: string;
  itemType: 'LINK' | 'MENU' | 'GROUP' | 'HEADER' | 'DIVIDER';
  parentId?: number;
  sortOrder: number;
  permissionKey?: string;
  activeMatch?: string;
  target?: string;
  badge?: {
    type: string;
    value?: string;
  };
  disabled?: boolean;
  disabledReason?: string;
  children?: ApiSidebarNode[];
}

/**
 * Maps raw API nodes to frontend SidebarItemType structure.
 */
export function mapApiNodeToSidebarItem(node: ApiSidebarNode): SidebarItemType {
  return {
    id: node.id,
    itemKey: node.itemKey,
    name: node.title,
    href: node.path || "#",
    icon: node.icon || "Folder",
    badge: node.badge?.value || (node.badge?.type === 'BETA' ? 'BETA' : undefined),
    isActive: true,
    itemType: node.itemType,
    activeMatch: node.activeMatch,
    disabled: node.disabled,
    disabledReason: node.disabledReason,
    target: node.target || "_self",
    child: node.children
      ? node.children.map((child) => ({
          id: child.id,
          itemKey: child.itemKey,
          name: child.title,
          href: child.path || "#",
          icon: child.icon || "Circle",
          group: "Options",
          badge: child.badge?.value,
          itemType: child.itemType,
          activeMatch: child.activeMatch,
          disabled: child.disabled,
        }))
      : [],
  };
}

export function useSidebarMenu() {
  const { user, accessToken } = useAuth();
  const isAuthenticated = Boolean(user || accessToken);
  const [menuItems, setMenuItems] = useState<SidebarItemType[]>(sidebarList);
  const [rawNodes, setRawNodes] = useState<ApiSidebarNode[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMenu = useCallback(async () => {
    if (!isAuthenticated) {
      setMenuItems(sidebarList);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await apiService.get<ApiSidebarNode[]>(API_LIST.GET_MY_SIDEBAR_MENU);
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setRawNodes(res.data);
        const mapped = res.data.map(mapApiNodeToSidebarItem);
        setMenuItems(mapped);
        setError(null);
      } else {
        setMenuItems(sidebarList);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load menu";
      setError(msg);
      setMenuItems(sidebarList);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  return {
    menuItems,
    rawNodes,
    loading,
    error,
    refetch: fetchMenu,
  };
}
