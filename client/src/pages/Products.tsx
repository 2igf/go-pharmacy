import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, ArrowLeft, ShoppingCart, Home, Users, Calendar, Pill } from "lucide-react";
import { trpc } from "@/lib/trpc";

const CATEGORIES = [
  { value: "all", label: "جميع الفئات" },
  { value: "medications", label: "الأدوية" },
  { value: "natural", label: "منتجات طبيعية" },
  { value: "hair_care", label: "العناية بالشعر" },
  { value: "mother_baby", label: "الأم والطفل" },
  { value: "medical_supplies", label: "مستلزمات طبية" },
];

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Fetch products
  const { data: products, isLoading } = trpc.products.list.useQuery({
    limit: 100,
    offset: 0,
  });

  const filteredProducts = products?.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.manufacturer?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price_low":
        return (Number(a.price)) - (Number(b.price));
      case "price_high":
        return (Number(b.price)) - (Number(a.price));
      case "name":
        return (String(a.name)).localeCompare(String(b.name));
      default:
        return 0;
    }
  });

  return (
    <div className="app-container">
      {/* Header */}
      <div className="app-header">
        <div className="container mx-auto px-4 py-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              العودة
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">الأدوية والمنتجات</h1>

          {/* Search and Filters */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="ابحث عن أدوية..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 rounded-full bg-gray-100 border-0 text-right"
              />
              <Button size="icon" className="rounded-full bg-[#0cc46a] hover:bg-[#09a855]">
                <Search className="w-5 h-5" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="text-right">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="text-right">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">الأحدث</SelectItem>
                  <SelectItem value="price_low">السعر: الأقل أولاً</SelectItem>
                  <SelectItem value="price_high">السعر: الأعلى أولاً</SelectItem>
                  <SelectItem value="name">الاسم: أ-ي</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="app-content">
        <div className="container mx-auto px-4 py-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#0cc46a]" />
            </div>
          ) : sortedProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {sortedProducts.map((product) => (
                <Card key={product.id} className="hover:shadow-lg transition-shadow h-full flex flex-col">
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
                    {product.category && (
                      <Badge variant="outline" className="mb-2 w-fit text-xs">
                        {product.category}
                      </Badge>
                    )}
                    <div className="flex items-center justify-between mt-auto mb-3">
                      <span className="text-lg font-bold text-[#0cc46a]">{product.price} JD</span>
                      {product.requiresPrescription && (
                        <Badge variant="destructive" className="text-xs">
                          وصفة
                        </Badge>
                      )}
                    </div>
                    <Button className="w-full bg-[#0cc46a] hover:bg-[#09a855] text-white">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      أضف للسلة
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">لم يتم العثور على منتجات</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="app-bottom-nav">
        <Link href="/">
          <div className="app-nav-item">
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
          <div className="app-nav-item">
            <ShoppingCart className="w-6 h-6" />
            <span className="text-xs">السلة</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
