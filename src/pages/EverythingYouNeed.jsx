import React from 'react'
import { Link } from 'react-router-dom'
import PublicLayout from '@/components/PublicLayout'
import { Button } from '@/components/ui/button'
import {
  Leaf,
  ShoppingCart,
  Star,
  Users,
  ShieldCheck,
  MapPin,
  Clock,
  Smartphone,
  BarChart,
  ArrowRight,
  CheckCircle2
} from "lucide-react"

import PageHeroBanner from '@/components/PageHeroBanner'

export default function EverythingYouNeed({ embedded = false }) {
  const mainFeatures = [
    {
      icon: Leaf,
      title: "Fresh from the Farm",
      desc: "Browse weekly produce directly from verified local farmers. What you see is harvested fresh for you.",
      badge: "Produce Quality"
    },
    {
      icon: ShoppingCart,
      title: "Pre-Order for Pickup",
      desc: "Reserve your items online in advance and collect them at designated market stalls without waiting in long lines.",
      badge: "Zero Waiting"
    },
    {
      icon: Star,
      title: "Honest Ratings & Reviews",
      desc: "Transparent customer review system to help you find the highest rated stalls and build strong community trust.",
      badge: "Community Driven"
    },
    {
      icon: Users,
      title: "Dedicated Farmer Portal",
      desc: "Empowering farmers with simple inventory control, order management, and real-time sales reporting.",
      badge: "Farmer First"
    },
    {
      icon: MapPin,
      title: "Interactive Market Map",
      desc: "Embedded OpenStreetMap routing to help customers locate stall positions and get turn-by-turn directions.",
      badge: "Geolocation"
    },
    {
      icon: Clock,
      title: "Flexible Cutoff Times",
      desc: "Automatic order cutoff logic so farmers have enough time to harvest and pack fresh pre-orders.",
      badge: "Smart Scheduling"
    },
    {
      icon: Smartphone,
      title: "Fully Responsive UI",
      desc: "Seamless experience across mobile, tablet, and desktop with dark mode support and sleek glassmorphism design.",
      badge: "Modern Web UI"
    },
    {
      icon: BarChart,
      title: "Admin Analytics",
      desc: "Comprehensive admin monitoring of platform performance, user management, and market location analytics.",
      badge: "Full Control"
    }
  ]

  const benefits = [
    "No upfront digital payment required for pre-orders",
    "Direct communication and support for local farmers",
    "Verified stall locations and operating schedules",
    "Instant dark and light mode preference sync",
  ]

  return (
    <PublicLayout embedded={embedded}>
      {!embedded && (
        <div className="max-w-6xl mx-auto px-4 pt-6">
          <PageHeroBanner
            badge="Complete Platform Capabilities"
            title="Everything You Need for Local Commerce"
            description="MarketLink is engineered from the ground up to empower regional farmers and offer consumers a frictionless farm-to-table pre-order experience."
            icon={ShieldCheck}
          >
            <div className="flex flex-wrap gap-3">
              <Link to="/register">
                <Button size="sm" className="shadow-md font-bold">
                  Get Started Free <ArrowRight className="size-4 ml-1.5" />
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" size="sm" className="bg-white/10 text-white border-white/30 backdrop-blur">
                  See How It Works
                </Button>
              </Link>
            </div>
          </PageHeroBanner>
        </div>
      )}

      {/* Grid Features */}
      <section id="features" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12" data-aos="fade-up">
            <h2 className="text-3xl font-bold mb-3">Core Platform Features</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Explore the built-in tools that make MarketLink the best place to trade local produce.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mainFeatures.map(({ icon: Icon, title, desc, badge }, idx) => (
              <div
                key={title}
                data-aos="fade-up"
                data-aos-delay={idx * 100}
                className="group relative bg-card/80 backdrop-blur-md rounded-2xl p-6 border shadow-sm hover:shadow-xl hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-sm">
                      <Icon className="size-6" />
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground border">
                      {badge}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="py-16 px-4 bg-muted/30 border-y">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div data-aos="fade-right">
            <span className="text-xs uppercase tracking-widest text-primary font-bold">Why Choose MarketLink</span>
            <h2 className="text-3xl font-bold mt-2 mb-4">Built for Transparency & Convenience</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Our pre-order architecture guarantees that farmers only harvest what has been ordered, dramatically cutting down food waste and guaranteeing peak freshness for consumers.
            </p>
            <div className="space-y-3">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-center gap-3 text-sm font-medium">
                  <CheckCircle2 className="size-5 text-primary shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
          <div data-aos="fade-left" className="relative">
            <div className="rounded-2xl overflow-hidden border shadow-2xl bg-card p-2">
              <img
                src="/banner.jpg"
                alt="MarketLink Features Banner"
                className="rounded-xl object-cover h-72 w-full filter brightness-95 dark:brightness-90 hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
