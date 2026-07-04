"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Stats = {
  contentTotal: number;
  featuredContent: number;
  liveEventTotal: number;
  liveChannelTotal: number;
  usersTotal: number;
};

type CapabilityResponse = {
  role: string;
  permissions: string[];
  controls: { permission: string; label: string }[];
  isSuperAdmin: boolean;
};

type AdminUser = {
  id: string;
  email: string;
  username: string;
  displayName: string;
  role: string;
  createdAt: string;
};

type AdminRole = {
  id: string;
  name: string;
};

async function getCsrfToken(): Promise<string | null> {
  const response = await fetch("/api/auth/csrf", { cache: "no-store" });
  if (!response.ok) return null;
  const json = (await response.json()) as { csrfToken?: string };
  return json.csrfToken ?? null;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [capabilities, setCapabilities] = useState<CapabilityResponse | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [error, setError] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const run = async () => {
      const [statsRes, capRes, usersRes] = await Promise.all([
        fetch("/api/admin/stats", { cache: "no-store" }),
        fetch("/api/admin/me/capabilities", { cache: "no-store" }),
        fetch("/api/admin/users", { cache: "no-store" }),
      ]);

      if (!statsRes.ok || !capRes.ok) {
        setError("Access denied or unauthorized.");
        return;
      }

      const statsJson = (await statsRes.json()) as { data: Stats };
      const capJson = (await capRes.json()) as { data: CapabilityResponse };
      setStats(statsJson.data);
      setCapabilities(capJson.data);

      if (usersRes.ok) {
        const usersJson = (await usersRes.json()) as { data: { users: AdminUser[]; roles: AdminRole[] } };
        setUsers(usersJson.data.users);
        setRoles(usersJson.data.roles);
      }
    };

    void run();
  }, []);

  const cards = useMemo(
    () =>
      stats
        ? [
            { key: "Total Content", value: stats.contentTotal },
            { key: "Featured Content", value: stats.featuredContent },
            { key: "Live Events", value: stats.liveEventTotal },
            { key: "Live Channels", value: stats.liveChannelTotal },
            { key: "Users", value: stats.usersTotal },
          ]
        : [],
    [stats],
  );

  const postJson = async (url: string, body: Record<string, unknown>, method: "POST" | "PATCH" | "DELETE" = "POST") => {
    const csrfToken = await getCsrfToken();
    if (!csrfToken) {
      setMessage("Unable to get CSRF token. Login again.");
      return false;
    }

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": csrfToken,
      },
      body: method === "DELETE" ? undefined : JSON.stringify(body),
    });

    if (!response.ok) {
      const err = (await response.json().catch(() => ({ error: "Request failed" }))) as { error?: string };
      setMessage(err.error ?? "Request failed");
      return false;
    }

    setMessage("Action completed successfully.");
    return true;
  };

  const onCreateContent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);

    await postJson("/api/content", {
      contentType: String(fd.get("contentType") ?? "movie"),
      slug: String(fd.get("slug") ?? "").trim(),
      title: String(fd.get("title") ?? "").trim(),
      description: String(fd.get("description") ?? "").trim(),
      source: {
        label: String(fd.get("sourceLabel") ?? "Primary"),
        sourceKind: String(fd.get("sourceKind") ?? "video"),
        sourceUrl: String(fd.get("sourceUrl") ?? "").trim(),
      },
    });
  };

  const onAddBackupSource = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const slug = String(fd.get("contentSlug") ?? "").trim();
    if (!slug) {
      setMessage("Content slug is required");
      return;
    }

    await postJson(`/api/content/${encodeURIComponent(slug)}/sources`, {
      label: String(fd.get("backupLabel") ?? "Backup"),
      sourceKind: String(fd.get("backupKind") ?? "video"),
      sourceUrl: String(fd.get("backupUrl") ?? "").trim(),
    });
  };

  const onDeleteContent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const slug = String(fd.get("deleteSlug") ?? "").trim();
    if (!slug) {
      setMessage("Slug is required");
      return;
    }

    const csrfToken = await getCsrfToken();
    if (!csrfToken) {
      setMessage("Unable to get CSRF token. Login again.");
      return;
    }

    const response = await fetch(`/api/content?slug=${encodeURIComponent(slug)}`, {
      method: "DELETE",
      headers: { "x-csrf-token": csrfToken },
    });

    if (!response.ok) {
      const err = (await response.json().catch(() => ({ error: "Delete failed" }))) as { error?: string };
      setMessage(err.error ?? "Delete failed");
      return;
    }

    setMessage("Content deleted successfully.");
  };

  const onUpdateRole = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const userId = String(fd.get("userId") ?? "");
    const roleName = String(fd.get("roleName") ?? "");
    if (!userId || !roleName) {
      setMessage("Select user and role.");
      return;
    }

    await postJson(`/api/admin/users/${encodeURIComponent(userId)}/role`, { roleName }, "PATCH");
  };

  if (error) {
    return <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-700">{error}</p>;
  }

  if (!stats || !capabilities) {
    return <p className="text-slate-300">Loading admin controls...</p>;
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <p className="text-sm text-slate-400">Signed in role</p>
        <h2 className="mt-1 text-2xl font-semibold text-white">{capabilities.role}</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {capabilities.permissions.map((perm) => (
            <span key={perm} className="rounded-full bg-indigo-600/20 px-3 py-1 text-xs text-indigo-200">
              {perm}
            </span>
          ))}
        </div>
        <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-slate-300">
          {capabilities.controls.map((control, idx) => (
            <li key={`${control.permission}-${idx}`}>{control.label}</li>
          ))}
        </ul>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <article key={card.key} className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm">
            <p className="text-sm text-slate-400">{card.key}</p>
            <p className="mt-2 text-3xl font-semibold text-white">{card.value}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={onCreateContent} className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <h3 className="text-lg font-semibold text-white">Add Video / Content</h3>
          <select name="contentType" className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white">
            <option value="movie">Movie</option>
            <option value="web_series">Web Series</option>
            <option value="tv_show">TV Show</option>
            <option value="episode">Episode</option>
            <option value="anime">Anime</option>
            <option value="documentary">Documentary</option>
            <option value="custom">Custom</option>
          </select>
          <input name="title" required placeholder="Title" className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white" />
          <input name="slug" required placeholder="Slug" className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white" />
          <textarea name="description" placeholder="Description" className="h-24 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white" />
          <input name="sourceLabel" defaultValue="Primary" placeholder="Source label" className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white" />
          <select name="sourceKind" className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white">
            <option value="video">Direct Video</option>
            <option value="hls">HLS</option>
            <option value="dash">DASH</option>
            <option value="embed">Embed</option>
          </select>
          <input name="sourceUrl" required type="url" placeholder="Primary source URL" className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white" />
          <button className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white">Create Content</button>
        </form>

        <form onSubmit={onAddBackupSource} className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <h3 className="text-lg font-semibold text-white">Add Backup Link / Server</h3>
          <input name="contentSlug" required placeholder="Content slug" className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white" />
          <input name="backupLabel" defaultValue="Server 2" placeholder="Server label" className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white" />
          <select name="backupKind" className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white">
            <option value="video">Direct Video</option>
            <option value="hls">HLS</option>
            <option value="dash">DASH</option>
            <option value="embed">Embed</option>
          </select>
          <input name="backupUrl" required type="url" placeholder="Backup source URL" className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white" />
          <button className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white">Add Backup Server</button>
        </form>

        <form onSubmit={onDeleteContent} className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <h3 className="text-lg font-semibold text-white">Delete Video / Content</h3>
          <input name="deleteSlug" required placeholder="Content slug" className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white" />
          <button className="rounded-lg bg-rose-600 px-4 py-2 font-medium text-white">Delete Content</button>
        </form>

        <form onSubmit={onUpdateRole} className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <h3 className="text-lg font-semibold text-white">User Role Management</h3>
          <select name="userId" className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white">
            {users.map((u) => (
              <option key={u.id} value={u.id}>{`${u.displayName} (${u.email}) - ${u.role}`}</option>
            ))}
          </select>
          <select name="roleName" className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white">
            {roles.map((r) => (
              <option key={r.id} value={r.name}>
                {r.name}
              </option>
            ))}
          </select>
          <button className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white">Update Role</button>
        </form>
      </div>

      {message && <p className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-200">{message}</p>}
    </div>
  );
}
