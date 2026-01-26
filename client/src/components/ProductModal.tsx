import { X, ShoppingCart, Heart, Star, AlertCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

interface ProductModalProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const addToCartMutation = trpc.cart.add.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة المنتج إلى السلة");
      setQuantity(1);
      onClose();
    },
    onError: (error) => {
      toast.error(error.message || "فشل إضافة المنتج");
    },
  });

  const handleAddToCart = async () => {
    if (!user) {
      toast.error("يرجى تسجيل الدخول أولاً");
      return;
    }

    try {
      await addToCartMutation.mutateAsync({
        productId: product.id,
        quantity,
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
      <div className="bg-white w-full rounded-t-2xl p-6 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">تفاصيل المنتج</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Product Image */}
        <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg h-48 mb-4 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-2">💊</div>
            <p className="text-sm text-gray-600">صورة المنتج</p>
          </div>
        </div>

        {/* Product Info */}
        <div className="mb-4">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h3>
          <p className="text-sm text-gray-600 mb-3">{product.category}</p>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={i < 4 ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">(128 تقييم)</span>
          </div>

          {/* Price */}
          <div className="mb-4">
            <p className="text-3xl font-bold text-[#00c57d]">${product.price}</p>
            <p className="text-xs text-gray-600 mt-1">السعر شامل الضريبة</p>
          </div>

          {/* Stock Status */}
          <div className="mb-4">
            {product.stock > 0 ? (
              <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full">
                متوفر ({product.stock} وحدة)
              </span>
            ) : (
              <span className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded-full">
                غير متوفر
              </span>
            )}
          </div>

          {/* Prescription Warning */}
          {product.requiresPrescription && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4 flex items-start gap-2">
              <AlertCircle className="text-orange-600 flex-shrink-0 mt-0.5" size={18} />
              <div>
                <p className="font-semibold text-orange-900 text-sm">يلزم وصفة طبية</p>
                <p className="text-xs text-orange-700 mt-1">
                  هذا المنتج يتطلب وصفة طبية صحيحة
                </p>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="mb-4">
            <h4 className="font-semibold text-gray-900 mb-2">الوصف</h4>
            <p className="text-sm text-gray-700 leading-relaxed">
              {product.description || "لا توجد وصفة متاحة"}
            </p>
          </div>
        </div>

        {/* Quantity Selector */}
        <div className="mb-6">
          <p className="font-semibold text-gray-900 mb-3">الكمية</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              −
            </button>
            <span className="text-lg font-semibold text-gray-900 w-8 text-center">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || addToCartMutation.isPending}
            className="w-full bg-[#00c57d] hover:bg-[#00a86a] text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
          >
            <ShoppingCart size={20} />
            {addToCartMutation.isPending ? "جاري الإضافة..." : "أضف إلى السلة"}
          </Button>

          <Button
            onClick={() => setIsWishlisted(!isWishlisted)}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
          >
            <Heart
              size={20}
              fill={isWishlisted ? "currentColor" : "none"}
              className={isWishlisted ? "text-red-500" : ""}
            />
            {isWishlisted ? "أزل من المفضلة" : "أضف للمفضلة"}
          </Button>

          <Button
            onClick={onClose}
            className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-900 py-3 rounded-lg font-semibold"
          >
            إغلاق
          </Button>
        </div>
      </div>
    </div>
  );
}
