import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import "./index.css";
import App from "./App";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,                       // Always re-fetch in background (stale-while-revalidate)
      gcTime: 24 * 60 * 60 * 1000,       // Keep cached data for 24 hours
      retry: 1,
      refetchOnWindowFocus: true,         // Refresh when user tabs back
      refetchOnReconnect: true,           // Refresh when network reconnects
      refetchInterval: 5 * 60 * 1000,    // Background poll every 5 minutes
      refetchIntervalInBackground: false, // Only poll when tab is visible
    },
  },
});

let persister: ReturnType<typeof createSyncStoragePersister> | null = null;
try {
  persister = createSyncStoragePersister({
    storage: window.localStorage,
    key: "bosf-cache-v3",
  });
} catch {
  // localStorage unavailable (private browsing, etc.) — fall back to no persistence
}

const root = document.getElementById("root");
if (!root) throw new Error("Root element #root not found in document");

createRoot(root).render(
  <StrictMode>
    {persister ? (
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister,
          maxAge: 24 * 60 * 60 * 1000,
        }}
      >
        <App />
      </PersistQueryClientProvider>
    ) : (
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    )}
  </StrictMode>
);
