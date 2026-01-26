import { Loader2, Package, AlertTriangle, TrendingUp, LogOut, ChevronRight } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function PharmacyDashboard() {
  const { user, logout, loading: authLoading } = useAuth({ redirectOnUnauthenticated: true });
  const [, navigate] = useLocation();

  // Fetch products
  const { data: products, isLoading: productsLoading } = trpc.products.list.useQuery({
    limit: 100,
    offset: 0,
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

  if (!user || user.role !== "pharmacist") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertTriangle size={48} className="mx-auto mb-4 text-red-500" />
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

  const lowStockProducts = products?.filter((p) => p.stock < 10) || [];
  const outOfStockProducts = products?.filter((p) => p.stock === 0) || [];
  const totalProducts = products?.length || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">لوحة تحكم الصيدلية</h1>
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
        {/* Alert Boxes */}
        {outOfStockProducts.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertTriangle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-semibold text-red-900">منتجات غير متوفرة</h3>
              <p className="text-sm text-red-700 mt-1">
                هناك {outOfStockProducts.length} منتج غير متوفر في المخزون
              </p>
            </div>
          </div>
        )}

        {lowStockProducts.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-semibold text-yellow-900">تحذير المخزون المنخفض</h3>
              <p className="text-sm text-yellow-700 mt-1">
                هناك {lowStockProducts.length} منتج بمخزون منخفض
              </p>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Total Products */}
          <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">إجمالي المنتجات</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{totalProducts}</p>
              </div>
              <Package className="text-blue-500" size={32} />
            </div>
          </div>

          {/* Low Stock */}
          <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">مخزون منخفض</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{lowStockProducts.length}</p>
              </div>
              <AlertTriangle className="text-yellow-500" size={32} />
            </div>
          </div>

          {/* Out of Stock */}
          <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">غير متوفر</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{outOfStockProducts.length}</p>
              </div>
              <AlertTriangle className="text-red-500" size={32} />
            </div>
          </div>
        </div>

        {/* Products List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">قائمة المنتجات</h2>
          </div>

          {productsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-[#00c57d]" size={32} />
            </div>
          ) : products && products.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                      اسم المنتج
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                      الفئة
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                      السعر
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                      المخزون
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                      الحالة
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900">{product.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{product.category}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        ${product.price}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            product.stock === 0
                              ? "bg-red-100 text-red-700"
                              : product.stock < 10
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {product.stock === 0 ? (
                          <span className="text-red-600 font-semibold">غير متوفر</span>
                        ) : product.stock < 10 ? (
                          <span className="text-yellow-600 font-semibold">منخفض</span>
                        ) : (
                          <span className="text-green-600 font-semibold">متوفر</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <Package size={48} className="mx-auto mb-4 opacity-50" />
              <p>لا توجد منتجات</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
