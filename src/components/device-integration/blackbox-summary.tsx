"use client";

import { Button } from "@/components/ui/button";
import { Gear, Verified, NotVerified } from "@/components/svg";
import FormInput from "@/components/reusables/form-fields/form-input";
import { PacsConfigurationSummaryProps, RoomData } from "~/types/device";
import { FormProvider, useForm } from "react-hook-form";
import { BlackboxConfigurationSchema } from "~/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { FORM_DEFAULT_VALUES } from "~/lib/variables";
import { BlackboxConfigurationType } from "~/types/form";
import { useState, useEffect } from "react";
import { WarningDialog } from "../reusables/dialogs/warning";
import { apiService } from "~/lib/api-service";
import { CustomAxiosResponse } from "~/types";
import { API_LIST } from "~/lib/api-list";
import { useParams } from "next/navigation";
import { parseJson } from "~/lib/helpers";
import { useLoader } from "@/context/loader-context";

export function BlackboxConfigurationSummary({
  onConfigure,
}: Readonly<PacsConfigurationSummaryProps>) {

    const params = useParams();
    const { showLoader, hideLoader } = useLoader();
    const [isLoading, setIsLoading] = useState(false)

    const [warningOpen, setWarningOpen] = useState(false);
    const [isVerified, setIsVerified] = useState(false);

    const form = useForm<BlackboxConfigurationType>({
      resolver: zodResolver(BlackboxConfigurationSchema),
      defaultValues: FORM_DEFAULT_VALUES.blackboxConfiguration,
      mode: "onBlur",
    });

    const blackboxName = form.watch("blackboxName");
  
    useEffect(() => {
        const fetchRoomDetails = async () => {
          try {
            setIsLoading(true)
            const response: CustomAxiosResponse<RoomData> =
              await apiService.getById(API_LIST.GET_ROOM_DETAILS_BY_ROOM_ID, params.id as string, undefined,
                { headers: { 'X-Skip-Toast': 'true' } }
              );
            if (response.success) {
              const { blackboxIp, blackboxPort, blackboxAeTitle, roomId, blackboxId, blackboxName, blackboxDescription } = response.data;
              form.reset({
                blackboxName,
                blackboxDescription,
                blackboxIp,
                blackboxPort: blackboxPort.toString(),
                blackboxAeTitle,
                roomId,
                blackboxId
              });
              const verificationDetails = parseJson(response?.data?.blackboxVerificationDetails);
              setIsVerified(verificationDetails?.success);
            }
          } catch {
          } finally {
            setIsLoading(false)
          }
        };
        if (params.id) {
          fetchRoomDetails();
        }
      }, [params.id, form]);

     useEffect(() => {
       if (isLoading) {
         showLoader();
       } else {
         hideLoader();
       }
     }, [isLoading, showLoader, hideLoader]);

    return (
        <FormProvider {...form}>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="flex flex-col justify-between w-full gap-4 px-[6px] py-2">
              <p className="text-base font-semibold text-header-secondary px-1 leading-[28px]">
                {blackboxName || "OMEA (AI/Blackbox/Link)"}
              </p>
              <div className="flex flex-col gap-4 bg-background-outer rounded-lg p-4">
                <div className="flex justify-between items-center w-full">
                  <p className="text-sm font-medium text-header-secondary leading-[20px]">
                    Connection Status
                  </p>
                  {isVerified ? (
                    <div className="flex items-center gap-2 mr-[0.8rem]">
                      <p className="text-xs font-normal italic text-neutral-400 leading-[1.5rem]">
                        Verified
                      </p>
                      <Verified className="h-4 w-4 text-neutral-500" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mr-[0.8rem]">
                      <NotVerified className="h-4 w-4 text-neutral-500" />
                      <p className="text-[10px] font-normal italic text-neutral-400 leading-[19.5px]">
                        not verified
                      </p>
                    </div>
                  )}
                </div>
  
                <div className="flex flex-row justify-between items-end gap-4">
                  <div className="flex flex-row gap-4">
                    <FormInput
                      className="w-[22.5rem] disabled:cursor-not-allowed disabled:opacity-100 disabled:text-text-primary text-wrap"
                      name="blackboxIp"
                      label="IP Address"
                      vertical
                      disabled
                    />
                    <FormInput
                      className="w-[10rem] disabled:cursor-not-allowed disabled:opacity-100 disabled:text-text-primary"
                      name="blackboxPort"
                      label="Port"
                      vertical
                      disabled
                    />
                    <FormInput
                      className="w-[11.25rem] disabled:cursor-not-allowed disabled:opacity-100 disabled:text-text-primary"
                      name="blackboxAeTitle"
                      label="AE Title"
                      vertical
                      disabled
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setWarningOpen(true)}
                    className="flex items-center justify-center gap-2 !px-[22px] !py-[10px] bg-light-100 rounded-sm"
                  >
                    <Gear className="h-4 w-4" stroke="var(--primary-500)"/>
                    Configure
                  </Button>
                </div>
              </div>
            </div>
          </form>

          <WarningDialog
            open={warningOpen}
            title="Configuration Warning"
            message="Changes made here may impact system functionality.<br>Only continue if you're familiar with this task."
            onConfirm={onConfigure}
            onCancel={() => setWarningOpen(false)}
          />
        </FormProvider>
    );
}