"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/images", label: "Images" },
  { href: "/admin/humor-flavors", label: "Humor Flavors" },
  { href: "/admin/humor-flavor-steps", label: "Humor Flavor Steps" },
  { href: "/admin/humor-mix", label: "Humor Mix" },
  { href: "/admin/terms", label: "Terms" },
  { href: "/admin/captions", label: "Captions" },
  { href: "/admin/caption-requests", label: "Caption Requests" },
  { href: "/admin/caption-examples", label: "Caption Examples" },
  { href: "/admin/llm-models", label: "LLM Models" },
  { href: "/admin/llm-providers", label: "LLM Providers" },
  { href: "/admin/llm-prompt-chains", label: "LLM Prompt Chains" },
  { href: "/admin/llm-responses", label: "LLM Responses" },
  { href: "/admin/allowed-signup-domains", label: "Allowed Signup Domains" },
  { href: "/admin/whitelisted-emails", label: "Whitelisted Emails" },
  { href: "/admin/schema-check", label: "Schema Check" },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="mt-6 space-y-0.5 overflow-y-auto max-h-[calc(100vh-12rem)]">
      {navItems.map((item) => {
        const isActive =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "bg-zinc-100 text-zinc-900"
                : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
