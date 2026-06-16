import type { DaySlots, Slot } from '@/api/generated'
import { Button } from '@/components/ui/button'
import { formatDayHeading, formatSlotTime } from '@/lib/datetime'

interface SlotPickerProps {
  days: DaySlots[]
  timezone: string
  selectedStartAt?: string
  onSelect: (slot: Slot) => void
}

export function SlotPicker({
  days,
  timezone,
  selectedStartAt,
  onSelect,
}: SlotPickerProps) {
  const daysWithSlots = days.filter((day) => day.slots.length > 0)

  if (daysWithSlots.length === 0) {
    return (
      <p className="text-muted-foreground">
        No free slots in the next 14 days.
      </p>
    )
  }

  return (
    <div className="space-y-6">
      {daysWithSlots.map((day) => (
        <div key={day.date.toISOString()}>
          <h3 className="mb-2 text-sm font-medium text-muted-foreground">
            {formatDayHeading(day.date, timezone)}
          </h3>
          <div className="flex flex-wrap gap-2">
            {day.slots.map((slot) => {
              const iso = slot.startAt.toISOString()
              return (
                <Button
                  key={iso}
                  type="button"
                  variant={iso === selectedStartAt ? 'default' : 'outline'}
                  onClick={() => onSelect(slot)}
                >
                  {formatSlotTime(slot.startAt, timezone)}
                </Button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
