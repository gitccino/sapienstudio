import { NavigationBar } from '@/components/navigation-bar'

export default function CollectionsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="no-scrollbar main-container flex-col-start gap-4 px-[5%] py-8 md:px-0">
      {/* NavigationBar lives here — persists across all /collections/* routes */}
      <NavigationBar />
      {children}
    </div>
  )
}
