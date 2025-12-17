import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Pill, Clock, ArrowLeft, Plus, Trash2, AlertCircle } from "lucide-react";
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>تذكيرات الأدوية</CardTitle>
            <CardDescription>يجب تسجيل الدخول لعرض تذكيراتك</CardDescription>
          </CardHeader>
          <CardContent>
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              العودة
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">تذكيرات الأدوية</h1>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => setShowAddReminder(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              إضافة تذكير
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {remindersLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : reminders && reminders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reminders.map((reminder) => {
              const times = parseReminderTimes(reminder.reminderTimes);
              return (
                <Card key={reminder.id} className={reminder.isActive ? "" : "opacity-60"}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          <Pill className="w-5 h-5 text-emerald-600" />
                          {reminder.medicationName}
                        </CardTitle>
                        {reminder.dosage && (
                          <CardDescription>{reminder.dosage}</CardDescription>
                        )}
                      </div>
                      {reminder.isActive ? (
                        <Badge className="bg-green-100 text-green-800">نشط</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">معطل</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Frequency */}
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">
                        {getFrequencyLabel(reminder.frequency)}
                      </span>
                    </div>

                    {/* Reminder Times */}
                    {times.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">أوقات التذكير:</p>
                        <div className="flex flex-wrap gap-2">
                          {times.map((time, idx) => (
                            <Badge key={idx} variant="outline">
                              {time}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {reminder.notes && (
                      <div>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">ملاحظات:</span> {reminder.notes}
                        </p>
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
          <Card>
            <CardContent className="pt-6 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-4">لا توجد تذكيرات أدوية</p>
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
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>إضافة تذكير دواء</DialogTitle>
            <DialogDescription>
              أضف تذكير لدوائك لتتذكر مواعيد تناوله
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Medication Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم الدواء *
              </label>
              <Input
                type="text"
                placeholder="مثال: الأسبرين"
                value={medicationName}
                onChange={(e) => setMedicationName(e.target.value)}
                className="text-right"
              />
            </div>

            {/* Dosage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الجرعة
              </label>
              <Input
                type="text"
                placeholder="مثال: 500mg"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                className="text-right"
              />
            </div>

            {/* Frequency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                التكرار *
              </label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                أوقات التذكير
              </label>
              <div className="space-y-2">
                {reminderTimes.map((time, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input
                      type="time"
                      value={time}
                      onChange={(e) => {
                        const newTimes = [...reminderTimes];
                        newTimes[idx] = e.target.value;
                        setReminderTimes(newTimes);
                      }}
                      className="text-right"
                    />
                    {reminderTimes.length > 1 && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setReminderTimes(reminderTimes.filter((_, i) => i !== idx));
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setReminderTimes([...reminderTimes, "12:00"])}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  إضافة وقت
                </Button>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ملاحظات
              </label>
              <Input
                type="text"
                placeholder="مثال: تناول مع الطعام"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="text-right"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowAddReminder(false)}
              >
                إلغاء
              </Button>
              <Button
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
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
