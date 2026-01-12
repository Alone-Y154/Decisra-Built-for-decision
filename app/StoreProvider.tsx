"use client";

import { useRef } from "react";
import { Provider } from "react-redux";
import { makeStore, AppStore } from "@/lib/store";

let storeRef: AppStore | null = null;

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!storeRef) {
    storeRef = makeStore();
  }

  return <Provider store={storeRef}>{children}</Provider>;
}
