import { useTypedSelector } from "@/app/hook";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AUTH_ROUTES, PROTECTED_ROUTES } from "./common/routePath";
import useBillingSubscription from "@/hooks/use-billing-subscription";
import { PageSkeleton } from "@/components/page-skeleton";
//

const BILLING_PAGE = PROTECTED_ROUTES.SETTINGS_BILLING;

const ProtectedRoute = () => {
  const location = useLocation();
  const { accessToken, user } = useTypedSelector((state) => state.auth);
  const { isSuccess, isLoading, isError, isPro, isTrialActive } = useBillingSubscription(accessToken);
  const disableBillingGuard = import.meta.env.VITE_DISABLE_BILLING_GUARD === "true";

  //const isBillingSettingsPage = location.pathname === PROTECTED_ROUTES.SETTINGS_BILLING;

  if (!accessToken && !user) return <Navigate to={AUTH_ROUTES.SIGN_IN} replace />;

  if (disableBillingGuard) {
    return <Outlet />;
  }

  if (isLoading || !isSuccess) return <PageSkeleton isError={isError} />;

  if (!isPro && !isTrialActive) {
    if (location.pathname !== BILLING_PAGE) {
      return <Navigate to={BILLING_PAGE} replace />;
    }

    return <Outlet />;
  }

  return <Outlet />;
};

export default ProtectedRoute;