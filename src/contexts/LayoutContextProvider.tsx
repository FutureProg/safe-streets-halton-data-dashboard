'use client';
import { AppThemeProvider } from "@/contexts/AppThemeContext";
import React from "react";

export function LayoutContextProvider({children}: Readonly<{children: React.ReactNode;}>) {
    return (
        <AppThemeProvider>
            {children}
        </AppThemeProvider>
    )
}