'use client';

import { createContext, useContext, useState } from 'react';

interface MobileNavValue {
  open: boolean;
  setOpen: (v: boolean) => void;
}

const MobileNavContext = createContext<MobileNavValue>({ open: false, setOpen: () => {} });

/** Shares the mobile sidebar-drawer open state between the top bar and sidebar. */
export function MobileNavProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return <MobileNavContext.Provider value={{ open, setOpen }}>{children}</MobileNavContext.Provider>;
}

export const useMobileNav = () => useContext(MobileNavContext);
