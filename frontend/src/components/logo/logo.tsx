import { PROTECTED_ROUTES } from "@/routes/common/routePath"
import { Landmark } from "lucide-react"
import { Link } from "react-router-dom"

const Logo = (props: { url?: string }) => {
  return (
    <Link to={props.url || PROTECTED_ROUTES.OVERVIEW} className="flex items-center gap-2">
    <div className="bg-blue-500 text-white h-8 w-8 rounded flex items-center justify-center">
    <Landmark className="size-5" />
    </div>
    <span className="font-semibold text-2xl">Finora</span>
  </Link>
  )
}

export default Logo