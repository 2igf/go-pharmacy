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
  X,
  Image as ImageIcon,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function AdminPanel() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<"dashboard" | "products" | "doctors" | "appointments">("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStatistic, setSelectedStatistic] = useState<string | null>(null);
  const [showStatisticModal, setShowStatisticModal] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "medications",
    description: "",
    stock: "",
    requiresPrescription: false,
    image: "",
    manufacturer: "",
  });

  // Fetch data
  const { data: products, isLoading: productsLoading, refetch: refetchProducts } = trpc.products.list.useQuery({
    limit: 100,
    offset: 0,
  });

  const { data: doctors, isLoading: doctorsLoading, refetch: refetchDoctors } = trpc.doctors.list.useQuery({
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

  // Mutations
  const createProductMutation = trpc.products.create.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة الدواء بنجاح");
      refetchProducts();
      resetForm();
      setShowAddForm(false);
    },
    onError: (error) => {
      toast.error("فشل إضافة الدواء: " + error.message);
    },
  });

  const updateProductMutation = trpc.products.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث الدواء بنجاح");
      refetchProducts();
      setShowEditModal(false);
      setEditingProduct(null);
      resetForm();
    },
    onError: (error) => {
      toast.error("فشل تحديث الدواء: " + error.message);
    },
  });

  const deleteProductMutation = trpc.products.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف الدواء بنجاح");
      refetchProducts();
    },
    onError: (error) => {
      toast.error("فشل حذف الدواء: " + error.message);
    },
  });

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

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      category: "medications",
      description: "",
      stock: "",
      requiresPrescription: false,
      image: "",
      manufacturer: "",
    });
    setImagePreview(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
      
      toast.success("تم اختيار الصورة بنجاح");
    } catch (error) {
      toast.error("فشل رفع الصورة");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddProduct = async () => {
    if (!formData.name || !formData.price) {
      toast.error("يرجى ملء الاسم والسعر");
      return;
    }

    createProductMutation.mutate({
      name: formData.name,
      price: formData.price,
      category: formData.category as any,
      description: formData.description,
      stock: formData.stock,
      requiresPrescription: formData.requiresPrescription,
      image: formData.image,
      manufacturer: formData.manufacturer,
    });
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      category: product.category,
      description: product.description || "",
      stock: product.stock?.toString() || "",
      requiresPrescription: product.requiresPrescription || false,
      image: product.image || "",
      manufacturer: product.manufacturer || "",
    });
    setImagePreview(product.image || null);
    setShowEditModal(true);
  };

  const handleUpdateProduct = async () => {
    if (!formData.name || !formData.price) {
      toast.error("يرجى ملء الاسم والسعر");
      return;
    }

    updateProductMutation.mutate({
      id: editingProduct.id,
      name: formData.name,
      price: formData.price,
      category: formData.category as any,
      description: formData.description,
      stock: formData.stock,
      requiresPrescription: formData.requiresPrescription,
      image: formData.image,
      manufacturer: formData.manufacturer,
    });
  };

  const handleDeleteProduct = async (id: number) => {
    if (confirm("هل تريد حذف هذا الدواء؟")) {
      deleteProductMutation.mutate({ id });
    }
  };

  // Calculate statistics
  const totalProducts = products?.length || 0;
  const totalDoctors = doctors?.length || 0;
  const totalAppointments = appointments?.length || 0;
  const totalOrders = orders?.length || 0;
  const pendingOrders = orders?.filter(o => o.status === "pending").length || 0;
  const completedOrders = orders?.filter(o => o.status === "delivered").length || 0;

  const filteredProducts = products?.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Get items for selected statistic
  const getStatisticItems = () => {
    switch (selectedStatistic) {
      case "products":
        return products || [];
      case "doctors":
        return doctors || [];
      case "appointments":
        return appointments || [];
      case "orders":
        return orders || [];
      case "pending":
        return orders?.filter(o => o.status === "pending") || [];
      case "completed":
        return orders?.filter(o => o.status === "delivered") || [];
      default:
        return [];
    }
  };

  const StatisticCard = ({ title, count, subtitle, onClick, color }: any) => (
    <button
      onClick={onClick}
      className={`text-left rounded-2xl p-6 transition-all hover:shadow-lg hover:scale-105 cursor-pointer border-0 ${color}`}
    >
      <h3 className="text-sm font-semibold mb-4">{title}</h3>
      <div className="text-4xl font-bold mb-2">{count}</div>
      <p className="text-xs opacity-70">{subtitle}</p>
    </button>
  );

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
                <StatisticCard
                  title="إجمالي الأدوية"
                  count={totalProducts}
                  subtitle="منتج متاح"
                  color="bg-gradient-to-br from-blue-50 to-blue-100"
                  onClick={() => {
                    setSelectedStatistic("products");
                    setShowStatisticModal(true);
                  }}
                />

                <StatisticCard
                  title="إجمالي الأطباء"
                  count={totalDoctors}
                  subtitle="طبيب متاح"
                  color="bg-gradient-to-br from-green-50 to-green-100"
                  onClick={() => {
                    setSelectedStatistic("doctors");
                    setShowStatisticModal(true);
                  }}
                />

                <StatisticCard
                  title="إجمالي المواعيد"
                  count={totalAppointments}
                  subtitle="موعد مسجل"
                  color="bg-gradient-to-br from-purple-50 to-purple-100"
                  onClick={() => {
                    setSelectedStatistic("appointments");
                    setShowStatisticModal(true);
                  }}
                />

                <StatisticCard
                  title="إجمالي الطلبات"
                  count={totalOrders}
                  subtitle="طلب مسجل"
                  color="bg-gradient-to-br from-orange-50 to-orange-100"
                  onClick={() => {
                    setSelectedStatistic("orders");
                    setShowStatisticModal(true);
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <StatisticCard
                  title="الطلبات المعلقة"
                  count={pendingOrders}
                  subtitle="قيد الانتظار"
                  color="bg-gradient-to-br from-yellow-50 to-yellow-100"
                  onClick={() => {
                    setSelectedStatistic("pending");
                    setShowStatisticModal(true);
                  }}
                />

                <StatisticCard
                  title="الطلبات المكتملة"
                  count={completedOrders}
                  subtitle="تم التسليم"
                  color="bg-gradient-to-br from-green-50 to-green-100"
                  onClick={() => {
                    setSelectedStatistic("completed");
                    setShowStatisticModal(true);
                  }}
                />
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
                  onClick={() => {
                    resetForm();
                    setShowAddForm(!showAddForm);
                  }}
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
                        اسم الدواء *
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
                          السعر *
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
                        <option value="pet_care">العناية بالحيوانات</option>
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

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        الشركة المصنعة
                      </label>
                      <Input
                        type="text"
                        value={formData.manufacturer}
                        onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                        placeholder="اسم الشركة"
                        className="w-full"
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
                        <ImageIcon className="inline mr-2" size={16} />
                        رفع صورة
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="w-full"
                      />
                      {imagePreview && (
                        <div className="mt-3 relative">
                          <img
                            src={imagePreview}
                            alt="preview"
                            className="w-full h-40 object-cover rounded-lg"
                          />
                          <p className="text-sm text-green-600 mt-2">✓ تم اختيار الصورة</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={handleAddProduct}
                        disabled={createProductMutation.isPending}
                        className="flex-1 bg-[#00c57d] hover:bg-[#00a86a] text-white"
                      >
                        {createProductMutation.isPending ? (
                          <>
                            <Loader2 className="animate-spin mr-2" size={16} />
                            جاري الحفظ...
                          </>
                        ) : (
                          "حفظ"
                        )}
                      </Button>
                      <Button
                        onClick={() => {
                          setShowAddForm(false);
                          resetForm();
                        }}
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
                ) : filteredProducts.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                            الصورة
                          </th>
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
                        {filteredProducts.map((product) => (
                          <tr key={product.id} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm">
                              {product.image ? (
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="w-10 h-10 rounded object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                                  <ImageIcon size={16} className="text-gray-400" />
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">{product.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">${product.price}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{product.stock}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{product.category}</td>
                            <td className="px-4 py-3 text-sm">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditProduct(product)}
                                  className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                                >
                                  <Edit2 size={16} className="text-blue-600" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(product.id)}
                                  disabled={deleteProductMutation.isPending}
                                  className="p-2 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
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
                ) : (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg font-semibold">لا توجد أدوية</p>
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
              ) : doctors && doctors.length > 0 ? (
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
                      {doctors.map((doctor) => (
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
              ) : (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg font-semibold">لا يوجد أطباء</p>
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

      {/* Statistic Details Modal */}
      <Dialog open={showStatisticModal} onOpenChange={setShowStatisticModal}>
        <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedStatistic === "products" && "الأدوية"}
              {selectedStatistic === "doctors" && "الأطباء"}
              {selectedStatistic === "appointments" && "المواعيد"}
              {selectedStatistic === "orders" && "الطلبات"}
              {selectedStatistic === "pending" && "الطلبات المعلقة"}
              {selectedStatistic === "completed" && "الطلبات المكتملة"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {getStatisticItems().length > 0 ? (
              getStatisticItems().map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {item.name || `${selectedStatistic} #${item.id}`}
                    </p>
                    <p className="text-sm text-gray-600">
                      {item.category && `الفئة: ${item.category}`}
                      {item.specialty && `التخصص: ${item.specialty}`}
                      {item.status && `الحالة: ${item.status}`}
                    </p>
                  </div>
                  {selectedStatistic === "products" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          handleEditProduct(item);
                          setShowStatisticModal(false);
                        }}
                        className="p-2 hover:bg-blue-100 rounded-lg"
                      >
                        <Edit2 size={16} className="text-blue-600" />
                      </button>
                      <button
                        onClick={() => {
                          handleDeleteProduct(item.id);
                          setShowStatisticModal(false);
                        }}
                        className="p-2 hover:bg-red-100 rounded-lg"
                      >
                        <Trash2 size={16} className="text-red-600" />
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-gray-600 py-6">لا توجد عناصر</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-md max-h-96 overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل الدواء</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                اسم الدواء *
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
                  السعر *
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
                <option value="pet_care">العناية بالحيوانات</option>
              </select>
            </div>

            {imagePreview && (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="preview"
                  className="w-full h-32 object-cover rounded-lg"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <ImageIcon className="inline mr-2" size={16} />
                تحديث الصورة
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="w-full"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleUpdateProduct}
                disabled={updateProductMutation.isPending}
                className="flex-1 bg-[#00c57d] hover:bg-[#00a86a] text-white"
              >
                {updateProductMutation.isPending ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={16} />
                    جاري التحديث...
                  </>
                ) : (
                  "حفظ التعديلات"
                )}
              </Button>
              <Button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingProduct(null);
                  resetForm();
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900"
              >
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
