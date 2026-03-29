/* eslint react-refresh/only-export-components: "off" */
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Info } from 'lucide-react'

import { inputBorderRadiusClass } from '@/design-system/tokens/inputs'
import { cn } from '@/lib/utils'

const shellVariants = cva(
  cn(
    'group flex w-full items-stretch overflow-hidden border border-solid border-[#f3f5f7] bg-white transition-colors hover:border-[#d1d6de] hover:bg-[#f2f2f2] focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/15',
    inputBorderRadiusClass
  ),
  {
    variants: {
      /** Figma Large — nákvæmlega 56px (heightPx í `figmaInputTokens.sizes.large`). */
      size: {
        lg: 'h-[56px]',
        /** Figma Small — nákvæmlega 40px. */
        sm: 'h-[40px]',
      },
    },
    defaultVariants: { size: 'lg' },
  }
)

/** Efri línuletur — alltaf 12px/16px (lg); stjarna er stærri (14px / 1.3) í Figma 120:9250. */
const labelTextVariants = cva('truncate font-normal text-[#666]', {
  variants: {
    size: {
      lg: 'text-[12px] leading-4',
      sm: 'text-[10px] leading-3',
    },
  },
  defaultVariants: { size: 'lg' },
})

const requiredMarkVariants = cva('shrink-0 font-normal text-[#666]', {
  variants: {
    size: {
      lg: 'text-sm leading-[1.3]',
      sm: 'text-xs leading-[1.3]',
    },
  },
  defaultVariants: { size: 'lg' },
})

const inputVariants = cva(
  'min-h-0 w-full min-w-0 border-0 bg-transparent p-0 text-[#1a1a1a] outline-none ring-0 placeholder:text-[#666] focus-visible:ring-0 disabled:cursor-not-allowed',
  {
    variants: {
      size: {
        /** Inntaksstrik — hæð 26px (text 16px, lína 26px). */
        lg: 'h-[26px] min-h-[26px] text-[16px] leading-[26px]',
        sm: 'text-xs leading-4',
      },
    },
    defaultVariants: { size: 'lg' },
  }
)

const supportingVariants = cva('text-[#4c4c4c]', {
  variants: {
    size: {
      lg: 'text-sm leading-5',
      sm: 'text-xs leading-4',
    },
  },
  defaultVariants: { size: 'lg' },
})

/** Fela innbyggða dagatal/tíma bendil (Chrome/Safari) — nota með vinstri takka sem kallar á showPicker(). */
const hideNativePickerIndicatorClass =
  '[&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none'

/**
 * Ein-línu reitur. **`size`**: `lg` = 56px, `sm` = 40px (`figmaInputTokens`); sjálfgefið `lg`.
 */
export type TextFieldProps = Omit<React.ComponentProps<'input'>, 'size'> &
  VariantProps<typeof shellVariants> & {
    /** Ef gefið, birtist lítill efri label innan rammans (Figma „upper label“). */
    label?: React.ReactNode
    required?: boolean
    /** Sýna litla upplýsingarmerki við hlið labels. */
    showLabelInfo?: boolean
    /** Sérsniðið efni við hlið labels (t.d. annað ikon). */
    labelAdornment?: React.ReactNode
    /** Vinstri ikon (t.d. leit, dagatal) — ætlað fyrir aðal aðgerð. */
    startIcon?: React.ReactNode
    /** Ef satt: vinstri ikon er smellanlegur takki sem kallar á showPicker() fyrir type=date|time. */
    startIconTriggersPicker?: boolean
    /** aria-label á vinstri takka (krafist þegar startIconTriggersPicker er notað). */
    startIconLabel?: string
    /** Fela væntanlegan innbyggðan dagatal/tíma bendil (mælt með með startIconTriggersPicker). */
    hideNativePickerIndicator?: boolean
    /** Hægri hluti: aðeins viðbót eins og X (hreinsa) eða Chevron (fellival). */
    endAdornment?: React.ReactNode
    /** Viðskeyti með bakgrunni (#EFF5F7 / hover #E5E5E5), t.d. „.is“. */
    suffix?: React.ReactNode
    supportingText?: React.ReactNode
    wrapperClassName?: string
    inputClassName?: string
  }

