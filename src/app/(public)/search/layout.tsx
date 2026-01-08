import { Suspense } from "react";
import { Loading } from "@/components/ui/loading";

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-white flex flex-col">{children}</div>;
}
