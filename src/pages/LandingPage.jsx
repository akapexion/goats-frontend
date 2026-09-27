import { Link } from "react-router-dom"
import PublicLayout from "@/components/PublicLayout"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  Leaf,
  ShoppingCart,
  Star,
  Store,
  Users,
  CheckCircle,
  ShieldCheck,
  MapPin
} from "lucide-react"

export default function LandingPage() {
  const steps = [
    {
      step: "01",
      title: "Create an account",
      desc: "Sign up as a customer or farmer in under a minute.",
    },
    {
      step: "02",
      title: "Browse & discover",
      desc: "Explore local markets, verified farmers, and seasonal produce.",
    },
    {
      step: "03",
      title: "Place your order",
      desc: "Add products to your cart, set a pickup time, and confirm with zero upfront payment.",
    },
    {
      step: "04",
      title: "Pickup at stall",
      desc: "Visit the market, collect your fresh items, and pay at pickup.",
    },
  ]

  const features = [
    {
      icon: Leaf,
      title: "Fresh from the Farm",
      desc: "Browse weekly produce from approved local farmers. What you see is what they have available.",
    },
    {
      icon: ShoppingCart,
      title: "Pre-Order for Pickup",
      desc: "Reserve your order in advance and pick it up directly from the market stall with zero queue.",
    },
    {
      icon: Star,
      title: "Honest Ratings",
      desc: "Read verified customer reviews and rate farmers after your order pickup to build community trust.",
    },
    {
      icon: Users,
      title: "Built for Farmers",
      desc: "Farmers manage stock, accept incoming orders, and view earnings from an intuitive dashboard.",
    },
  ]

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative min-h-[560px] flex items-center justify-center overflow-hidden px-4 text-center">
        <video
          autoPlay
          loop
          muted
          playsInline
          poster="/banner.jpg"
          className="absolute inset-0 w-full h-full object-cover filter brightness-[0.45] dark:brightness-[0.3]"
        >
          <source
            src="https://assets.mixkit.co/videos/preview/mixkit-vegetables-at-a-market-stall-41551-large.mp4"
            type="video/mp4"
          />
        </video>

        <div className="absolute inset-0 bg-gradient-to-t from-background via-black/40 to-black/60" />

        <div className="relative z-10 max-w-3xl mx-auto py-20 text-white animate-fade-in">
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur text-green-300 border border-white/20 px-4 py-1.5 rounded-full text-sm font-medium">
              <Leaf className="size-4 text-green-400" />
              Local. Fresh. Direct from Farmers.
            </div>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight mb-6 text-white drop-shadow-md">
            Your local farmers
            <br />
            market, <span className="text-green-400">online</span>
          </h1>
          <p className="text-lg sm:text-xl text-white/90 max-w-xl mx-auto mb-8 leading-relaxed font-normal drop-shadow">
            MarketLink connects community farmers with local buyers. Browse
            fresh seasonal harvests, reserve pre-orders, and pick up directly
            from market stalls.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button
                size="lg"
                className="gap-2 px-8 bg-green-600 hover:bg-green-700 text-white border-0 font-semibold shadow-lg"
              >
                Start shopping <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link to="/register?role=farmer">
              <Button
                size="lg"
                variant="outline"
                className="gap-2 px-8 bg-white/10 hover:bg-white/20 border-white/30 text-white backdrop-blur font-semibold"
              >
                <Leaf className="size-4" /> Join as a farmer
              </Button>
            </Link>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-white/80">
            {[
              "Zero upfront payment",
              "Verified local farmers",
              "Free to join",
            ].map((item) => (
              <div key={item} className="flex items-center gap-1.5">
                <CheckCircle className="size-4 text-green-400" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works summary */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12" data-aos="fade-up">
            <h2 className="text-3xl font-bold mb-3">How it works</h2>
            <p className="text-muted-foreground">
              Getting fresh farm produce directly to your kitchen in 4 easy steps.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {steps.map(({ step, title, desc }, idx) => (
              <div
                key={step}
                data-aos="fade-up"
                data-aos-delay={idx * 100}
                className="flex gap-4 p-5 rounded-xl border bg-card hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-md cursor-pointer"
              >
                <div className="shrink-0 size-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shadow-sm">
                  {step}
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features overview */}
      <section id="features" className="py-20 px-4 bg-muted/30 border-y">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12" data-aos="fade-up">
            <h2 className="text-3xl font-bold mb-3">Everything you need</h2>
            <p className="text-muted-foreground">
              A complete platform for farmers markets, engineered for seamless community commerce.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc }, idx) => (
              <div
                key={title}
                data-aos="fade-up"
                data-aos-delay={idx * 100}
                className="bg-card rounded-xl p-6 border hover:-translate-y-1 transition-all duration-300 hover:shadow-md hover:border-primary/50 cursor-pointer"
              >
                <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="size-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center" data-aos="zoom-in">
          <Store className="size-12 mx-auto mb-4 text-primary opacity-80" />
          <h2 className="text-3xl font-bold mb-4">
            Ready to support local agriculture?
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Join local farmers and community buyers using MarketLink to simplify fresh produce ordering.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="px-8 shadow-md">
                Create your account
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="px-8">
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
