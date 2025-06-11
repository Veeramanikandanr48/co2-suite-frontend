import { WorkflowMaster } from "~/types/workflow";
import TriStateCheckbox from "../reusables/form-fields/tri-state-checkbox";
import { ESelectedStatus } from "~/enums/workflow-customization-enum";
import { ANATOMY_LIST_TEST_IDS } from "../test-ids/anatomy-list.ids";

interface AnatomyListProps {
  anatomies: WorkflowMaster[];
  activeAnatomyId: number;
  onToggle: (id: number) => void;
  onSelect: (id: number) => void;
  onActiveAnatomyNameChange?: (name: string) => void;
}

export default function AnatomyList({
  anatomies,
  activeAnatomyId,
  onToggle,
  onSelect,
  onActiveAnatomyNameChange,
}: Readonly<AnatomyListProps>) {
  return (
    <div className="h-[81vh] bg-light-100 border-b-[1px] border-neutral-100" data-testid={ANATOMY_LIST_TEST_IDS.ANATOMY_LIST_CONTAINER}>
      <div className="w-full h-full overflow-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 hover:[&::-webkit-scrollbar-thumb]:bg-gray-400">
        {anatomies?.map(anatomy => (
          <button
            key={anatomy.id}
            type="button"
            data-testid={ANATOMY_LIST_TEST_IDS.ANATOMY_LIST_ITEM(anatomy.id)}
            className={`w-full relative flex items-center gap-2 border-b border-neutral-100 h-[47px] text-xs font-normal leading-[20px] cursor-pointer px-5 ${activeAnatomyId === anatomy.id
              ? "bg-light-300 text-neutral-800"
              : "hover:bg-gray-50 text-neutral-400"
            }`}
            onClick={(e) => {
              if (!(e.target as HTMLElement).closest('input[type="checkbox"]')) {
                onSelect(anatomy.id);
                onActiveAnatomyNameChange?.(anatomy.name);
              }
            }}
            tabIndex={0}
          >
            {activeAnatomyId === anatomy.id && (
              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary-500" />
            )}
            <TriStateCheckbox
              state={anatomy.selectedStatus}
              onChange={() => {
                onToggle(anatomy.id);
              }}
              data-testid={ANATOMY_LIST_TEST_IDS.ANATOMY_CHECKBOX(anatomy.id)}
            />
            <div className="flex flex-col items-start gap-[2px]">
              <span 
                className="truncate font-medium text-xs text-neutral-400 leading-[16px]"
                data-testid={ANATOMY_LIST_TEST_IDS.ANATOMY_NAME(anatomy.id)}
              >
                {anatomy.name}
              </span>
              <span 
                className="truncate font-medium text-[10px] text-neutral-400 leading-[12px]"
                data-testid={ANATOMY_LIST_TEST_IDS.ANATOMY_PLANE_COUNT(anatomy.id)}
              >
                {anatomy.diagnosticViews.filter(view => view.selectedStatus === ESelectedStatus.SELECTED).length}/{anatomy.diagnosticViews.length} Planes
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}