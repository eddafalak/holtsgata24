import { cn } from '@/lib/utils'

type DsSectionHeaderProps = {
  icon?: string
  title: string
  description: string
  className?: string
}

export function DsSectionHeader({ icon, title, description, className }: DsSectionHeaderProps) {
  return (
    <header className={cn('mb-10 max-w-3xl', className)}>
      <div className="flex items-start gap-3">
        {icon ? (
          <span className="text-2xl leading-none" aria-hidden>
            {icon}
          </span>
        ) : null}
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#18325a] sm:text-3xl">{title}</h2>
          <p className="mt-2 text-base leading-relaxed text-[#666]">{description}</p>
        </div>
      </div>
    </header>
  )
}
