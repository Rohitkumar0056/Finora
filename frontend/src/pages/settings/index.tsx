import PageLayout from "@/components/page-layout";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PROTECTED_ROUTES } from "@/routes/common/routePath";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useTypedSelector } from "@/app/hook";
import useBillingSubscription from "@/hooks/use-billing-subscription";

interface ItemPropsType {
  items: {
    title: string;
    href: string;
  }[];
  blockOtherRoutes: boolean;
}

const Settings = () => {
  const { accessToken } = useTypedSelector((state) => state.auth);
  const { isPro, isTrialActive } = useBillingSubscription(accessToken);
  const blockOtherRoutes = !isPro && !isTrialActive;

  const sidebarNavItems = [
    { title: "Account", href: PROTECTED_ROUTES.SETTINGS },
    { title: "Appearance", href: PROTECTED_ROUTES.SETTINGS_APPEARANCE },
    { title: "Billings", href: PROTECTED_ROUTES.SETTINGS_BILLING },
  ];
  return (
    <PageLayout
      title="Settings"
      subtitle="Manage your account settings and set e-mail preferences."
      addMarginTop
    >
      <Card className="border shadow-none">
        <CardContent>
          <div
            className="flex flex-col space-y-8 lg:flex-row lg:space-x-12
         lg:space-y-0 pb-10 pt-2"
          >
            <aside className="mr-4 lg:w-1/5">
              <SidebarNav items={sidebarNavItems} blockOtherRoutes={blockOtherRoutes} />
            </aside>
            {/* <Separator orientation="vertical" className=" !h-[500px] !border-gray-200" /> */}
            <div className="flex-1 lg:max-w-2xl">
              <Outlet />
            </div>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
};

function SidebarNav({ items, blockOtherRoutes }: ItemPropsType) {
  const { pathname } = useLocation();
  return (
    <nav className={"flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1"}>
      {items.map((item) => {
        const isBlocked = blockOtherRoutes && item.href !== PROTECTED_ROUTES.SETTINGS_BILLING;

        return (
          <Link
            key={item.href}
            to={isBlocked ? PROTECTED_ROUTES.SETTINGS_BILLING : item.href}
            onClick={(event) => {
              if (isBlocked) {
                event.preventDefault();
              }
            }}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              pathname === item.href
                ? "bg-muted hover:bg-muted"
                : "hover:bg-transparent hover:underline",
              isBlocked && "pointer-events-none opacity-50",
              "justify-start"
            )}
          >
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}

export default Settings;