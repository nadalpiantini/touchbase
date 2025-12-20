"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Input,
} from "@/components/ui";

type OrgMember = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  joined_at: string;
};

type OrgDetails = {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  created_at: string;
  members: OrgMember[];
  classCount: number;
  moduleCount: number;
};

export default function OrganizationDetailPage() {
  const t = useTranslations("admin.organizations.detail");
  const locale = useLocale();
  const params = useParams();
  const orgId = params.id as string;

  const [org, setOrg] = useState<OrgDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("student");

  useEffect(() => {
    loadOrganization();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  const loadOrganization = async () => {
    try {
      const res = await fetch(`/api/admin/organizations/${orgId}`);
      if (res.ok) {
        const data = await res.json();
        setOrg(data);
        setEditName(data.name);
      } else {
        // Mock data
        setOrg({
          id: orgId,
          name: "TouchBase Academy",
          slug: "touchbase-academy",
          created_at: new Date().toISOString(),
          classCount: 10,
          moduleCount: 25,
          members: [
            {
              id: "1",
              email: "admin@touchbase.academy",
              full_name: "Admin User",
              role: "owner",
              joined_at: new Date().toISOString(),
            },
            {
              id: "2",
              email: "teacher1@touchbase.academy",
              full_name: "Sarah Johnson",
              role: "teacher",
              joined_at: new Date().toISOString(),
            },
            {
              id: "3",
              email: "student1@touchbase.academy",
              full_name: "Alex Rivera",
              role: "student",
              joined_at: new Date().toISOString(),
            },
          ],
        });
        setEditName("TouchBase Academy");
      }
    } catch (error) {
      console.error("Error loading organization:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/admin/organizations/${orgId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName }),
      });

      if (res.ok) {
        setOrg((prev) => (prev ? { ...prev, name: editName } : null));
        setEditing(false);
      }
    } catch (error) {
      console.error("Error updating organization:", error);
    }
  };

  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) return;

    try {
      const res = await fetch(`/api/admin/organizations/${orgId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newMemberEmail, role: newMemberRole }),
      });

      if (res.ok) {
        await loadOrganization();
        setShowAddMember(false);
        setNewMemberEmail("");
        setNewMemberRole("student");
      }
    } catch (error) {
      console.error("Error adding member:", error);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm(t("confirmRemoveMember"))) return;

    try {
      const res = await fetch(
        `/api/admin/organizations/${orgId}/members/${memberId}`,
        {
          method: "DELETE",
        }
      );

      if (res.ok) {
        await loadOrganization();
      }
    } catch (error) {
      console.error("Error removing member:", error);
    }
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, "success" | "info" | "warning"> = {
      owner: "warning",
      admin: "warning",
      teacher: "info",
      student: "success",
    };
    return (
      <Badge variant={variants[role] || "info"}>
        {t(`roles.${role}` as any) || role}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-tb-bone flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-tb-rust"></div>
      </div>
    );
  }

  if (!org) {
    return (
      <div className="min-h-screen bg-tb-bone flex items-center justify-center">
        <p className="text-tb-shadow">{t("notFound")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tb-bone">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Link
              href={`/${locale}/admin/organizations`}
              className="text-tb-shadow hover:text-tb-navy"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Link>
            <span className="text-tb-shadow">{t("breadcrumb")}</span>
            <span className="text-tb-shadow">/</span>
            <span className="text-tb-navy font-medium">{org.name}</span>
          </div>

          <div className="flex items-center gap-6">
            {org.logo_url ? (
              <img
                src={org.logo_url}
                alt={org.name}
                className="w-20 h-20 rounded-xl object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-xl bg-tb-rust/10 flex items-center justify-center">
                <span className="text-3xl font-bold text-tb-rust">
                  {org.name.charAt(0)}
                </span>
              </div>
            )}
            <div className="flex-1">
              {editing ? (
                <div className="flex items-center gap-3">
                  <Input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="text-2xl font-bold"
                  />
                  <Button variant="primary" onClick={handleSave}>
                    {t("actions.save")}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditing(false);
                      setEditName(org.name);
                    }}
                  >
                    {t("actions.cancel")}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-display font-bold text-tb-navy">
                    {org.name}
                  </h1>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditing(true)}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  </Button>
                </div>
              )}
              <p className="text-tb-shadow">@{org.slug}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-tb-navy">
                {org.members.length}
              </div>
              <p className="text-sm text-tb-shadow">{t("stats.totalMembers")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-tb-navy">
                {org.members.filter((m) => m.role === "teacher").length}
              </div>
              <p className="text-sm text-tb-shadow">{t("stats.teachers")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-tb-navy">
                {org.classCount}
              </div>
              <p className="text-sm text-tb-shadow">{t("stats.classes")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-tb-navy">
                {org.moduleCount}
              </div>
              <p className="text-sm text-tb-shadow">{t("stats.modules")}</p>
            </CardContent>
          </Card>
        </div>

        {/* Members */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{t("members.title")}</CardTitle>
              <Button
                variant="primary"
                onClick={() => setShowAddMember(true)}
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
                {t("members.addButton")}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-tb-bone/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-tb-shadow uppercase tracking-wider">
                      {t("members.headers.member")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-tb-shadow uppercase tracking-wider">
                      {t("members.headers.role")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-tb-shadow uppercase tracking-wider">
                      {t("members.headers.joined")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-tb-shadow uppercase tracking-wider">
                      {t("members.headers.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-tb-line">
                  {org.members.map((member) => (
                    <tr key={member.id} className="hover:bg-tb-bone/30">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-tb-rust/10 flex items-center justify-center">
                            <span className="text-tb-rust font-medium">
                              {member.full_name.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-tb-navy">
                              {member.full_name}
                            </div>
                            <div className="text-sm text-tb-shadow">
                              {member.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(member.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-tb-shadow">
                        {new Date(member.joined_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            {t("members.actions.changeRole")}
                          </Button>
                          {member.role !== "owner" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleRemoveMember(member.id)}
                            >
                              {t("members.actions.remove")}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Add Member Modal */}
        {showAddMember && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>{t("modal.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-tb-navy mb-1">
                      {t("modal.email")}
                    </label>
                    <Input
                      type="email"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      placeholder={t("modal.emailPlaceholder")}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-tb-navy mb-1">
                      {t("modal.role")}
                    </label>
                    <select
                      value={newMemberRole}
                      onChange={(e) => setNewMemberRole(e.target.value)}
                      className="w-full px-4 py-2 border border-tb-line rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-tb-rust"
                    >
                      <option value="student">{t("roles.student")}</option>
                      <option value="teacher">{t("roles.teacher")}</option>
                      <option value="admin">{t("roles.admin")}</option>
                    </select>
                  </div>
                  <div className="flex gap-3 justify-end pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowAddMember(false);
                        setNewMemberEmail("");
                        setNewMemberRole("student");
                      }}
                    >
                      {t("modal.cancel")}
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleAddMember}
                      disabled={!newMemberEmail.trim()}
                    >
                      {t("modal.addButton")}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
