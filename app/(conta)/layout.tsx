import { Logo } from "@/components/logo"

export default function ContaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-md flex-col justify-center gap-6 px-4 py-10">
      <Logo
        priority
        width={210}
        height={48}
        className="h-12 w-auto self-start"
      />
      {children}
    </div>
  )
}
