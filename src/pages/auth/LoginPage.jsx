import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Sun, Moon, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function MarketLinkLogo({ size = 36, className = '' }) {
  return (
    <img
      src="/logo.jpg"
      alt="MarketLink Logo"
      style={{ width: size, height: size }}
      className={`object-cover rounded-xl shadow-md border border-emerald-500/20 ${className}`}
    />
  )
}

export default function LoginPage() {
  const { login } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`Welcome back, ${user.name}!`)
      if (user.role === 'customer') {
        navigate('/')
      } else {
        navigate(`/${user.role}/dashboard`)
      }
    } catch (err) {
      const data = err.response?.data
      if (data?.errors) {
        setErrors(data.errors)
      } else {
        toast.error(data?.message || 'Login failed. Please verify your credentials.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dark relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-slate-950 text-slate-100">
      <div
        className="absolute inset-0 bg-cover bg-center filter brightness-[0.45] dark:brightness-[0.25] scale-105"
        style={{ backgroundImage: "url('/banner.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/60" />

      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20 max-w-6xl mx-auto">
        <Link to="/" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm font-medium">
          <ArrowLeft className="size-4" /> Back to home
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-md my-12 animate-fade-in">
        <Card className="backdrop-blur-xl bg-card/90 dark:bg-card/85 border shadow-2xl hover:-translate-y-1 hover:border-primary hover:shadow-primary/10 transition-all duration-300">
          <CardHeader className="text-center pb-4 flex flex-col items-center">
            <CardTitle className="text-2xl font-bold">Welcome to MarketLink</CardTitle>
            <CardDescription>Sign in to manage your orders & market stall</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email[0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password[0]}</p>
                )}
              </div>

              <Button type="submit" className="w-full h-10 font-semibold shadow-md" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in to Account'}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-primary hover:underline">
                Create an account
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
