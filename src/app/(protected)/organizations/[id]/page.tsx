'use client';

import React, { useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-provider';
import { MasterRole } from '@/enums/base-enum';
import { useFetchList } from '@/hooks/use-fetchlist';
import { Users, MapPin, FileText, Share2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { showErrorToast } from '@/components/reusables/toast-variant';

// Modularized Organization Components
import { OrgHeader } from '@/components/organizations/org-header';
import { OrgOverviewTab } from '@/components/organizations/org-overview-tab';
import { OrgMembersTab, OrgUser, TableOrgUser } from '@/components/organizations/org-members-tab';
import { OrgServicesTab } from '@/components/organizations/org-services-tab';
import { OrgFacilitiesTab } from '@/components/organizations/org-facilities-tab';
import { OrgDialogs } from '@/components/organizations/org-dialogs';
import { useOrgDetails } from './use-org-details';
import { createOrgUserColumns } from './org-user-columns';
import { OrgLoadingState, OrgNotFoundState } from './org-loading-view';

export default function OrganizationDetailsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const orgId = params.id as string;

  const isSuperAdmin = user?.roleId === MasterRole.SUPER_ADMIN;
  const isAdmin = user?.roleId === MasterRole.ADMIN;
  const canEdit = isSuperAdmin || isAdmin;

  const {
    loading,
    orgDetails,
    isEditing,
    setIsEditing,
    isSubmitting,
    isDeleteOpen,
    setIsDeleteOpen,
    isAddMemberOpen,
    setIsAddMemberOpen,
    isAddingMember,
    editForm,
    setEditForm,
    addMemberForm,
    setAddMemberForm,
    allServices,
    orgServices,
    subscribedServiceIds,
    servicesLoading,
    assigningServiceId,
    removingServiceId,
    fetchOrgServices,
    handleAssignService,
    handleRemoveService,
    facilities,
    filteredFacilities,
    facilitiesLoading,
    facilitySearch,
    setFacilitySearch,
    isAddFacilityOpen,
    setIsAddFacilityOpen,
    editingFacility,
    deletingFacility,
    setDeletingFacility,
    isSavingFacility,
    facilityForm,
    setFacilityForm,
    fetchOrgFacilities,
    handleOpenAddFacility,
    handleOpenEditFacility,
    handleSaveFacility,
    handleDeleteFacilityConfirm,
    handleCancelEdit,
    handleSave,
    handleAddMemberSubmit,
    handleDeactivate,
  } = useOrgDetails(orgId, isSuperAdmin);

  const usersFilterEndpoint = useMemo(
    () => (canEdit ? `organizations/${orgId}/users/filter` : ''),
    [canEdit, orgId],
  );

  const {
    list: userList,
    totalCount: userTotalCount,
    isLoadingMore: userIsLoadingMore,
    hasMore: userHasMore,
    setSearch: setUserSearch,
    loadMore: userLoadMore,
    refetch: userRefetch,
  } = useFetchList<OrgUser>(usersFilterEndpoint);

  useEffect(() => {
    if (user && !isSuperAdmin && user.organizationId && String(user.organizationId) !== orgId) {
      showErrorToast('You can only access your assigned organization.');
      router.replace(`/organizations/${user.organizationId}`);
    }
  }, [user, isSuperAdmin, orgId, router]);

  const userTableData: TableOrgUser[] = useMemo(
    () => userList.map((u) => ({ ...u, id: String(u.id), rawId: u.id })),
    [userList],
  );

  const userColumns = useMemo(() => createOrgUserColumns(), []);

  if (loading) {
    return <OrgLoadingState />;
  }

  if (!orgDetails) {
    return <OrgNotFoundState isSuperAdmin={isSuperAdmin} />;
  }

  return (
    <div className="h-full flex flex-col bg-[#F8F9FA]">
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <Tabs defaultValue="overview" className="flex-1 flex flex-col min-h-0">
          <OrgHeader
            orgDetails={orgDetails}
            userTotalCount={userTotalCount}
            isSuperAdmin={isSuperAdmin}
            canEdit={canEdit}
            isEditing={isEditing}
            isSubmitting={isSubmitting}
            onEditToggle={() => setIsEditing(true)}
            onSave={handleSave}
            onCancelEdit={handleCancelEdit}
            onDeactivateOpen={() => setIsDeleteOpen(true)}
            onBack={() => router.push('/organizations')}
          />

          <div className="shrink-0 bg-white border-b border-[#E2E8F0] px-8">
            <TabsList className="bg-transparent border-0 p-0 h-auto gap-1 rounded-none">
              <TabsTrigger
                value="overview"
                className="relative flex items-center gap-2 px-4 py-3.5 text-xs font-bold rounded-none text-[#64748B] bg-transparent border-0 shadow-none hover:text-[#4355F5] data-[state=active]:text-[#4355F5] data-[state=active]:bg-transparent data-[state=active]:shadow-none after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#4355F5] after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                Overview
              </TabsTrigger>
              {canEdit && (
                <TabsTrigger
                  value="members"
                  className="relative flex items-center gap-2 px-4 py-3.5 text-xs font-bold rounded-none text-[#64748B] bg-transparent border-0 shadow-none hover:text-[#4355F5] data-[state=active]:text-[#4355F5] data-[state=active]:bg-transparent data-[state=active]:shadow-none after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#4355F5] after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform transition-colors cursor-pointer"
                >
                  <Users className="w-4 h-4" />
                  Members
                  <span className="ml-1 inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-[#EEF4FF] text-[#4355F5] text-[11px] font-bold">
                    {userTotalCount}
                  </span>
                </TabsTrigger>
              )}
              <TabsTrigger
                value="services"
                onClick={() => { if (orgServices.length === 0 && allServices.length === 0) fetchOrgServices(); }}
                className="relative flex items-center gap-2 px-4 py-3.5 text-xs font-bold rounded-none text-[#64748B] bg-transparent border-0 shadow-none hover:text-[#4355F5] data-[state=active]:text-[#4355F5] data-[state=active]:bg-transparent data-[state=active]:shadow-none after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#4355F5] after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform transition-colors cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                Services
                <span className="ml-1 inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-[#EEF4FF] text-[#4355F5] text-[11px] font-bold">
                  {subscribedServiceIds.size}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="facilities"
                onClick={fetchOrgFacilities}
                className="relative flex items-center gap-2 px-4 py-3.5 text-xs font-bold rounded-none text-[#64748B] bg-transparent border-0 shadow-none hover:text-[#4355F5] data-[state=active]:text-[#4355F5] data-[state=active]:bg-transparent data-[state=active]:shadow-none after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#4355F5] after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform transition-colors cursor-pointer"
              >
                <MapPin className="w-4 h-4" />
                Facility Sites
                <span className="ml-1 inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-[#EEF4FF] text-[#4355F5] text-[11px] font-bold">
                  {facilities.length}
                </span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="flex-1 min-h-0 overflow-y-auto outline-none scrollBar">
            <OrgOverviewTab
              orgDetails={orgDetails}
              isEditing={isEditing}
              isSubmitting={isSubmitting}
              editForm={editForm}
              setEditForm={setEditForm}
              onSave={handleSave}
              onCancelEdit={handleCancelEdit}
            />
          </TabsContent>

          {canEdit && (
            <TabsContent value="members" className="flex-1 min-h-0 flex flex-col outline-none">
              <OrgMembersTab
                userTableData={userTableData}
                userColumns={userColumns}
                userTotalCount={userTotalCount}
                userIsLoadingMore={userIsLoadingMore}
                userHasMore={userHasMore}
                setUserSearch={setUserSearch}
                userLoadMore={userLoadMore}
                canEdit={canEdit}
                onAddMemberOpen={() => setIsAddMemberOpen(true)}
              />
            </TabsContent>
          )}

          <TabsContent value="services" className="flex-1 min-h-0 overflow-y-auto outline-none scrollBar">
            <OrgServicesTab
              allServices={allServices}
              orgServices={orgServices}
              subscribedServiceIds={subscribedServiceIds}
              servicesLoading={servicesLoading}
              isSuperAdmin={isSuperAdmin}
              assigningServiceId={assigningServiceId}
              removingServiceId={removingServiceId}
              onRefresh={fetchOrgServices}
              onAssignService={handleAssignService}
              onRemoveService={handleRemoveService}
            />
          </TabsContent>

          <TabsContent value="facilities" className="flex-1 min-h-0 overflow-y-auto outline-none scrollBar">
            <OrgFacilitiesTab
              facilities={facilities}
              filteredFacilities={filteredFacilities}
              facilitiesLoading={facilitiesLoading}
              facilitySearch={facilitySearch}
              setFacilitySearch={setFacilitySearch}
              canEdit={canEdit}
              orgName={orgDetails.name}
              onOpenAddFacility={handleOpenAddFacility}
              onOpenEditFacility={handleOpenEditFacility}
              onDeleteFacilityConfirmOpen={(fac) => setDeletingFacility(fac)}
            />
          </TabsContent>
        </Tabs>
      </div>

      <OrgDialogs
        isDeleteOpen={isDeleteOpen}
        setIsDeleteOpen={setIsDeleteOpen}
        isSubmitting={isSubmitting}
        onDeactivate={handleDeactivate}
        orgName={orgDetails.name}

        isAddMemberOpen={isAddMemberOpen}
        setIsAddMemberOpen={setIsAddMemberOpen}
        isAddingMember={isAddingMember}
        addMemberForm={addMemberForm}
        setAddMemberForm={setAddMemberForm}
        onAddMemberSubmit={(e) => handleAddMemberSubmit(e, userRefetch)}

        isAddFacilityOpen={isAddFacilityOpen}
        setIsAddFacilityOpen={setIsAddFacilityOpen}
        editingFacility={editingFacility}
        facilityForm={facilityForm}
        setFacilityForm={setFacilityForm}
        isSavingFacility={isSavingFacility}
        onSaveFacility={handleSaveFacility}

        deletingFacility={deletingFacility}
        setDeletingFacility={setDeletingFacility}
        onDeleteFacilityConfirm={handleDeleteFacilityConfirm}
      />
    </div>
  );
}
