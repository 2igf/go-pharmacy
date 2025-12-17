import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, MapPin, Star, Clock, ShoppingCart, Pill, Users, Calendar } from "lucide-react";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { useState } from "react";

export default function Home() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch featured products
  const { data: products, isLoading: productsLoading } = trpc.products.list.useQuery({
    limit: 6,
    offset: 0,
  });

  // Fetch featured doctors
  const { data: doctors, isLoading: doctorsLoading } = trpc.doctors.list.useQuery({
    limit: 6,
    offset: 0,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Pill className="w-8 h-8 text-emerald-600" />
            <span className="text-2xl font-bold text-emerald-600">GO Pharmacy</span>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link href="/cart">
                  <Button variant="outline" size="sm">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    السلة
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant="outline" size="sm">
                    {user?.name || "الملف الشخصي"}
                  </Button>
                </Link>
              </>
            ) : (
              <Button asChild size="sm">
                <a href={getLoginUrl()}>تسجيل الدخول</a>
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              صيدليتك الموثوقة أونلاين
            </h1>
            <p className="text-lg md:text-xl mb-8 text-emerald-100">
              اطلب أدويتك واستشر الأطباء من منزلك بكل سهولة وأمان
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-2 mb-8">
              <Input
                type="text"
                placeholder="ابحث عن أدوية أو منتجات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white text-right"
              />
              <Button type="submit" className="bg-white text-emerald-600 hover:bg-emerald-50">
                <Search className="w-4 h-4" />
              </Button>
            </form>

            {/* Quick Links */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/products">
                <Button variant="secondary" className="w-full">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  الأدوية
                </Button>
              </Link>
              <Link href="/doctors">
                <Button variant="secondary" className="w-full">
                  <Users className="w-4 h-4 mr-2" />
                  الأطباء
                </Button>
              </Link>
              <Link href="/appointments">
                <Button variant="secondary" className="w-full">
                  <Calendar className="w-4 h-4 mr-2" />
                  المواعيد
                </Button>
              </Link>
              <Link href="/reminders">
                <Button variant="secondary" className="w-full">
                  <Pill className="w-4 h-4 mr-2" />
                  التذكيرات
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">لماذا تختار صيدليتنا؟</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Clock className="w-8 h-8 text-emerald-600 mb-2" />
                <CardTitle>توصيل سريع</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">توصيل في 30-60 دقيقة إلى عنوانك</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Users className="w-8 h-8 text-emerald-600 mb-2" />
                <CardTitle>استشارات طبية</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">استشر أطباء متخصصين مباشرة</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Pill className="w-8 h-8 text-emerald-600 mb-2" />
                <CardTitle>تذكيرات آمنة</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">لا تنسى مواعيد أدويتك أبداً</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">المنتجات المميزة</h2>
            <Link href="/products">
              <Button variant="outline">عرض الكل</Button>
            </Link>
          </div>

          {productsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products?.map((product) => (
                <Link key={product.id} href={`/product/${product.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      {product.image && (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-40 object-cover rounded-md mb-4"
                        />
                      )}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{product.name}</CardTitle>
                          {product.manufacturer && (
                            <CardDescription>{product.manufacturer}</CardDescription>
                          )}
                        </div>
                        {product.requiresPrescription && (
                          <Badge variant="destructive" className="ml-2">
                            وصفة
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-emerald-600">
                            {product.price} JD
                          </p>
                          {product.rating && (
                            <div className="flex items-center gap-1 mt-2">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm text-gray-600">
                                {product.rating} ({product.reviewCount})
                              </span>
                            </div>
                          )}
                        </div>
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                          <ShoppingCart className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Doctors */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">الأطباء المميزون</h2>
            <Link href="/doctors">
              <Button variant="outline">عرض الكل</Button>
            </Link>
          </div>

          {doctorsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors?.map((doctor) => (
                <Link key={doctor.id} href={`/doctor/${doctor.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <CardTitle>{doctor.clinic}</CardTitle>
                          <Badge className="mt-2 bg-emerald-100 text-emerald-800">
                            {doctor.specialty}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">وقت الانتظار: {doctor.waitTime} دقيقة</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm">{doctor.clinicLocation}</span>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{doctor.rating}</span>
                            <span className="text-sm text-gray-600">({doctor.reviewCount})</span>
                          </div>
                          <p className="text-lg font-bold text-emerald-600">
                            {doctor.consultationFee} JD
                          </p>
                        </div>
                        <Button className="w-full bg-emerald-600 hover:bg-emerald-700 mt-4">
                          احجز موعد
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-emerald-600 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">ابدأ مع صيدليتنا اليوم</h2>
          <p className="text-lg mb-8 text-emerald-100">
            احصل على أفضل الأدوية والاستشارات الطبية بأسعار منافسة
          </p>
          {!isAuthenticated ? (
            <Button asChild size="lg" className="bg-white text-emerald-600 hover:bg-emerald-50">
              <a href={getLoginUrl()}>تسجيل الدخول الآن</a>
            </Button>
          ) : (
            <Link href="/products">
              <Button size="lg" className="bg-white text-emerald-600 hover:bg-emerald-50">
                تسوق الآن
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold mb-4">عن صيدليتنا</h3>
              <p className="text-sm">
                صيدليتك الموثوقة للحصول على الأدوية والاستشارات الطبية أونلاين
              </p>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">الخدمات</h3>
              <ul className="text-sm space-y-2">
                <li><Link href="/products">الأدوية</Link></li>
                <li><Link href="/doctors">الأطباء</Link></li>
                <li><Link href="/reminders">التذكيرات</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">المساعدة</h3>
              <ul className="text-sm space-y-2">
                <li><a href="#">الأسئلة الشائعة</a></li>
                <li><a href="#">اتصل بنا</a></li>
                <li><a href="#">الشروط والأحكام</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">تابعنا</h3>
              <ul className="text-sm space-y-2">
                <li><a href="#">فيسبوك</a></li>
                <li><a href="#">تويتر</a></li>
                <li><a href="#">إنستجرام</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2025 GO Pharmacy. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
