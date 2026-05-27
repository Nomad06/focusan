import React, { useMemo } from 'react'

import { format, subDays, eachDayOfInterval, startOfWeek } from 'date-fns'

import { t } from '../i18n'

interface HeatmapProps {
  data: Record<string, number> // YYYY-MM-DD -> minutes
  color?: string
}

const Heatmap: React.FC<HeatmapProps> = ({ data }) => {
  const [hoveredDay, setHoveredDay] = React.useState<{
    value: number
    dateStr: string
    formattedDate: string
    x: number
    y: number
  } | null>(null)

  // Generate calendar data grouped by weeks
  const { weeks, monthLabels } = useMemo(() => {
    const today = new Date()
    // Ensure start date is a Monday
    const startDate = startOfWeek(subDays(today, 364), { weekStartsOn: 1 })

    const days = eachDayOfInterval({ start: startDate, end: today })

    // Enhance days with data
    const enhancedDays = days.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd')
      const value = data[dateStr] || 0
      return {
        date,
        dateStr,
        value,
        level: getLevel(value),
      }
    })

    // Chunk into weeks
    const weeksArray: (typeof enhancedDays)[] = []
    let currentWeek: typeof enhancedDays = []

    enhancedDays.forEach(day => {
      currentWeek.push(day)
      if (currentWeek.length === 7) {
        weeksArray.push(currentWeek)
        currentWeek = []
      }
    })
    // Push last partial week if exists
    if (currentWeek.length > 0) {
      weeksArray.push(currentWeek)
    }

    // Calculate month labels
    const labels: { weekIndex: number; label: string }[] = []
    let lastMonth = ''

    weeksArray.forEach((week, index) => {
      const firstDay = week[0].date
      const monthStr = format(firstDay, 'MMM')

      if (monthStr !== lastMonth) {
        labels.push({ weekIndex: index, label: monthStr })
        lastMonth = monthStr
      }
    })

    return { weeks: weeksArray, monthLabels: labels }
  }, [data])

  function getLevel(minutes: number) {
    if (minutes === 0) return 0
    if (minutes < 15) return 1
    if (minutes < 30) return 2
    if (minutes < 60) return 3
    return 4 // Intense focus
  }

  const getColorClass = (level: number) => {
    switch (level) {
      case 0:
        return 'bg-black/5'
      case 1:
        return 'bg-nissho-orange/30'
      case 2:
        return 'bg-nissho-orange/50'
      case 3:
        return 'bg-nissho-orange/70'
      case 4:
        return 'bg-nissho-orange'
      default:
        return 'bg-black/5'
    }
  }

  return (
    <div className="w-full overflow-x-auto pb-4 relative">
      <div className="min-w-fit pr-4">
        {/* Month Labels Row */}
        <div className="flex gap-[3px] text-xs font-serif text-sumi-gray mb-2 ml-[36px] pl-0.5 tracking-wide">
          {weeks.map((_, index) => {
            const labelObj = monthLabels.find(l => l.weekIndex === index)
            return (
              <div key={index} className="w-[11px] flex-none relative">
                {labelObj && (
                  <span className="absolute left-0 bottom-0 whitespace-nowrap">
                    {labelObj.label}
                  </span>
                )}
              </div>
            )
          })}
        </div>

        <div className="flex gap-2">
          {/* Day labels */}
          <div className="flex flex-col gap-[3px] text-[10px] font-mono text-sumi-gray/60 w-8 text-right pr-2">
            <div className="h-[11px]" /> {/* Empty for Mon */}
            <div className="h-[11px] leading-[11px]">Tue</div>
            <div className="h-[11px]" /> {/* Empty for Wed */}
            <div className="h-[11px] leading-[11px]">Thu</div>
            <div className="h-[11px]" /> {/* Empty for Fri */}
            <div className="h-[11px] leading-[11px]">Sat</div>
            <div className="h-[11px]" /> {/* Empty for Sun */}
          </div>

          {/* Heatmap Grid */}
          <div className="flex gap-[3px]" onMouseLeave={() => setHoveredDay(null)}>
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-[3px] w-[11px]">
                {week.map(day => (
                  <div
                    key={day.dateStr}
                    className={`w-[11px] h-[11px] rounded-[2px] ${getColorClass(day.level)} transition-all duration-300 hover:scale-125 hover:z-10 cursor-pointer hover:shadow-sm`}
                    onMouseEnter={e => {
                      const rect = e.currentTarget.getBoundingClientRect()
                      setHoveredDay({
                        value: day.value,
                        dateStr: day.dateStr,
                        formattedDate: format(day.date, 'MMM d, yyyy'),
                        x: rect.left + rect.width / 2,
                        y: rect.top,
                      })
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-sumi-gray mt-5 justify-end uppercase tracking-widest opacity-80">
          <span>{t('stats.less')}</span>
          <div className="flex gap-[3px]">
            <div className="w-[11px] h-[11px] rounded-[2px] bg-black/5"></div>
            <div className="w-[11px] h-[11px] rounded-[2px] bg-nissho-orange/30"></div>
            <div className="w-[11px] h-[11px] rounded-[2px] bg-nissho-orange/50"></div>
            <div className="w-[11px] h-[11px] rounded-[2px] bg-nissho-orange/70"></div>
            <div className="w-[11px] h-[11px] rounded-[2px] bg-nissho-orange"></div>
          </div>
          <span>{t('stats.more')}</span>
        </div>
      </div>

      {/* Shared Tooltip Portal/Overlay */}
      {hoveredDay && (
        <div
          className="fixed z-[120] pointer-events-none fade-in"
          style={{
            left: hoveredDay.x,
            top: hoveredDay.y - 8, // slight offset to clear the cursor more comfortably
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="bg-sumi-black text-white text-xs px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap flex flex-col items-center">
            <span className="font-medium tracking-wide">{hoveredDay.value} mins</span>
            <span className="opacity-70 font-mono text-[10px] uppercase tracking-wider mt-0.5">{hoveredDay.formattedDate}</span>
            {/* Little arrow pointing down */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-sumi-black"></div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Heatmap
