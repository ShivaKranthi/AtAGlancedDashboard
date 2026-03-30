"use client";

import * as React from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO, startOfWeek, endOfWeek } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, PackageOpen, X } from "lucide-react";
import { formatNumber } from "@/lib/utils";

/** Represents a single scheduled record. Based on the skusOnSchedule schema */
export interface ScheduledItem {
  id: number;
  sku: string;
  quantity: number | null;
  scheduledDate: string | null; // "YYYY-MM-DD"
}

interface ScheduledCalendarModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  data: ScheduledItem[];
}

export function ScheduledCalendarModal({ isOpen, onOpenChange, data }: ScheduledCalendarModalProps) {
  // Find the earliest date in data, or use today
  const initialDate = React.useMemo(() => {
    const validDates = data
      .map((d) => d.scheduledDate)
      .filter(Boolean)
      .sort() as string[];
    return validDates.length > 0 ? parseISO(validDates[0]) : new Date();
  }, [data]);

  const [currentMonth, setCurrentMonth] = React.useState<Date>(initialDate);
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null); // Closed by default
  const [skuFilter, setSkuFilter] = React.useState<string>("");

  // Group data by YYYY-MM-DD
  const groupedData = React.useMemo(() => {
    const group: Record<string, ScheduledItem[]> = {};
    data.forEach((item) => {
      if (!item.scheduledDate) return;
      if (!group[item.scheduledDate]) group[item.scheduledDate] = [];
      group[item.scheduledDate].push(item);
    });
    return group;
  }, [data]);

  // Totals for header
  const totalScheduledVials = React.useMemo(() => {
    return data.reduce((acc, item) => acc + (item.quantity ?? 0), 0);
  }, [data]);

  const totalLots = React.useMemo(() => data.length, [data]);

  // Calendar Math
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  // Determine top-volume day for highlighting
  const maxVialsInADay = React.useMemo(() => {
    let max = 0;
    Object.values(groupedData).forEach(items => {
        const sum = items.reduce((acc, i) => acc + (i.quantity ?? 0), 0);
        if (sum > max) max = sum;
    });
    return max;
  }, [groupedData]);

  const HIGH_VOLUME_THRESHOLD = maxVialsInADay > 0 ? maxVialsInADay * 0.7 : Infinity;

  // Selected date items
  const selectedDateString = selectedDate ? format(selectedDate, "yyyy-MM-dd") : null;
  const rawItemsForSelectedDate = selectedDateString ? groupedData[selectedDateString] || [] : [];
  
  // Filter selected items by SKU
  const itemsForSelectedDate = rawItemsForSelectedDate.filter(item => 
    item.sku.toLowerCase().includes(skuFilter.toLowerCase())
  );

  const selectedDateTotal = itemsForSelectedDate.reduce((acc, i) => acc + (i.quantity ?? 0), 0);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="max-w-[90vw] w-[850px] bg-[#0a0e1a] border-slate-800 p-0 text-slate-100 rounded-2xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
        
        {/* Modal Header */}
        <div className="bg-[#111827]/80 backdrop-blur-md border-b border-slate-800 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-white">
              <CalendarIcon className="w-5 h-5 text-purple-400" />
              Scheduled Vials Calendar
            </DialogTitle>
            <p className="text-sm text-slate-400 mt-1">Upcoming production broken down by date.</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Total Scheduled</p>
              <p className="text-xl font-black text-purple-400">{formatNumber(totalScheduledVials)} <span className="text-sm font-medium text-slate-400">vials</span></p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Total Batches</p>
              <p className="text-xl font-black text-white">{formatNumber(totalLots)}</p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="relative flex flex-col md:flex-row h-[600px] overflow-hidden">
          
          {/* Left: Calendar */}
          <div className="flex-1 p-6 flex flex-col bg-[#0a0e1a] w-full z-0">
            {/* Month Nav */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white tracking-wide">
                {format(currentMonth, "MMMM yyyy")}
              </h3>
              <div className="flex gap-2">
                <button onClick={prevMonth} className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700 text-slate-300 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={nextMonth} className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700 text-slate-300 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-3 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                <div key={day} className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-3 flex-1 auto-rows-fr">
              {days.map((day: Date, idx: number) => {
                const dateKey = format(day, "yyyy-MM-dd");
                const dayItems = groupedData[dateKey] || [];
                const dayVials = dayItems.reduce((acc, i) => acc + (i.quantity ?? 0), 0);
                
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const hasProduction = dayVials > 0;
                const isHighVolume = dayVials >= HIGH_VOLUME_THRESHOLD && dayVials > 0;

                const heatmapIntensity = maxVialsInADay > 0 ? (dayVials / maxVialsInADay) : 0;
                const bgAlpha = hasProduction ? Math.min(0.6, Math.max(0.1, heatmapIntensity)) : 0;
                const customStyle = hasProduction && !isSelected ? { backgroundColor: `rgba(168, 85, 247, ${bgAlpha})` } : {};

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDate(day)}
                    style={customStyle}
                    className={`
                      relative flex flex-col justify-between p-2 rounded-xl border text-left transition-all duration-200 overflow-hidden
                      ${!isCurrentMonth ? 'opacity-30' : 'opacity-100'}
                      ${isSelected 
                        ? 'border-purple-400 bg-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.4)] z-10 scale-[1.02]' 
                        : hasProduction 
                          ? 'border-slate-700/50 hover:border-purple-400/50 hover:bg-purple-500/30' 
                          : 'border-transparent bg-transparent hover:bg-slate-800/30 text-slate-500'
                      }
                    `}
                  >
                    {/* Top Right Dot Indicator */}
                    {hasProduction && (
                      <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${isHighVolume ? 'bg-cyan-400 shadow-[0_0_8px_rgba(6,214,160,0.8)]' : 'bg-purple-400'}`} />
                    )}

                    <span className={`text-sm font-semibold ${isSelected ? 'text-white' : isCurrentMonth ? 'text-slate-300' : 'text-slate-600'}`}>
                      {format(day, "d")}
                    </span>

                    <div className="mt-1 h-6">
                      {hasProduction && (
                        <div className="flex flex-col gap-0.5">
                          <span className={`text-xs font-bold ${isHighVolume ? 'text-cyan-400' : 'text-purple-300'}`}>
                            {formatNumber(dayVials)} <span className="text-[9px] font-normal opacity-70">vls</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 flex items-center justify-center gap-6 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-400" />
                <span>Scheduled Day</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,214,160,0.8)]" />
                <span>High Volume</span>
              </div>
            </div>
          </div>

          {/* Right: Details Panel Sliding Drawer */}
          <div className={`
            absolute right-0 top-0 bottom-0 w-full sm:w-[380px] bg-[#0f1522]/95 backdrop-blur-xl border-l border-slate-700 flex flex-col h-full shadow-[-20px_0_40px_rgba(0,0,0,0.6)] transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] z-20
            ${selectedDate ? 'translate-x-0' : 'translate-x-full'}
          `}>
            {selectedDate ? (
              <>
                {/* Panel Header */}
                <div className="p-5 border-b border-slate-800 bg-[#141b2d] relative">
                  <button 
                    onClick={() => setSelectedDate(null)}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-700/60 text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <h4 className="text-lg font-bold text-white leading-tight pr-10">
                    {format(selectedDate, "EEEE, MMM do")}
                  </h4>
                  {rawItemsForSelectedDate.length > 0 ? (
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-2xl font-black text-purple-400">{formatNumber(selectedDateTotal)}</span>
                      <span className="text-sm font-medium text-slate-400">Total Vials</span>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 mt-1">No scheduled production</p>
                  )}
                </div>

                {/* Filter */}
                {rawItemsForSelectedDate.length > 0 && (
                  <div className="p-4 border-b border-slate-800 bg-[#0f1522]">
                    <div className="relative">
                       <input 
                         type="text"
                         placeholder="Filter by SKU..."
                         value={skuFilter}
                         onChange={(e) => setSkuFilter(e.target.value)}
                         className="w-full bg-[#1a2333] border border-slate-700 rounded-lg py-2 px-3 text-sm text-white focus:outline-hidden focus:border-purple-400 transition-colors"
                       />
                    </div>
                  </div>
                )}

                {/* Items List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                  {itemsForSelectedDate.length > 0 ? (
                    itemsForSelectedDate.map((item, idx) => (
                      <div key={idx} className="bg-[#1a2333] border border-slate-800 rounded-xl p-3 hover:border-purple-500/30 transition-colors">
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <p className="text-sm font-semibold text-white leading-snug">{item.sku}</p>
                          <span className="shrink-0 px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 text-[10px] font-bold tracking-wide">
                            {formatNumber(item.quantity ?? 0)} VLS
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
                          <div className="flex items-center gap-1.5 opacity-80">
                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                            <span>On Schedule</span>
                          </div>
                          {/* We don't have lot number in the schema for skus_on_schedule usually, but if provided we'd show it */}
                          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">
                            Batch #{item.id}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : rawItemsForSelectedDate.length > 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center opacity-70">
                      <p className="text-sm text-slate-400">No items match your filter.</p>
                      <button onClick={() => setSkuFilter("")} className="mt-2 text-xs text-purple-400 hover:underline">Clear filter</button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6 opacity-50">
                      <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-3">
                        <PackageOpen className="w-6 h-6 text-slate-500" />
                      </div>
                      <p className="text-sm text-slate-400 font-medium pb-10">No scheduled production for this date</p>
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
