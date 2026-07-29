"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  User as UserIcon,
  Mail,
  Shield,
  Key,
  CheckCircle2,
  Building,
  Briefcase,
  Phone,
  Lock,
  Save,
  Sparkles,
} from "lucide-react";

export function ProfileView() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: "+1 (555) 234-5678",
    jobTitle: "Sustainability Director",
    department: "ESG & Compliance",
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    setTimeout(() => {
      if (user) {
        updateUser({
          ...user,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
        });
      }
      setIsSaving(false);
      toast({
        title: "Profile updated successfully",
        description: "Your personal information has been saved.",
      });
    }, 600);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwords.currentPassword) {
      toast({
        title: "Current password required",
        description: "Please enter your current password.",
        variant: "destructive",
      });
      return;
    }
    if (passwords.newPassword.length < 8) {
      toast({
        title: "Weak password",
        description: "New password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "New password and confirmation do not match.",
        variant: "destructive",
      });
      return;
    }

    setIsUpdatingPassword(true);
    setTimeout(() => {
      setIsUpdatingPassword(false);
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast({
        title: "Password updated",
        description: "Your account password has been changed successfully.",
      });
    }, 800);
  };

  const initials = `${formData.firstName.charAt(0)}${formData.lastName.charAt(0)}`.toUpperCase() || "U";

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 p-6 sm:p-8 text-white shadow-lg">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-10 pointer-events-none">
          <Sparkles className="w-64 h-64" />
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/20 backdrop-blur-md border-2 border-white/40 flex items-center justify-center text-white font-bold text-2xl sm:text-3xl shadow-inner shrink-0">
            {initials}
          </div>
          <div className="text-center sm:text-left space-y-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight capitalize">
                {formData.firstName} {formData.lastName}
              </h1>
              <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 font-medium px-2.5 py-0.5">
                Admin
              </Badge>
            </div>
            <p className="text-emerald-100 text-sm flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="w-3.5 h-3.5 opacity-80" />
              <span>{formData.email || "user@co2suite.com"}</span>
            </p>
            <div className="pt-2 flex flex-wrap justify-center sm:justify-start gap-3 text-xs text-emerald-100/90">
              <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-md">
                <Briefcase className="w-3.5 h-3.5" />
                {formData.jobTitle}
              </span>
              <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-md">
                <Building className="w-3.5 h-3.5" />
                CO2 Suite Enterprise
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Main Tabs */}
      <Tabs defaultValue="personal" className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[450px] bg-background-inner p-1 border border-border rounded-xl">
          <TabsTrigger value="personal" className="flex items-center gap-2 text-xs sm:text-sm rounded-lg">
            <UserIcon className="w-4 h-4" />
            <span>Personal Info</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2 text-xs sm:text-sm rounded-lg">
            <Key className="w-4 h-4" />
            <span>Security</span>
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2 text-xs sm:text-sm rounded-lg">
            <Shield className="w-4 h-4" />
            <span>Role & Access</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Personal Info Form */}
        <TabsContent value="personal">
          <Card className="border border-border shadow-sm rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-emerald-600" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Update your account details and contact information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-muted-foreground" /> Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-muted-foreground" /> Phone Number
                    </Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle" className="flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-muted-foreground" /> Job Title
                    </Label>
                    <Input
                      id="jobTitle"
                      value={formData.jobTitle}
                      onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department" className="flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-muted-foreground" /> Department
                    </Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                    <Save className="w-4 h-4" />
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Security */}
        <TabsContent value="security">
          <Card className="border border-border shadow-sm rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-600" />
                Security & Password
              </CardTitle>
              <CardDescription>
                Manage your login credentials and authentication security.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-5 max-w-lg">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwords.currentPassword}
                    onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>

                <div className="bg-background-inner/50 border border-border p-3.5 rounded-lg space-y-2 text-xs text-muted-foreground">
                  <p className="font-semibold text-foreground">Password requirements:</p>
                  <ul className="space-y-1 list-disc pl-4">
                    <li>Minimum 8 characters in length</li>
                    <li>At least one uppercase and one lowercase letter</li>
                    <li>At least one number or special character</li>
                  </ul>
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" disabled={isUpdatingPassword} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                    <Key className="w-4 h-4" />
                    {isUpdatingPassword ? "Updating..." : "Update Password"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Role & Access */}
        <TabsContent value="account">
          <Card className="border border-border shadow-sm rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-600" />
                Role & System Privileges
              </CardTitle>
              <CardDescription>
                Overview of assigned access permissions and active workspace roles.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border border-border rounded-xl bg-background-inner/30 space-y-1">
                  <span className="text-xs text-muted-foreground">Assigned Role</span>
                  <p className="text-base font-semibold text-foreground flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-600" /> System Administrator
                  </p>
                </div>
                <div className="p-4 border border-border rounded-xl bg-background-inner/30 space-y-1">
                  <span className="text-xs text-muted-foreground">Account Status</span>
                  <p className="text-base font-semibold text-emerald-600 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Active & Verified
                  </p>
                </div>
                <div className="p-4 border border-border rounded-xl bg-background-inner/30 space-y-1">
                  <span className="text-xs text-muted-foreground">Identity Provider</span>
                  <p className="text-base font-semibold text-foreground capitalize">
                    {user?.idpId || "Local Credentials"}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground">Active Role Privileges</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    "Manage Facilities & Locations",
                    "Emission Inventory Data Entry",
                    "Emission Factors Customization",
                    "Organization Onboarding & Audit",
                    "Export Compliance & Carbon Reports",
                    "User Administration & Access Delegation",
                  ].map((permission) => (
                    <div key={permission} className="flex items-center gap-2.5 p-3 rounded-lg border border-border/80 bg-background text-xs font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{permission}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
