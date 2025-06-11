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
import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { DicomPayload, VerifyResponse, CropData, RoomData } from "~/types/device";
import { UsgConfigurationType } from "~/types/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UsgConfigurationSchema } from "~/lib/schemas";
import { FORM_DEFAULT_VALUES } from "~/lib/variables";
import { useRouter, useParams, usePathname } from "next/navigation";
import ImageCropDialog from "~/components/device-integration/image-crop-dialog";
import { parseJson } from "~/lib/helpers";
import Image from "next/image";
import { PacsImage } from "@/enums/base-enum";
import { UnSavedDialog } from "@/components/reusables/dialogs/unsaved.dialog";
import EventBus from "@/components/composables/eventbus";
import { AxiosError } from "axios";
import { useLoader } from '@/context/loader-context';

const TARGET_WIDTH = 300;
const TARGET_HEIGHT = 225;

export default function UsgConfigurationPage() {
  const router = useRouter();
  const params = useParams();
  const [verifyError, setVerifyError] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [showWarning, setShowWarning] = useState(false);
  const isVerified = useRef<boolean>(false);
  const [cropDialogOpen, setCropDialogOpen] = useState(false)
  const [cropData, setCropData] = useState<CropData | undefined>(undefined);
  const [croppedImage, setCroppedImage] = useState<string | null>(null)
  const [name, setName] = useState<string | null>(null);
  const verifiedValuesRef = useRef<{ ip: string; port: string; aeTitle: string } | null>(null);
  const [isBlackboxConfigured, setIsBlackboxConfigured] = useState(false);
  const [isUsgConfigured, setIsUsgConfigured] = useState(false);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const isRoomIntegration = useRef<boolean>(false);
  const [initialCropData, setInitialCropData] = useState<CropData | undefined>(undefined);
  const [requiresCropConfig, setRequiresCropConfig] = useState<boolean>(false);
  const initialValuesRef = useRef<UsgConfigurationType | null>(null);
  const currentRoute: string = usePathname();
  const requestHref = useRef<string | null>(null);
  const deviceId = useRef<number | null>(null);
  const [isLoading, setIsLoading] = useState(false)

  const { showLoader, hideLoader } = useLoader();

  const form = useForm<UsgConfigurationType>({
    resolver: zodResolver(UsgConfigurationSchema),
    defaultValues: FORM_DEFAULT_VALUES.usgConfiguration,
    mode: "onChange",
  });

  const { formState, handleSubmit, getValues, watch, trigger } = form;
  const values = getValues();
  const watchedValues = watch();

  useEffect(() => {
    setIsDirty(formState.isDirty);
  }, [formState.isDirty]);

  const hasCropDataChanged = useMemo(() => {
    if (!initialCropData && !cropData) return false;
    if (!initialCropData || !cropData) return true;
    return JSON.stringify(initialCropData) !== JSON.stringify(cropData);
  }, [initialCropData, cropData]);

  const checkVerificationFields = () => {
    return Boolean(
      formState.errors.usgIp || 
      formState.errors.usgPort || 
      formState.errors.usgAeTitle
    );
  };

  const checkVerificationFieldsFilled = () => {
    return Boolean(
      values.usgIp && 
      values.usgPort && 
      values.usgAeTitle
    );
  };
  const verificationErrors = checkVerificationFields();
  const areVerificationFieldsFilled = checkVerificationFieldsFilled();

  const haveVerificationFieldsChanged = useMemo(() => {
    if (!verifiedValuesRef.current) return true;
    setCroppedImage(null);
    
    const fields = [
      { current: values.usgIp, verified: verifiedValuesRef.current.ip },
      { current: values.usgPort, verified: verifiedValuesRef.current.port },
      { current: values.usgAeTitle, verified: verifiedValuesRef.current.aeTitle }
    ];
    return fields.some(({ current, verified }) => {
      const currentValue = current ?? '';
      const verifiedValue = verified ?? '';
      return currentValue !== verifiedValue;
    });
  }, [values.usgIp, values.usgPort, values.usgAeTitle, isVerified.current]);

  const hasFormChanged = useMemo(() => {
    if (!initialValuesRef.current) return false;
    
    const initial = initialValuesRef.current;
    const current = values;
    const fields = [
      { name: 'usgName', initial: initial.usgName, current: current.usgName },
      { name: 'usgDescription', initial: initial.usgDescription, current: current.usgDescription },
      { name: 'usgIp', initial: initial.usgIp, current: current.usgIp },
      { name: 'usgPort', initial: initial.usgPort, current: current.usgPort },
      { name: 'usgAeTitle', initial: initial.usgAeTitle, current: current.usgAeTitle }
    ];
    
    const hasValuesChanged = fields.some(({ initial, current }) => {
      const initialValue = initial ?? '';
      const currentValue = current ?? '';
      return initialValue !== currentValue;
    });
    
    return hasValuesChanged;
  }, [watchedValues, formState.dirtyFields]);

  const checkConfirmEnabled = () => {
    const isFormValid = formState.isValid;
    const isCurrentlyVerified = isVerified.current && !haveVerificationFieldsChanged;
    
    if (!values.usgId) {
      return isFormValid && isCurrentlyVerified && cropData !== undefined;
    }
    
    const hasAnyChanges = formState.isDirty || hasFormChanged || hasCropDataChanged;
    return isFormValid && 
           isCurrentlyVerified && 
           hasAnyChanges && 
           (cropData !== undefined || !requiresCropConfig);
  };
  const isConfirmEnabled = useMemo(checkConfirmEnabled, [
    formState.isValid,
    formState.isDirty,
    isVerified.current,
    haveVerificationFieldsChanged,
    hasFormChanged,
    values.usgId,
    hasCropDataChanged,
    cropData,
    requiresCropConfig
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
  }, [values.usgIp, values.usgPort, values.usgAeTitle]);

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
          usgName, 
          usgDescription, 
          usgIp, 
          usgPort, 
          usgAeTitle, 
          roomId, 
          usgId, 
          roomName, 
          usgVerificationDetails, 
          blackboxVerificationDetails,
          usgRegionOfInterest 
        } = response.data;
        
        setName(roomName);
        deviceId.current = usgId;
        const parsedBlackbox = parseJson(blackboxVerificationDetails);
        const parsedUsg = parseJson(usgVerificationDetails);
        setIsBlackboxConfigured(parsedBlackbox?.success ?? false);
        setIsUsgConfigured(parsedUsg?.success ?? false);
        
        const formData = {
          usgName, 
          usgDescription, 
          usgIp, 
          usgPort: usgPort.toString(), 
          usgAeTitle, 
          roomId, 
          usgId
        };
        
        // Store initial values for comparison
        initialValuesRef.current = formData;
        
        // Reset form with initial values and mark as pristine
        form.reset(formData, { 
          keepDirty: false,
          keepErrors: false,
          keepIsSubmitted: false,
          keepIsSubmitSuccessful: false,
          keepSubmitCount: false
        });
        
        const verificationDetails = parseJson(response?.data?.usgVerificationDetails);
        const isVerifiedFromAPI = verificationDetails?.success;
        isVerified.current = isVerifiedFromAPI;
        
        // If verified, store the verified values
        if (isVerifiedFromAPI) {
          verifiedValuesRef.current = {
            ip: usgIp,
            port: usgPort.toString(),
            aeTitle: usgAeTitle
          };
        }

        const parsedROI = parseJson(usgRegionOfInterest ?? '{}');
        setCropData(parsedROI);
        setInitialCropData(parsedROI);
        generateCroppedImage(parsedROI);
        setRequiresCropConfig(false);
      }
    } catch {
    } finally {
      setIsLoading(false)
    }
  }, [params.id, form]);

  useEffect(() => {    
    fetchRoomDetails();
  }, [fetchRoomDetails]);

  const handleVerifyError = (error: unknown) => {
    if (error instanceof AxiosError) {
      const err = error.response?.data;
      if (err?.data) {
        if (err.data.ipAddress) form.setValue('contextUsgIp', values.usgIp);
        if (err.data.aeTitle) form.setValue('contextUsgAeTitle', values.usgAeTitle);
        trigger();
        return true;
      }
    }
    setVerifyError(true);
    isVerified.current = false;
    verifiedValuesRef.current = null;
    return false;
  };

  const handleVerifyClick = async () => {
    if (isVerifying || !areVerificationFieldsFilled || verificationErrors) return;
    
    try {
      setIsLoading(true)
      setIsVerifying(true);
      setVerifyError(false);
      
      const payload: DicomPayload = {
        ip: values.usgIp,
        port: parseInt(values.usgPort),
        ae_title: values.usgAeTitle,
        id: deviceId.current
      };

      const response: CustomAxiosResponse<VerifyResponse> = await apiService.post(API_LIST.VERIFY_ULTRASOUND_CONFIGURATION, payload,
        { headers: { 'X-Skip-Toast': 'false' } }
      );

      if (response.success) {
        setVerifyError(false);
        isVerified.current = true;
        setCroppedImage(null);
        setRequiresCropConfig(true);
        setCropData(undefined); // Reset crop data after verification
        
        // Store the verified values
        verifiedValuesRef.current = {
          ip: values.usgIp,
          port: values.usgPort,
          aeTitle: values.usgAeTitle
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
      const response: CustomAxiosResponse = await apiService.put(API_LIST.DELETE_ROOM, params.id as string, undefined,
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

  const generateCroppedImage = (cropData: CropData) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const image = new window.Image();
    image.src = "/images/sample.png";
    image.onload = () => {
      // Set canvas size to match the target display size
      canvas.width = TARGET_WIDTH;
      canvas.height = TARGET_HEIGHT;

      // Draw the cropped image scaled to fit the target size
      ctx.drawImage(
        image,
        cropData.x,
        cropData.y,
        cropData.width,
        cropData.height,
        0,
        0,
        TARGET_WIDTH,
        TARGET_HEIGHT
      );
      const croppedImageUrl = canvas.toDataURL('image/jpeg');
      setCroppedImage(croppedImageUrl);
    };
  };

  const verificationDetails: VerifyResponse = {
    success: isVerified.current,
    status: isVerified.current ? "success" : "error",
    ip: values.usgIp,
    port: parseInt(values.usgPort),
    ae_title: values.usgAeTitle
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
    const { usgIp, usgPort, usgAeTitle, usgName, usgDescription, usgId } = form.getValues();
    try {
      setIsLoading(true)
      if (!params.id) return;
      
      const formData = {  
        ipAddress: usgIp,
        port: usgPort,
        aeTitle: usgAeTitle,
        ultrasoundName: usgName,
        description: usgDescription,
        roomId: params.id,
        verificationDetails,
        regionOfInterest: cropData
      };
      
      if (usgId) {
        const response: CustomAxiosResponse = await apiService.put(API_LIST.UPDATE_ULTRASOUND, usgId, formData, 
          { headers: { 'X-Skip-Toast': 'false' } }
        );
        if (response.success) {
          isRoomIntegration.current = true;
          handleRouteChange();
        }
      } else {
        const response: CustomAxiosResponse = await apiService.post(API_LIST.CREATE_ULTRASOUND, formData, 
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
    if (isDirty || hasFormChanged || hasCropDataChanged || !isRoomIntegration.current) {
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
    if (isDirty || hasFormChanged || hasCropDataChanged) {
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
    setShowWarning(false)
  }
  
  useEffect(() => {
    EventBus.$on(`${currentRoute}`, handleCancel);
    return () => {
      EventBus.$off(`${currentRoute}`, handleCancel);
    }
  });

  useEffect(() => {
    if (isLoading) {
      showLoader();
    } else {
      hideLoader();
    }
  }, [isLoading, showLoader, hideLoader]);

  return (
    <FormProvider {...form}>
      <SubheadingDivider>Device Integration</SubheadingDivider>

      <div className='mt-2'>
        <span className="flex items-center gap-1 text-[16px] font-semibold text-header-secondary">
          <button
            type="button"
            onClick={(e) => handleNavigationClick(e)}
            className="hover:underline flex items-center text-header-secondary font-semibold cursor-pointer text-lg capitalize"
          >
            Room Integration
          </button>
          <ChevronRight className="w-7 h-7" />
          <button
            type="button"
            onClick={() => handleRoomClick()}
            className="hover:underline flex items-center text-header-secondary font-semibold cursor-pointer text-lg capitalize"
          >
            {name}
          </button>
          <ChevronRight className="w-7 h-7" />
          <span className="flex items-center text-header-secondary font-semibold text-lg capitalize">
            Ultrasound Configuration
          </span>
        </span>
      </div>
        <form onSubmit={handleSubmit(onSubmit)} className="w-full gap-y-3">
          <p className="text-md font-semibold text-header-secondary leading-tight mt-4 py-1">
            Ultrasound Configuration
          </p>
          <div className="relative w-[100%] h-[calc(100vh-200px)] bg-light-100 flex flex-col px-4 py-2 gap-3">

            <div className="w-full flex flex-row gap-4">
                <FormInput
                    className={`w-[22.5rem]`}
                    name="usgName"
                    label="Name"
                    placeholder="Type here..."
                    labelClassName="text-[13px]"
                    vertical
                    disabled={isVerifying}
                />
                <FormInput
                    className={`w-[22.5rem]`}
                    name="usgDescription"
                    label="Description"
                    placeholder="Type here..."
                    labelClassName="text-[13px]"
                    vertical
                    disabled={isVerifying}
                />
            </div>

            <div className="w-full flex flex-row gap-4">
              <div className="relative w-[22.5rem]">
                <FormInput
                  className={`w-full relative ${verifyError ? "border-red-500" : ""}`}
                  name="usgIp"
                  label="IP Address"
                  placeholder="0.0.0.0"
                  labelClassName="text-[13px]"
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
                        className={`text-[10px] italic font-normal ${areVerificationFieldsFilled && !verificationErrors && !isVerifying ? "cursor-pointer text-blue-600 underline" : "cursor-not-allowed text-neutral-400"}`}
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
                  name="usgPort"
                  label="Port"
                  placeholder="8080"
                  labelClassName="text-[13px]"
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
                  name="usgAeTitle"
                  label="AE Title"
                  placeholder="Type here..."
                  labelClassName="text-[13px]"
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

            <div className="flex flex-row gap-4 mt-8">
              <div className="w-[18.75rem] flex flex-col gap-4">
                <div className="flex flex-row justify-between items-center">
                  <p className="text-[13px] font-normal text-gray-700 mb-1 capitalize">
                    Region Of Interest
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCropDialogOpen(true)}
                    disabled={!isVerified.current || haveVerificationFieldsChanged}
                    className={`flex items-center gap-2 mr-1 text-primary-500 text-[10px] w-[6rem] h-[1.5rem] border border-primary-500
                      disabled:bg-button-disabled disabled:cursor-not-allowed disabled:border-neutral-300 disabled:text-neutral-700`}
                  >
                    <PlusCircle className="h-4 w-4" stroke={!isVerified.current || haveVerificationFieldsChanged ? "var(--neutral-700)" : "var(--primary-500)"}/>
                    Configure
                  </Button>
                </div>
                <div className="w-[18.75rem] h-[14rem] border border-neutral-300 rounded-md">
                  {(croppedImage || isVerified.current) && !haveVerificationFieldsChanged && (
                    <div className="gap-3">
                      <div className="relative w-full h-[14rem] rounded-lg">
                        <Image
                          src={croppedImage ?? "/images/sample.png"}
                          alt="Cropped USG Image"
                          fill
                          className="object-contain rounded-lg"
                          priority
                        />
                      </div>
                      <p className="text-[13px] mt-[6px] font-normal text-gray-700 tracking-wide">
                          {PacsImage.WIDTH}x{PacsImage.HEIGHT}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="absolute bottom-4 flex justify-center items-center w-full gap-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => handleRoomClick()}
                className="flex items-center gap-2 border border-primary-500 w-[8rem] text-primary-500"
              >
                <X className="h-4 w-4 text-primary-500" />
                <span className="text-sm leading-[1.5rem]">Cancel</span>
              </Button>
              <Button
                type="submit"
                variant="outline-primary"
                disabled={!isConfirmEnabled}
                className={`bg-primary text-light-100 text-sm font-bold flex items-center gap-2 w-[8rem] border-none ${
                  !isConfirmEnabled 
                    ? 'bg-button-disabled text-neutral-600' 
                    : ''
                }`}
              >
                <PlusCircle className="h-4 w-4" stroke={!isConfirmEnabled ? "#222" : "white"}/>
                <span className="text-sm leading-[1.5rem]">Confirm</span>
              </Button>
            </div>
          </div>

          <ImageCropDialog
            open={cropDialogOpen}
            onOpenChange={setCropDialogOpen}
            imageUrl="/images/sample.png"
            initialCrop={!requiresCropConfig && cropData ? cropData : undefined}
            onSave={(newCropData: CropData) => {
              setCropData(newCropData);
              generateCroppedImage(newCropData);
              setRequiresCropConfig(false);
            }}
          />

        <UnSavedDialog
          open={showWarning}
          title="Unsaved Changes"
          message="You will lose all your changes if you proceed."
          onConfirm={() => {
            handleConfirm()
          }}
          onCancel={() => {
            setShowWarning(false)
            isRoomIntegration.current = false;
            requestHref.current = null;
          }}
        />
        
      </form>
    </FormProvider>
  );
}
