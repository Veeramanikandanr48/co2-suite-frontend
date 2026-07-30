'use client';

import React, { useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/auth-provider';
import { MasterRole } from '@/types/enums';
import { useFetchList } from '@/hooks/use-fetch-list';
import { Users, MapPin, FileText, Share2, Building2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { showErrorToast } from '@/components/shared/toast-variant';
import { PageHeader } from '@/components/shared';

// Modularized Organization Components
import { OrgHeader } from '@/features/organizations/components/org-header';
import { OrgOverviewTab } from '@/features/organizations/components/tabs/org-overview-tab';
import { OrgMembersTab, OrgUser, TableOrgUser } from '@/features/organizations/components/tabs/org-members-tab';
import { OrgServicesTab } from '@/features/organizations/components/tabs/org-services-tab';
import { OrgFacilitiesTab } from '@/features/organizations/components/tabs/org-facilities-tab';
import { OrgDialogs } from '@/features/organizations/components/dialogs/org-dialogs';
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
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="page-container"
    >
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

          <div className="shrink-0 bg-card border-b border-border px-8">
            <TabsList className="bg-transparent border-0 p-0 h-auto gap-1 rounded-none">
              <TabsTrigger
                value="overview"
                className="tab-underline"
              >
                <FileText className="w-4 h-4" />
                Overview
              </TabsTrigger>
              {canEdit && (
                <TabsTrigger
                  value="members"
                  className="tab-underline"
                >
                  <Users className="w-4 h-4" />
                  Members
                  <span className="tab-badge">{userTotalCount}</span>
                </TabsTrigger>
              )}
              <TabsTrigger
                value="services"
                onClick={() => { if (orgServices.length === 0 && allServices.length === 0) fetchOrgServices(); }}
                className="tab-underline"
              >
                <Share2 className="w-4 h-4" />
                Services
                <span className="tab-badge">{subscribedServiceIds.size}</span>
              </TabsTrigger>
              <TabsTrigger
                value="facilities"
                onClick={fetchOrgFacilities}
                className="tab-underline"
              >
                <MapPin className="w-4 h-4" />
                Facility Sites
                <span className="tab-badge">{facilities.length}</span>
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
    </motion.div>
  );
}
