import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ESelectedStatus } from "~/enums/workflow-customization-enum";
import { WorkflowMaster, DiagnosticView, Annotation, QualityCriterion, BaseMasterModel } from "~/types/workflow";

interface AnatomyAccordionProps {
  anatomy: WorkflowMaster;
  isOpen?: boolean;
  onValueChange?: (value: string) => void;
}

interface SectionProps<T> {
  title: string;
  items: T[];
  getName: (item: T) => string;
  emptyText?: string;
}

function Section<T extends { id: number }>(props: Readonly<SectionProps<T>>) {
  const { title, items, getName, emptyText } = props;
  return (
    <div>
      <div className="flex items-center">
        <span className="text-[13px] font-normal text-neutral-600 uppercase tracking-wide">{title}</span>
        <div className="flex-1 border-t border-neutral-100 ml-2 h-1" />
      </div>
      {!items.length ? (
        <div className="my-2 px-4 py-2">
          <span className="text-sm font-medium text-neutral-400">{emptyText}</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-y-2 my-2 w-[95%]">
          {items.map(item => (
            <div key={item.id} className="w-1/2 flex flex-row items-center px-4 py-2 gap-2">
              <div className="bg-neutral-400 rounded-full w-1 h-1"></div>
              <span className="text-sm font-medium text-neutral-400 capitalize">{getName(item)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AnatomyAccordion({ anatomy, isOpen = false, onValueChange }: Readonly<AnatomyAccordionProps>) {
  return (
    <Accordion
      type="single"
      collapsible
      value={isOpen ? String(anatomy.id) : ""}
      onValueChange={onValueChange}
    >
      <AccordionItem value={String(anatomy.id)}>
        <AccordionTrigger className="flex items-center gap-2 h-[37px] px-5 bg-background-outer">
          <span className="truncate font-black text-lg uppercase text-neutral-400">{anatomy.name}</span>
        </AccordionTrigger>
        <AccordionContent className="p-4 bg-light-100 border-[1px] border-neutral-100 space-y-4">
          {anatomy.diagnosticViews
            .filter(view => view.selectedStatus === ESelectedStatus.SELECTED)
            .map((view: DiagnosticView) => (
              <div key={view.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="font-medium text-base text-neutral-400 uppercase">{view.name}</p>
                  <div className="flex flex-row items-start gap-16">
                    <div className="flex flex-col justify-between">
                      <span className="text-sm font-bold text-neutral-400 capitalize">No. Of Images Acquisition</span>
                      <span className="text-xs font-normal text-neutral-400 italic">(max: {view?.max})</span>
                    </div>
                    <span className="w-10 h-10 flex justify-center items-center rounded-lg bg-light-100 border-[1px] text-sm font-bold border-input-border">
                      {view?.noOfImageAcquisition}
                    </span>
                  </div>
                </div>
                <Section<QualityCriterion>
                  title="STRUCTURAL CRITERIA"
                  items={view.qualityCriterias.filter(qc => qc.selectedStatus === ESelectedStatus.SELECTED)}
                  getName={qc => qc.name}
                  emptyText="No Structural Criteria"
                />
                <Section<BaseMasterModel>
                  title="MEASUREMENTS"
                  items={view.measurements.filter(m => m.selectedStatus === ESelectedStatus.SELECTED)}
                  getName={m => m.name}
                  emptyText="No Measurements"
                />
                <Section<Annotation>
                  title="ANNOTATIONS"
                  items={view.annotations.filter(a => a.selectedStatus === ESelectedStatus.SELECTED)}
                  getName={a => a.acronym}
                  emptyText="No Annotations"
                />
              </div>
            ))}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}