"use client";

import { Agentation } from "agentation";
import React from "react";
import { ToastContainer } from "..";
import { NetworkProvider } from "./NetworkContext";

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <NetworkProvider>
      {children}
      <ToastContainer />
      {process.env.NODE_ENV === "development" && <Agentation />}
    </NetworkProvider>
  );
};
