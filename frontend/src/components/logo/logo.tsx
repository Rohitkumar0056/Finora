import { PROTECTED_ROUTES } from "@/routes/common/routePath"
import { Landmark } from "lucide-react"
import { Link } from "react-router-dom"
import { useTypedSelector } from "@/app/hook"
import useBillingSubscription from "@/hooks/use-billing-subscription"

const Logo = (props: { url?: string }) => {
  const { accessToken } = useTypedSelector((state) => state.auth)
  const { isPro, isTrialActive } = useBillingSubscription(accessToken)
  const shouldKeepOnBilling = !isPro && !isTrialActive

  return (
    <Link
      to={shouldKeepOnBilling ? PROTECTED_ROUTES.SETTINGS_BILLING : props.url || PROTECTED_ROUTES.OVERVIEW}
      onClick={(event) => {
        if (shouldKeepOnBilling && (!props.url || props.url !== PROTECTED_ROUTES.SETTINGS_BILLING)) {
          event.preventDefault()
        }
      }}
      className="flex items-center gap-2"
    >
      <div className="bg-blue-500 text-white h-8 w-8 rounded flex items-center justify-center">
        <Landmark className="size-5" />
      </div>
      <span className="font-semibold text-2xl">Finora</span>
    </Link>
  )
}

export default Logo