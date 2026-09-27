import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-background flex flex-col text-foreground">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
