"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
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

type User = {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: string;
  organization?: string;
  created_at: string;
  last_active?: string;
};

export default function UsersPage() {
  const t = useTranslations("admin.users");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "",
    full_name: "",
    role: "student",
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      } else {
        // Mock data for development
        setUsers([
          {
            id: "1",
            email: "admin1@touchbase.academy",
            full_name: "Admin User",
            role: "owner",
            organization: "TouchBase Academy",
            created_at: new Date().toISOString(),
            last_active: new Date().toISOString(),
          },
          {
            id: "2",
            email: "teacher1@touchbase.academy",
            full_name: "Sarah Johnson",
            role: "teacher",
            organization: "TouchBase Academy",
            created_at: new Date().toISOString(),
            last_active: new Date(Date.now() - 3600000).toISOString(),
          },
          {
            id: "3",
            email: "teacher2@touchbase.academy",
            full_name: "Michael Chen",
            role: "teacher",
            organization: "TouchBase Academy",
            created_at: new Date().toISOString(),
          },
          {
            id: "4",
            email: "student1@touchbase.academy",
            full_name: "Alex Rivera",
            role: "student",
            organization: "TouchBase Academy",
            created_at: new Date().toISOString(),
            last_active: new Date(Date.now() - 7200000).toISOString(),
          },
          {
            id: "5",
            email: "student2@touchbase.academy",
            full_name: "Emma Wilson",
            role: "student",
            organization: "TouchBase Academy",
            created_at: new Date().toISOString(),
          },
        ]);
      }
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.email.trim() || !newUser.full_name.trim()) return;

    setCreating(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      if (res.ok) {
        await loadUsers();
        setShowCreateModal(false);
        setNewUser({ email: "", full_name: "", role: "student" });
      }
    } catch (error) {
      console.error("Error creating user:", error);
    } finally {
      setCreating(false);
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
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

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
              <Link href="/admin" className="text-tb-shadow hover:text-tb-navy">
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
                {t("title") || "Users"}
              </h1>
            </div>
            <p className="text-tb-shadow">
              {t("subtitle") || "Manage all users in the system"}
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
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
            {t("create") || "Add User"}
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <Input
            type="text"
            placeholder={t("search") || "Search users..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-tb-line rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-tb-rust"
          >
            <option value="all">All Roles</option>
            <option value="owner">Owners</option>
            <option value="admin">Admins</option>
            <option value="teacher">Teachers</option>
            <option value="student">Students</option>
          </select>
        </div>

        {/* Users Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-tb-bone/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-tb-shadow uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-tb-shadow uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-tb-shadow uppercase tracking-wider">
                      Organization
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-tb-shadow uppercase tracking-wider">
                      Last Active
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-tb-shadow uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-tb-line">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-tb-bone/30">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {user.avatar_url ? (
                            <img
                              className="h-10 w-10 rounded-full"
                              src={user.avatar_url}
                              alt=""
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-tb-rust/10 flex items-center justify-center">
                              <span className="text-tb-rust font-medium">
                                {user.full_name.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div className="ml-4">
                            <div className="text-sm font-medium text-tb-navy">
                              {user.full_name}
                            </div>
                            <div className="text-sm text-tb-shadow">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-tb-shadow">
                        {user.organization || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-tb-shadow">
                        {user.last_active
                          ? new Date(user.last_active).toLocaleString()
                          : "Never"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {filteredUsers.length === 0 && (
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
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <p className="text-tb-shadow mt-4">
              {searchQuery || roleFilter !== "all"
                ? "No users match your filters"
                : "No users yet"}
            </p>
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>{t("createTitle") || "Add New User"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-tb-navy mb-1">
                      Full Name
                    </label>
                    <Input
                      type="text"
                      value={newUser.full_name}
                      onChange={(e) =>
                        setNewUser({ ...newUser, full_name: e.target.value })
                      }
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-tb-navy mb-1">
                      Email
                    </label>
                    <Input
                      type="email"
                      value={newUser.email}
                      onChange={(e) =>
                        setNewUser({ ...newUser, email: e.target.value })
                      }
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-tb-navy mb-1">
                      Role
                    </label>
                    <select
                      value={newUser.role}
                      onChange={(e) =>
                        setNewUser({ ...newUser, role: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-tb-line rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-tb-rust"
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="flex gap-3 justify-end pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowCreateModal(false);
                        setNewUser({ email: "", full_name: "", role: "student" });
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleCreateUser}
                      disabled={
                        creating ||
                        !newUser.email.trim() ||
                        !newUser.full_name.trim()
                      }
                    >
                      {creating ? "Creating..." : "Add User"}
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
