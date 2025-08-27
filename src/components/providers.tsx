"use client";

import { AuthProvider } from "@/components/auth-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { I18nProvider } from "@/providers/I18nProvider";
import { ReactNode } from "react";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <I18nProvider>
      <AuthProvider>
        <ThemeProvider 
          attribute="class" 
          defaultTheme="system" 
          enableSystem={true} 
          storage="omiam-theme" 
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </AuthProvider>
    </I18nProvider>
  );
}