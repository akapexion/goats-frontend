import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, LogIn, UserPlus, X, Eye, EyeOff, CheckCircle } from "lucide-react"
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'

export default function LoginRequiredModal({
  isOpen,
  onClose,
  onSuccess,
  title = "Authentication Required",
  message = "Please sign in or create an account to place your pre-order."
}) {
  const { login, register } = useAuth()
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'customer',
    phone: '',
  })

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    try {
      let loggedUser = null
      if (mode === 'login') {
        loggedUser = await login(form.email, form.password)
        toast.success(`Welcome back, ${loggedUser.name}!`)
      } else {
        if (form.password !== form.password_confirmation) {
          setErrors({ password_confirmation: ['Passwords do not match'] })
          setLoading(false)
          return
        }
        loggedUser = await register(form)
        toast.success('Account created successfully!')
      }

      onClose()
      if (onSuccess) onSuccess(loggedUser)
    } catch (err) {
      const data = err.response?.data
      if (data?.errors) {
        setErrors(data.errors)
      } else {
        toast.error(data?.message || 'Authentication failed. Please check your inputs.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <Card className="w-full max-w-md shadow-2xl border-emerald-500/20 bg-card overflow-hidden">
        <CardHeader className="pb-3 relative bg-emerald-950/20 border-b">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-muted-foreground hover:text-foreground rounded-full p-1 transition-colors"
          >
            <X className="size-4" />
          </button>
          <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-1">
            <Lock className="size-5" />
          </div>
          <CardTitle className="text-xl font-bold">{title}</CardTitle>
          <CardDescription className="text-xs leading-relaxed">{message}</CardDescription>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-muted/60 p-1 rounded-xl mt-3 text-xs font-semibold">
            <button
              type="button"
              onClick={() => { setMode('login'); setErrors({}) }}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                mode === 'login' ? 'bg-background text-foreground shadow-xs font-bold' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setErrors({}) }}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                mode === 'register' ? 'bg-background text-foreground shadow-xs font-bold' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Quick Register
            </button>
          </div>
        </CardHeader>

        <CardContent className="pt-4 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'register' && (
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Full Name *</Label>
                <Input
                  type="text"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="h-9 text-xs"
                />
                {errors.name && <p className="text-[11px] text-destructive">{errors.name[0]}</p>}
              </div>
            )}

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Email Address *</Label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="h-9 text-xs"
              />
              {errors.email && <p className="text-[11px] text-destructive">{errors.email[0]}</p>}
            </div>

            {mode === 'register' && (
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Phone Number (optional)</Label>
                <Input
                  type="text"
                  placeholder="0300 0000000"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>
            )}

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Password *</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  className="h-9 text-xs pr-9"
                />
                <button
                  type="button"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                </button>
              </div>
              {errors.password && <p className="text-[11px] text-destructive">{errors.password[0]}</p>}
            </div>

            {mode === 'register' && (
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Confirm Password *</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={form.password_confirmation}
                  onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
                  required
                  className="h-9 text-xs"
                />
                {errors.password_confirmation && (
                  <p className="text-[11px] text-destructive">{errors.password_confirmation[0]}</p>
                )}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 shadow-md mt-2"
            >
              {loading
                ? 'Processing...'
                : mode === 'login'
                ? 'Sign In & Continue Checkout'
                : 'Register & Continue Checkout'}
            </Button>
          </form>

          <div className="text-center text-[11px] text-muted-foreground pt-1 border-t">
            <span className="flex items-center justify-center gap-1">
              <CheckCircle className="size-3 text-emerald-600" />
              Browsing products and adding items to cart is always free & public.
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
