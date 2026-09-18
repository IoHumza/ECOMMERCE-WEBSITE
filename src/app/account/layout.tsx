import type { ReactNode } from "react";
import { AccountNav } from "@/components/account/AccountNav";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-black text-slate-950">My Account</h1>
      <div className="mt-6">
        <AccountNav />
      </div>
      <div className="mt-8">{children}</div>
    </div>
  );
}
