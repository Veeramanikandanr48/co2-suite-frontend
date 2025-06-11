import React from 'react';
import { momentFormat } from '~/lib/helpers';
import { cn, toCapitalizedWords } from '~/lib/utils';
import { WorkflowCardProps } from '~/types/workflow';
import { workflowTestIds } from '../test-ids/workflow.ids';

const WorkflowCard: React.FC<WorkflowCardProps> = ({
  heading,
  description,
  createdBy,
  lastUpdated,
  className = '',
}) => {
  return (
    <div className={cn(`border-[1px] border-light-400 py-4 px-6 bg-light-100`, className)} data-testid={workflowTestIds.workflowCard.container}>
      <h2 className="text-xl font-bold text-neutral-600 min-h-6 line-clamp-1" data-testid={workflowTestIds.workflowCard.heading}>{heading}</h2>
      <p className="text-base font-normal text-neutral-400 min-h-12 my-[6px] line-clamp-3 wrap-break-word leading-[22px]" data-testid={workflowTestIds.workflowCard.description}>
        {description || '-'}
      </p>
      <div className="flex py-2">
        <div className="flex flex-col w-[50%]" data-testid={workflowTestIds.workflowCard.createdBy}>
          <p className="text-sm font-normal text-neutral-400">Created by</p>
          <p className="text-base font-bold text-neutral-400">{createdBy?.trim() ? toCapitalizedWords(createdBy) : '-'}</p>
        </div>
        <div className="flex flex-col w-[50%]" data-testid={workflowTestIds.workflowCard.lastUpdated}>
          <p className="text-sm font-normal text-neutral-400">Last Updated</p>
          <p className="text-base font-bold text-neutral-400">{ lastUpdated ? momentFormat(lastUpdated, 'DD/MM/YYYY') : '-'}</p>
        </div>
      </div>
    </div>
  );
};

export default WorkflowCard;
