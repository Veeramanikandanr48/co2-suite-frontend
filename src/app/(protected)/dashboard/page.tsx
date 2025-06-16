"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DashboardPage() {

  return (
    <>
      <div>
        <h4 className="text-neutral-950 font-heading-1 font-400">Dashboard</h4>
      </div>
      <Tabs defaultValue="overview" className="w-[400px]">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="userAnalytics">User Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
        </TabsContent>
        <TabsContent value="userAnalytics">User Analytics tab here.</TabsContent>
      </Tabs>
    </>

  );
}
