'use client';

import { SubheadingDivider } from "~/components/reusables/form-fields/sub-heading";
import { Button } from "@/components/ui/button";
import { ChevronRight, X } from "lucide-react";
import { PlusCircle, Verified, Warning } from "~/components/svg";
import FormInput from "~/components/reusables/form-fields/form-input";
import { CustomAxiosResponse } from "~/types";
import { apiService } from "~/lib/api-service";
import { API_LIST } from "~/lib/api-list";
import { FormProvider, useForm } from "react-hook-form";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { DicomPayload, RoomData, VerifyResponse, SpecificErrorData } from "~/types/device";
import { BlackboxConfigurationType } from "~/types/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BlackboxConfigurationSchema } from "~/lib/schemas";
import { FORM_DEFAULT_VALUES } from "~/lib/variables";
import { useParams, usePathname, useRouter } from "next/navigation";
import { parseJson } from "~/lib/helpers";
import { UnSavedDialog } from "@/components/reusables/dialogs/unsaved.dialog";
import EventBus from "@/components/composables/eventbus";
import { AxiosError } from "axios";
import { useLoader } from '@/context/loader-context';

export default function BlackboxConfigurationPage() {
  const params = useParams();
  const router = useRouter();
  const [verifyError, setVerifyError] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [showWarning, setShowWarning] = useState(false);
  const isVerified = useRef<boolean>(false);
  const [name, setName] = useState<string | null>(null);
  const [isBlackboxConfigured, setIsBlackboxConfigured] = useState(false);
  const [isUsgConfigured, setIsUsgConfigured] = useState(false);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const isRoomIntegration = useRef<boolean>(false);
  const currentRoute: string = usePathname();
  const requestHref = useRef<string | null>(null);
  const deviceId = useRef<number | null>(null);
  const [isLoading, setIsLoading] = useState(false)

  const { showLoader, hideLoader } = useLoader();
  
  // Track the values that were last verified
  const verifiedValuesRef = useRef<{ ip: string; port: string; aeTitle: string } | null>(null);
  // Track initial values to detect changes
  const initialValuesRef = useRef<BlackboxConfigurationType | null>(null);

  // Add this state to track if form was ever modified
  const [wasFormEverModified, setWasFormEverModified] = useState(false);

  const form = useForm<BlackboxConfigurationType>({
    resolver: zodResolver(BlackboxConfigurationSchema),
    defaultValues: FORM_DEFAULT_VALUES.blackboxConfiguration,
    mode: "onChange",
  });

  const { formState, handleSubmit, getValues, watch, trigger } = form;
  const values = getValues();

  const watchedValues = watch();

  useEffect(() => {
    setIsDirty(formState.isDirty);
  }, [formState.isDirty]);

  // Check if verification fields are valid
  const verificationErrors = Boolean(
    formState.errors.blackboxIp || 
    formState.errors.blackboxPort || 
    formState.errors.blackboxAeTitle
  );

  // Check if verification fields are filled
  const areVerificationFieldsFilled = Boolean(
    values.blackboxIp && 
    values.blackboxPort && 
    values.blackboxAeTitle
  );

  // Check if verification fields have changed since last verification
  const haveVerificationFieldsChanged = useMemo(() => {
    if (!verifiedValuesRef.current) return true;
    
    // Compare each field individually, handling empty string cases
    const fields = [
      { current: values.blackboxIp, verified: verifiedValuesRef.current.ip },
      { current: values.blackboxPort, verified: verifiedValuesRef.current.port },
      { current: values.blackboxAeTitle, verified: verifiedValuesRef.current.aeTitle }
    ];
    
    return fields.some(({ current, verified }) => {
      const currentValue = current ?? '';
      const verifiedValue = verified ?? '';
      return currentValue !== verifiedValue;
    });
  }, [values.blackboxIp, values.blackboxPort, values.blackboxAeTitle, isVerified.current]);

  // Add this effect to track form modifications
  useEffect(() => {
    if (formState.isDirty) {
      setWasFormEverModified(true);
    }
  }, [formState.isDirty]);

  const handleVerifyError = (error: unknown) => {
    if (error instanceof AxiosError) {
      const err = error.response?.data;
      if (err?.data) {
        if (err.data.ipAddress) form.setValue('contextBlackboxIp', values.blackboxIp);
        if (err.data.aeTitle) form.setValue('contextBlackboxAeTitle', values.blackboxAeTitle);
        trigger();
        return true;
      }
    }
    setVerifyError(true);
    isVerified.current = false;
    verifiedValuesRef.current = null;
    return false;
  };

  // Check if form has changed from initial values
  const hasFormChanged = useMemo(() => {
    if (!initialValuesRef.current) return false;
    
    const initial = initialValuesRef.current;
    const current = values;
    
    // Compare each field individually
    const fields = [
      { name: 'blackboxName', initial: initial.blackboxName, current: current.blackboxName },
      { name: 'blackboxDescription', initial: initial.blackboxDescription, current: current.blackboxDescription },
      { name: 'blackboxIp', initial: initial.blackboxIp, current: current.blackboxIp },
      { name: 'blackboxPort', initial: initial.blackboxPort, current: current.blackboxPort },
      { name: 'blackboxAeTitle', initial: initial.blackboxAeTitle, current: current.blackboxAeTitle }
    ];
    
    // Check if any field has been modified (even if reverted to original value)
    const hasFieldBeenModified = fields.some(({ name }) => 
      formState.dirtyFields[name as keyof typeof formState.dirtyFields]
    );
    
    // Check if values are different
    const hasValuesChanged = fields.some(({ initial, current }) => {
      const initialValue = initial ?? '';
      const currentValue = current ?? '';
      return initialValue !== currentValue;
    });
    
    // Return true if either the form is dirty, values have changed, or form was ever modified
    return hasFieldBeenModified || hasValuesChanged || wasFormEverModified;
  }, [watchedValues, formState.dirtyFields, wasFormEverModified]);

  // Determine if confirm button should be enabled
  const isConfirmEnabled = useMemo(() => {
    const isFormValid = formState.isValid;
    
    // Must be verified and verification fields haven't changed since verification
    const isCurrentlyVerified = isVerified.current && !haveVerificationFieldsChanged;
    
    // For new entries (no blackboxId): needs to be valid and verified
    if (!values.blackboxId) {
      return isFormValid && isCurrentlyVerified;
    }
    
    // For updates (has blackboxId): needs form changes AND valid AND verified
    return isFormValid && isCurrentlyVerified && (formState.isDirty || hasFormChanged || wasFormEverModified);
  }, [
    formState.isValid,
    formState.isDirty,
    isVerified.current,
    haveVerificationFieldsChanged,
    hasFormChanged,
    wasFormEverModified,
    values.blackboxId
  ]);

  // Reset verification when verification fields change
  useEffect(() => {
    if (haveVerificationFieldsChanged && isVerified.current) {
      isVerified.current = false;
      setVerifyError(false);
    }
  }, [haveVerificationFieldsChanged, isVerified.current]);

  // Reset verifyError when verification fields change
  useEffect(() => {
    setVerifyError(false);
  }, [values.blackboxIp, values.blackboxPort, values.blackboxAeTitle]);

  const fetchRoomDetails = useCallback(async () => {
    if (!params.id) return;
    try {
      setIsLoading(true)
      const response: CustomAxiosResponse<RoomData> =
        await apiService.getById(API_LIST.GET_ROOM_DETAILS_BY_ROOM_ID, params.id as string, undefined,
          { headers: { 'X-Skip-Toast': 'true' } }
        );
      if (response.success) {
        const { 
          blackboxName, 
          blackboxDescription, 
          blackboxIp, 
          blackboxPort, 
          blackboxAeTitle, 
          roomId, 
          blackboxId, 
          roomName, 
          blackboxVerificationDetails, 
          usgVerificationDetails 
        } = response.data;
        
        setName(roomName);
        deviceId.current = blackboxId;
        const parsedBlackbox = parseJson(blackboxVerificationDetails);
        const parsedUsg = parseJson(usgVerificationDetails);
        setIsBlackboxConfigured(parsedBlackbox?.success ?? false);
        setIsUsgConfigured(parsedUsg?.success ?? false);
        
        const formData = {
          blackboxName, 
          blackboxDescription, 
          blackboxIp, 
          blackboxPort: blackboxPort.toString(), 
          blackboxAeTitle, 
          roomId, 
          blackboxId
        };
        
        // Store initial values for comparison
        initialValuesRef.current = formData;
        
        form.reset(formData, { keepDirty: false });
        
        const verificationDetails = parseJson(response?.data?.blackboxVerificationDetails);
        const isVerifiedFromAPI = verificationDetails?.success;
        isVerified.current = isVerifiedFromAPI;
        
        // If verified, store the verified values
        if (isVerifiedFromAPI) {
          verifiedValuesRef.current = {
            ip: blackboxIp,
            port: blackboxPort.toString(),
            aeTitle: blackboxAeTitle
          };
        }
      }
    } catch {
    } finally {
      setIsLoading(false)
    }
  }, [params.id, form]);

  useEffect(() => {    
    fetchRoomDetails();
  }, [fetchRoomDetails]);

  const handleVerifyClick = async () => {
    if (isVerifying || !areVerificationFieldsFilled || verificationErrors) return;
    
    try {
      setIsLoading(true)
      setIsVerifying(true);
      setVerifyError(false);
      
      const payload: DicomPayload = {
        ip: values.blackboxIp,
        port: parseInt(values.blackboxPort),
        ae_title: values.blackboxAeTitle,
        id: deviceId.current
      };

      const response: CustomAxiosResponse<VerifyResponse | SpecificErrorData> = await apiService.post(API_LIST.VERIFY_BLACKBOX_CONFIGURATION, payload,
        { headers: { 'X-Skip-Toast': 'false' } }
      );

      if (response.success) {
        setVerifyError(false);
        isVerified.current = true;
        
        // Store the verified values
        verifiedValuesRef.current = {
          ip: values.blackboxIp,
          port: values.blackboxPort,
          aeTitle: values.blackboxAeTitle
        };
      }
    } catch (error) {
      handleVerifyError(error);
    } finally {
      setIsVerifying(false);
      setIsLoading(false)
    }
  };
  
  const handleWarningConfirm = async () => {
    try {
      setIsLoading(true)
      const response: CustomAxiosResponse = await apiService.put(API_LIST.DELETE_ROOM, params.id as string, 
        undefined,
        { headers: { 'X-Skip-Toast': 'true' } }
      );
      if (response?.success) {
        router.push(requestHref.current ?? '/device-integration/room-integration');
      }
    } catch {
    } finally {
      setShowWarning(false);
      setIsLoading(false)
    }
  };

  const verificationDetails: VerifyResponse = {
    success: isVerified.current,
    status: isVerified.current ? "success" : "error",
    ip: values.blackboxIp,
    port: parseInt(values.blackboxPort),
    ae_title: values.blackboxAeTitle
  };

  const handleRouteChange = () => {
    if (!isRoomIntegration.current) {
      const path = requestHref.current ?? `/device-integration/room-integration`
      router.push(path);
    } else {
      const path = requestHref.current ?? `/device-integration/room-integration/room/${params.id}`
      router.push(path);
    }
  };

  const onSubmit = async () => {
    const { blackboxIp, blackboxPort, blackboxAeTitle, blackboxName, blackboxDescription, blackboxId } = form.getValues();
    try {
      setIsLoading(true)
      if (!params.id) return;
      
      const formData = {  
        ipAddress: blackboxIp,
        port: blackboxPort,
        aeTitle: blackboxAeTitle,
        blackboxName,
        description: blackboxDescription,
        roomId: params.id,
        verificationDetails
      };
      
      if (blackboxId) {
        const response: CustomAxiosResponse = await apiService.put(API_LIST.UPDATE_BLACKBOX, blackboxId, formData, 
          { headers: { 'X-Skip-Toast': 'false' } }
        );
        if (response.success) {
          isRoomIntegration.current = true;
          handleRouteChange();
        }
      } else {
        const response: CustomAxiosResponse = await apiService.post(API_LIST.CREATE_BLACKBOX, formData, 
          { headers: { 'X-Skip-Toast': 'false' } }
        );
        if (response.success) {
          isRoomIntegration.current = true;
          handleRouteChange();
        }
      }
    } catch {
    } finally {
      setIsLoading(false)
    }
  };

  const handleCancel = (newHref: string | undefined = undefined) => {
    if(newHref){
      requestHref.current = newHref;
    }
    if (isDirty || hasFormChanged || !isRoomIntegration.current) {
      setShowWarning(true);
    } else {
      handleRouteChange()
    }
  };

  const handleNavigationClick = (e: React.MouseEvent) => {
    e.preventDefault();
    handleCancel();
  };

  const handleRoomClick = () => {
    isRoomIntegration.current = true;
    if (isDirty || hasFormChanged) {
      setShowWarning(true);
    } else {
      handleRouteChange()
    }
  }

  const handleConfirm = () => {
    if (!isUsgConfigured && !isBlackboxConfigured && !isRoomIntegration.current) {
      handleWarningConfirm()
    } else {
      handleRouteChange()
    }
    setShowWarning(false);
  }

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
      <form onSubmit={(e) => handleSubmit(onSubmit)(e)} className="w-full space-y-4">
     <SubheadingDivider>Device Integration</SubheadingDivider>
      <div className="w-full">
          <span className="flex items-center gap-1 text-[16px] font-semibold text-neutral-400">
            <button
              type="button"
              onClick={(e) => handleNavigationClick(e)}
              className="hover:underline flex items-center text-neutral-400 font-semibold cursor-pointer text-lg capitalize"
            >
              Room Integration
            </button>
            <ChevronRight className="w-7 h-7" />
            <button
              type="button"
              onClick={() => handleRoomClick()}
              className="hover:underline flex items-center text-neutral-400 font-semibold cursor-pointer text-lg capitalize"
            >
              {name}
            </button>
            <ChevronRight className="w-7 h-7" />
            <span className="flex items-center text-neutral-400 font-semibold text-lg capitalize">
              OMEA Configuration
            </span>
          </span>
        </div>           
        
        <p className=" relative text-md font-semibold text-header-secondary leading-tight top-2 ">
          OMEA (AI/Blackbox/Link) Configuration
        </p>
          
        <div className="relative w-full h-[calc(100vh-215px)] bg-light-100 flex flex-col p-4 gap-4">
          <div className="w-full flex flex-row gap-4">
            <FormInput
              className={`w-[22.5rem]`}
              name="blackboxName"
              label="Name"
              placeholder="Type here..."
              vertical
              disabled={isVerifying}
            />
            <FormInput
              className={`w-[22.5rem]`}
              name="blackboxDescription"
              label="Description"
              placeholder="Type here..."
              vertical
              disabled={isVerifying}
            />
          </div>
          
          <div className="w-full flex flex-row gap-4">
            <div className="relative w-[22.5rem]">
              <FormInput
                className={`w-full relative ${verifyError ? "border-red-500" : ""}`}
                name="blackboxIp"
                label="IP Address"
                placeholder="0.0.0.0"
                vertical
                disabled={isVerifying}
              />
              {verifyError && (
                <div className="absolute right-2 top-1 flex flex-row items-center gap-2">
                  <Warning className="w-5 h-5 text-red-500" />
                  <span className="text-xs italic font-normal text-header-secondary">Error</span>
                </div>
              )}
              <div className="relative flex flex-row justify-between">
                <div className="absolute right-0 top-1">
                  {isVerified.current && !haveVerificationFieldsChanged ? (
                    <div className="flex flex-row gap-2 justify-center items-center">
                      <Verified className="w-3 h-3"/>
                      <span className="text-[10px] italic font-normal text-neutral-500">Verified</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleVerifyClick}
                      disabled={!areVerificationFieldsFilled || verificationErrors || isVerifying}
                      className={`text-[10px] italic font-normal ${
                        areVerificationFieldsFilled && !verificationErrors && !isVerifying 
                          ? "cursor-pointer text-blue-600 underline" 
                          : "cursor-not-allowed text-neutral-400"
                      }`}
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
                name="blackboxPort"
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
                name="blackboxAeTitle"
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
          </div>
          
          <div className="absolute bottom-8 flex justify-center items-center w-full gap-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => handleRoomClick()}
              className="border-primary-500 text-primary-500 w-[8rem]"
            >
              <X className="h-4 w-4 text-primary-500" stroke={"var(--primary-500)"} />
              Cancel
            </Button>
            
            <Button
              type="submit"
              variant="outline-primary"
              disabled={!isConfirmEnabled}
              className={`bg-primary hover:bg-primary text-light-100 text-sm font-bold w-[8rem] flex items-center gap-2 border-none ${
                !isConfirmEnabled 
                  ? 'bg-button-disabled text-neutral-400 hover:bg-neutral-700 hover:text-neutral-900' 
                  : ''
              }`}
            >
              <PlusCircle className="h-4 w-4" stroke={!isConfirmEnabled ? "#222" : "white"}/>
              Confirm
            </Button>
          </div>
        </div>
        
        <UnSavedDialog
          open={showWarning}
          title="Unsaved Changes"
          message="You will lose all your changes if you proceed."
          onConfirm={() => {
            handleConfirm()
            setShowWarning(false);
          }}
          onCancel={() => {
            setShowWarning(false)
            isRoomIntegration.current = false
            requestHref.current = null
          }}
        />
      </form>
    </FormProvider>
  );
}
