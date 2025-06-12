"use client";
import { useParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DashboardPage() {
  const params = useParams();
  const { slug } = params;

  return (
    <>
      <div>
        <h4 className="text-neutral-950 font-heading-1 font-400">Dashboard: {slug}</h4>
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
