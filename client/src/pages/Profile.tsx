import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Home, Users, Calendar, Pill, ShoppingCart, User, Mail, Phone, MapPin, LogOut, Edit2, Save, LayoutDashboard, Crown, Stethoscope, UserCheck } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { useState } from "react";

const ROLE_CONFIG = {
  admin: {
    label: "مسؤول النظام",
    icon: Crown,
    color: "from-emerald-600 to-emerald-700",
    bgColor: "bg-emerald-100",
    textColor: "text-emerald-900",
    badgeColor: "bg-emerald-600",
    description: "لديك صلاحيات إدارية كاملة للتحكم في الموقع"
  },
  pharmacist: {
    label: "صيدلاني",
    icon: Stethoscope,
    color: "from-emerald-600 to-emerald-700",
    bgColor: "bg-emerald-100",
    textColor: "text-emerald-900",
    badgeColor: "bg-emerald-600",
    description: "يمكنك إدارة المنتجات والطلبات"
  },
  user: {
    label: "مستخدم عادي",
    icon: UserCheck,
    color: "from-emerald-600 to-emerald-700",
    bgColor: "bg-emerald-100",
    textColor: "text-emerald-900",
    badgeColor: "bg-emerald-600",
    description: "يمكنك تصفح المنتجات والأطباء وحجز المواعيد"
  }
};

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

  // Fetch user reminders
  const { data: reminders, isLoading: remindersLoading } = trpc.medicationReminders.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  if (!isAuthenticated) {
    return (
      <div className="app-container">
        <div className="app-header bg-white">
          <div className="container mx-auto px-4 py-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="mb-4 text-white hover:bg-emerald-500">
                <ArrowLeft className="w-4 h-4 mr-2" />
                العودة
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-white">الملف الشخصي</h1>
          </div>
        </div>

        <div className="app-content flex items-center justify-center">
          <Card className="w-full max-w-md shadow-lg">
            <CardHeader className="bg-white text-white rounded-t-lg">
              <CardTitle>يجب تسجيل الدخول</CardTitle>
              <CardDescription className="text-emerald-100">قم بتسجيل الدخول لعرض ملفك الشخصي</CardDescription>
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

  const userRole = user?.role || "user";
  const roleConfig = ROLE_CONFIG[userRole as keyof typeof ROLE_CONFIG] || ROLE_CONFIG.user;
  const RoleIcon = roleConfig.icon;

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
      <div className="app-header bg-white">
        <div className="container mx-auto px-4 py-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4 text-white hover:bg-emerald-500">
              <ArrowLeft className="w-4 h-4 mr-2" />
              العودة
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-white">الملف الشخصي</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="app-content">
        <div className="container mx-auto px-4 py-6">
          {/* Profile Header Card with Role */}
          <Card className="mb-6 shadow-lg border-0 overflow-hidden">
            <div className={`bg-gradient-to-r ${roleConfig.color} h-24`}></div>
            <CardHeader className="pb-3 -mt-12 relative">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${roleConfig.color} flex items-center justify-center text-white text-3xl font-bold shadow-lg border-4 border-white flex-shrink-0`}>
                    {user?.name?.charAt(0) || "U"}
                  </div>
                  <div className="pt-2 flex-1">
                    <CardTitle className="text-2xl text-gray-900">{user?.name || "المستخدم"}</CardTitle>
                    <CardDescription className="text-gray-600">{user?.email || "بريد إلكتروني"}</CardDescription>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 mt-2"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  تعديل
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Role Badge Card */}
          <Card className={`mb-6 border-l-4 ${roleConfig.bgColor}`}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full ${roleConfig.bgColor} flex items-center justify-center`}>
                    <RoleIcon className={`w-6 h-6 ${roleConfig.textColor}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">دورك في النظام</p>
                    <p className={`text-sm ${roleConfig.textColor}`}>{roleConfig.description}</p>
                  </div>
                </div>
                <Badge className={`${roleConfig.badgeColor} text-white text-base px-3 py-1`}>
                  {roleConfig.label}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Admin Dashboard Link */}
          {userRole === "admin" && (
            <Card className="mb-6 bg-white text-white border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white text-lg">
                  <LayoutDashboard className="w-5 h-5" />
                  لوحة التحكم الإدارية
                </CardTitle>
                <CardDescription className="text-purple-100">
                  إدارة كاملة للموقع والمنتجات والأطباء والمواعيد
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin-panel">
                  <Button className="w-full bg-white text-emerald-600 hover:bg-gray-100 font-semibold">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    الذهاب إلى لوحة التحكم
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Edit Profile Form */}
          {isEditing && (
            <Card className="mb-6 bg-emerald-50 border-emerald-200">
              <CardHeader>
                <CardTitle className="text-lg text-emerald-900">تعديل البيانات الشخصية</CardTitle>
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
                    className="text-right h-11"
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
                    className="text-right h-11"
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
                    className="text-right h-11"
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
                    className="text-right h-11"
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
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    onClick={handleSaveProfile}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    حفظ التغييرات
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="border-t-4 border-t-emerald-600">
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-emerald-600">{orders?.length || 0}</p>
                <p className="text-sm text-gray-600 mt-1">الطلبات</p>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-blue-600">
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-emerald-600">{appointments?.length || 0}</p>
                <p className="text-sm text-gray-600 mt-1">المواعيد</p>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-purple-600">
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-emerald-600">{reminders?.length || 0}</p>
                <p className="text-sm text-gray-600 mt-1">التذكيرات</p>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-orange-600">
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-orange-600">5★</p>
                <p className="text-sm text-gray-600 mt-1">التقييم</p>
              </CardContent>
            </Card>
          </div>

          {/* Account Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-600" />
                  البريد الإلكتروني
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 font-medium">{user?.email || "لم يتم تعيينه"}</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  رقم الهاتف
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 font-medium">{editPhone || "لم يتم تعيينه"}</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  العنوان
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 font-medium">{editAddress || "لم يتم تعيينه"}</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  حالة العضوية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className="bg-emerald-600 text-white">عضو نشط</Badge>
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-emerald-600" />
              الطلبات الأخيرة
            </h2>
            {ordersLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
              </div>
            ) : orders && orders.length > 0 ? (
              <div className="space-y-3">
                {orders.slice(0, 5).map((order) => (
                  <Card key={order.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">الطلب #{order.id}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(order.createdAt).toLocaleDateString("ar-SA")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-emerald-600 text-lg">{order.totalAmount} JD</p>
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
              <Card className="border-dashed">
                <CardContent className="pt-6 text-center text-gray-600">
                  لا توجد طلبات بعد
                </CardContent>
              </Card>
            )}
          </div>

          {/* Recent Appointments */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              المواعيد القادمة
            </h2>
            {appointmentsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
              </div>
            ) : appointments && appointments.length > 0 ? (
              <div className="space-y-3">
                {appointments.slice(0, 5).map((appointment) => (
                  <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">موعد مع الطبيب</p>
                          <p className="text-sm text-gray-600">
                            {new Date(appointment.appointmentDate).toLocaleDateString("ar-SA")}
                          </p>
                        </div>
                        <Badge className="bg-emerald-100 text-emerald-800">
                          {appointment.consultationType}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="pt-6 text-center text-gray-600">
                  لا توجد مواعيد قادمة
                </CardContent>
              </Card>
            )}
          </div>

          {/* Logout Button */}
          <Button
            variant="destructive"
            className="w-full mb-8 h-11 text-base"
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
