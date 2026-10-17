"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
type Schedule = {
  time?: string;
  minute?: number;
  everyHours?: number;
  everyDays?: number;
  everyWeeks?: number;
  days?: number[];
  dayOfMonth?: number;
  months?: number[];
};
export function AutomationScheduleFields({
  frequency,
  setFrequency,
  schedule,
  setSchedule,
}: {
  frequency: string;
  setFrequency: (value: string) => void;
  schedule: Schedule;
  setSchedule: (value: Schedule) => void;
}) {
  const toggle = (key: "days" | "months", value: number) => {
    const values = schedule[key] || [];
    setSchedule({
      ...schedule,
      [key]: values.includes(value)
        ? values.filter((item) => item !== value)
        : [...values, value].sort((a, b) => a - b),
    });
  };
  return (
    <div className="space-y-3 rounded-lg border bg-muted/20 p-3">
      <div>
        <Label>Send interval</Label>
        <Select
          value={frequency}
          onValueChange={(value) => setFrequency(value || "once")}
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="once">Once</SelectItem>
            <SelectItem value="hour">Per hour</SelectItem>
            <SelectItem value="day">Per day</SelectItem>
            <SelectItem value="week">Per week</SelectItem>
            <SelectItem value="month">Per month</SelectItem>
            <SelectItem value="year">Per year</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {frequency === "hour" && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Repeat every (hours)</Label>
            <Input
              className="mt-1"
              type="number"
              min={1}
              max={24}
              value={schedule.everyHours || 1}
              onChange={(e) =>
                setSchedule({
                  ...schedule,
                  everyHours: Math.max(1, Number(e.target.value) || 1),
                })
              }
            />
          </div>
          <div>
            <Label>At minute</Label>
            <Select
              value={String(schedule.minute ?? 0)}
              onValueChange={(value) =>
                setSchedule({ ...schedule, minute: Number(value) })
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 60 }, (_, minute) => (
                  <SelectItem key={minute} value={String(minute)}>
                    {String(minute).padStart(2, "0")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
      {frequency === "day" && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Every (days)</Label>
            <Input
              className="mt-1"
              type="number"
              min={1}
              value={schedule.everyDays || 1}
              onChange={(e) =>
                setSchedule({
                  ...schedule,
                  everyDays: Math.max(1, Number(e.target.value) || 1),
                })
              }
            />
          </div>
          <div>
            <Label>Send time</Label>
            <Input
              className="mt-1"
              type="time"
              value={schedule.time || "09:00"}
              onChange={(e) =>
                setSchedule({ ...schedule, time: e.target.value })
              }
            />
          </div>
        </div>
      )}
      {frequency === "week" && (
        <>
          <div>
            <Label>Repeat every (weeks)</Label>
            <Input
              className="mt-1"
              type="number"
              min={1}
              value={schedule.everyWeeks || 1}
              onChange={(e) =>
                setSchedule({
                  ...schedule,
                  everyWeeks: Math.max(1, Number(e.target.value) || 1),
                })
              }
            />
          </div>
          <div>
            <Label>Send on these days</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {days.map((day, index) => (
                <button
                  type="button"
                  key={day}
                  onClick={() => toggle("days", index)}
                  className={`rounded-full border px-3 py-1 text-xs ${schedule.days?.includes(index) ? "border-blue-600 bg-blue-600 text-white" : "bg-background"}`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label>Send time</Label>
            <Input
              className="mt-1"
              type="time"
              value={schedule.time || "09:00"}
              onChange={(e) =>
                setSchedule({ ...schedule, time: e.target.value })
              }
            />
          </div>
        </>
      )}
      {frequency === "month" && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Day of month</Label>
            <Select
              value={String(schedule.dayOfMonth || 1)}
              onValueChange={(value) =>
                setSchedule({ ...schedule, dayOfMonth: Number(value) })
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 31 }, (_, index) => (
                  <SelectItem key={index + 1} value={String(index + 1)}>
                    {index + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Send time</Label>
            <Input
              className="mt-1"
              type="time"
              value={schedule.time || "09:00"}
              onChange={(e) =>
                setSchedule({ ...schedule, time: e.target.value })
              }
            />
          </div>
        </div>
      )}
      {frequency === "year" && (
        <>
          <div>
            <Label>Send in these months</Label>
            <Popover>
              <PopoverTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-1 w-full justify-between"
                  />
                }
              >
                {schedule.months?.length
                  ? schedule.months.map((month) => months[month - 1]).join(", ")
                  : "Choose months"}
              </PopoverTrigger>
              <PopoverContent
                align="start"
                className="max-h-64 overflow-y-auto"
              >
                {months.map((month, index) => (
                  <label
                    key={month}
                    className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 hover:bg-muted"
                  >
                    <Checkbox
                      checked={schedule.months?.includes(index + 1) || false}
                      onCheckedChange={() => toggle("months", index + 1)}
                    />
                    <span>{month}</span>
                  </label>
                ))}
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Day of month</Label>
              <Select
                value={String(schedule.dayOfMonth || 1)}
                onValueChange={(value) =>
                  setSchedule({ ...schedule, dayOfMonth: Number(value) })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 31 }, (_, index) => (
                    <SelectItem key={index + 1} value={String(index + 1)}>
                      {index + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Send time</Label>
              <Input
                className="mt-1"
                type="time"
                value={schedule.time || "09:00"}
                onChange={(e) =>
                  setSchedule({ ...schedule, time: e.target.value })
                }
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
