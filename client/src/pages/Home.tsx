import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2, Search, ShoppingCart, Clock, Users, Pill, ChevronRight, Star, MapPin } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch products and doctors
  const { data: products, isLoading: productsLoading } = trpc.products.list.useQuery({
    limit: 10,
    offset: 0,
  });

  const { data: doctors, isLoading: doctorsLoading } = trpc.doctors.list.useQuery({
    limit: 10,
    offset: 0,
  });

  const handleProductClick = (productId: number) => {
    navigate(`/products?id=${productId}`);
  };

  const handleDoctorClick = (doctorId: number) => {
    navigate(`/doctors?id=${doctorId}`);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-[#00c57d]" size={48} />
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Header */}
      <div className="app-header">
        <div className="container py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">GO Pharmacy</h1>
            <button className="relative">
              <ShoppingCart className="text-[#00c57d]" size={24} />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                0
              </span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Input
              type="text"
              placeholder="ابحث عن أدوية أو منتجات"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 rounded-full border-gray-300 bg-gray-100"
            />
            <Search className="absolute left-3 top-3.5 text-[#00c57d]" size={20} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="app-content">
        <div className="container py-6">
          {/* Quick Action Buttons */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <button
              onClick={() => navigate("/products")}
              className="bg-gradient-to-br from-[#00c57d] to-[#00a86a] text-white rounded-lg p-4 flex flex-col items-center justify-center gap-2 hover:shadow-lg transition-shadow"
            >
              <Pill size={28} />
              <span className="text-sm font-semibold">الأدوية</span>
            </button>
            <button
              onClick={() => navigate("/doctors")}
              className="bg-gradient-to-br from-[#00c57d] to-[#00a86a] text-white rounded-lg p-4 flex flex-col items-center justify-center gap-2 hover:shadow-lg transition-shadow"
            >
              <Users size={28} />
              <span className="text-sm font-semibold">الأطباء</span>
            </button>
            <button
              onClick={() => navigate("/appointments")}
              className="bg-gradient-to-br from-[#00c57d] to-[#00a86a] text-white rounded-lg p-4 flex flex-col items-center justify-center gap-2 hover:shadow-lg transition-shadow"
            >
              <Clock size={28} />
              <span className="text-sm font-semibold">المواعيد</span>
            </button>
          </div>

          {/* Why Choose Us */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">لماذا تختار صيدليتنا؟</h2>
            <div className="grid grid-cols-1 gap-3">
              <div className="bg-white rounded-lg p-4 border-l-4 border-[#00c57d] shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <Clock className="text-[#00c57d] flex-shrink-0 mt-1" size={20} />
                  <div>
                    <h3 className="font-semibold text-gray-900">توصيل سريع</h3>
                    <p className="text-sm text-gray-600">توصيل في 30-60 دقيقة إلى عنوانك</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border-l-4 border-[#00c57d] shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <Users className="text-[#00c57d] flex-shrink-0 mt-1" size={20} />
                  <div>
                    <h3 className="font-semibold text-gray-900">استشارات طبية</h3>
                    <p className="text-sm text-gray-600">استشير أطباء متخصصين مباشرة</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border-l-4 border-[#00c57d] shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <Pill className="text-[#00c57d] flex-shrink-0 mt-1" size={20} />
                  <div>
                    <h3 className="font-semibold text-gray-900">تذكيرات آمنة</h3>
                    <p className="text-sm text-gray-600">لا تنسى موعيد أدويتك أبداً</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Featured Products */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">المنتجات المميزة</h2>
              <button
                onClick={() => navigate("/products")}
                className="text-[#00c57d] flex items-center gap-1 hover:gap-2 transition-all"
              >
                <span className="text-sm font-semibold">عرض الكل</span>
                <ChevronRight size={16} />
              </button>
            </div>

            {productsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-[#00c57d]" size={32} />
              </div>
            ) : products && products.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 overflow-x-auto pb-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleProductClick(product.id)}
                    className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="bg-gray-100 rounded-lg h-32 mb-2 flex items-center justify-center">
                      <Pill className="text-[#00c57d]" size={40} />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{product.name}</h3>
                    <p className="text-[#00c57d] font-bold text-sm mt-1">${product.price}</p>
                    {product.requiresPrescription && (
                      <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded mt-1 inline-block">
                        يلزم وصفة
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">لا توجد منتجات</div>
            )}
          </div>

          {/* Featured Doctors */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">الأطباء المتاحون</h2>
              <button
                onClick={() => navigate("/doctors")}
                className="text-[#00c57d] flex items-center gap-1 hover:gap-2 transition-all"
              >
                <span className="text-sm font-semibold">عرض الكل</span>
                <ChevronRight size={16} />
              </button>
            </div>

            {doctorsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-[#00c57d]" size={32} />
              </div>
            ) : doctors && doctors.length > 0 ? (
              <div className="space-y-3">
                {doctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    onClick={() => handleDoctorClick(doctor.id)}
                    className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="bg-gradient-to-br from-[#00c57d] to-[#00a86a] text-white rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                        <Users size={24} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900">{doctor.clinic}</h3>
                        <p className="text-sm text-gray-600">{doctor.qualifications}</p>
                        <div className="flex items-center gap-2 mt-2 text-sm">
                          <div className="flex items-center gap-1 text-yellow-500">
                            <Star size={14} fill="currentColor" />
                            <span className="font-semibold">{doctor.rating}</span>
                          </div>
                          <span className="text-gray-500">({doctor.reviewCount})</span>
                          <span className="text-[#00c57d] font-semibold">${doctor.consultationFee}</span>
                        </div>
                      </div>
                      <ChevronRight className="text-gray-400 flex-shrink-0" size={20} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">لا يوجد أطباء متاحون</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
