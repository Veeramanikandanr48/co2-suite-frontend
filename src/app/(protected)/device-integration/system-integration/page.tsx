'use client'
import { useEffect, useState, useCallback } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { WarningDialog } from "../../../../components/reusables/dialogs/warning";
import { apiService } from "../../../../lib/api-service";
import { API_LIST } from "../../../../lib/api-list";
import { CustomAxiosResponse } from "../../../../types";
import { Configuration } from "~/types/device";
import { FORM_DEFAULT_VALUES } from "~/lib/variables";
import { PacsConfigurationSummary } from "~/components/device-integration/pacs-summary";
import { zodResolver } from "@hookform/resolvers/zod";
import { PacsConfigurationSchema } from "~/lib/schemas";
import { PacsConfigurationType } from "~/types/form";
import { parseJson } from "~/lib/helpers";
import { useRouter } from "next/navigation";
import { SYSTEM_INTEGRATION_TEST_IDS } from "@/components/test-ids/system-integration.ids";
import { useLoader } from '@/context/loader-context';

export default function SystemIntegrationPage() {
  const router = useRouter();
  const [warningDialogOpen, setWarningDialogOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false)

  const { showLoader, hideLoader } = useLoader();

  const form = useForm<PacsConfigurationType>({
    defaultValues: FORM_DEFAULT_VALUES.pacsConfiguration,
    resolver: zodResolver(PacsConfigurationSchema),
    mode: "onChange",
  });

  const { reset } = form;

  const getPACSConfiguration = useCallback(async () => {
    try {
      setIsLoading(true)
      const response: CustomAxiosResponse<Configuration> = await apiService.get(API_LIST.GET_PACS_CONFIGURATION);

      const data: Configuration = response?.data;
      const { ipAddress = "", port = "", aeTitle = "" } = data;

      if(response.success) {
        reset({
          ipAddress,
          port: port.toString(),
          aeTitle,
        });
      }
      const verificationDetails = parseJson(data?.verificationDetails ?? '{}');
      setConnectionStatus(verificationDetails.success);

    } catch {
    } finally {
      setIsLoading(false)
    }
  }, [reset]);

  const handleConfigure = () => {
    setWarningDialogOpen(false);
    router.push('/device-integration/system-integration/pacs-configuration');
  }

  useEffect(() => {
    getPACSConfiguration();
  }, [getPACSConfiguration]);

  useEffect(() => {
    if (isLoading) {
      showLoader();
    } else {
      hideLoader();
    }
  }, [isLoading, showLoader, hideLoader]);

  return (
    <FormProvider {...form}>
      <form>
        <PacsConfigurationSummary
          connectionStatus={connectionStatus}
          onConfigure={() => setWarningDialogOpen(true)}
          data-testid={SYSTEM_INTEGRATION_TEST_IDS.PACS_SUMMARY}
        />
  
        <WarningDialog
          open={warningDialogOpen}
          title="Configuration Warning"
          message="Changes made here may impact system functionality.<br>Only continue if you're familiar with this task."
          onConfirm={handleConfigure}
          onCancel={() => setWarningDialogOpen(false)}
          data-testid={SYSTEM_INTEGRATION_TEST_IDS.WARNING_DIALOG}
        />
      </form>
    </FormProvider>
  )
}