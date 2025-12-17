import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, ShoppingCart, Star, ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";

const CATEGORIES = [
  { value: "medications", label: "الأدوية" },
  { value: "medical_supplies", label: "المستلزمات الطبية" },
  { value: "natural_products", label: "المنتجات الطبيعية" },
  { value: "skincare", label: "العناية بالبشرة" },
  { value: "baby_care", label: "العناية بالأطفال" },
  { value: "pet_care", label: "العناية بالحيوانات" },
];

export default function Products() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split("?")[1] || "");
  const initialSearch = searchParams.get("search") || "";

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [offset, setOffset] = useState(0);

  // Fetch products
  const { data: products, isLoading } = trpc.products.list.useQuery({
    limit: 12,
    offset,
  });

  // Search products
  const { data: searchResults, isLoading: searchLoading } = trpc.products.search.useQuery(
    { query: searchQuery, limit: 12 },
    { enabled: searchQuery.length > 0 }
  );

  // Filter by category
  const { data: categoryProducts, isLoading: categoryLoading } = trpc.products.byCategory.useQuery(
    { category: selectedCategory, limit: 12, offset },
    { enabled: selectedCategory.length > 0 }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setOffset(0);
  };

  const displayProducts = searchQuery.length > 0 ? searchResults : selectedCategory ? categoryProducts : products;
  const isLoadingData = searchQuery.length > 0 ? searchLoading : selectedCategory ? categoryLoading : isLoading;

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
          <h1 className="text-3xl font-bold text-gray-900">الأدوية والمنتجات</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-20">
              <h2 className="text-lg font-bold mb-6">التصفية</h2>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  البحث
                </label>
                <form onSubmit={handleSearch} className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="ابحث..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="text-right"
                  />
                  <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                    <Search className="w-4 h-4" />
                  </Button>
                </form>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الفئة
                </label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر فئة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">جميع الفئات</SelectItem>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters */}
              {(searchQuery || selectedCategory) && (
                <Button
                  variant="outline"
                  className="w-full mt-6"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("");
                    setOffset(0);
                  }}
                >
                  مسح الفلاتر
                </Button>
              )}
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {isLoadingData ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              </div>
            ) : displayProducts && displayProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {displayProducts.map((product) => (
                    <Link key={product.id} href={`/product/${product.id}`}>
                      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
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
                        <CardContent className="flex-1 flex flex-col justify-between">
                          {product.description && (
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                              {product.description}
                            </p>
                          )}
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

                {/* Pagination */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setOffset(Math.max(0, offset - 12))}
                    disabled={offset === 0}
                  >
                    السابق
                  </Button>
                  <span className="text-gray-600">
                    الصفحة {Math.floor(offset / 12) + 1}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setOffset(offset + 12)}
                    disabled={!displayProducts || displayProducts.length < 12}
                  >
                    التالي
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">لم يتم العثور على منتجات</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
