'use client'

import { useEffect, useState } from "react";
import { apiService } from "~/lib/api-service";
import { API_LIST } from "~/lib/api-list";
import { CustomAxiosResponse } from "~/types";
import { RoomData, RoomListResponse } from "~/types/device";
import RoomItem from "~/components/device-integration/room-item";
import { DeleteDialog } from "~/components/reusables/dialogs/delete";
import { SubheadingDivider } from "~/components/reusables/form-fields/sub-heading";
import AddRoomDialog from "~/components/device-integration/add-room-dialog";
import { PlusCircle } from "~/components/svg";
import { Button } from "~/components/ui/button";
import { ROOM_INTEGRATION_TEST_IDS } from '@/components/test-ids/room-integration.ids'
import { useLoader } from '@/context/loader-context';

export default function RoomIntegrationPage() {
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [existingRoomName, setExistingRoomName] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(false)

  const { showLoader, hideLoader } = useLoader();

  const fetchRooms = async () => {
    try {
      setIsLoading(true)
      const response: CustomAxiosResponse<RoomListResponse> = await apiService.post(
        API_LIST.GET_ALL_ROOMS, 
        undefined, 
        { headers: { 'X-Skip-Toast': 'true' } }
      );
      
      if (response?.success && response?.data?.listData) {
        setExistingRoomName(response?.data?.listData.map(room => room.roomName));
        setRooms(response?.data?.listData);
      }
    } catch {
    } finally {
      setIsLoading(false)
    }
  };

  const handleDelete = (roomId: number) => {
    setSelectedRoomId(roomId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedRoomId) {
      try {
        setIsLoading(true)
        const response: CustomAxiosResponse = await apiService.put(API_LIST.DELETE_ROOM, selectedRoomId, undefined,
          { headers: { 'X-Skip-Toast': 'false' } }
        );
        if (response?.success) {
          await fetchRooms();
        }
      } catch {
      } finally {
        setIsLoading(false)
      }
    }
    setDeleteDialogOpen(false);
    setSelectedRoomId(null);
  };

  useEffect(() => {
    if (isLoading) {
      showLoader();
    } else {
      hideLoader();
    }
  }, [isLoading, showLoader, hideLoader]);

  useEffect(() => {
    fetchRooms();
  }, []);

  return (
    <div data-testid={ROOM_INTEGRATION_TEST_IDS.PAGE_CONTAINER}>
      <SubheadingDivider data-testid={ROOM_INTEGRATION_TEST_IDS.SUBHEADING_DIVIDER}>
        Device Integration
      </SubheadingDivider>
      <p className="text-base font-semibold text-header-secondary py-4 leading-tight capitalize" data-testid={ROOM_INTEGRATION_TEST_IDS.ROOM_CONFIG_HEADER}>
          Room Integration
        </p>

      <div 
        className="w-full h-[calc(100vh-180px)] bg-light-200 box-shadow-lg rounded-xs flex flex-col mt-1"
        style={{ boxShadow: '2px 2px 7px rgba(0, 0, 0, 0.3)' }}
        data-testid={ROOM_INTEGRATION_TEST_IDS.ROOM_CONFIG_SECTION}
      > 
        <div className="flex flex-row justify-between items-center px-4 py-3">
          <Button 
            onClick={() => setDialogOpen(true)}
            className="bg-primary-500 hover:bg-primary-600 text-light-100 text-sm font-bold rounded-sm leading-[24px] px-[13px] py-2"
            data-testid={ROOM_INTEGRATION_TEST_IDS.ADD_ROOM_BUTTON}
          >
            <PlusCircle className="h-5 w-5" stroke="white" />
            <span className="ml-2">Add A Room</span>
          </Button>
        </div>
        <div 
          className="flex flex-col gap-2 overflow-y-auto h-[calc(100vh-140px)] overflow-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 hover:[&::-webkit-scrollbar-thumb]:bg-gray-400"
          data-testid={ROOM_INTEGRATION_TEST_IDS.ROOM_LIST}
        >
          {rooms.map((room) => (
            <RoomItem
              key={room.roomId}
              room={room}
              onDelete={handleDelete}
              data-testid={ROOM_INTEGRATION_TEST_IDS.ROOM_ITEM}
            />
          ))}
        </div>
      </div>

      <DeleteDialog
        open={deleteDialogOpen}
        title="Delete Room?"
        message={`This will permanently delete ${rooms.find(room => room?.roomId === selectedRoomId)?.roomName} and all <br>associated device configurations.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setSelectedRoomId(null);
        }}
        data-testid={ROOM_INTEGRATION_TEST_IDS.DELETE_DIALOG}
      />

      <AddRoomDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onDelete={handleDeleteConfirm}
        onCancel={() => setDialogOpen(false)}
        onConfirm={() => {
          setDialogOpen(false);
          fetchRooms();
        }}
        existingRooms={existingRoomName ?? []}
        data-testid={ROOM_INTEGRATION_TEST_IDS.ADD_ROOM_DIALOG}
      />
    </div>
  );
}
