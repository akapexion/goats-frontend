import { Sparkles } from "lucide-react"

export default function PageHeroBanner({
  badge = "Organic Farm Direct",
  title = "Explore Our Community",
  description = "Discover fresh harvests, verified local farmers, and neighborhood markets.",
  icon: Icon = Sparkles,
  backgroundImage = "/banner.jpg",
  children
}) {
  return (
    <div className="relative rounded-2xl overflow-hidden border shadow-lg bg-cover bg-center mb-8 min-h-[190px] sm:min-h-[240px] flex items-center">
      <img
        src={backgroundImage}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover filter brightness-[0.45] dark:brightness-[0.35]"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/30" />

      <div className="relative z-10 p-6 sm:p-10 flex flex-col justify-center text-white h-full max-w-3xl animate-fade-in">
        {badge && (
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5 mb-2">
            {Icon && <Icon className="size-3.5" />} {badge}
          </span>
        )}
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight drop-shadow-sm">
          {title}
        </h1>
        {description && (
          <p className="text-xs sm:text-sm text-white/90 max-w-2xl mt-2 leading-relaxed font-normal drop-shadow">
            {description}
          </p>
        )}
        {children && <div className="mt-4">{children}</div>}
      </div>
    </div>
  )
}
