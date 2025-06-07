"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <header className="bg-primary text-primary-foreground py-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-6 w-6" />
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
          </div>
          <nav>
            <ul className="flex space-x-4">
              <li>
                <Button variant="secondary" size="sm" asChild>
                  <Link href="/posts">Return to Posts</Link>
                </Button>
              </li>
              <li>
                <Button variant="secondary" size="sm" asChild>
                  <Link href="/">Return to Homepage</Link>
                </Button>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <main className="container mx-auto py-8 px-4">{children}</main>
    </div>
  );
}
