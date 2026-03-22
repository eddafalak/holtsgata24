import * as React from 'react'
import type { DayPickerProps } from 'react-day-picker'

import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type DayPickerRangeProps = Extract<DayPickerProps, { mode: 'range' }>

type CalendarExtras = Pick<
  React.ComponentProps<typeof Calendar>,
  'buttonVariant' | 'formatters' | 'components' | 'showOutsideDays' | 'captionLayout' | 'classNames'
>

export type CalendarRangeProps = Omit<DayPickerRangeProps, 'mode'> &
  Partial<CalendarExtras> & {
    /** Extra classes on the wrapping `Card` (e.g. `shadow-none ring-0` inside a popover). */
    cardClassName?: string
    className?: string
  }

/** Range `DayPicker` í `Card` — einn mánuður í senn (sjálfgefið). */
export function CalendarRange({
  className,
  cardClassName,
  ...calendarProps
}: CalendarRangeProps) {
  return (
    <Card className={cn('mx-auto w-fit p-0', cardClassName)}>
      <CardContent className="p-0">
        {/* Cast: DayPicker's prop union does not narrow after Omit; runtime is always range mode. */}
        <Calendar
          mode="range"
          className={className}
          {...(calendarProps as React.ComponentProps<typeof Calendar>)}
        />
      </CardContent>
    </Card>
  )
}
