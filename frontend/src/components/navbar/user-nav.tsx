import { ChevronDown, LogOut, Moon, Sun, Monitor } from "lucide-react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../ui/avatar"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { useTypedSelector } from "@/app/hook";
import useBillingSubscription from "@/hooks/use-billing-subscription";
import { useTheme } from "@/context/theme-provider";

export function UserNav({
  userName,
  profilePicture,
  onLogout,
}: {
  userName: string;
  profilePicture: string;
  onLogout: () => void;
}) {
  const { accessToken } = useTypedSelector((state) => state.auth);
  const { daysLeft, isLoading, isPro, isTrialActive } =
    useBillingSubscription(accessToken);
  const { theme, setTheme } = useTheme();

  const subscriptionLabel = isLoading
    ? "loading..."
    : isPro
      ? "Pro Plan"
      : isTrialActive
        ? `Free Trial (${daysLeft} day${daysLeft === 1 ? "" : "s"} left)`
        : "Trial expired";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative !bg-transparent h-8 w-8 rounded-full !gap-0"
        >
          <Avatar className="h-10 w-10 !cursor-pointer ">
            <AvatarImage
              src={profilePicture || ""}
              className="!cursor-pointer "
            />
            <AvatarFallback
              className="!bg-[var(--secondary-dark-color)] border !border-gray-700
               !text-white"
            >
              {userName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <ChevronDown className="!w-3 !h-3 ml-1 text-white" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 !bg-[var(--secondary-dark-color)] !text-white
         !border-gray-700
        "
        align="end"
        forceMount
      >
        <DropdownMenuLabel className="flex flex-col items-start gap-1">
          <span className="font-semibold">{userName}</span>
          <span className="text-[13px] text-gray-400 font-light">{subscriptionLabel}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="!bg-gray-700" />
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="hover:!bg-gray-800 hover:!text-white">
              {theme === "dark" ? (
                <Moon className="w-4 h-4 mr-2" />
              ) : theme === "light" ? (
                <Sun className="w-4 h-4 mr-2" />
              ) : (
                <Monitor className="w-4 h-4 mr-2" />
              )}
              Theme
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="!bg-[var(--secondary-dark-color)] !text-white !border-gray-700">
              <DropdownMenuItem
                onClick={() => setTheme("light")}
                className="hover:!bg-gray-800 hover:!text-white"
              >
                <Sun className="w-4 h-4 mr-2" />
                Light
                {theme === "light" && <span className="ml-auto text-green-400">✓</span>}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("dark")}
                className="hover:!bg-gray-800 hover:!text-white"
              >
                <Moon className="w-4 h-4 mr-2" />
                Dark
                {theme === "dark" && <span className="ml-auto text-green-400">✓</span>}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("system")}
                className="hover:!bg-gray-800 hover:!text-white"
              >
                <Monitor className="w-4 h-4 mr-2" />
                System
                {theme === "system" && <span className="ml-auto text-green-400">✓</span>}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator className="!bg-gray-700" />
          <DropdownMenuItem className="hover:!bg-gray-800 hover:!text-white"
            onClick={onLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}