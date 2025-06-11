"use client"
import { Dialog, DialogContent, DialogTitle, DialogOverlay, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { PlusCircle, Close } from "../svg"
import FormInput from "../reusables/form-fields/form-input"
import { FormProvider, useForm } from "react-hook-form"
import { apiService } from "~/lib/api-service"
import { CustomAxiosResponse } from "~/types"
import { API_LIST } from "~/lib/api-list"
import { zodResolver } from "@hookform/resolvers/zod"
import { FORM_DEFAULT_VALUES } from "~/lib/variables"
import { RoomNameSchema } from "~/lib/schemas"
import { AddRoomDialogProps, RoomData } from "~/types/device"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ROOM_INTEGRATION_TEST_IDS } from "~/components/test-ids/room-integration.ids"
import { useLoader } from "@/context/loader-context";

export default function AddRoomDialog({ open,
    onOpenChange,
    onConfirm,
    existingRooms
  }: Readonly<AddRoomDialogProps>) {

  const router = useRouter();
  const { showLoader, hideLoader } = useLoader();
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm({
    resolver: zodResolver(RoomNameSchema),
    defaultValues: FORM_DEFAULT_VALUES.roomName,
    mode: "onChange",
  });

  const { formState } = form;

  const handleCancel = () => {
    onOpenChange(false)
    form.reset(FORM_DEFAULT_VALUES.roomName)
  }

  const handleAddRoom = async (data: { name: string }) => {
    try {
      setIsLoading(true)
      const payload = {
        roomName: data.name
      }
    const response: CustomAxiosResponse<RoomData> = 
      await apiService.post(API_LIST.CREATE_ROOM, payload, { headers: { 'X-Skip-Toast': 'false' } });
    if (response.success) {
      onOpenChange(false);
        router.push(`/device-integration/room-integration/room/${response?.data?.roomId}`);
      }
    } catch {
    } finally {
      setIsLoading(false)
    }
  };

  useEffect(() => {
    if (open) {
      form.reset(FORM_DEFAULT_VALUES.roomName);
      if (existingRooms && existingRooms.length > 0) {
        form.setValue('contextRoomValue', existingRooms);
      }
    }
  }, [open, existingRooms, form]);

  useEffect(() => {
    if (isLoading) {
      showLoader();
    } else {
      hideLoader();
    }
  }, [isLoading, showLoader, hideLoader]);

  return (
    <Dialog open={open} data-testid={ROOM_INTEGRATION_TEST_IDS.ADD_ROOM_DIALOG}>
      <DialogOverlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-3xs" />
      <DialogDescription className="h-0"> </DialogDescription>
      <DialogContent className="sm:max-w-[553px] p-0 gap-0">
        <DialogTitle> </DialogTitle>
        <div className="flex justify-between items-center px-4 pt-3">
          <p className="text-base font-bold text-neutral-400 ">Add a Room</p>
          <button 
            onClick={handleCancel} 
            className="text-gray-700 hover:text-gray-500"
            data-testid={ROOM_INTEGRATION_TEST_IDS.CANCEL_ADD_BUTTON}
          >
            <Close className="h-6 w-6" stroke="var(--neutral-800)"/>
          </button>
        </div>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(handleAddRoom)}>
            <div className="p-6 pr-8 min-h-[130px] mt-8">
              <p className="text-[10px] font-bold text-neutral-500 mb-1">Room Name</p>
              <FormInput
                name="name"
                placeholder="type here..."
                className="w-full"
                vertical
                data-testid={ROOM_INTEGRATION_TEST_IDS.ROOM_NAME_INPUT}
                autoFocus
              />
            </div>

            <div className="flex justify-center gap-12 p-4 border-t-[1px] border-neutral-400">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="flex items-center rounded-sm gap-2 border-primary text-primary w-[120px]"
                data-testid={ROOM_INTEGRATION_TEST_IDS.CANCEL_ADD_BUTTON}
              >
                <Close className="h-4 w-4" />
                Cancel
              </Button>
              <Button
                type="submit"
                onClick={onConfirm}
                disabled={!formState.isValid}
                className={`flex items-center rounded-sm text-bold gap-2 bg-primary-500 text-light-100 w-[120px] disabled:button-disabled`}
                data-testid={ROOM_INTEGRATION_TEST_IDS.CONFIRM_ADD_BUTTON}
              >
                <PlusCircle className="h-4 w-4" stroke={`${formState.isValid ? "white" : "#444"}`}/>
                Create
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
