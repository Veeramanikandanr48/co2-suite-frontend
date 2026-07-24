import React from "react";
import * as Icons from "lucide-react";
import { Folder } from "lucide-react";

interface DynamicIconProps extends Omit<React.SVGProps<SVGSVGElement>, "name"> {
  name?: string | null;
  className?: string;
  size?: number;
}

/**
 * Dynamic O(1) Icon Resolver mapping Lucide icon names to React SVG components.
 */
export const DynamicIcon: React.FC<DynamicIconProps> = ({
  name,
  className = "w-4 h-4",
  size = 18,
  ...props
}) => {
  if (!name) return <Folder className={className} size={size} {...props} />;

  // Normalize icon key to PascalCase if needed
  const normalizedKey = name.trim();
  const IconComponent = (Icons as unknown as Record<string, React.FC<Icons.LucideProps>>)[normalizedKey];

  if (!IconComponent) {
    return <Folder className={className} size={size} {...props} />;
  }

  return <IconComponent className={className} size={size} {...props} />;
};
