import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";

// Layout
import MainLayout from "./components/layout/MainLayout";

// Pages
import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import GeneralLedgerPage from "@/pages/GeneralLedgerPage";
import AccountsPayablePage from "@/pages/AccountsPayablePage";
import AccountsReceivablePage from "@/pages/AccountsReceivablePage";
import FinancialReportsPage from "@/pages/FinancialReportsPage";
import SettingsPage from "@/pages/SettingsPage";

function Router() {
  return (
    <Switch>
      {/* Auth routes */}
      <Route path="/login" component={Login} />
      
      {/* Protected routes with MainLayout */}
      <Route path="/">
        <MainLayout>
          <Dashboard />
        </MainLayout>
      </Route>
      
      <Route path="/finance/general-ledger">
        <MainLayout>
          <GeneralLedgerPage />
        </MainLayout>
      </Route>
      
      <Route path="/finance/accounts-payable">
        <MainLayout>
          <AccountsPayablePage />
        </MainLayout>
      </Route>
      
      <Route path="/finance/accounts-receivable">
        <MainLayout>
          <AccountsReceivablePage />
        </MainLayout>
      </Route>
      
      <Route path="/finance/reports">
        <MainLayout>
          <FinancialReportsPage />
        </MainLayout>
      </Route>
      
      <Route path="/settings">
        <MainLayout>
          <SettingsPage />
        </MainLayout>
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
