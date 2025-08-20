import { PortalHost } from "@rn-primitives/portal";
import { Slot } from "expo-router";
import React from "react";

const Layout = () => {
  return (
    <>
      <PortalHost />
      <Slot />
    </>
  );
};

export default Layout;
