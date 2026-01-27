import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Pill, Clock, ArrowLeft, Plus, Trash2, AlertCircle, Edit2, CheckCircle2, XCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

const FREQUENCIES = [
  { value: "once_daily", label: "مرة واحدة يومياً" },
  { value: "twice_daily", label: "مرتين يومياً" },
  { value: "three_times_daily", label: "ثلاث مرات يومياً" },
  { value: "four_times_daily", label: "أربع مرات يومياً" },
  { value: "every_6_hours", label: "كل 6 ساعات" },
  { value: "every_8_hours", label: "كل 8 ساعات" },
  { value: "every_12_hours", label: "كل 12 ساعة" },
  { value: "weekly", label: "أسبوعياً" },
  { value: "as_needed", label: "عند الحاجة" },
];

export default function Reminders() {
  const { isAuthenticated } = useAuth();
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [medicationName, setMedicationName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState<string>("once_daily");
  const [reminderTimes, setReminderTimes] = useState<string[]>(["08:00"]);
  const [notes, setNotes] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch user reminders
  const { data: reminders, isLoading: remindersLoading, refetch: refetchReminders } = trpc.medicationReminders.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Mutations
  const createReminder = trpc.medicationReminders.create.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة التذكير بنجاح!");
      refetchReminders();
      setShowAddReminder(false);
      setMedicationName("");
      setDosage("");
      setFrequency("once_daily");
      setReminderTimes(["08:00"]);
      setNotes("");
    },
    onError: () => {
      toast.error("حدث خطأ أثناء إضافة التذكير");
    },
  });

  const deleteReminder = trpc.medicationReminders.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف التذكير بنجاح");
      refetchReminders();
    },
    onError: () => {
      toast.error("حدث خطأ أثناء حذف التذكير");
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="bg-white text-white rounded-t-lg">
            <CardTitle>تذكيرات الأدوية</CardTitle>
            <CardDescription className="text-emerald-100">يجب تسجيل الدخول لعرض تذكيراتك</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Link href="/">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                العودة للرئيسية
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleAddReminder = async () => {
    if (!medicationName || !frequency) {
      toast.error("يرجى ملء الحقول المطلوبة");
      return;
    }

    await createReminder.mutateAsync({
      medicationName,
      dosage: dosage || undefined,
      frequency: frequency as any,
      startDate: new Date(),
      reminderTimes,
      notes: notes || undefined,
    });
  };

  const handleAddTime = () => {
    setReminderTimes([...reminderTimes, "12:00"]);
  };

  const handleRemoveTime = (idx: number) => {
    setReminderTimes(reminderTimes.filter((_, i) => i !== idx));
  };

  const handleTimeChange = (idx: number, value: string) => {
    const newTimes = [...reminderTimes];
    newTimes[idx] = value;
    setReminderTimes(newTimes);
  };

  const getFrequencyLabel = (freq: string): string => {
    return FREQUENCIES.find(f => f.value === freq)?.label || freq;
  };

  const parseReminderTimes = (times: any): string[] => {
    if (Array.isArray(times)) {
      return times.map(t => String(t));
    }
    if (typeof times === 'string') {
      try {
        const parsed = JSON.parse(times);
        return Array.isArray(parsed) ? parsed.map(t => String(t)) : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  const filteredReminders = reminders?.filter(r =>
    r.medicationName.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40 border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4 text-emerald-600 hover:text-emerald-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              العودة
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">تذكيرات الأدوية</h1>
              <p className="text-gray-600 text-sm mt-1">تذكر بمواعيد تناول أدويتك</p>
            </div>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 shadow-md"
              onClick={() => setShowAddReminder(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              إضافة تذكير
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        {reminders && reminders.length > 0 && (
          <div className="mb-6">
            <Input
              type="text"
              placeholder="ابحث عن الدواء..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-right"
            />
          </div>
        )}

        {remindersLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : filteredReminders && filteredReminders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReminders.map((reminder) => {
              const times = parseReminderTimes(reminder.reminderTimes);
              return (
                <Card key={reminder.id} className={`hover:shadow-lg transition-shadow border-l-4 ${reminder.isActive ? "border-l-emerald-600" : "border-l-gray-300 opacity-60"}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white flex-shrink-0">
                          <Pill className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg break-words">
                            {reminder.medicationName}
                          </CardTitle>
                          {reminder.dosage && (
                            <CardDescription className="text-sm">{reminder.dosage}</CardDescription>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {reminder.isActive ? (
                          <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            نشط
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800 flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            معطل
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Frequency */}
                    <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                      <Clock className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-emerald-900">التكرار</p>
                        <p className="text-sm text-blue-700">
                          {getFrequencyLabel(reminder.frequency)}
                        </p>
                      </div>
                    </div>

                    {/* Reminder Times */}
                    {times.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-gray-900 mb-2">أوقات التذكير:</p>
                        <div className="flex flex-wrap gap-2">
                          {times.map((time, idx) => (
                            <Badge key={idx} variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                              <Clock className="w-3 h-3 mr-1" />
                              {time}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {reminder.notes && (
                      <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <p className="text-xs font-medium text-yellow-900 mb-1">ملاحظات:</p>
                        <p className="text-sm text-yellow-800">{reminder.notes}</p>
                      </div>
                    )}

                    {/* Delete Button */}
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() => deleteReminder.mutate({ id: reminder.id })}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      حذف التذكير
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="border-2 border-dashed border-gray-300">
            <CardContent className="pt-12 text-center pb-12">
              <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg font-medium mb-2">لا توجد تذكيرات أدوية</p>
              <p className="text-gray-500 text-sm mb-6">ابدأ بإضافة تذكير لأدويتك</p>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => setShowAddReminder(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                إضافة تذكير جديد
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Reminder Dialog */}
      <Dialog open={showAddReminder} onOpenChange={setShowAddReminder}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">إضافة تذكير دواء</DialogTitle>
            <DialogDescription>
              أضف تذكير لدوائك لتتذكر مواعيد تناوله
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Medication Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                اسم الدواء *
              </label>
              <Input
                type="text"
                placeholder="مثال: الأسبرين"
                value={medicationName}
                onChange={(e) => setMedicationName(e.target.value)}
                className="text-right h-11"
              />
            </div>

            {/* Dosage */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                الجرعة
              </label>
              <Input
                type="text"
                placeholder="مثال: 500mg"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                className="text-right h-11"
              />
            </div>

            {/* Frequency */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                التكرار *
              </label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCIES.map((freq) => (
                    <SelectItem key={freq.value} value={freq.value}>
                      {freq.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Reminder Times */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-semibold text-gray-900">
                  أوقات التذكير
                </label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAddTime}
                  className="text-emerald-600 hover:text-emerald-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  إضافة وقت
                </Button>
              </div>
              <div className="space-y-2">
                {reminderTimes.map((time, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => handleTimeChange(idx, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    {reminderTimes.length > 1 && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemoveTime(idx)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                ملاحظات إضافية
              </label>
              <textarea
                placeholder="مثال: تناول مع الطعام، قد يسبب النعاس..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                rows={3}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1 h-11"
                onClick={() => setShowAddReminder(false)}
              >
                إلغاء
              </Button>
              <Button
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 h-11"
                onClick={handleAddReminder}
                disabled={createReminder.isPending || !medicationName}
              >
                {createReminder.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    جاري الإضافة...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    إضافة التذكير
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
