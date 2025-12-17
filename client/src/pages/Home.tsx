import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Search, ShoppingCart, Clock, Users, Pill, Home, Calendar, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"home" | "doctors" | "appointments" | "reminders">("home");

  // Fetch featured products
  const { data: products, isLoading: productsLoading } = trpc.products.list.useQuery({
    limit: 20,
    offset: 0,
  });

  // Fetch featured doctors
  const { data: doctors, isLoading: doctorsLoading } = trpc.doctors.list.useQuery({
    limit: 6,
    offset: 0,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search functionality can be implemented here
  };

  return (
    <div className="app-container">
      {/* Header */}
      <div className="app-header">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">GO Pharmacy</h1>
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="w-6 h-6 text-[#0cc46a]" />
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  0
                </span>
              </Button>
            </Link>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="text"
              placeholder="ابحث عن أدوية أو منتجات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 rounded-full bg-gray-100 border-0 text-right"
            />
            <Button type="submit" size="icon" className="rounded-full bg-[#0cc46a] hover:bg-[#09a855]">
              <Search className="w-5 h-5" />
            </Button>
          </form>
        </div>
      </div>

      {/* Main Content */}
      <div className="app-content">
        <div className="container mx-auto px-4 py-6">
          {/* Hero Section with Features */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <Link href="/products">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-[#0cc46a] to-[#09a855] text-white">
                <CardContent className="pt-6 text-center">
                  <Pill className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm font-semibold">الأدوية</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/doctors">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-[#0cc46a] to-[#09a855] text-white">
                <CardContent className="pt-6 text-center">
                  <Users className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm font-semibold">الأطباء</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/appointments">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-[#0cc46a] to-[#09a855] text-white">
                <CardContent className="pt-6 text-center">
                  <Calendar className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm font-semibold">المواعيد</p>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Why Choose Us Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">لماذا تختار صيدليتنا؟</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-l-4 border-l-[#0cc46a]">
                <CardContent className="pt-6">
                  <Clock className="w-8 h-8 text-[#0cc46a] mb-3" />
                  <h3 className="font-bold text-lg mb-2">توصيل سريع</h3>
                  <p className="text-sm text-gray-600">توصيل في 30-60 دقيقة إلى عنوانك</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-[#0cc46a]">
                <CardContent className="pt-6">
                  <Users className="w-8 h-8 text-[#0cc46a] mb-3" />
                  <h3 className="font-bold text-lg mb-2">استشارات طبية</h3>
                  <p className="text-sm text-gray-600">استشر أطباء متخصصين مباشرة</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-[#0cc46a]">
                <CardContent className="pt-6">
                  <Pill className="w-8 h-8 text-[#0cc46a] mb-3" />
                  <h3 className="font-bold text-lg mb-2">تذكيرات آمنة</h3>
                  <p className="text-sm text-gray-600">لا تنسى مواعيد أدويتك أبداً</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Featured Products Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">المنتجات المميزة</h2>
              <Link href="/products">
                <Button variant="ghost" className="text-[#0cc46a] hover:text-[#09a855]">
                  عرض الكل
                </Button>
              </Link>
            </div>

            {productsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#0cc46a]" />
              </div>
            ) : products && products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.slice(0, 8).map((product) => (
                  <Link key={product.id} href={`/product/${product.id}`}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
                      <CardContent className="pt-4 flex-1 flex flex-col">
                        {product.image && (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-32 object-cover rounded-md mb-3"
                          />
                        )}
                        <h3 className="font-semibold text-sm line-clamp-2 mb-2">{product.name}</h3>
                        {product.manufacturer && (
                          <p className="text-xs text-gray-600 mb-2">{product.manufacturer}</p>
                        )}
                        <div className="flex items-center justify-between mt-auto">
                          <span className="text-lg font-bold text-[#0cc46a]">{product.price} JD</span>
                          {product.requiresPrescription && (
                            <Badge variant="destructive" className="text-xs">
                              وصفة
                            </Badge>
                          )}
                        </div>
                        <Button className="w-full mt-3 bg-[#0cc46a] hover:bg-[#09a855] text-white">
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          أضف
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">لا توجد منتجات متاحة حالياً</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Featured Doctors Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">الأطباء المتخصصون</h2>
              <Link href="/doctors">
                <Button variant="ghost" className="text-[#0cc46a] hover:text-[#09a855]">
                  عرض الكل
                </Button>
              </Link>
            </div>

            {doctorsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#0cc46a]" />
              </div>
            ) : doctors && doctors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {doctors.slice(0, 6).map((doctor) => (
                  <Link key={doctor.id} href={`/doctor/${doctor.id}`}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-bold text-lg">{doctor.clinic}</h3>
                            <Badge className="bg-[#0cc46a] text-white mt-1">
                              {doctor.specialty}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {doctor.qualifications || "طبيب متخصص"}
                        </p>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm text-gray-600">
                            ⏱️ {doctor.waitTime} دقيقة
                          </span>
                          <span className="text-lg font-bold text-[#0cc46a]">
                            {doctor.consultationFee} JD
                          </span>
                        </div>
                        <Button className="w-full bg-[#0cc46a] hover:bg-[#09a855] text-white">
                          احجز موعد
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">لا يوجد أطباء متاحون حالياً</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="app-bottom-nav">
        <Link href="/">
          <div className={`app-nav-item ${activeTab === "home" ? "active" : ""}`}>
            <Home className="w-6 h-6" />
            <span className="text-xs">الرئيسية</span>
          </div>
        </Link>

        <Link href="/doctors">
          <div className="app-nav-item">
            <Users className="w-6 h-6" />
            <span className="text-xs">الأطباء</span>
          </div>
        </Link>

        <Link href="/appointments">
          <div className="app-nav-item">
            <Calendar className="w-6 h-6" />
            <span className="text-xs">المواعيد</span>
          </div>
        </Link>

        <Link href="/reminders">
          <div className="app-nav-item">
            <Pill className="w-6 h-6" />
            <span className="text-xs">التذكيرات</span>
          </div>
        </Link>

        <Link href="/cart">
          <div className="app-nav-item relative">
            <ShoppingCart className="w-6 h-6" />
            <span className="text-xs">السلة</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
