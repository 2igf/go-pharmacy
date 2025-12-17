import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, ArrowLeft, Home, Users, Calendar, Pill, ShoppingCart, User, Mail, Phone, MapPin, LogOut, Edit2, Save } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || "");
  const [editEmail, setEditEmail] = useState(user?.email || "");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");

  // Fetch user orders
  const { data: orders, isLoading: ordersLoading } = trpc.orders.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Fetch user appointments
  const { data: appointments, isLoading: appointmentsLoading } = trpc.appointments.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  if (!isAuthenticated) {
    return (
      <div className="app-container">
        <div className="app-header">
          <div className="container mx-auto px-4 py-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                العودة
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">الملف الشخصي</h1>
          </div>
        </div>

        <div className="app-content flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>يجب تسجيل الدخول</CardTitle>
              <CardDescription>قم بتسجيل الدخول لعرض ملفك الشخصي</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/">
                <Button className="w-full bg-[#0cc46a] hover:bg-[#09a855]">
                  العودة للرئيسية
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Navigation */}
        <div className="app-bottom-nav">
          <Link href="/">
            <div className="app-nav-item">
              <Home className="w-6 h-6" />
              <span className="text-xs">الرئيسية</span>
            </div>
          </Link>

          <Link href="/doctors">
            <div className="app-nav-item">
              <Users className="w-6 h-6" />
              <span className="text-xs">الأطباء</span>
            </div>
          </Link>

          <Link href="/appointments">
            <div className="app-nav-item">
              <Calendar className="w-6 h-6" />
              <span className="text-xs">المواعيد</span>
            </div>
          </Link>

          <Link href="/reminders">
            <div className="app-nav-item">
              <Pill className="w-6 h-6" />
              <span className="text-xs">التذكيرات</span>
            </div>
          </Link>

          <Link href="/profile">
            <div className="app-nav-item active">
              <User className="w-6 h-6" />
              <span className="text-xs">الملف</span>
            </div>
          </Link>
        </div>
      </div>
    );
  }

  const handleSaveProfile = () => {
    toast.success("تم حفظ البيانات بنجاح!");
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    toast.success("تم تسجيل الخروج بنجاح");
  };

  return (
    <div className="app-container">
      {/* Header */}
      <div className="app-header">
        <div className="container mx-auto px-4 py-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              العودة
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">الملف الشخصي</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="app-content">
        <div className="container mx-auto px-4 py-6">
          {/* Profile Header Card */}
          <Card className="mb-6 border-t-4 border-t-[#0cc46a]">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#0cc46a] flex items-center justify-center text-white text-2xl font-bold">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{user?.name || "المستخدم"}</CardTitle>
                    <CardDescription>{user?.email || "بريد إلكتروني"}</CardDescription>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  className="border-[#0cc46a] text-[#0cc46a] hover:bg-[#0cc46a] hover:text-white"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  تعديل
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Edit Profile Form */}
          {isEditing && (
            <Card className="mb-6 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg">تعديل البيانات الشخصية</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الاسم
                  </label>
                  <Input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="text-right"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    البريد الإلكتروني
                  </label>
                  <Input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="text-right"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رقم الهاتف
                  </label>
                  <Input
                    type="tel"
                    placeholder="+962..."
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="text-right"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    العنوان
                  </label>
                  <Input
                    type="text"
                    placeholder="عنوان السكن"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="text-right"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsEditing(false)}
                  >
                    إلغاء
                  </Button>
                  <Button
                    className="flex-1 bg-[#0cc46a] hover:bg-[#09a855]"
                    onClick={handleSaveProfile}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    حفظ التغييرات
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Account Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#0cc46a]" />
                  البريد الإلكتروني
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{user?.email || "لم يتم تعيينه"}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#0cc46a]" />
                  رقم الهاتف
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{editPhone || "لم يتم تعيينه"}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#0cc46a]" />
                  العنوان
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{editAddress || "لم يتم تعيينه"}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">حالة العضوية</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className="bg-[#0cc46a] text-white">عضو نشط</Badge>
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">الطلبات الأخيرة</h2>
            {ordersLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-[#0cc46a]" />
              </div>
            ) : orders && orders.length > 0 ? (
              <div className="space-y-3">
                {orders.slice(0, 5).map((order) => (
                  <Card key={order.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">الطلب #{order.id}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(order.createdAt).toLocaleDateString("ar-SA")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[#0cc46a]">{order.totalAmount} JD</p>
                          <Badge className="bg-green-100 text-green-800 text-xs mt-1">
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-gray-600">
                  لا توجد طلبات بعد
                </CardContent>
              </Card>
            )}
          </div>

          {/* Recent Appointments */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">المواعيد القادمة</h2>
            {appointmentsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-[#0cc46a]" />
              </div>
            ) : appointments && appointments.length > 0 ? (
              <div className="space-y-3">
                {appointments.slice(0, 5).map((appointment) => (
                  <Card key={appointment.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">موعد مع الطبيب</p>
                          <p className="text-sm text-gray-600">
                            {new Date(appointment.appointmentDate).toLocaleDateString("ar-SA")}
                          </p>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">
                          {appointment.consultationType}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-gray-600">
                  لا توجد مواعيد قادمة
                </CardContent>
              </Card>
            )}
          </div>

          {/* Logout Button */}
          <Button
            variant="destructive"
            className="w-full mb-8"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            تسجيل الخروج
          </Button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="app-bottom-nav">
        <Link href="/">
          <div className="app-nav-item">
            <Home className="w-6 h-6" />
            <span className="text-xs">الرئيسية</span>
          </div>
        </Link>

        <Link href="/doctors">
          <div className="app-nav-item">
            <Users className="w-6 h-6" />
            <span className="text-xs">الأطباء</span>
          </div>
        </Link>

        <Link href="/appointments">
          <div className="app-nav-item">
            <Calendar className="w-6 h-6" />
            <span className="text-xs">المواعيد</span>
          </div>
        </Link>

        <Link href="/reminders">
          <div className="app-nav-item">
            <Pill className="w-6 h-6" />
            <span className="text-xs">التذكيرات</span>
          </div>
        </Link>

        <Link href="/profile">
          <div className="app-nav-item active">
            <User className="w-6 h-6" />
            <span className="text-xs">الملف</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
