import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, ArrowLeft, ShoppingCart, Home, Users, Calendar, Pill, Star, Clock } from "lucide-react";
import { trpc } from "@/lib/trpc";

const SPECIALTIES = [
  { value: "all", label: "جميع التخصصات" },
  { value: "dentistry", label: "طب الأسنان" },
  { value: "dermatology", label: "الجلدية" },
  { value: "orthopedics", label: "العظام" },
  { value: "pediatrics", label: "الأطفال" },
  { value: "internal_medicine", label: "الباطنية" },
  { value: "cardiology", label: "القلب" },
  { value: "neurology", label: "الأعصاب" },
  { value: "general_practice", label: "الطب العام" },
];

export default function Doctors() {
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("rating");

  // Fetch doctors
  const { data: doctors, isLoading } = trpc.doctors.list.useQuery({
    limit: 100,
    offset: 0,
  });

  const filteredDoctors = doctors?.filter((doctor) => {
    const matchesSearch = (doctor.clinic?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (doctor.qualifications?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
    const matchesSpecialty = selectedSpecialty === "all" || doctor.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  }) || [];

  const sortedDoctors = [...filteredDoctors].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return (Number(b.rating)) - (Number(a.rating));
      case "fee_low":
        return (Number(a.consultationFee)) - (Number(b.consultationFee));
      case "fee_high":
        return (Number(b.consultationFee)) - (Number(a.consultationFee));
      case "wait_time":
        return (Number(a.waitTime)) - (Number(b.waitTime));
      default:
        return 0;
    }
  });

  return (
    <div className="app-container">
      {/* Header */}
      <div className="app-header sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4 text-[#00c57d] hover:bg-green-50">
              <ArrowLeft className="w-4 h-4 mr-2" />
              العودة
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">الأطباء المتخصصون</h1>

          {/* Search and Filters */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="ابحث عن طبيب أو عيادة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 rounded-full bg-gray-100 border-0 text-right"
              />
              <Button size="icon" className="rounded-full bg-[#00c57d] hover:bg-[#00a86a]">
                <Search className="w-5 h-5" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                <SelectTrigger className="text-right bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SPECIALTIES.map((spec) => (
                    <SelectItem key={spec.value} value={spec.value}>
                      {spec.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="text-right bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">التقييم: الأعلى أولاً</SelectItem>
                  <SelectItem value="fee_low">السعر: الأقل أولاً</SelectItem>
                  <SelectItem value="fee_high">السعر: الأعلى أولاً</SelectItem>
                  <SelectItem value="wait_time">وقت الانتظار: الأقل أولاً</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Doctors List */}
      <div className="app-content pb-24">
        <div className="container mx-auto px-4 py-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#00c57d]" />
            </div>
          ) : sortedDoctors.length > 0 ? (
            <div className="space-y-3">
              {sortedDoctors.map((doctor) => (
                <Card key={doctor.id} className="hover:shadow-lg transition-shadow border border-gray-200 rounded-lg overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Doctor Avatar */}
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#00c57d] to-[#00a86a] rounded-full flex items-center justify-center">
                          <Users className="text-white" size={32} />
                        </div>
                      </div>

                      {/* Doctor Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-base">{doctor.clinic}</h3>
                        <p className="text-sm text-gray-600 mb-2">{doctor.qualifications}</p>

                        {/* Rating and Stats */}
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          <div className="flex items-center gap-1 text-yellow-500">
                            <Star size={16} fill="currentColor" />
                            <span className="font-bold text-sm">{doctor.rating}</span>
                            <span className="text-gray-600 text-xs">({doctor.reviewCount})</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-600 text-xs">
                            <Clock size={14} />
                            <span>{doctor.waitTime} دقيقة</span>
                          </div>
                          <span className="text-[#00c57d] font-bold text-sm">${doctor.consultationFee}</span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Link href={`/appointments?doctorId=${doctor.id}`}>
                            <Button className="flex-1 bg-[#00c57d] hover:bg-[#00a86a] text-white h-8 text-sm">
                              احجز موعد
                            </Button>
                          </Link>
                          <Button variant="outline" className="flex-1 h-8 text-sm border-[#00c57d] text-[#00c57d] hover:bg-green-50">
                            استشارة
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg font-semibold">لم يتم العثور على أطباء</p>
              <p className="text-gray-500 text-sm mt-2">جرب البحث عن تخصص آخر أو غير المعايير</p>
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
          <div className="app-nav-item active">
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
