import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import WorkflowCard from '~/components/workflow-customization/workflow-card';
import { momentFormat } from '~/lib/helpers';
import { generateTestId, APP_NAME, SRS_ID } from '../../test-ids/utc-global';
import { workflowTestIds } from '../../test-ids/workflow.ids';

// Mock momentFormat helper
jest.mock('~/lib/helpers', () => ({
  momentFormat: jest.fn(() => '01/01/2024')
}));

describe(`${APP_NAME}-${SRS_ID.WORKFLOW_CARD}: WorkflowCard`, () => {
  const defaultProps = {
    heading: 'Test Workflow',
    description: 'Test Description',
    createdBy: 'Test User',
    lastUpdated: '2024-01-01T00:00:00Z',
    className: 'test-class'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it(`${generateTestId(SRS_ID.WORKFLOW_CARD, 82)}: renders with all props`, () => {
    render(<WorkflowCard {...defaultProps} />);

    expect(screen.getByTestId(workflowTestIds.workflowCard.container)).toBeInTheDocument();
    expect(screen.getByTestId(workflowTestIds.workflowCard.heading)).toHaveTextContent(defaultProps.heading);
    expect(screen.getByTestId(workflowTestIds.workflowCard.description)).toHaveTextContent(defaultProps.description);
    expect(screen.getByTestId(workflowTestIds.workflowCard.createdBy)).toHaveTextContent(defaultProps.createdBy);
    expect(screen.getByTestId(workflowTestIds.workflowCard.lastUpdated)).toHaveTextContent('01/01/2024');
  });

  it(`${generateTestId(SRS_ID.WORKFLOW_CARD, 83)}: renders with missing props`, () => {
    render(
      <WorkflowCard
        heading=""
        description=""
        createdBy=""
        lastUpdated=""
      />
    );

    const createdBySection = screen.getByTestId(workflowTestIds.workflowCard.createdBy);
    const lastUpdatedSection = screen.getByTestId(workflowTestIds.workflowCard.lastUpdated);
    
    expect(createdBySection).toHaveTextContent('-');
    expect(lastUpdatedSection).toHaveTextContent('-');
  });

  it(`${generateTestId(SRS_ID.WORKFLOW_CARD, 84)}: applies custom className`, () => {
    render(<WorkflowCard {...defaultProps} />);
    const element = screen.getByTestId(workflowTestIds.workflowCard.container);
    
    expect(element).toHaveClass('test-class');
    expect(element).toHaveClass('border-[1px]');
    expect(element).toHaveClass('border-light-400');
    expect(element).toHaveClass('bg-light-100');
  });

  it(`${generateTestId(SRS_ID.WORKFLOW_CARD, 85)}: formats date correctly`, () => {
    render(<WorkflowCard {...defaultProps} />);
    expect(momentFormat).toHaveBeenCalledWith(defaultProps.lastUpdated, 'DD/MM/YYYY');
  });

  it(`${generateTestId(SRS_ID.WORKFLOW_CARD, 86)}: truncates long description`, () => {
    const longDescription = 'A'.repeat(200);
    render(
      <WorkflowCard
        {...defaultProps}
        description={longDescription}
      />
    );

    const description = screen.getByTestId(workflowTestIds.workflowCard.description);
    expect(description).toHaveClass('line-clamp-3');
  });

  it(`${generateTestId(SRS_ID.WORKFLOW_CARD, 87)}: renders section labels correctly`, () => {
    render(<WorkflowCard {...defaultProps} />);

    const createdBySection = screen.getByTestId(workflowTestIds.workflowCard.createdBy);
    const lastUpdatedSection = screen.getByTestId(workflowTestIds.workflowCard.lastUpdated);

    expect(createdBySection).toHaveTextContent('Created by');
    expect(lastUpdatedSection).toHaveTextContent('Last Updated');
  });

  it(`${generateTestId(SRS_ID.WORKFLOW_CARD, 88)}: maintains consistent layout with varying content lengths`, () => {
    const longText = 'Very Long Description That Should Not Break Layout';
    render(
      <WorkflowCard
        {...defaultProps}
        heading="Very Long Heading That Should Not Break Layout"
        description={`${longText} ${longText} ${longText} ${longText} ${longText}`}
      />
    );

    const createdBySection = screen.getByTestId(workflowTestIds.workflowCard.createdBy);
    const lastUpdatedSection = screen.getByTestId(workflowTestIds.workflowCard.lastUpdated);

    expect(createdBySection).toHaveClass('flex');
    expect(createdBySection).toHaveClass('flex-col');
    expect(lastUpdatedSection).toHaveClass('flex');
    expect(lastUpdatedSection).toHaveClass('flex-col');
  });
}); 