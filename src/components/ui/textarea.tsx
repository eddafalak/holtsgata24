/* eslint react-refresh/only-export-components: "off" */
import * as React from 'react'

import { cn } from '@/lib/utils'
import { labelTextVariants, requiredMarkVariants } from '@/components/ui/text-field'
import { textareaFieldShellClasses, textareaPatternClasses } from '@/design-system/tokens'

export type TextareaProps = React.ComponentProps<'textarea'>

/** Einfaldur textarea með Figma ramma (120:9250 — Umræða). */
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, ...props },
  ref
) {
  return (
    <textarea ref={ref} className={cn(textareaPatternClasses, className)} {...props} />
  )
})

export type TextareaFieldProps = Omit<React.ComponentProps<'textarea'>, 'children'> & {
  label?: React.ReactNode
  /** `inside` = efri línuletur innan ramma (eins og TextField); `above` = titill fyrir ofan kassa. */
  labelPlacement?: 'above' | 'inside'
  required?: boolean
  maxLength?: number
  showCharCount?: boolean
  wrapperClassName?: string
}

/**
 * Textarea með teljara; label annaðhvort fyrir ofan eða innan ramma (Figma Fundargerð).
 */
const TextareaField = React.forwardRef<HTMLTextAreaElement, TextareaFieldProps>(function TextareaField(
  {
    className,
    wrapperClassName,
    label,
    labelPlacement = 'above',
    required,
    maxLength,
    showCharCount = true,
    value,
    defaultValue,
    onChange,
    id: idProp,
    ...props
  },
  ref
) {
  const genId = React.useId()
  const fieldId = idProp ?? genId
  const [uncontrolled, setUncontrolled] = React.useState(String(defaultValue ?? ''))
  const isControlled = value !== undefined
  const str = isControlled ? String(value ?? '') : uncontrolled
  const count = str.length

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isControlled) setUncontrolled(e.target.value)
    onChange?.(e)
  }

  const textareaClass = cn(
    'w-full flex-1 resize-none border-0 bg-transparent p-0 text-[16px] leading-[1.5] text-[#1a1a1a] outline-none placeholder:text-[#666] disabled:cursor-not-allowed disabled:opacity-50',
    labelPlacement === 'inside' ? 'min-h-[72px]' : 'min-h-[48px]',
    className
  )

  const counter =
    maxLength != null && showCharCount ? (
      <p className="text-xs leading-4 text-[#b3b3b3]" aria-live="polite">
        {count}/{maxLength} stafir
      </p>
    ) : null

  const inner =
    label != null && label !== '' && labelPlacement === 'inside' ? (
      <div className={cn(textareaFieldShellClasses, wrapperClassName)}>
        <label htmlFor={fieldId} className="flex min-h-0 flex-1 cursor-text flex-col gap-0.5 py-1.5">
          <span className="flex w-full min-w-0 items-center gap-0.5">
            <span className={labelTextVariants({ size: 'lg' })}>{label}</span>
            {required ? (
              <span className={requiredMarkVariants({ size: 'lg' })} aria-hidden>
                *
              </span>
            ) : null}
          </span>
          <textarea
            ref={ref}
            id={fieldId}
            maxLength={maxLength}
            value={value}
            defaultValue={defaultValue}
            onChange={handleChange}
            className={textareaClass}
            {...props}
          />
        </label>
        {counter}
      </div>
    ) : (
      <div className={cn(textareaFieldShellClasses, wrapperClassName)}>
        <textarea
          ref={ref}
          id={fieldId}
          maxLength={maxLength}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          className={textareaClass}
          {...props}
        />
        {counter}
      </div>
    )

  if (label != null && label !== '' && labelPlacement === 'above') {
    return (
      <div className="flex w-full flex-col gap-2">
        <label htmlFor={fieldId} className="text-sm leading-4 text-black">
          {label}
        </label>
        {inner}
      </div>
    )
  }

  return inner
})

export { Textarea, TextareaField }
