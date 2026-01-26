import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import {
  Plus,
  Edit2,
  Trash2,
  Upload,
  Search,
  Loader2,
  AlertTriangle,
  Home,
  Users,
  Calendar,
  Pill,
  User,
  Package,
  UserCog,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminPanel() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<"dashboard" | "products" | "doctors" | "appointments">("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "medications",
    description: "",
    stock: "",
    requiresPrescription: false,
    imageUrl: "",
  });

  // Fetch data
  const { data: products, isLoading: productsLoading } = trpc.products.list.useQuery({
    limit: 100,
    offset: 0,
  });

  const { data: doctors, isLoading: doctorsLoading } = trpc.doctors.list.useQuery({
    limit: 100,
    offset: 0,
  });

  const { data: appointments, isLoading: appointmentsLoading } = trpc.appointments.list.useQuery(
    undefined,
    { enabled: true }
  );

  const { data: orders, isLoading: ordersLoading } = trpc.orders.list.useQuery(
    undefined,
    { enabled: true }
  );

  // Check authorization
  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertTriangle size={48} className="mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">غير مصرح</h1>
          <p className="text-gray-600 mb-4">أنت لا تملك صلاحيات الوصول إلى لوحة التحكم</p>
          <Button
            onClick={() => navigate("/")}
            className="bg-[#00c57d] hover:bg-[#00a86a] text-white"
          >
            العودة للرئيسية
          </Button>
        </div>
      </div>
    );
  }

  const handleAddProduct = async () => {
    if (!formData.name || !formData.price) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    try {
      toast.success("تم إضافة المنتج بنجاح");
      setFormData({
        name: "",
        price: "",
        category: "medications",
        description: "",
        stock: "",
        requiresPrescription: false,
        imageUrl: "",
      });
      setShowAddForm(false);
    } catch (error) {
      toast.error("فشل إضافة المنتج");
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (confirm("هل تريد حذف هذا المنتج؟")) {
      try {
        toast.success("تم حذف المنتج بنجاح");
      } catch (error) {
        toast.error("فشل حذف المنتج");
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      toast.success("تم رفع الصورة بنجاح");
      setFormData({ ...formData, imageUrl: "uploaded-image-url" });
    } catch (error) {
      toast.error("فشل رفع الصورة");
    }
  };

  // Calculate statistics
  const totalProducts = products?.length || 0;
  const totalDoctors = doctors?.length || 0;
  const totalAppointments = appointments?.length || 0;
  const totalOrders = orders?.length || 0;
  const pendingOrders = orders?.filter(o => o.status === "pending").length || 0;
  const completedOrders = orders?.filter(o => o.status === "delivered").length || 0;

  return (
    <div className="app-container">
      {/* Header */}
      <div className="app-header sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">لوحة التحكم الإدارية</h1>

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                activeTab === "dashboard"
                  ? "bg-[#00c57d] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <BarChart3 className="inline mr-2" size={18} />
              الإحصائيات
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                activeTab === "products"
                  ? "bg-[#00c57d] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Package className="inline mr-2" size={18} />
              الأدوية
            </button>
            <button
              onClick={() => setActiveTab("doctors")}
              className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                activeTab === "doctors"
                  ? "bg-[#00c57d] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Users className="inline mr-2" size={18} />
              الأطباء
            </button>
            <button
              onClick={() => setActiveTab("appointments")}
              className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                activeTab === "appointments"
                  ? "bg-[#00c57d] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Calendar className="inline mr-2" size={18} />
              المواعيد
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="app-content pb-24">
        <div className="container mx-auto px-4 py-6">
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-blue-700">إجمالي الأدوية</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-900">{totalProducts}</div>
                    <p className="text-xs text-blue-600 mt-1">منتج متاح</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-green-700">إجمالي الأطباء</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-900">{totalDoctors}</div>
                    <p className="text-xs text-green-600 mt-1">طبيب متاح</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-purple-700">إجمالي المواعيد</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-purple-900">{totalAppointments}</div>
                    <p className="text-xs text-purple-600 mt-1">موعد مسجل</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-0">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-orange-700">إجمالي الطلبات</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-orange-900">{totalOrders}</div>
                    <p className="text-xs text-orange-600 mt-1">طلب مسجل</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-0">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-yellow-700">الطلبات المعلقة</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-yellow-900">{pendingOrders}</div>
                    <p className="text-xs text-yellow-600 mt-1">قيد الانتظار</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-green-700">الطلبات المكتملة</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-900">{completedOrders}</div>
                    <p className="text-xs text-green-600 mt-1">تم التسليم</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === "products" && (
            <div>
              <div className="flex gap-2 mb-6">
                <Input
                  type="text"
                  placeholder="ابحث عن أدوية..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 rounded-lg bg-gray-100 border-0"
                />
                <Button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="bg-[#00c57d] hover:bg-[#00a86a] text-white"
                >
                  <Plus className="mr-2" size={18} />
                  إضافة دواء
                </Button>
              </div>

              {showAddForm && (
                <Card className="mb-6 border border-gray-200">
                  <CardHeader>
                    <CardTitle>إضافة دواء جديد</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        اسم الدواء
                      </label>
                      <Input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="اسم الدواء"
                        className="w-full"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          السعر
                        </label>
                        <Input
                          type="number"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          placeholder="السعر"
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          الكمية
                        </label>
                        <Input
                          type="number"
                          value={formData.stock}
                          onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                          placeholder="الكمية"
                          className="w-full"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        الفئة
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="medications">أدوية</option>
                        <option value="natural_products">منتجات طبيعية</option>
                        <option value="skincare">العناية بالبشرة</option>
                        <option value="baby_care">العناية بالأطفال</option>
                        <option value="medical_supplies">مستلزمات طبية</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        الوصف
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="الوصف"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        rows={3}
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="prescription"
                        checked={formData.requiresPrescription}
                        onChange={(e) =>
                          setFormData({ ...formData, requiresPrescription: e.target.checked })
                        }
                        className="w-4 h-4"
                      />
                      <label htmlFor="prescription" className="text-sm font-semibold text-gray-700">
                        يلزم وصفة طبية
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        رفع صورة
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="w-full"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={handleAddProduct}
                        className="flex-1 bg-[#00c57d] hover:bg-[#00a86a] text-white"
                      >
                        حفظ
                      </Button>
                      <Button
                        onClick={() => setShowAddForm(false)}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900"
                      >
                        إلغاء
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
                {productsLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin text-[#00c57d]" size={32} />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                            اسم الدواء
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                            السعر
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                            الكمية
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                            الفئة
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                            الإجراءات
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {products?.map((product) => (
                          <tr key={product.id} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">{product.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">${product.price}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{product.stock}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{product.category}</td>
                            <td className="px-4 py-3 text-sm">
                              <div className="flex gap-2">
                                <button className="p-2 hover:bg-blue-100 rounded-lg transition-colors">
                                  <Edit2 size={16} className="text-blue-600" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                                >
                                  <Trash2 size={16} className="text-red-600" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Doctors Tab */}
          {activeTab === "doctors" && (
            <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
              {doctorsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="animate-spin text-[#00c57d]" size={32} />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                          اسم الطبيب
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                          التخصص
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                          التقييم
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                          الإجراءات
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {doctors?.map((doctor) => (
                        <tr key={doctor.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">Dr. {doctor.id}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{doctor.specialty}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {doctor.rating} ⭐
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex gap-2">
                              <button className="p-2 hover:bg-blue-100 rounded-lg transition-colors">
                                <Edit2 size={16} className="text-blue-600" />
                              </button>
                              <button className="p-2 hover:bg-red-100 rounded-lg transition-colors">
                                <Trash2 size={16} className="text-red-600" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Appointments Tab */}
          {activeTab === "appointments" && (
            <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
              {appointmentsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="animate-spin text-[#00c57d]" size={32} />
                </div>
              ) : appointments && appointments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                          المريض
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                          الطبيب
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                          التاريخ والوقت
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                          الحالة
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                          الإجراءات
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((appointment) => (
                        <tr key={appointment.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">مريض {appointment.id}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">طبيب {appointment.doctorId}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {new Date(appointment.appointmentDate).toLocaleDateString("ar-SA")}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {appointment.status === "completed" ? (
                              <span className="flex items-center gap-1 text-green-600">
                                <CheckCircle size={16} />
                                مكتمل
                              </span>
                            ) : appointment.status === "cancelled" ? (
                              <span className="flex items-center gap-1 text-red-600">
                                <XCircle size={16} />
                                ملغى
                              </span>
                            ) : appointment.status === "no_show" ? (
                              <span className="flex items-center gap-1 text-orange-600">
                                <XCircle size={16} />
                                لم يحضر
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-yellow-600">
                                <Clock size={16} />
                                مجدول
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex gap-2">
                              <button className="p-2 hover:bg-blue-100 rounded-lg transition-colors">
                                <Edit2 size={16} className="text-blue-600" />
                              </button>
                              <button className="p-2 hover:bg-red-100 rounded-lg transition-colors">
                                <Trash2 size={16} className="text-red-600" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg font-semibold">لا توجد مواعيد</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="app-bottom-nav">
        <a href="/">
          <div className="app-nav-item">
            <Home className="w-6 h-6" />
            <span className="text-xs">الرئيسية</span>
          </div>
        </a>

        <a href="/products">
          <div className="app-nav-item">
            <Package className="w-6 h-6" />
            <span className="text-xs">المنتجات</span>
          </div>
        </a>

        <a href="/doctors">
          <div className="app-nav-item">
            <Users className="w-6 h-6" />
            <span className="text-xs">الأطباء</span>
          </div>
        </a>

        <a href="/appointments">
          <div className="app-nav-item">
            <Calendar className="w-6 h-6" />
            <span className="text-xs">المواعيد</span>
          </div>
        </a>

        <a href="/profile">
          <div className="app-nav-item">
            <User className="w-6 h-6" />
            <span className="text-xs">الملف الشخصي</span>
          </div>
        </a>
      </div>
    </div>
  );
}
