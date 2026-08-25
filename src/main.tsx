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
      staleTime: 60_000,
      gcTime: 24 * 60 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchInterval: 5 * 60 * 1000,
      refetchIntervalInBackground: false,
    },
  },
});

let persister: ReturnType<typeof createSyncStoragePersister> | null = null;
try {
  persister = createSyncStoragePersister({
    storage: window.localStorage,
    key: "bosf-cache-v7",
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
          maxAge: 6 * 60 * 60 * 1000,
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
