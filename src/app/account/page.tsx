"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { apiFetch, ApiClientError } from "@/lib/api-client";
import { useToast } from "@/components/providers/ToastProvider";

export default function ProfilePage() {
  const { user, isLoading, refresh } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) router.push("/login?redirect=/account");
  }, [isLoading, user, router]);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone ?? "");
    }
  }, [user]);

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      await apiFetch("/api/profile", { method: "PATCH", body: JSON.stringify({ name, phone }) });
      await refresh();
      showToast("Profile updated", "success");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Could not update profile");
    } finally {
      setIsSaving(false);
    }
  }

  async function handlePasswordChange(event: FormEvent) {
    event.preventDefault();
    setPasswordMessage(null);
    setIsChangingPassword(true);
    try {
      await apiFetch("/api/profile", { method: "PUT", body: JSON.stringify({ newPassword }) });
      setNewPassword("");
      setPasswordMessage("Password updated successfully.");
    } catch (err) {
      setPasswordMessage(err instanceof ApiClientError ? err.message : "Could not update password");
    } finally {
      setIsChangingPassword(false);
    }
  }

  if (isLoading || !user) return <p className="text-sm text-slate-500">Loading...</p>;

  return (
    <div className="flex flex-col gap-10">
      <section className="max-w-lg">
        <h2 className="text-lg font-semibold text-slate-900">Personal Information</h2>
        <form onSubmit={handleSave} className="mt-4 flex flex-col gap-4">
          <Input label="Full name" required value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Email address" value={user.email} disabled hint="Contact support to change your email address." />
          <Input label="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" isLoading={isSaving} className="self-start">
            Save Changes
          </Button>
        </form>
      </section>

      <section className="max-w-lg border-t border-slate-200 pt-8">
        <h2 className="text-lg font-semibold text-slate-900">Change Password</h2>
        <form onSubmit={handlePasswordChange} className="mt-4 flex flex-col gap-4">
          <Input
            label="New password"
            type="password"
            required
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          {passwordMessage && <p className="text-sm text-slate-700">{passwordMessage}</p>}
          <Button type="submit" variant="outline" isLoading={isChangingPassword} className="self-start">
            Update Password
          </Button>
        </form>
      </section>
    </div>
  );
}
