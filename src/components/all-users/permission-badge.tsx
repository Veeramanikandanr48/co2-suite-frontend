import { PermissionBadgeProps } from "~/types/users";

export const PermissionBadge = ({ permission, isDisabled = false }: PermissionBadgeProps) => {
    return (
        <div className="flex flex-col w-8 h-[17px] justify-center">
            <span 
                className={`h-[17px] w-[32px] rounded-[2px] text-[10px] leading-[15px] font-normal flex items-center justify-center ${isDisabled ? "bg-gray-200 text-gray-400" : ""}`}
                style={{ 
                    backgroundColor: isDisabled ? undefined : permission.color,
                    color: permission.textColor ?? 'black'
                }}
                title={permission.code}
            >
                {permission.code}
            </span>
        </div>
    );
};