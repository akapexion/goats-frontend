import { useAuth } from "@/context/AuthContext"
import { AppLayout } from "@/components/AppLayout"
import PublicLayout from "@/components/PublicLayout"

export default function PageContainer({ children, embedded = false }) {
  const { user } = useAuth()

  if (embedded) {
    return <div className="w-full">{children}</div>
  }

  if (user && user.role !== 'customer') {
    return <AppLayout>{children}</AppLayout>
  }

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-10rem)]">
        {children}
      </div>
    </PublicLayout>
  )
}
