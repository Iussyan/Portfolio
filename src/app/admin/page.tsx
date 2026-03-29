"use client";

import dynamic from "next/dynamic";
import { useVersion } from "@/providers/VersionProvider";

const V1Page = dynamic(() => import("@v1/app/admin/page"));
const V2Page = dynamic(() => import("@v2/app/admin/page"));

export default function AdminDispatcher() {
  const { version } = useVersion();
  return version === "v1" ? <V1Page /> : <V2Page />;
}
