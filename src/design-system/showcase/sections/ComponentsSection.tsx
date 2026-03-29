import { useState } from 'react'
import { ArrowLeft, ArrowRight, CalendarDays, ChevronDown, Clock, Search, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { TextField } from '@/components/ui/text-field'
import { TextareaField } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

import { theme } from '../../theme/theme'
import { DsCodeBlock } from '../components/DsCodeBlock'
import { DsSectionHeader } from '../components/DsSectionHeader'

type ComponentsSectionProps = {
  onNavigateToColors?: () => void
}

export function ComponentsSection({ onNavigateToColors }: ComponentsSectionProps) {
  const [discussion, setDiscussion] = useState('')

  return (
    <section id="ihlutir" className="scroll-mt-24 space-y-14 pb-16 sm:scroll-mt-8">
      <DsSectionHeader
        icon="🧩"
        title="Íhlutir"
        description="shadcn/ui-hlutar í notkun — hnappar, reitir, kort, gluggar og fleira. Uppruni: @/components/ui."
      />

      {onNavigateToColors ? (
        <p className="-mt-6 max-w-2xl text-sm text-[#666]">
          Heildarlitar og stærðartöflur fyrir hnappa:{' '}
          <button
            type="button"
            className="font-semibold text-[#18325a] underline-offset-2 hover:underline"
            onClick={onNavigateToColors}
          >
            opna köfluna Litir
          </button>
          .
        </p>
      ) : null}

      {/* Buttons */}
      <div className="space-y-6">
        <div className="flex flex-col gap-2 border-b border-[#f2f3f4] pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-[#323232]">Hnappar</h3>
            <p className="mt-1 text-sm text-[#666]">Aðal-, auka-, útlínu- og tengilsnið.</p>
          </div>
        </div>
        <div className="rounded-2xl border border-[#e8eaee] bg-white p-6 sm:p-8">
          <p className="text-sm font-medium text-[#666]">Yfirlit</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button>sjálfgefið</Button>
            <Button variant="secondary">secondary</Button>
            <Button variant="outline">útlína</Button>
            <Button variant="ghost">draugur</Button>
            <Button variant="destructive">eyðing</Button>
            <Button variant="link">tengill</Button>
          </div>
          <p className="mt-6 text-sm font-medium text-[#666]">Stærðir</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <Button size="lg">Stór (Big)</Button>
            <Button size="default">Mið (Medium)</Button>
            <Button size="sm">Lítil (Small)</Button>
            <Button size="xs">xs</Button>
          </div>
          <div className="mt-8 border-t border-[#f2f3f4] pt-8">
            <p className="text-sm font-medium text-[#666]">Með ikonum</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <Button size="default">
                <ArrowLeft className="h-4 w-4" aria-hidden />
                Til baka
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            </div>
          </div>
          <div className="mt-6">
            <DsCodeBlock label="React" code={`<Button variant="default">Vista</Button>
<Button variant="secondary">Hætta við</Button>
<Button variant="outline">Opna</Button>`} />
          </div>
        </div>
      </div>

      {/* Inputs — Figma Fundargerð (120:9250) + Textfield */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-[#323232]">Reitur</h3>
          <p className="mt-1 max-w-2xl text-sm text-[#666]">
            Samkvæmt Figma glugganum „Fundargerð“:{' '}
            <code className="rounded bg-[#f3f5f7] px-1">@/components/ui/text-field</code>,{' '}
            <code className="rounded bg-[#f3f5f7] px-1">@/components/ui/textarea</code> (Umræða), og einfaldar stillingar í{' '}
            <code className="rounded bg-[#f3f5f7] px-1">theme.componentPatterns.figmaInput</code>.
          </p>
        </div>
        <div className="max-w-xl space-y-10 rounded-2xl border border-[#e8eaee] bg-white p-6 sm:p-8">
          <div className="space-y-4 rounded-md bg-[#fbfbfc] p-6">
            <p className="text-sm font-medium text-[#666]">Fundargerð — reitir (56px, efri label + stjarna 14px)</p>
            <TextField
              size="lg"
              label="Titill"
              required
              placeholder="T.d „laga glugga að utan“"
              endAdornment={<X className="size-4" aria-hidden />}
              readOnly
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                size="lg"
                label="Dagsetning"
                required
                type="date"
                startIcon={<CalendarDays aria-hidden />}
                startIconTriggersPicker
                startIconLabel="Velja dagsetningu"
                endAdornment={<X className="size-4" aria-hidden />}
                readOnly
              />
              <TextField
                size="lg"
                label="Tími"
                required
                type="time"
                startIcon={<Clock aria-hidden />}
                startIconTriggersPicker
                startIconLabel="Velja tíma"
                endAdornment={<X className="size-4" aria-hidden />}
                readOnly
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                size="lg"
                label="Staðsetning"
                defaultValue="Input"
                startIcon={<Search aria-hidden />}
                endAdornment={<X className="size-4" aria-hidden />}
                readOnly
              />
              <TextField
                size="lg"
                label="Fundartegund"
                defaultValue="Annað"
                endAdornment={<ChevronDown className="size-4" aria-hidden />}
                readOnly
              />
            </div>
            <TextareaField
              label="Umræða"
              labelPlacement="inside"
              placeholder="t.d. Umræða um viðhald á þaki, samþykkt fjárhagsáætlunar..."
              maxLength={500}
              value={discussion}
              onChange={(e) => setDiscussion(e.target.value)}
            />
          </div>

          <div className="space-y-4 border-t border-[#f2f3f4] pt-8">
            <p className="text-sm font-medium text-[#666]">Aðrar sýnishorn (ikon + viðskeyti)</p>
            <TextField
              size="lg"
              label="Label"
              required
              showLabelInfo
              startIcon={<Search aria-hidden />}
              endAdornment={<X className="size-4" aria-hidden />}
              suffix=".is"
              placeholder="vefur"
              readOnly
              supportingText="Supporting text"
            />
          </div>
          <div className="space-y-4 border-t border-[#f2f3f4] pt-8">
            <p className="text-sm font-medium text-[#666]">Small (40px)</p>
            <TextField
              size="sm"
              label="Label"
              required
              showLabelInfo
              startIcon={<Search aria-hidden />}
              endAdornment={<X className="size-4" aria-hidden />}
              placeholder="Placeholder"
              readOnly
              supportingText="Supporting text"
            />
          </div>
          <div className="space-y-3 border-t border-[#f2f3f4] pt-8">
            <p className="text-sm font-medium text-[#666]">Einfaldur einn-línu reitur</p>
            <input
              className={cn('w-full', theme.componentPatterns.figmaInput)}
              placeholder="Sláðu inn texta…"
              readOnly
            />
            <input
              className={cn('w-full', theme.componentPatterns.figmaInputSm)}
              placeholder="Sláðu inn texta…"
              readOnly
            />
          </div>
          <DsCodeBlock
            label="React"
            code={`<TextField size="lg" label="Titill" required placeholder="…" endAdornment={…} />
<TextareaField label="Umræða" labelPlacement="inside" maxLength={500} value={…} onChange={…} />`}
          />
        </div>
      </div>

      {/* Primary pattern */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-[#323232]">Aðalhnappur (mynstur)</h3>
        <div className="rounded-2xl border border-[#e8eaee] bg-white p-6 sm:p-8">
          <button type="button" className={theme.componentPatterns.figmaPrimaryButton}>
            Vista breytingar
          </button>
          <p className="mt-4 text-sm text-[#666]">
            <code className="rounded bg-[#f3f5f7] px-1">theme.componentPatterns.figmaPrimaryButton</code> — miðstærð, Figma-samsvörun.
          </p>
        </div>
      </div>

      {/* Card */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-[#323232]">Kort</h3>
        <Card className="max-w-md border-[#e8eaee] shadow-sm">
          <CardHeader>
            <CardTitle>Kort</CardTitle>
            <CardDescription>Úr @/components/ui/card — eins og á forsíðu.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Innihald með lýsingu.</p>
          </CardContent>
          <CardFooter>
            <Button size="sm">Aðgerð</Button>
          </CardFooter>
        </Card>
      </div>

      {/* Dialog + Popover */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-[#323232]">Gluggar og popover</h3>
        <div className="flex flex-wrap gap-4 rounded-2xl border border-[#e8eaee] bg-white p-6 sm:p-8">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Opna glugga</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Dialog</DialogTitle>
                <DialogDescription>Staðfestingar og eyðublöð.</DialogDescription>
              </DialogHeader>
              <Button type="button">Í lagi</Button>
            </DialogContent>
          </Dialog>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <CalendarDays className="h-4 w-4" aria-hidden />
                Dagatal
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="rounded-2xl border border-[#e8eaee] bg-[#fbfbfc] p-6 text-sm text-[#666]">
        <p>
          Fleiri íhlutir má bæta við hér eftir því sem verkefnið stækkar. Skjáupplýsingar: notið{' '}
          <code className="rounded bg-white px-1">focus-visible:ring</code> og merktu takka með{' '}
          <code className="rounded bg-white px-1">aria-label</code> þar sem texti vantar.
        </p>
      </div>
    </section>
  )
}
