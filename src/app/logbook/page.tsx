"use client";

import dynamic from "next/dynamic";
import { useVersion } from "@/providers/VersionProvider";

const V1Page = dynamic(() => import("@v1/app/logbook/page"));
const V2Page = dynamic(() => import("@v2/app/logbook/page"));

export default function LogbookDispatcher() {
  const { version } = useVersion();
  return version === "v1" ? <V1Page /> : <V2Page />;
}