const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  {
    className,
    wrapperClassName,
    inputClassName,
    size = 'lg',
    label,
    required,
    showLabelInfo,
    labelAdornment,
    startIcon,
    startIconTriggersPicker,
    startIconLabel = 'Opna val',
    hideNativePickerIndicator,
    endAdornment,
    suffix,
    supportingText,
    disabled,
    id: idProp,
    ...inputProps
  },
  ref
) {
  const genId = React.useId()
  const inputId = idProp ?? genId
  const supportingId = `${inputId}-support`
  const showSupporting = supportingText != null && supportingText !== ''
  const showLabelRow = label != null && label !== ''

  const innerRef = React.useRef<HTMLInputElement | null>(null)
  const setInputRef = React.useCallback(
    (node: HTMLInputElement | null) => {
      innerRef.current = node
      if (typeof ref === 'function') ref(node)
      else if (ref && typeof ref === 'object') (ref as React.MutableRefObject<HTMLInputElement | null>).current = node
    },
    [ref]
  )

  const inputType = inputProps.type
  const shouldHideNativePicker =
    hideNativePickerIndicator ??
    (Boolean(startIconTriggersPicker) && (inputType === 'date' || inputType === 'time'))

  const openPicker = React.useCallback(() => {
    const el = innerRef.current
    if (!el || disabled) return
    if (typeof el.showPicker === 'function') {
      try {
        void el.showPicker()
        return
      } catch {
        /* sum vafri leyfa ekki nema notandavirkni */
      }
    }
    el.focus()
  }, [disabled])

  const startIconBox =
    size === 'lg' ? 'size-6 [&_svg]:size-5' : 'size-5 [&_svg]:size-5'

  const inputChromeClass = cn(shouldHideNativePicker && hideNativePickerIndicatorClass, inputClassName)

  return (
    <div className={cn('flex w-full flex-col gap-1', wrapperClassName)}>
      <div className={cn(shellVariants({ size }), disabled && 'pointer-events-none opacity-50', className)}>
        <div
          className={cn(
            'flex min-h-0 min-w-0 flex-1 items-center gap-2',
            size === 'lg' ? 'pl-3 pr-4' : 'pl-2 pr-2'
          )}
        >
          {startIcon ? (
            startIconTriggersPicker ? (
              <button
                type="button"
                className={cn(
                  'flex shrink-0 items-center justify-center rounded-md text-[#666] transition-colors',
                  'hover:bg-black/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25',
                  startIconBox,
                )}
                aria-label={startIconLabel}
                disabled={disabled}
                onClick={(e) => {
                  e.preventDefault()
                  openPicker()
                }}
              >
                {startIcon}
              </button>
            ) : (
              <span
                className={cn('flex shrink-0 items-center justify-center text-[#666]', startIconBox)}
                aria-hidden
              >
                {startIcon}
              </span>
            )
          ) : null}

          {showLabelRow ? (
            <label
              htmlFor={inputId}
              className={cn(
                'flex min-h-0 min-w-0 flex-1 cursor-text flex-col justify-center gap-0.5 py-1.5'
              )}
            >
              <span className="flex w-full min-w-0 items-center gap-0.5">
                <span className={labelTextVariants({ size })}>{label}</span>
                {required ? (
                  <span className={requiredMarkVariants({ size })} aria-hidden>
                    *
                  </span>
                ) : null}
                {labelAdornment}
                {showLabelInfo ? (
                  <span className="inline-flex shrink-0 items-center justify-center text-[#666]" aria-hidden>
                    <Info className={size === 'lg' ? 'size-4' : 'size-3'} strokeWidth={2} />
                  </span>
                ) : null}
              </span>
              <input
                ref={setInputRef}
                id={inputId}
                disabled={disabled}
                aria-describedby={showSupporting ? supportingId : undefined}
                className={cn(inputVariants({ size }), inputChromeClass)}
                {...inputProps}
              />
            </label>
          ) : (
            <input
              ref={setInputRef}
              id={inputId}
              disabled={disabled}
              aria-describedby={showSupporting ? supportingId : undefined}
              className={cn(
                inputVariants({ size }),
                size === 'lg' ? 'py-0' : 'flex-1 py-2 pr-0',
                inputChromeClass
              )}
              {...inputProps}
            />
          )}

          {endAdornment ? (
            <div className="flex h-5 shrink-0 items-center gap-2 text-[#666] [&_svg]:size-4">
              {endAdornment}
            </div>
          ) : null}
        </div>

        {suffix != null && suffix !== '' ? (
          <div
            className={cn(
              'flex shrink-0 items-center border-l border-[#f3f5f7] bg-[#eff5f7] px-3 text-sm leading-[1.3] text-[#1a1a1a] transition-colors group-hover:bg-[#e5e5e5]'
            )}
          >
            {suffix}
          </div>
        ) : null}
      </div>

      {showSupporting ? (
        <p id={supportingId} className={cn(supportingVariants({ size }), 'py-0.5')}>
          {supportingText}
        </p>
      ) : null}
    </div>
  )
})

export {
  TextField,
  shellVariants,
  inputVariants,
  labelTextVariants,
  requiredMarkVariants,
  supportingVariants,
  hideNativePickerIndicatorClass,
}
