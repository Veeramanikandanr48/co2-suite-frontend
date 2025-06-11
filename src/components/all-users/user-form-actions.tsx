import { X, CirclePlus } from "lucide-react";
import { Button } from "../ui/button";
import { CREATE_USER_TEST_IDS } from "../test-ids/create-user.ids";

export interface UserFormActionsProps {
    isSubmitting: boolean;
    isValid?: boolean;
    onCancel: () => void;
    onSave?: () => void;
}

export const UserFormActions = ({ 
    isSubmitting, 
    isValid, 
    onCancel, 
    onSave 
}: UserFormActionsProps): JSX.Element => {

    return (
        <div className="flex flex-col gap-4 bg-white rounded-md h-[3.5rem] py-2 px-8">
            <div className="flex justify-end gap-4">
                <Button
                    type="button"
                    variant="outline-primary"
                    className="bg-white w-[8.15rem] h-[2.4rem] disabled:button-disabled"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    data-testid={CREATE_USER_TEST_IDS.CANCEL_BUTTON}
                >
                    <X className="w-4 h-4" data-testid={CREATE_USER_TEST_IDS.X_ICON} />
                    <span className="text-primary-500">Cancel</span>
                </Button>
                <Button
                    type="submit"
                    className="bg-blue-700 text-white w-[8.15rem] h-[2.4rem] disabled:button-disabled"
                    disabled={isSubmitting || !isValid}
                    data-testid={CREATE_USER_TEST_IDS.CREATE_BUTTON}
                    onClick={onSave}
                >
                    <CirclePlus className="w-4 h-4" data-testid={CREATE_USER_TEST_IDS.CIRCLE_PLUS_ICON} />
                    <span>Create</span>
                </Button>
            </div>
        </div>
    );
}; 