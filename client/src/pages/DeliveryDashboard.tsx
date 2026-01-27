import { Loader2, Truck, MapPin, CheckCircle, AlertTriangle, LogOut, Clock } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function DeliveryDashboard() {
  const { user, logout, loading: authLoading } = useAuth({ redirectOnUnauthenticated: true });
  const [, navigate] = useLocation();

  // Fetch orders
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

  if (!user || (user.role !== "admin" && user.role !== "user")) {
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

  const shippedOrders = orders?.filter((o) => o.status === "shipped") || [];
  const deliveredOrders = orders?.filter((o) => o.status === "delivered") || [];
  const pendingOrders = orders?.filter((o) => o.status === "pending" || o.status === "confirmed") || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">قيد الانتظار</span>;
      case "confirmed":
        return <span className="bg-emerald-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">مؤكد</span>;
      case "shipped":
        return <span className="bg-emerald-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold">مشحون</span>;
      case "delivered":
        return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">مسلم</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">لوحة تحكم التوصيل</h1>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Pending Delivery */}
          <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">قيد الانتظار</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{pendingOrders.length}</p>
              </div>
              <Clock className="text-yellow-500" size={32} />
            </div>
          </div>

          {/* In Transit */}
          <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">في الطريق</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{shippedOrders.length}</p>
              </div>
              <Truck className="text-purple-500" size={32} />
            </div>
          </div>

          {/* Delivered */}
          <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">مسلمة</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{deliveredOrders.length}</p>
              </div>
              <CheckCircle className="text-green-500" size={32} />
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">قائمة الطلبات</h2>
          </div>

          {ordersLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-[#00c57d]" size={32} />
            </div>
          ) : orders && orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                      رقم الطلب
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                      العنوان
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                      المبلغ
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                      الحالة
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                      التاريخ
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {order.orderNumber}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-start gap-2">
                          <MapPin size={16} className="text-[#00c57d] flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{order.deliveryAddress}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        ${parseFloat(order.totalAmount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString("ar-SA")}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => navigate(`/order?id=${order.id}`)}
                          className="text-[#00c57d] hover:text-[#00a86a] font-semibold transition-colors"
                        >
                          عرض التفاصيل
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <Truck size={48} className="mx-auto mb-4 opacity-50" />
              <p>لا توجد طلبات</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
