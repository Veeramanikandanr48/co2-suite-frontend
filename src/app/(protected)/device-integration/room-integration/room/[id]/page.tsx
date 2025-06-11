'use client';

import { useParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { apiService } from "@/lib/api-service";
import { API_LIST } from "@/lib/api-list";
import { CustomAxiosResponse } from "@/types";
import { RoomData } from "@/types/device";
import { SubheadingDivider } from "~/components/reusables/form-fields/sub-heading";
import { UsgConfigurationSummary } from "~/components/device-integration/usg-summary";
import { BlackboxConfigurationSummary } from "~/components/device-integration/blackbox-summary";
import { parseJson } from "~/lib/helpers";
import Link from 'next/link';
import { UnSavedDialog } from "@/components/reusables/dialogs/unsaved.dialog";
import { ChevronRight } from "lucide-react";
import EventBus from "@/components/composables/eventbus";
import { useLoader } from '@/context/loader-context';

export default function RoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [isBlackboxConfigured, setIsBlackboxConfigured] = useState(false);
  const [isUsgConfigured, setIsUsgConfigured] = useState(false);
  const [roomName, setRoomName] = useState<string | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const currentRoute: string = usePathname();
  const requestHref = useRef<string | null>(null);
  const [isLoading, setIsLoading] = useState(false)

  const { showLoader, hideLoader } = useLoader();

  const fetchRoomDetails = useCallback(async () => {
    try {
      setIsLoading(true)
      if (!params.id) return;
      const response: CustomAxiosResponse<RoomData> =
        await apiService.getById(API_LIST.GET_ROOM_DETAILS_BY_ROOM_ID, params.id as string, undefined,
          { headers: { 'X-Skip-Toast': 'true' } }
        );

      if (response?.success) {
        setRoomName(response?.data?.roomName);
        const parsedBlackbox = parseJson(response?.data?.blackboxVerificationDetails);
        const parsedUsg = parseJson(response?.data?.usgVerificationDetails);
        setIsBlackboxConfigured(parsedBlackbox?.success ?? false);
        setIsUsgConfigured(parsedUsg?.success ?? false);
      }
    } catch {
    } finally {
      setIsLoading(false)
    }
  }, [params.id]);

  useEffect(() => {
    fetchRoomDetails();
  }, [params.id, fetchRoomDetails]);

  const handleBlackboxConfigure = () => {
    router.push(`/device-integration/room-integration/room/${params.id}/blackbox-configuration`);
  };

  const handleUsgConfigure = () => {
    router.push(`/device-integration/room-integration/room/${params.id}/usg-configuration`);
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
      setIsLoading(false)
      setShowWarning(false);
    }
  };

  const handleWarningCancel = () => {
    setShowWarning(false);
  };

  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    handleCancel()
  };

  const handleCancel = (newHref: string | undefined = undefined) => {
    if(newHref){
      requestHref.current = newHref;
    }
    if (!isBlackboxConfigured && !isUsgConfigured) {
      setShowWarning(true);
    } else {
      router.push(requestHref.current ?? '/device-integration/room-integration');
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
    <div className="w-full space-y-4">
      <SubheadingDivider> Device Integration</SubheadingDivider>
      <div>
        <span className="flex items-center gap-1 text-[16px] font-semibold text-header-secondary">
          <Link 
            href="/device-integration/room-integration" 
            onClick={(e) => handleNavigation(e)}
            className="hover:underline flex items-center text-neutral-400 font-semibold text-lg capitalize"
          >
            Room Integration
          </Link>
          <ChevronRight className="w-7 h-7" />
          <span className="flex items-center text-neutral-400 font-semibold text-lg capitalize">
            {roomName}
          </span>
        </span>
      </div>
      <div className="w-full h-[calc(100vh-180px)] bg-light-200 box-shadow-lg rounded-xs"
        style={{ boxShadow: '2px 2px 7px rgba(0, 0, 0, 0.3)' }}
      >
        <UsgConfigurationSummary
          connectionStatus={isUsgConfigured}
          onConfigure={handleUsgConfigure}
        />
        <BlackboxConfigurationSummary
          connectionStatus={isBlackboxConfigured}
          onConfigure={handleBlackboxConfigure}
        />
      </div>

      <UnSavedDialog
        open={showWarning}
        title="Unsaved Changes"
        message="You will lose all your changes if you proceed."
        onConfirm={handleWarningConfirm}
        onCancel={handleWarningCancel}
      />
    </div>
  );
}