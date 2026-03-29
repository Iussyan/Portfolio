"use client";

import dynamic from "next/dynamic";
import { useVersion } from "@/providers/VersionProvider";

const V1Page = dynamic(() => import("@v1/app/about/page"));
const V2Page = dynamic(() => import("@v2/app/about/page"));

export default function AboutDispatcher() {
  const { version } = useVersion();
  return version === "v1" ? <V1Page /> : <V2Page />;
}
