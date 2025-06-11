'use client';

import { SubheadingDivider } from "~/components/reusables/form-fields/sub-heading";
import { Button } from "~/components/ui/button";
import { Warning, Verified } from "~/components/svg";
import FormInput from "~/components/reusables/form-fields/form-input";
import { CustomAxiosResponse } from "~/types";
import { apiService } from "~/lib/api-service";
import { API_LIST } from "~/lib/api-list";
import { FormProvider, useForm } from "react-hook-form";
import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { VerifyResponse, Configuration } from "~/types/device";
import { PacsConfigurationType } from "~/types/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PacsConfigurationSchema } from "~/lib/schemas";
import { FORM_DEFAULT_VALUES } from "~/lib/variables";
import { usePathname, useRouter } from "next/navigation";
import { parseJson } from "~/lib/helpers";
import { X, PlusCircle } from "lucide-react";
import { UnSavedDialog } from "@/components/reusables/dialogs/unsaved.dialog";
import EventBus from "@/components/composables/eventbus";
import { AxiosError } from "axios";
import { useLoader } from "@/context/loader-context";

export default function PacsConfigurationPage() {
  const router = useRouter();
  const [verifyError, setVerifyError] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [showWarning, setShowWarning] = useState(false);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [initialVerification, setInitialVerification] = useState<boolean>(false);
  const [id, setId] = useState<number>(0);
  const verifiedValuesRef = useRef<{ ip: string; port: string; aeTitle: string } | null>(null);
  const [hasEditedFields, setHasEditedFields] = useState(false);
  const currentRoute: string = usePathname();
  const requestHref = useRef<string | undefined>(undefined);
  const deviceId = useRef<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false)

  const { showLoader, hideLoader } = useLoader();

  const form = useForm<PacsConfigurationType>({
    resolver: zodResolver(PacsConfigurationSchema),
    defaultValues: FORM_DEFAULT_VALUES.pacsConfiguration,
    mode: "onBlur",
  });

  const { formState, handleSubmit, getValues, watch, reset, trigger } = form;

  // Watch for changes in form fields
  const ipAddress = watch('ipAddress');
  const port = watch('port');
  const aeTitle = watch('aeTitle');

  const fetchPACSConfiguration = useCallback(async () => {
    try {
      setIsLoading(true)
      const response: CustomAxiosResponse<Configuration> = await apiService.get(API_LIST.GET_PACS_CONFIGURATION);
      if (response.success) {
        const { ipAddress, port, aeTitle, id: configId } = response.data;
        reset({
          ipAddress,
          port: port.toString(),
          aeTitle,
        });
        setId(configId ?? 0);
        deviceId.current = response.data.id;
        const verificationDetails = parseJson(response?.data?.verificationDetails ?? '{}');
        setInitialVerification(verificationDetails?.success);
        if (verificationDetails?.success) {
          verifiedValuesRef.current = {
            ip: ipAddress,
            port: port.toString(),
            aeTitle
          };
        }
      }
    } catch {
    } finally {
      setIsLoading(false)
    }
  }, [reset]);

  useEffect(() => {
    fetchPACSConfiguration();
  }, [reset, fetchPACSConfiguration]);

  // Reset verification status when fields change
  useEffect(() => {
    if (isVerified && verifiedValuesRef.current) {
      if (ipAddress !== verifiedValuesRef.current.ip ||
        port !== verifiedValuesRef.current.port ||
        aeTitle !== verifiedValuesRef.current.aeTitle) {
        setIsVerified(false);
        setVerifyError(false);
        setHasEditedFields(true);
      }
    }
  }, [ipAddress, port, aeTitle, isVerified]);

  // Add effect to track initial form state
  useEffect(() => {
    if (formState.isDirty) {
      setVerifyError(false)
      setHasEditedFields(true);
    }
  }, [formState.isDirty]);

  const verificationErrors = Boolean(formState.errors.ipAddress || formState.errors.port || formState.errors.aeTitle);
  const values = getValues();
  const areAllFieldsFilled = Boolean(values.ipAddress && values.port && values.aeTitle);
  const isSubmit = useMemo(() => {
    // Only enable if form is valid and explicitly verified
    return isVerified && !verificationErrors && areAllFieldsFilled && formState.isValid;
  }, [isVerified, formState.isValid, verificationErrors, areAllFieldsFilled]);

  // Reset verifyError when verification fields change
  useEffect(() => {
    setVerifyError(false);
  }, [values.ipAddress, values.port, values.aeTitle]);

  const handleVerifyError = (error: unknown) => {
    if (error instanceof AxiosError) {
      const err = error.response?.data;
      if (err?.data) {
        if (err.data.ipAddress) form.setValue('contextPacsIp', values.ipAddress);
        if (err.data.aeTitle) form.setValue('contextPacsAeTitle', values.aeTitle);
        trigger();
        return true;
      }
    }

    setVerifyError(true);
    setIsVerified(false);
    verifiedValuesRef.current = null;
    return false;
  };

  const handleVerifyClick = async () => {
    if (isVerifying) return;
    try {
      setIsLoading(true)
      setIsVerifying(true);
      const values = getValues();
      const payload = {
        ip: values.ipAddress,
        port: values.port,
        ae_title: values.aeTitle,
        id: deviceId.current
      };

      const response: CustomAxiosResponse<VerifyResponse> = await apiService.post(API_LIST.VERIFY_PACS_CONFIGURATION, payload,
        { headers: { 'X-Skip-Toast': 'false' } }
      );

      if (response?.data?.success) {
        setVerifyError(false);
        setIsVerified(true);
        setHasEditedFields(false);
        const currentValues = getValues();
        verifiedValuesRef.current = {
          ip: currentValues.ipAddress,
          port: currentValues.port,
          aeTitle: currentValues.aeTitle
        };
        reset(currentValues, { keepDirty: false });
      }
    } catch (error) {
      handleVerifyError(error);
    } finally {
      setIsLoading(false)
      setIsVerifying(false);
    }
  };

  const handleCancel = (newHref: string | undefined = undefined) => {
    const href: string = newHref ?? '/device-integration/system-integration'
    if(newHref){
      requestHref.current = newHref;
    }
    if (isVerified || formState.isDirty) {
      setShowWarning(true);
    } else {
      router.push(href);
    }
  };

  const verificationDetails: VerifyResponse = {
    success: isVerified,
    status: isVerified ? "success" : "error",
    ip: values.ipAddress,
    port: parseInt(values.port),
    ae_title: values.aeTitle
  };

  const onSubmit = async () => {
    const { ipAddress, port, aeTitle } = form.getValues();
    try {
      setIsLoading(true)
      const formData = {
        ipAddress,
        port,
        aeTitle,
        verificationDetails,
      };
      if (id) {
        const response = await apiService.put(API_LIST.UPDATE_PACS_CONFIGURATION, id, formData, { headers: { 'X-Skip-Toast': 'false' } });
        if (response.success) {
          router.push('/device-integration/system-integration');
        }
      } else {
        const response = await apiService.post(API_LIST.CREATE_PACS_CONFIGURATION, formData, { headers: { 'X-Skip-Toast': 'false' } });
        if (response.success) {
          router.push('/device-integration/system-integration');
        }
      }
    } catch {
    } finally {
      setIsLoading(false)
    }
  };

  useEffect(() => {
    if (isLoading) {
      showLoader();
    } else {
      hideLoader();
    }
  }, [isLoading, showLoader, hideLoader]);

  useEffect(() => {
    EventBus.$on(`${currentRoute}`, handleCancel);
    return () => {
      EventBus.$off(`${currentRoute}`, handleCancel);
    }
  });

  return (
    <FormProvider {...form}>
      <SubheadingDivider>Device Integration</SubheadingDivider>
      <p className="text-base font-semibold text-header-secondary py-3 leading-tight capitalize">
      System Integration
        </p>
      
      <form onSubmit={handleSubmit(onSubmit)} className="w-full h-[calc(100vh-194px)]">
        <p className="text-md font-semibold text-header-secondary mt-1 py-1 leading-tight capitalize">
          PACS configuration
        </p>
        <div className="relative w-full h-full bg-light-100 flex flex-row p-5 gap-4">
          <div className="relative w-[360px]">
            <FormInput
              className={`w-full relative ${verifyError ? "border-red-500" : ""}`}
              name="ipAddress"
              label="IP Address"
              placeholder="0.0.0.0"
              vertical
              disabled={isVerifying}
            />
            {verifyError &&
              <div className="absolute right-2 top-1 flex flex-row items-center gap-2">
                <Warning className="w-5 h-5 text-red-500" />
                <span className="text-xs italic font-normal text-header-secondary">Error</span>
              </div>
            }
            <div className="relative flex flex-row justify-between">
              <div className="absolute top-0 right-0">
                {(isVerified || initialVerification) && !hasEditedFields ? (
                  <div className="flex flex-row gap-2 justify-center items-center">
                    <Verified className="w-3 h-3" />
                    <span className="text-[10px] italic font-normal text-neutral-500">Verified</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleVerifyClick}
                    disabled={!areAllFieldsFilled || verificationErrors || isVerifying}
                    className={`text-[10px] italic font-normal ${areAllFieldsFilled && !verificationErrors && !isVerifying ? "cursor-pointer text-blue-600 underline" : "cursor-not-allowed text-neutral-400"}`}
                  >
                    {isVerifying ? "Verifying..." : "Click Here To Verify"}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="relative w-[10.75rem]">
            <FormInput
              className={`w-full relative ${verifyError ? "border-red-500" : ""}`}
              name="port"
              label="Port"
              placeholder="8080"
              vertical
              disabled={isVerifying}
            />
            {verifyError && (
              <div className="absolute right-2 top-1 flex flex-row items-center gap-2">
                <Warning className="w-5 h-5 text-red-500" />
                <span className="text-xs italic font-normal text-header-secondary">Error</span>
              </div>
            )}
          </div>
          <div className="relative w-[10.75rem]">
            <FormInput
              className={`w-full relative ${verifyError ? "border-red-500" : ""}`}
              name="aeTitle"
              label="AE Title"
              placeholder="Type here..."
              vertical
              disabled={isVerifying}
            />
              {verifyError && (
                <div className="absolute right-2 top-1 flex flex-row items-center gap-2">
                  <Warning className="w-5 h-5 text-red-500" />
                  <span className="text-xs italic font-normal text-header-secondary">Error</span>
                </div>
              )}
          </div>

          {/* Empty div for flex grow to push buttons to bottom right */}
          <div className="flex-1" />
          <div className="absolute bottom-8 right-[30%] flex justify-center items-center gap-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => handleCancel()}
              className="border-primary text-primary w-[8rem] rounded-sm gap-2"
            >
              <X className="h-4 w-4 text-primary" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isSubmit || hasEditedFields}
              className={`bg-primary text-light-100 text-sm w-[8rem] font-bold flex items-center justify-center rounded-sm gap-2 border-none ${(!isSubmit || hasEditedFields) ? 'bg-button-disabled text-neutral-400' : ''}`}
            >
              <PlusCircle className="h-4 w-4" stroke={(!isSubmit || hasEditedFields) ? "var(--neutral-400)" : "white"} />
              Confirm
            </Button>
          </div>
        </div>
      </form>

      <UnSavedDialog
        open={showWarning}
        title="Unsaved Changes"
        message="Exiting now will discard your current PACS configuration.<br>You will need to reconfigure it from the beginning."
        onConfirm={() => {
          setShowWarning(false);
          const href: string = requestHref.current ?? '/device-integration/system-integration'
          router.push(href);
        }}
        onCancel={() => setShowWarning(false)}
      />
    </FormProvider>
  );
} 