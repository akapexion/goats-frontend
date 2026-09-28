import React from 'react'
import { Link } from 'react-router-dom'
import PublicLayout from '@/components/PublicLayout'
import { Button } from '@/components/ui/button'
import {
  UserCheck,
  Search,
  ShoppingBag,
  Store,
  ArrowRight,
  Heart,
  ShieldCheck,
  CheckCircle2,
  Users
} from 'lucide-react'
import PageHeroBanner from '@/components/PageHeroBanner'

export default function HowItWorks({ embedded = false }) {
  const steps = [
    {
      step: "01",
      icon: UserCheck,
      title: "Create Free Account",
      desc: "Sign up as a customer or register your farm stall in under a minute with zero hidden fees.",
    },
    {
      step: "02",
      icon: Search,
      title: "Browse & Discover",
      desc: "Explore nearby farmers markets, stall locations, operating schedules, and weekly fresh produce.",
    },
    {
      step: "03",
      icon: ShoppingBag,
      title: "Pre-Order Fresh Items",
      desc: "Select items from your favorite stalls, choose your pickup time, and confirm your pre-order.",
    },
    {
      step: "04",
      icon: Store,
      title: "Pick Up & Pay at Market",
      desc: "Visit the market stall at your designated time, inspect your pre-packed fresh produce, and pay on pickup.",
    },
  ]

  const userRoles = [
    {
      title: "For Customers",
      desc: "Support local growers, secure fresh produce before market day runs out, and skip long market lines.",
      points: ["Real-time stall stock", "Interactive market directions", "Verified farmer ratings"],
      buttonText: "Browse Markets",
      link: "/login"
    },
    {
      title: "For Farmers",
      desc: "Harvest with confidence knowing your orders are pre-sold. Manage inventory and track sales effortlessly.",
      points: ["Eliminate food wastage", "Streamlined order queue", "Build loyal customer relationships"],
      buttonText: "Register Your Stall",
      link: "/register?role=farmer"
    }
  ]

  return (
    <PublicLayout embedded={embedded}>
      {/* Hero Banner */}
      {!embedded && (
        <div className="max-w-6xl mx-auto px-4 pt-6">
          <PageHeroBanner
            badge="About MarketLink"
            title={
              <>
                How <span className="text-primary">MarketLink</span> Works
              </>
            }
            description="Our mission is to strengthen local food networks by connecting small-scale farmers directly with conscious consumers through a simple pre-order pickup marketplace."
            icon={Heart}
          >
            <div className="flex flex-wrap gap-3">
              <Link to="/register">
                <Button size="sm" className="shadow-md font-bold">
                  Join the Community <ArrowRight className="size-4 ml-1.5" />
                </Button>
              </Link>
              <Link to="/features">
                <Button variant="outline" size="sm" className="bg-white/10 text-white border-white/30 backdrop-blur hover:bg-white/20 hover:text-white">
                  Explore Features
                </Button>
              </Link>
            </div>
          </PageHeroBanner>
        </div>
      )}

      {/* 4 Simple Steps */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14" data-aos="fade-up">
            <h2 className="text-3xl font-bold mb-3">4 Simple Steps to Fresh Produce</h2>
            <p className="text-muted-foreground">
              Getting fresh farm produce directly to your kitchen has never been easier.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {steps.map(({ step, icon: Icon, title, desc }, idx) => (
              <div
                key={step}
                data-aos="fade-up"
                data-aos-delay={idx * 100}
                className="flex gap-5 p-6 rounded-2xl border bg-card/80 backdrop-blur-md hover:border-primary/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              >
                <div className="shrink-0 size-14 rounded-2xl bg-primary text-primary-foreground flex flex-col items-center justify-center font-bold shadow-md">
                  <span className="text-xs opacity-80">STEP</span>
                  <span className="text-lg leading-none">{step}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="size-5 text-primary" />
                    <h3 className="font-bold text-xl">{title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer vs Farmer Roles */}
      <section className="py-16 px-4 bg-muted/30 border-y">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12" data-aos="fade-up">
            <h2 className="text-3xl font-bold mb-3">Designed for Both Sides of the Market</h2>
            <p className="text-muted-foreground">
              Whether you are buying fresh veggies or growing them, MarketLink works for you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {userRoles.map(({ title, desc, points, buttonText, link }, idx) => (
              <div
                key={title}
                data-aos={idx === 0 ? "fade-right" : "fade-left"}
                className="bg-card rounded-2xl p-8 border shadow-sm flex flex-col justify-between hover:border-primary/40 transition-colors"
              >
                <div>
                  <h3 className="text-2xl font-bold mb-3 text-primary">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    {desc}
                  </p>
                  <ul className="space-y-3 mb-8">
                    {points.map((pt) => (
                      <li key={pt} className="flex items-center gap-2.5 text-sm font-medium">
                        <CheckCircle2 className="size-4 text-primary shrink-0" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link to={link}>
                  <Button className="w-full font-semibold">
                    {buttonText} <ArrowRight className="size-4 ml-2" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
