import { Loader2, Home as HomeIcon, ShoppingCart, Users, Clock, Pill, User, ChevronLeft, MapPin, Package, CheckCircle, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

export default function OrderTracking() {
  const { user, loading: authLoading } = useAuth({ redirectOnUnauthenticated: true });
  const [, navigate] = useLocation();

  // Get order ID from URL
  const params = new URLSearchParams(window.location.search);
  const orderId = parseInt(params.get("id") || "0");

  // Fetch order details
  const { data: order, isLoading } = trpc.orders.byId.useQuery(
    { id: orderId },
    { enabled: orderId > 0 && !!user }
  );

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "قيد الانتظار";
      case "confirmed":
        return "تم التأكيد";
      case "shipped":
        return "تم الشحن";
      case "delivered":
        return "تم التسليم";
      case "cancelled":
        return "تم الإلغاء";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-50 border-l-4 border-yellow-500";
      case "confirmed":
        return "bg-blue-50 border-l-4 border-blue-500";
      case "shipped":
        return "bg-purple-50 border-l-4 border-purple-500";
      case "delivered":
        return "bg-green-50 border-l-4 border-green-500";
      case "cancelled":
        return "bg-red-50 border-l-4 border-red-500";
      default:
        return "bg-gray-50 border-l-4 border-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="text-yellow-600" size={24} />;
      case "confirmed":
        return <CheckCircle className="text-blue-600" size={24} />;
      case "shipped":
        return <Package className="text-purple-600" size={24} />;
      case "delivered":
        return <CheckCircle className="text-green-600" size={24} />;
      case "cancelled":
        return <AlertCircle className="text-red-600" size={24} />;
      default:
        return <Package className="text-gray-600" size={24} />;
    }
  };

  const getPaymentStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "قيد الانتظار";
      case "completed":
        return "مكتمل";
      case "failed":
        return "فشل";
      default:
        return status;
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-[#00c57d]" size={48} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="app-container">
        <div className="app-header">
          <div className="container py-4">
            <button
              onClick={() => navigate("/profile")}
              className="flex items-center gap-2 text-[#00c57d] hover:text-[#00a86a]"
            >
              <ChevronLeft size={24} />
              <span>العودة</span>
            </button>
          </div>
        </div>
        <div className="app-content">
          <div className="container py-12 text-center">
            <AlertCircle size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">الطلب غير موجود</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Header */}
      <div className="app-header">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/profile")}
              className="flex items-center gap-2 text-[#00c57d] hover:text-[#00a86a]"
            >
              <ChevronLeft size={24} />
              <span>العودة</span>
            </button>
            <h1 className="text-xl font-bold text-gray-900">تتبع الطلب</h1>
            <div className="w-6" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="app-content">
        <div className="container py-6">
          {/* Order Number */}
          <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
            <p className="text-sm text-gray-600">رقم الطلب</p>
            <p className="text-2xl font-bold text-gray-900">{order.orderNumber}</p>
          </div>

          {/* Order Status */}
          <div className={`rounded-lg p-4 mb-6 ${getStatusColor(order.status)}`}>
            <div className="flex items-center gap-3">
              {getStatusIcon(order.status)}
              <div>
                <h3 className="font-semibold text-gray-900">حالة الطلب</h3>
                <p className="text-sm text-gray-700 mt-1">
                  {getStatusLabel(order.status)}
                </p>
              </div>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">مراحل الطلب</h3>
            <div className="space-y-4">
              {/* Pending */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      ["pending", "confirmed", "shipped", "delivered"].includes(
                        order.status
                      )
                        ? "bg-[#00c57d]"
                        : "bg-gray-300"
                    }`}
                  >
                    <CheckCircle className="text-white" size={20} />
                  </div>
                  <div
                    className={`w-1 h-12 ${
                      ["confirmed", "shipped", "delivered"].includes(order.status)
                        ? "bg-[#00c57d]"
                        : "bg-gray-300"
                    }`}
                  />
                </div>
                <div className="pb-4">
                  <p className="font-semibold text-gray-900">تم استقبال الطلب</p>
                  <p className="text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString("ar-SA")}
                  </p>
                </div>
              </div>

              {/* Confirmed */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      ["confirmed", "shipped", "delivered"].includes(order.status)
                        ? "bg-[#00c57d]"
                        : "bg-gray-300"
                    }`}
                  >
                    <CheckCircle className="text-white" size={20} />
                  </div>
                  <div
                    className={`w-1 h-12 ${
                      ["shipped", "delivered"].includes(order.status)
                        ? "bg-[#00c57d]"
                        : "bg-gray-300"
                    }`}
                  />
                </div>
                <div className="pb-4">
                  <p className="font-semibold text-gray-900">تم تأكيد الطلب</p>
                  <p className="text-sm text-gray-600">
                    {order.status !== "pending"
                      ? "تم التأكيد"
                      : "قيد الانتظار"}
                  </p>
                </div>
              </div>

              {/* Shipped */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      ["shipped", "delivered"].includes(order.status)
                        ? "bg-[#00c57d]"
                        : "bg-gray-300"
                    }`}
                  >
                    <Package className="text-white" size={20} />
                  </div>
                  <div
                    className={`w-1 h-12 ${
                      ["delivered"].includes(order.status)
                        ? "bg-[#00c57d]"
                        : "bg-gray-300"
                    }`}
                  />
                </div>
                <div className="pb-4">
                  <p className="font-semibold text-gray-900">تم الشحن</p>
                  <p className="text-sm text-gray-600">
                    {["shipped", "delivered"].includes(order.status)
                      ? "في الطريق إليك"
                      : "قيد الانتظار"}
                  </p>
                </div>
              </div>

              {/* Delivered */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      ["delivered"].includes(order.status)
                        ? "bg-[#00c57d]"
                        : "bg-gray-300"
                    }`}
                  >
                    <CheckCircle className="text-white" size={20} />
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">تم التسليم</p>
                  <p className="text-sm text-gray-600">
                    {order.status === "delivered"
                      ? "تم استلام الطلب بنجاح"
                      : "قيد الانتظار"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <MapPin size={20} className="text-[#00c57d]" />
              عنوان التسليم
            </h3>
            <p className="text-gray-700">{order.deliveryAddress}</p>
            {order.deliveryLatitude && order.deliveryLongitude && (
              <p className="text-xs text-gray-500 mt-2">
                الإحداثيات: {order.deliveryLatitude}, {order.deliveryLongitude}
              </p>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">ملخص الطلب</h3>
            <div className="space-y-2 pb-4 border-b border-gray-200">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">المجموع</span>
                <span className="font-semibold text-gray-900">
                  ${parseFloat(order.totalAmount).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">طريقة الدفع</span>
                <span className="font-semibold text-gray-900">
                  {order.paymentMethod === "cash" ? "دفع عند الاستلام" : "بطاقة ائتمان"}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">حالة الدفع</span>
                <span className="font-semibold text-gray-900">
                  {getPaymentStatusLabel(order.paymentStatus)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="app-bottom-nav">
        <a href="/">
          <div className="app-nav-item">
            <HomeIcon className="w-6 h-6" />
            <span className="text-xs">الرئيسية</span>
          </div>
        </a>

        <a href="/products">
          <div className="app-nav-item">
            <ShoppingCart className="w-6 h-6" />
            <span className="text-xs">الأدوية</span>
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
            <Clock className="w-6 h-6" />
            <span className="text-xs">المواعيد</span>
          </div>
        </a>

        <a href="/reminders">
          <div className="app-nav-item">
            <Pill className="w-6 h-6" />
            <span className="text-xs">التذكيرات</span>
          </div>
        </a>

        <a href="/profile">
          <div className="app-nav-item active">
            <User className="w-6 h-6" />
            <span className="text-xs">الملف الشخصي</span>
          </div>
        </a>
      </div>
    </div>
  );
}
