import { Loader2, BarChart3, Users, Package, ShoppingCart, TrendingUp, AlertCircle, LogOut } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdminDashboard() {
  const { user, logout, loading: authLoading } = useAuth({ redirectOnUnauthenticated: true });
  const [, navigate] = useLocation();

  // Fetch dashboard data
  const { data: products, isLoading: productsLoading } = trpc.products.list.useQuery({
    limit: 100,
    offset: 0,
  });

  const { data: doctors, isLoading: doctorsLoading } = trpc.doctors.list.useQuery({
    limit: 100,
    offset: 0,
  });

  const { data: orders, isLoading: ordersLoading } = trpc.orders.list.useQuery(undefined, {
    enabled: !!user,
  });

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
      toast.success("تم تسجيل الخروج بنجاح");
    } catch (error) {
      toast.error("فشل تسجيل الخروج");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-[#00c57d]" size={48} />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
          <p className="text-gray-600 mb-4">ليس لديك صلاحيات للوصول إلى هذه الصفحة</p>
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

  const totalProducts = products?.length || 0;
  const totalDoctors = doctors?.length || 0;
  const totalOrders = orders?.length || 0;
  const totalRevenue = orders?.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0) || 0;

  const pendingOrders = orders?.filter((o) => o.status === "pending").length || 0;
  const completedOrders = orders?.filter((o) => o.status === "delivered").length || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم الإدارية</h1>
            <p className="text-gray-600 mt-1">مرحباً بك، {user.name}</p>
          </div>
          <Button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white flex items-center gap-2"
          >
            <LogOut size={18} />
            تسجيل الخروج
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Products */}
          <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-emerald-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">إجمالي المنتجات</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{totalProducts}</p>
              </div>
              <Package className="text-blue-500" size={32} />
            </div>
          </div>

          {/* Total Doctors */}
          <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">إجمالي الأطباء</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{totalDoctors}</p>
              </div>
              <Users className="text-purple-500" size={32} />
            </div>
          </div>

          {/* Total Orders */}
          <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-[#00c57d]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">إجمالي الطلبات</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{totalOrders}</p>
              </div>
              <ShoppingCart className="text-[#00c57d]" size={32} />
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">إجمالي الإيرادات</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">${totalRevenue.toFixed(2)}</p>
              </div>
              <TrendingUp className="text-green-500" size={32} />
            </div>
          </div>
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Order Status Overview */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 size={24} className="text-[#00c57d]" />
              حالة الطلبات
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">قيد الانتظار</span>
                  <span className="font-bold text-gray-900">{pendingOrders}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{
                      width: `${totalOrders > 0 ? (pendingOrders / totalOrders) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">مكتملة</span>
                  <span className="font-bold text-gray-900">{completedOrders}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                      width: `${totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">النشاط الأخير</h2>
            <div className="space-y-3">
              <div className="p-3 bg-emerald-50 rounded-lg">
                <p className="text-sm font-semibold text-gray-900">طلب جديد</p>
                <p className="text-xs text-gray-600 mt-1">تم استقبال {totalOrders} طلب</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-sm font-semibold text-gray-900">أطباء نشطين</p>
                <p className="text-xs text-gray-600 mt-1">{totalDoctors} طبيب متاح</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm font-semibold text-gray-900">منتجات متوفرة</p>
                <p className="text-xs text-gray-600 mt-1">{totalProducts} منتج في المخزون</p>
              </div>
            </div>
          </div>
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Products Management */}
          <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate("/admin/products")}
          >
            <Package className="text-blue-500 mb-3" size={32} />
            <h3 className="text-lg font-bold text-gray-900">إدارة المنتجات</h3>
            <p className="text-sm text-gray-600 mt-2">إضافة وتعديل وحذف المنتجات</p>
            <p className="text-2xl font-bold text-gray-900 mt-4">{totalProducts}</p>
          </div>

          {/* Doctors Management */}
          <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate("/admin/doctors")}
          >
            <Users className="text-purple-500 mb-3" size={32} />
            <h3 className="text-lg font-bold text-gray-900">إدارة الأطباء</h3>
            <p className="text-sm text-gray-600 mt-2">إضافة وتعديل بيانات الأطباء</p>
            <p className="text-2xl font-bold text-gray-900 mt-4">{totalDoctors}</p>
          </div>

          {/* Orders Management */}
          <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate("/admin/orders")}
          >
            <ShoppingCart className="text-[#00c57d] mb-3" size={32} />
            <h3 className="text-lg font-bold text-gray-900">إدارة الطلبات</h3>
            <p className="text-sm text-gray-600 mt-2">عرض وتحديث حالة الطلبات</p>
            <p className="text-2xl font-bold text-gray-900 mt-4">{totalOrders}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
