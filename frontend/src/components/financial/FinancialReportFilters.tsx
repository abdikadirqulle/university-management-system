import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

interface FinancialReportFiltersProps {
  onFilter: (filters: {
    startDate?: string;
    endDate?: string;
    paymentType?: string;
    status?: string;
    studentId?: string;
  }) => void;
}

export function FinancialReportFilters({
  onFilter,
}: FinancialReportFiltersProps) {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [paymentType, setPaymentType] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [studentId, setStudentId] = useState<string>("");

  const handleFilter = () => {
    onFilter({
      startDate: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
      endDate: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
      paymentType: paymentType || undefined,
      status: status || undefined,
      studentId: studentId || undefined,
    });
  };

  return (
    <div className="flex flex-wrap gap-4 p-4 bg-white rounded-lg shadow">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Start Date</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[200px] justify-start">
              {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
              <CalendarIcon className="ml-auto h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={setStartDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">End Date</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[200px] justify-start">
              {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
              <CalendarIcon className="ml-auto h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={setEndDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Payment Type</label>
        <Select value={paymentType} onValueChange={setPaymentType}>
          <SelectTrigger>
            <SelectValue placeholder="Select Payment Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TUITION">All Types</SelectItem>
            <SelectItem value="TUITION">Tuition</SelectItem>
            <SelectItem value="REGISTRATION">Registration</SelectItem>
            <SelectItem value="EXAM">Exam</SelectItem>
            <SelectItem value="OTHER">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Status</label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Select Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PAID">All Status</SelectItem>
            <SelectItem value="PAID">Paid</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="OVERDUE">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Student ID</label>
        <Input
          type="text"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          placeholder="Enter Student ID"
        />
      </div>

      <div className="flex items-end">
        <Button onClick={handleFilter}>Apply Filters</Button>
      </div>
    </div>
  );
}
