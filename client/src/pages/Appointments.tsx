import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Calendar, Clock, MapPin, ArrowLeft, Plus, Trash2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Appointments() {
  const { isAuthenticated } = useAuth();
  const [showBooking, setShowBooking] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [appointmentDate, setAppointmentDate] = useState<string>("");
  const [consultationType, setConsultationType] = useState<"in_clinic" | "video" | "chat">("in_clinic");

  // Fetch user appointments
  const { data: appointments, isLoading: appointmentsLoading, refetch: refetchAppointments } = trpc.appointments.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Fetch doctors for booking
  const { data: doctors, isLoading: doctorsLoading } = trpc.doctors.list.useQuery({
    limit: 50,
    offset: 0,
  });

  // Mutations
  const createAppointment = trpc.appointments.create.useMutation({
    onSuccess: () => {
      toast.success("تم حجز الموعد بنجاح!");
      refetchAppointments();
      setShowBooking(false);
      setSelectedDoctor("");
      setAppointmentDate("");
    },
    onError: () => {
      toast.error("حدث خطأ أثناء حجز الموعد");
    },
  });

  const cancelAppointment = trpc.appointments.cancel.useMutation({
    onSuccess: () => {
      toast.success("تم إلغاء الموعد بنجاح");
      refetchAppointments();
    },
    onError: () => {
      toast.error("حدث خطأ أثناء إلغاء الموعد");
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>المواعيد</CardTitle>
            <CardDescription>يجب تسجيل الدخول لعرض مواعيدك</CardDescription>
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

  const handleBookAppointment = async () => {
    if (!selectedDoctor || !appointmentDate) {
      toast.error("يرجى ملء جميع الحقول");
      return;
    }

    await createAppointment.mutateAsync({
      doctorId: parseInt(selectedDoctor),
      appointmentDate: new Date(appointmentDate),
      consultationType,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "scheduled":
        return "مجدول";
      case "completed":
        return "مكتمل";
      case "cancelled":
        return "ملغى";
      default:
        return status;
    }
  };

  const getConsultationTypeLabel = (type: string) => {
    switch (type) {
      case "in_clinic":
        return "في العيادة";
      case "video":
        return "استشارة فيديو";
      case "chat":
        return "دردشة نصية";
      default:
        return type;
    }
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
            <h1 className="text-3xl font-bold text-gray-900">مواعيدي</h1>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => setShowBooking(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              حجز موعد جديد
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {appointmentsLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : appointments && appointments.length > 0 ? (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">
                          الطبيب #{appointment.doctorId}
                        </h3>
                        <Badge className={getStatusColor(appointment.status)}>
                          {getStatusLabel(appointment.status)}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(appointment.appointmentDate).toLocaleDateString("ar-JO")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>
                            {new Date(appointment.appointmentDate).toLocaleTimeString("ar-JO")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{getConsultationTypeLabel(appointment.consultationType)}</span>
                        </div>
                      </div>
                      {appointment.notes && (
                        <p className="text-sm text-gray-600 mt-2">
                          ملاحظات: {appointment.notes}
                        </p>
                      )}
                    </div>
                    {appointment.status === "scheduled" && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => cancelAppointment.mutate({ id: appointment.id })}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-gray-600 text-lg mb-4">لا توجد مواعيد محجوزة</p>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => setShowBooking(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                حجز موعد جديد
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Booking Dialog */}
      <Dialog open={showBooking} onOpenChange={setShowBooking}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>حجز موعد جديد</DialogTitle>
            <DialogDescription>
              اختر الطبيب والموعد المناسب لك
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Doctor Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اختر الطبيب
              </label>
              {doctorsLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              ) : doctors && doctors.length > 0 ? (
                <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر طبيب" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id.toString()}>
                        {doctor.clinic} - {doctor.specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-gray-600">لا توجد أطباء متاحة</p>
              )}
            </div>

            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اختر التاريخ والوقت
              </label>
              <input
                type="datetime-local"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-right"
              />
            </div>

            {/* Consultation Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نوع الاستشارة
              </label>
              <Select value={consultationType} onValueChange={(val) => setConsultationType(val as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_clinic">في العيادة</SelectItem>
                  <SelectItem value="video">استشارة فيديو</SelectItem>
                  <SelectItem value="chat">دردشة نصية</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowBooking(false)}
              >
                إلغاء
              </Button>
              <Button
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                onClick={handleBookAppointment}
                disabled={createAppointment.isPending || !selectedDoctor || !appointmentDate}
              >
                {createAppointment.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    جاري الحجز...
                  </>
                ) : (
                  "حجز الموعد"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
