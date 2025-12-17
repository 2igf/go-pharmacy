import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Trash2, Plus, Minus, ArrowLeft, MapPin, CreditCard } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Cart() {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card">("cash");

  // Fetch cart items
  const { data: cartItems, isLoading: cartLoading, refetch: refetchCart } = trpc.cart.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Fetch user addresses
  const { data: addresses, isLoading: addressesLoading } = trpc.addresses.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Mutations
  const removeFromCart = trpc.cart.remove.useMutation({
    onSuccess: () => {
      refetchCart();
      toast.success("تم حذف المنتج من السلة");
    },
    onError: () => {
      toast.error("حدث خطأ أثناء حذف المنتج");
    },
  });

  const updateQuantity = trpc.cart.updateQuantity.useMutation({
    onSuccess: () => {
      refetchCart();
    },
    onError: () => {
      toast.error("حدث خطأ أثناء تحديث الكمية");
    },
  });

  const createOrder = trpc.orders.create.useMutation({
    onSuccess: (data) => {
      toast.success("تم إنشاء الطلب بنجاح!");
      navigate(`/order/${data.orderId}`);
    },
    onError: () => {
      toast.error("حدث خطأ أثناء إنشاء الطلب");
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>السلة فارغة</CardTitle>
            <CardDescription>يجب تسجيل الدخول لعرض سلتك</CardDescription>
          </CardHeader>
          <CardContent>
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

  const total = cartItems?.reduce((sum, item) => {
    // Note: We need to fetch product prices, this is simplified
    return sum + (item.quantity * 10); // Placeholder calculation
  }, 0) || 0;

  const handleCheckout = async () => {
    if (!selectedAddressId) {
      toast.error("يرجى اختيار عنوان التوصيل");
      return;
    }

    await createOrder.mutateAsync({
      addressId: parseInt(selectedAddressId),
      paymentMethod,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              العودة
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">سلة التسوق</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            {cartLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              </div>
            ) : cartItems && cartItems.length > 0 ? (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">منتج #{item.productId}</h3>
                          <p className="text-gray-600">الكمية: {item.quantity}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateQuantity.mutate({
                                id: item.id,
                                quantity: Math.max(1, item.quantity - 1),
                              })
                            }
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateQuantity.mutate({
                                id: item.id,
                                quantity: item.quantity + 1,
                              })
                            }
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeFromCart.mutate({ id: item.id })}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-gray-600 text-lg mb-4">السلة فارغة</p>
                  <Link href="/products">
                    <Button className="bg-emerald-600 hover:bg-emerald-700">
                      تصفح المنتجات
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Checkout Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>ملخص الطلب</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">المجموع:</span>
                    <span className="font-semibold">{total.toFixed(2)} JD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">التوصيل:</span>
                    <span className="font-semibold">مجاني</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span className="font-bold">الإجمالي:</span>
                    <span className="font-bold text-lg text-emerald-600">{total.toFixed(2)} JD</span>
                  </div>
                </div>

                {cartItems && cartItems.length > 0 && (
                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => setShowCheckout(true)}
                  >
                    المتابعة للدفع
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Checkout Dialog */}
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>إكمال الطلب</DialogTitle>
            <DialogDescription>
              اختر عنوان التوصيل وطريقة الدفع
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Address Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                عنوان التوصيل
              </label>
              {addressesLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              ) : addresses && addresses.length > 0 ? (
                <Select value={selectedAddressId} onValueChange={setSelectedAddressId}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر عنوان" />
                  </SelectTrigger>
                  <SelectContent>
                    {addresses.map((addr) => (
                      <SelectItem key={addr.id} value={addr.id.toString()}>
                        {addr.label || addr.address}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-sm text-gray-600">
                  <p className="mb-2">لا توجد عناوين محفوظة</p>
                  <Link href="/addresses">
                    <Button variant="outline" size="sm" className="w-full">
                      <MapPin className="w-4 h-4 mr-2" />
                      إضافة عنوان
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                طريقة الدفع
              </label>
              <Select value={paymentMethod} onValueChange={(val) => setPaymentMethod(val as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">
                    <span className="flex items-center gap-2">
                      الدفع عند الاستلام
                    </span>
                  </SelectItem>
                  <SelectItem value="card">
                    <span className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      بطاقة ائتمان
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Order Summary */}
            <Card className="bg-gray-50">
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>المجموع:</span>
                    <span className="font-semibold">{total.toFixed(2)} JD</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowCheckout(false)}
              >
                إلغاء
              </Button>
              <Button
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                onClick={handleCheckout}
                disabled={createOrder.isPending || !selectedAddressId}
              >
                {createOrder.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    جاري المعالجة...
                  </>
                ) : (
                  "تأكيد الطلب"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
