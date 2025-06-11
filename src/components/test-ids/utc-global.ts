const APP_NAME = "BPV";

const URS_ID = {
    LOGIN:'02',
    WORKFLOW_CUSTOMIZATION:'009',
}

const SRS_ID = {
    LOGIN: `${URS_ID.LOGIN}-038`,
    ACTION_TEMPLATE: `${URS_ID.WORKFLOW_CUSTOMIZATION}-043`,
    PROTOCOL_CHECKBOX: `${URS_ID.WORKFLOW_CUSTOMIZATION}-043`,
}

function generateTestId(srsNo: string, testNo: number): string {
    const paddedTestNo = testNo.toString().padStart(2, '0');
    return `${APP_NAME}-${srsNo}-UTC-${paddedTestNo}`;
}

export {
    APP_NAME,
    URS_ID,
    SRS_ID,
    generateTestId
}
