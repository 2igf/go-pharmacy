import { Loader2, Home as HomeIcon, ShoppingCart, Users, Clock, Pill, User, ChevronLeft, MapPin, CreditCard, Banknote } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Checkout() {
  const { user, loading: authLoading } = useAuth({ redirectOnUnauthenticated: true });
  const [, navigate] = useLocation();
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card">("cash");
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch cart items
  const { data: cartItems, isLoading: cartLoading } = trpc.cart.list.useQuery(
    undefined,
    { enabled: !!user }
  );

  // Fetch user addresses
  const { data: addresses, isLoading: addressesLoading } = trpc.addresses.list.useQuery(
    undefined,
    { enabled: !!user }
  );

  // Create order mutation
  const createOrderMutation = trpc.orders.create.useMutation({
    onSuccess: (order) => {
      toast.success("تم إنشاء الطلب بنجاح!");
      navigate(`/order/${order.orderId}`);
    },
    onError: (error) => {
      toast.error(error.message || "فشل إنشاء الطلب");
      setIsProcessing(false);
    },
  });

  const handleCheckout = async () => {
    if (!selectedAddress) {
      toast.error("يرجى اختيار عنوان التوصيل");
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      toast.error("السلة فارغة");
      return;
    }

    setIsProcessing(true);

    try {
      await createOrderMutation.mutateAsync({
        addressId: selectedAddress,
        paymentMethod,
      });
    } catch (error) {
      console.error("Error creating order:", error);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-[#00c57d]" size={48} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="app-container">
        <div className="app-header">
          <div className="container py-4">
            <h1 className="text-2xl font-bold text-gray-900">الدفع والتسليم</h1>
          </div>
        </div>
        <div className="app-content">
          <div className="container py-12 text-center">
            <p className="text-gray-600 mb-4">يجب تسجيل الدخول للمتابعة</p>
            <Button
              onClick={() => navigate("/")}
              className="bg-[#00c57d] hover:bg-[#00a86a] text-white"
            >
              العودة للرئيسية
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // TODO: Fetch product prices for cart items
  const cartTotal = 0;

  const shippingCost = cartTotal > 50 ? 0 : 5;
  const total = cartTotal + shippingCost;

  return (
    <div className="app-container">
      {/* Header */}
      <div className="app-header">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/cart")}
              className="flex items-center gap-2 text-[#00c57d] hover:text-[#00a86a]"
            >
              <ChevronLeft size={24} />
              <span>العودة</span>
            </button>
            <h1 className="text-xl font-bold text-gray-900">الدفع والتسليم</h1>
            <div className="w-6" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="app-content">
        <div className="container py-6">
          {/* Order Summary */}
          <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4">ملخص الطلب</h2>
            <div className="space-y-2 pb-4 border-b border-gray-200">
              {cartItems && cartItems.length > 0 ? (
                cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">
                      المنتج #{item.productId} × {item.quantity}
                    </span>
                    <span className="font-semibold text-gray-900">$0.00</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">السلة فارغة</p>
              )}
            </div>

            {/* Totals */}
            <div className="space-y-2 pt-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">المجموع الفرعي</span>
                <span className="font-semibold text-gray-900">${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">الشحن</span>
                <span className="font-semibold text-gray-900">
                  {shippingCost === 0 ? "مجاني" : `$${shippingCost.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold pt-2 border-t border-gray-200 mt-2">
                <span className="text-gray-900">الإجمالي</span>
                <span className="text-[#00c57d]">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin size={20} className="text-[#00c57d]" />
              عنوان التوصيل
            </h2>

            {addressesLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="animate-spin text-[#00c57d]" size={24} />
              </div>
            ) : addresses && addresses.length > 0 ? (
              <div className="space-y-3">
                {addresses.map((address) => (
                  <label
                    key={address.id}
                    className="flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors"
                    style={{
                      borderColor: selectedAddress === address.id ? "#00c57d" : "#e5e7eb",
                      backgroundColor:
                        selectedAddress === address.id ? "#f0fdf4" : "transparent",
                    }}
                  >
                    <input
                      type="radio"
                      name="address"
                      value={address.id}
                      checked={selectedAddress === address.id}
                      onChange={(e) => setSelectedAddress(parseInt(e.target.value))}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{address.label}</p>
                      <p className="text-sm text-gray-600">{address.address}</p>
                      {address.isDefault && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded mt-1 inline-block">
                          العنوان الافتراضي
                        </span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-600 mb-3">لم تضف أي عناوين بعد</p>
                <Button
                  onClick={() => navigate("/profile")}
                  className="bg-[#00c57d] hover:bg-[#00a86a] text-white"
                >
                  إضافة عنوان
                </Button>
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4">طريقة الدفع</h2>
            <div className="space-y-3">
              {/* Cash Payment */}
              <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors"
                style={{
                  borderColor: paymentMethod === "cash" ? "#00c57d" : "#e5e7eb",
                  backgroundColor: paymentMethod === "cash" ? "#f0fdf4" : "transparent",
                }}
              >
                <input
                  type="radio"
                  name="payment"
                  value="cash"
                  checked={paymentMethod === "cash"}
                  onChange={(e) => setPaymentMethod(e.target.value as "cash" | "card")}
                />
                <Banknote className="text-[#00c57d]" size={20} />
                <div>
                  <p className="font-semibold text-gray-900">الدفع عند الاستلام</p>
                  <p className="text-sm text-gray-600">ادفع عند استلام طلبك</p>
                </div>
              </label>

              {/* Card Payment */}
              <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors"
                style={{
                  borderColor: paymentMethod === "card" ? "#00c57d" : "#e5e7eb",
                  backgroundColor: paymentMethod === "card" ? "#f0fdf4" : "transparent",
                }}
              >
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={paymentMethod === "card"}
                  onChange={(e) => setPaymentMethod(e.target.value as "cash" | "card")}
                />
                <CreditCard className="text-[#00c57d]" size={20} />
                <div>
                  <p className="font-semibold text-gray-900">بطاقة ائتمان</p>
                  <p className="text-sm text-gray-600">ادفع بأمان باستخدام بطاقتك</p>
                </div>
              </label>
            </div>
          </div>

          {/* Checkout Button */}
          <Button
            onClick={handleCheckout}
            disabled={
              !selectedAddress ||
              !cartItems ||
              cartItems.length === 0 ||
              isProcessing ||
              createOrderMutation.isPending
            }
            className="w-full bg-[#00c57d] hover:bg-[#00a86a] text-white py-3 rounded-lg font-semibold mb-6"
          >
            {isProcessing || createOrderMutation.isPending
              ? "جاري معالجة الطلب..."
              : `إتمام الشراء - $${total.toFixed(2)}`}
          </Button>
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
