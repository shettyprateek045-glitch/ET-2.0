// src/app/layout.tsx
"use client";

import React from "react";
import { AuthProvider } from "../context/AuthContext";
import { ProjectProvider } from "../context/ProjectContext";
import NavBar from "../components/NavBar";
import AIChatbot from "../components/AIChatbot";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <title>DataCentre AI EPC Intelligence Platform</title>
        <meta name="description" content="Enterprise AI-powered EPC platform for data-centre construction management" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
        <AuthProvider>
          <ProjectProvider>
            <NavBar />
            <main className="min-h-[calc(100vh-80px)]">
              {children}
            </main>
            <AIChatbot />
          </ProjectProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
