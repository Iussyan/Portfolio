"use client";

import dynamic from "next/dynamic";
import { useVersion } from "@/providers/VersionProvider";

const V1Page = dynamic(() => import("@v1/app/expeditions/page"));
const V2Page = dynamic(() => import("@v2/app/expeditions/page"));

export default function ExpeditionsDispatcher() {
  const { version } = useVersion();
  return version === "v1" ? <V1Page /> : <V2Page />;
}
