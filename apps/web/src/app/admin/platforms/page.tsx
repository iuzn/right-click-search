"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Platform } from "@/types/platform";
import { PlatformForm } from "@/components/admin/PlatformForm";
import {
  getAllPlatforms,
  createPlatform,
  updatePlatform,
  deletePlatform,
  togglePlatformEnabled,
} from "@/app/admin/actions";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, Power } from "lucide-react";

/**
 * Admin platforms management page
 * PLATFORM.md Phase 6.2
 */
export default function AdminPlatformsPage() {
  const { user } = useAdminAuth();
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState<
    Platform | undefined
  >();

  const loadPlatforms = async () => {
    if (!user?.email) return;

    setLoading(true);
    const result = await getAllPlatforms(user.email);
    if (result.error) {
      toast.error(result.error);
    } else if (result.data) {
      setPlatforms(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPlatforms();
  }, [user]);

  const handleCreate = async (data: any) => {
    if (!user?.email) return;

    const result = await createPlatform(data, user.email);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Platform created!");
      setShowForm(false);
      loadPlatforms();
    }
  };

  const handleUpdate = async (data: any) => {
    if (!user?.email || !editingPlatform) return;

    const result = await updatePlatform(editingPlatform.id, data, user.email);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Platform updated!");
      setEditingPlatform(undefined);
      loadPlatforms();
    }
  };

  const handleDelete = async (id: string) => {
    if (!user?.email) return;
    if (!confirm("Are you sure you want to delete this platform?")) return;

    const result = await deletePlatform(id, user.email);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Platform deleted!");
      loadPlatforms();
    }
  };

  const handleToggleEnabled = async (id: string, currentEnabled: boolean) => {
    if (!user?.email) return;

    const result = await togglePlatformEnabled(id, !currentEnabled, user.email);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`Platform ${!currentEnabled ? "enabled" : "disabled"}!`);
      loadPlatforms();
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Platform Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {platforms.length} platforms registered
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm text-white transition-colors hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          New Platform
        </button>
      </div>

      {/* Create/Edit Form Modal */}
      {(showForm || editingPlatform) && user?.email && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl border border-border bg-card p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">
              {editingPlatform ? "Edit Platform" : "New Platform"}
            </h2>
            <PlatformForm
              platform={editingPlatform}
              adminEmail={user.email}
              onSubmit={editingPlatform ? handleUpdate : handleCreate}
              onCancel={() => {
                setShowForm(false);
                setEditingPlatform(undefined);
              }}
            />
          </div>
        </div>
      )}

      {/* Platforms Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      ) : platforms.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">No platforms added yet</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                    Platform
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                    URL Pattern
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                    Context
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {platforms.map((platform) => (
                  <tr
                    key={platform.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {platform.icon_url ? (
                          <img
                            src={platform.icon_url}
                            alt=""
                            className="h-8 w-8 rounded object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xs font-bold">
                            {platform.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-sm text-foreground">
                            {platform.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {platform.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-indigo-100 dark:bg-indigo-900 px-2 py-1 text-xs text-indigo-700 dark:text-indigo-300">
                        {platform.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-xs text-muted-foreground truncate block max-w-xs">
                        {platform.url_pattern}
                      </code>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {platform.context.map((ctx) => (
                          <span
                            key={ctx}
                            className="text-xs rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5"
                          >
                            {ctx}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        {platform.enabled ? (
                          <span className="text-xs text-green-600 dark:text-green-400">
                            ✓ Enabled
                          </span>
                        ) : (
                          <span className="text-xs text-red-600 dark:text-red-400">
                            ✗ Disabled
                          </span>
                        )}
                        {platform.featured && (
                          <span className="text-xs text-amber-600 dark:text-amber-400">
                            ★ Featured
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() =>
                            handleToggleEnabled(
                              platform.id,
                              platform.enabled || false
                            )
                          }
                          className="p-1 rounded hover:bg-muted transition-colors"
                          title={platform.enabled ? "Disable" : "Enable"}
                        >
                          <Power
                            className={`h-4 w-4 ${
                              platform.enabled
                                ? "text-green-600"
                                : "text-gray-400"
                            }`}
                          />
                        </button>
                        <button
                          onClick={() => setEditingPlatform(platform)}
                          className="p-1 rounded hover:bg-muted transition-colors"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(platform.id)}
                          className="p-1 rounded hover:bg-muted transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
