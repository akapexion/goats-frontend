import { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { useTheme } from "@/context/ThemeContext"
import toast from "react-hot-toast"
import { Eye, EyeOff, Sun, Moon, ArrowLeft, Leaf, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

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

import { validateName, validateEmail, validatePassword, validatePhone } from '@/lib/validation'

export default function RegisterPage() {
  const { register } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: searchParams.get("role") === "farmer" ? "farmer" : "customer",
    phone: "",
    address: "",
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})

    const fieldErrors = {}
    const nameErr = validateName(form.name, "Full Name")
    if (nameErr) fieldErrors.name = [nameErr]

    const emailErr = validateEmail(form.email)
    if (emailErr) fieldErrors.email = [emailErr]

    const passErr = validatePassword(form.password, 8)
    if (passErr) fieldErrors.password = [passErr]

    if (form.password !== form.password_confirmation) {
      fieldErrors.password_confirmation = ["Passwords do not match."]
    }

    const phoneErr = validatePhone(form.phone)
    if (phoneErr) fieldErrors.phone = [phoneErr]

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors)
      return
    }

    setLoading(true)
    try {
      const user = await register(form)
      toast.success("Account created successfully!")
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
        toast.error(data?.message || "Registration failed.")
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

      <div className="relative z-10 w-full max-w-lg my-2 animate-fade-in">
        <Card className="backdrop-blur-xl bg-card/90 dark:bg-card/85 border shadow-2xl hover:-translate-y-1 hover:border-primary hover:shadow-primary/10 transition-all duration-300">
          <CardHeader className="text-center pb-4 flex flex-col items-center">
            <CardTitle className="text-2xl font-bold">
              Join the MarketLink Community
            </CardTitle>
            <CardDescription>
              Connect, discover, and grow with a marketplace built for everyone
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Account Type</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, role: "customer" })}
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all ${
                      form.role === "customer"
                        ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                        : "border-input hover:bg-accent text-muted-foreground"
                    }`}
                  >
                    <User className="size-4" /> Customer
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, role: "farmer" })}
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all ${
                      form.role === "farmer"
                        ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                        : "border-input hover:bg-accent text-muted-foreground"
                    }`}
                  >
                    <Leaf className="size-4" /> Farmer
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive">{errors.name[0]}</p>
                  )}
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive">
                      {errors.email[0]}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 8 characters"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-destructive">
                      {errors.password[0]}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password_confirmation">
                    Confirm Password *
                  </Label>
                  <Input
                    id="password_confirmation"
                    type={showPassword ? "text" : "password"}
                    placeholder="Repeat password"
                    value={form.password_confirmation}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        password_confirmation: e.target.value,
                      })
                    }
                    required
                  />
                  {errors.password_confirmation && (
                    <p className="text-xs text-destructive">
                      {errors.password_confirmation[0]}
                    </p>
                  )}
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="phone">Phone Number (optional)</Label>
                  <Input
                    id="phone"
                    placeholder="+92 000000000"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                  {errors.phone && (
                    <p className="text-xs text-destructive">
                      {errors.phone[0]}
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-10 font-semibold shadow-md mt-2"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-primary hover:underline"
              >
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
