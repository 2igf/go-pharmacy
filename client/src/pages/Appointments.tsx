import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Calendar, Clock, MapPin, ArrowLeft, Plus, Trash2, User, Phone, Mail, Stethoscope } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Appointments() {
  const { isAuthenticated } = useAuth();
  const [showBooking, setShowBooking] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [appointmentDate, setAppointmentDate] = useState<string>("");
  const [consultationType, setConsultationType] = useState<"in_clinic" | "video" | "chat">("in_clinic");
  const [notes, setNotes] = useState("");

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
      setNotes("");
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
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-t-lg">
            <CardTitle>المواعيد</CardTitle>
            <CardDescription className="text-emerald-100">يجب تسجيل الدخول لعرض مواعيدك</CardDescription>
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

  const handleBookAppointment = async () => {
    if (!selectedDoctor || !appointmentDate) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    await createAppointment.mutateAsync({
      doctorId: parseInt(selectedDoctor),
      appointmentDate: new Date(appointmentDate),
      consultationType,
      notes: notes || undefined,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-emerald-100 text-emerald-800";
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

  const getConsultationTypeIcon = (type: string) => {
    switch (type) {
      case "in_clinic":
        return <MapPin className="w-4 h-4" />;
      case "video":
        return <Stethoscope className="w-4 h-4" />;
      case "chat":
        return <Mail className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const selectedDoctorData = doctors?.find(d => d.id.toString() === selectedDoctor);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
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
              <h1 className="text-3xl font-bold text-gray-900">مواعيدي</h1>
              <p className="text-gray-600 text-sm mt-1">إدارة مواعيدك مع الأطباء</p>
            </div>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 shadow-md"
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
              <Card key={appointment.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-emerald-600">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Doctor Info */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white">
                          <User className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-900">
                            الطبيب #{appointment.doctorId}
                          </h3>
                          <p className="text-sm text-gray-600">استشارة طبية</p>
                        </div>
                        <Badge className={`${getStatusColor(appointment.status)} font-medium`}>
                          {getStatusLabel(appointment.status)}
                        </Badge>
                      </div>

                      {/* Appointment Details */}
                      <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center gap-3 text-gray-700">
                          <Calendar className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">التاريخ</p>
                            <p className="text-sm text-gray-600">
                              {new Date(appointment.appointmentDate).toLocaleDateString("ar-JO", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric"
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-gray-700">
                          <Clock className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">الوقت</p>
                            <p className="text-sm text-gray-600">
                              {new Date(appointment.appointmentDate).toLocaleTimeString("ar-JO", {
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-gray-700">
                          {getConsultationTypeIcon(appointment.consultationType)}
                          <div>
                            <p className="text-sm font-medium">نوع الاستشارة</p>
                            <p className="text-sm text-gray-600">
                              {getConsultationTypeLabel(appointment.consultationType)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Notes */}
                      {appointment.notes && (
                        <div className="mt-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                          <p className="text-sm text-emerald-900">
                            <span className="font-medium">ملاحظات:</span> {appointment.notes}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Cancel Button */}
                    {appointment.status === "scheduled" && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => cancelAppointment.mutate({ id: appointment.id })}
                        className="flex-shrink-0"
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
          <Card className="border-2 border-dashed border-gray-300">
            <CardContent className="pt-12 text-center pb-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg font-medium mb-2">لا توجد مواعيد محجوزة</p>
              <p className="text-gray-500 text-sm mb-6">ابدأ بحجز موعد مع طبيبك المفضل</p>
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">حجز موعد جديد</DialogTitle>
            <DialogDescription>
              اختر الطبيب والموعد المناسب لك
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Doctor Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                اختر الطبيب *
              </label>
              {doctorsLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              ) : doctors && doctors.length > 0 ? (
                <>
                  <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="اختر طبيب" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id.toString()}>
                          <div className="flex items-center gap-2">
                            <Stethoscope className="w-4 h-4" />
                            <span>{doctor.clinic} - {doctor.specialty}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Doctor Details Preview */}
                  {selectedDoctorData && (
                    <div className="mt-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white flex-shrink-0">
                          <User className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{selectedDoctorData.clinic}</p>
                          <p className="text-sm text-gray-600">{selectedDoctorData.specialty}</p>

                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-600 p-4 bg-gray-50 rounded-lg">لا توجد أطباء متاحة</p>
              )}
            </div>

            {/* Date Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                اختر التاريخ والوقت *
              </label>
              <input
                type="datetime-local"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Consultation Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                نوع الاستشارة
              </label>
              <Select value={consultationType} onValueChange={(val) => setConsultationType(val as any)}>
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_clinic">في العيادة</SelectItem>
                  <SelectItem value="video">استشارة فيديو</SelectItem>
                  <SelectItem value="chat">دردشة نصية</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                ملاحظات إضافية
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="أضف أي ملاحظات أو أسئلة للطبيب..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                rows={3}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1 h-12"
                onClick={() => setShowBooking(false)}
              >
                إلغاء
              </Button>
              <Button
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 h-12"
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
