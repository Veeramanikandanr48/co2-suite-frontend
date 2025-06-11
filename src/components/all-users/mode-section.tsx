import { Mode } from "~/types/users";    
import { PermissionBadge } from "./permission-badge";

interface ModeSectionProps {
    mode: Mode;
    isDisabled?: boolean;
}

export const ModeSection = ({ mode, isDisabled = false }: ModeSectionProps) => {
    const renderPermissions = () => {
        if (isDisabled) {
            return (
                <div className="flex gap-2 justify-around min-h-[32px] items-center">
                    <span className="text-gray-400 text-center text-2xl w-[32px]">-</span>
                </div>
            );
        }

        return (
            <div className="flex gap-2 justify-around min-h-[32px] items-center">
                {mode.permissions.map((permission) => (
                    <PermissionBadge 
                        key={`${permission.modeId}-${permission.permissionId}`}
                        permission={{
                            id: permission.permissionId,
                            code: permission.abbrevation,
                            color: permission.styles.color
                        }}
                        isDisabled={isDisabled} 
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-[2px]">
            <p className={`text-[8.5px] uppercase font-light ${isDisabled ? "text-input-label" : "text-neutral-500"}`}>
                {mode.name}
            </p>
            {renderPermissions()}
        </div>
    );
}; 