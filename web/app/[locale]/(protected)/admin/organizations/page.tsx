"use client";

import { useState, useEffect } from "react";
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

type Organization = {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  created_at: string;
  memberCount: number;
  classCount: number;
};

export default function OrganizationsPage() {
  const t = useTranslations("admin.organizations");
  const locale = useLocale();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      const res = await fetch("/api/admin/organizations");
      if (res.ok) {
        const data = await res.json();
        setOrganizations(data.organizations || []);
      } else {
        // Mock data for development
        setOrganizations([
          {
            id: "1",
            name: "TouchBase Academy",
            slug: "touchbase-academy",
            created_at: new Date().toISOString(),
            memberCount: 50,
            classCount: 10,
          },
          {
            id: "2",
            name: "Demo High School",
            slug: "demo-high-school",
            created_at: new Date().toISOString(),
            memberCount: 30,
            classCount: 5,
          },
          {
            id: "3",
            name: "Community Center",
            slug: "community-center",
            created_at: new Date().toISOString(),
            memberCount: 20,
            classCount: 3,
          },
        ]);
      }
    } catch (error) {
      console.error("Error loading organizations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrg = async () => {
    if (!newOrgName.trim()) return;

    setCreating(true);
    try {
      const res = await fetch("/api/admin/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newOrgName }),
      });

      if (res.ok) {
        await loadOrganizations();
        setShowCreateModal(false);
        setNewOrgName("");
      }
    } catch (error) {
      console.error("Error creating organization:", error);
    } finally {
      setCreating(false);
    }
  };

  const filteredOrgs = organizations.filter(
    (org) =>
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-tb-bone flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-tb-rust"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tb-bone">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link href={`/${locale}/admin`} className="text-tb-shadow hover:text-tb-navy">
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
              <h1 className="text-3xl font-display font-bold text-tb-navy">
                {t("title") || "Organizations"}
              </h1>
            </div>
            <p className="text-tb-shadow">
              {t("subtitle") || "Manage all organizations in the system"}
            </p>
          </div>
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            {t("create") || "Create Organization"}
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <Input
            type="text"
            placeholder={t("search") || "Search organizations..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* Organizations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrgs.map((org) => (
            <Link key={org.id} href={`/${locale}/admin/organizations/${org.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    {org.logo_url ? (
                      <img
                        src={org.logo_url}
                        alt={org.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-tb-rust/10 flex items-center justify-center">
                        <span className="text-xl font-bold text-tb-rust">
                          {org.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-lg">{org.name}</CardTitle>
                      <p className="text-sm text-tb-shadow">@{org.slug}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-tb-shadow"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                      <span className="text-sm">{org.memberCount} members</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-tb-shadow"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5"
                        />
                      </svg>
                      <span className="text-sm">{org.classCount} classes</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-tb-line">
                    <p className="text-xs text-tb-shadow">
                      Created{" "}
                      {new Date(org.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {filteredOrgs.length === 0 && (
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 mx-auto text-tb-shadow/50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <p className="text-tb-shadow mt-4">
              {searchQuery
                ? "No organizations match your search"
                : "No organizations yet"}
            </p>
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>
                  {t("createTitle") || "Create New Organization"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-tb-navy mb-1">
                      {t("orgName") || "Organization Name"}
                    </label>
                    <Input
                      type="text"
                      value={newOrgName}
                      onChange={(e) => setNewOrgName(e.target.value)}
                      placeholder="Enter organization name"
                    />
                  </div>
                  <div className="flex gap-3 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowCreateModal(false);
                        setNewOrgName("");
                      }}
                    >
                      {t("cancel") || "Cancel"}
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleCreateOrg}
                      disabled={creating || !newOrgName.trim()}
                    >
                      {creating ? "Creating..." : t("create") || "Create"}
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
