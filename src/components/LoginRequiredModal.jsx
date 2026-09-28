import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lock, LogIn, UserPlus, X } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function LoginRequiredModal({ isOpen, onClose, title = "Login Required", message = "You need to log in to your account to perform this action." }) {
  const navigate = useNavigate()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <Card className="w-full max-w-md shadow-2xl border-primary/20 bg-card">
        <CardHeader className="pb-3 relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-muted-foreground hover:text-foreground rounded-full p-1 transition-colors"
          >
            <X className="size-4" />
          </button>
          <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
            <Lock className="size-6" />
          </div>
          <CardTitle className="text-xl font-bold">{title}</CardTitle>
          <CardDescription className="text-sm">{message}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-2">
          <div className="flex flex-col gap-2">
            <Button
              className="w-full font-semibold shadow-md"
              onClick={() => {
                onClose()
                navigate("/login")
              }}
            >
              <LogIn className="size-4 mr-2" /> Sign In to Account
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                onClose()
                navigate("/register")
              }}
            >
              <UserPlus className="size-4 mr-2" /> Create New Account
            </Button>
          </div>
          <p className="text-center text-xs text-muted-foreground pt-1">
            Browsing products, markets, and farmers is always free and public.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
