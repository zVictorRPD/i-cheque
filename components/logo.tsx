import Image from "next/image"
import { cn } from "@/lib/utils"

export function Logo({
  className,
  width = 175,
  height = 40,
  priority = false,
}: {
  className?: string
  width?: number
  height?: number
  priority?: boolean
}) {
  return (
    <>
      <Image
        src="/logo.svg"
        alt="iCheque"
        width={width}
        height={height}
        priority={priority}
        className={cn("dark:hidden", className)}
      />
      <Image
        src="/logo-dark.svg"
        alt=""
        aria-hidden
        width={width}
        height={height}
        priority={priority}
        className={cn("hidden dark:block", className)}
      />
    </>
  )
}
