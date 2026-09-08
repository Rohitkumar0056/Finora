import { useTypedSelector } from "@/app/hook";
import { Navigate, Outlet } from "react-router-dom";
import { PROTECTED_ROUTES } from "./common/routePath";
import useBillingSubscription from "@/hooks/use-billing-subscription";
import { PageSkeleton } from "@/components/page-skeleton";

const AuthRoute = () => {
  const { accessToken, user } = useTypedSelector((state) => state.auth);
  const { isLoading, isPro, isTrialActive, isSuccess, isError } = useBillingSubscription(
    accessToken
  );

  if (!accessToken && !user) return <Outlet />;

  if (isLoading || !isSuccess) {
    return <PageSkeleton isError={isError} />;
  }

  if (!isPro && !isTrialActive) {
    return <Navigate to={PROTECTED_ROUTES.SETTINGS_BILLING} replace />;
  }

  return <Navigate to={PROTECTED_ROUTES.OVERVIEW} replace />;
};

export default AuthRoute;
