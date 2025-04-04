import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing-page";
import AdminLoginPage from "@/pages/admin-login";
import DriverLoginPage from "@/pages/driver-login";
import RegisterPage from "@/pages/register-page";
import DriverDashboard from "@/pages/driver-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import { ProtectedRoute } from "./lib/protected-route";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { NavigationLoadingProvider } from "@/hooks/use-navigation-loading";
import { RouteTransition } from "@/components/RouteTransition";

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <NavigationLoadingProvider>
            <RouteTransition>
              <Switch>
                <Route path="/" component={LandingPage} />
                <Route path="/auth" component={DriverLoginPage} />
                <Route path="/admin/login" component={AdminLoginPage} />
                <Route path="/register" component={RegisterPage} />
                <Route path="/driver">
                  <ProtectedRoute component={DriverDashboard} requiredRole="driver" />
                </Route>
                <Route path="/admin/dashboard">
                  <ProtectedRoute component={AdminDashboard} requiredRole="admin" />
                </Route>
                <Route>
                  <NotFound />
                </Route>
              </Switch>
            </RouteTransition>
          </NavigationLoadingProvider>
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;