import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, Star, Clock, MapPin, ArrowLeft, Calendar, MessageSquare } from "lucide-react";
import { trpc } from "@/lib/trpc";

const SPECIALTIES = [
  { value: "dermatology", label: "الجلدية" },
  { value: "dentistry", label: "طب الأسنان" },
  { value: "orthopedics", label: "العظام" },
  { value: "pediatrics", label: "طب الأطفال" },
  { value: "internal_medicine", label: "الطب الباطني" },
  { value: "cardiology", label: "أمراض القلب" },
  { value: "neurology", label: "الأعصاب" },
  { value: "general_practice", label: "الطب العام" },
];

export default function Doctors() {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [offset, setOffset] = useState(0);

  // Fetch doctors
  const { data: doctors, isLoading } = trpc.doctors.list.useQuery({
    limit: 12,
    offset,
  });

  // Filter by specialty
  const { data: specialtyDoctors, isLoading: specialtyLoading } = trpc.doctors.bySpecialty.useQuery(
    { specialty: selectedSpecialty, limit: 12, offset },
    { enabled: selectedSpecialty.length > 0 }
  );

  const displayDoctors = selectedSpecialty ? specialtyDoctors : doctors;
  const isLoadingData = selectedSpecialty ? specialtyLoading : isLoading;

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
          <h1 className="text-3xl font-bold text-gray-900">الأطباء المتخصصون</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-20">
              <h2 className="text-lg font-bold mb-6">البحث والتصفية</h2>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  البحث عن طبيب
                </label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="ابحث..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="text-right"
                  />
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Specialty Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  التخصص
                </label>
                <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر تخصص" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">جميع التخصصات</SelectItem>
                    {SPECIALTIES.map((spec) => (
                      <SelectItem key={spec.value} value={spec.value}>
                        {spec.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters */}
              {selectedSpecialty && (
                <Button
                  variant="outline"
                  className="w-full mt-6"
                  onClick={() => {
                    setSelectedSpecialty("");
                    setOffset(0);
                  }}
                >
                  مسح الفلاتر
                </Button>
              )}
            </div>
          </div>

          {/* Doctors Grid */}
          <div className="lg:col-span-3">
            {isLoadingData ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              </div>
            ) : displayDoctors && displayDoctors.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {displayDoctors.map((doctor) => (
                    <Link key={doctor.id} href={`/doctor/${doctor.id}`}>
                      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
                        <CardHeader>
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <CardTitle className="text-xl">{doctor.clinic}</CardTitle>
                              <Badge className="mt-2 bg-emerald-100 text-emerald-800">
                                {SPECIALTIES.find(s => s.value === doctor.specialty)?.label || doctor.specialty}
                              </Badge>
                            </div>
                          </div>
                          {doctor.qualifications && (
                            <CardDescription className="text-sm">
                              {doctor.qualifications}
                            </CardDescription>
                          )}
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col justify-between space-y-4">
                          {/* Info */}
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Clock className="w-4 h-4 flex-shrink-0" />
                              <span className="text-sm">وقت الانتظار: {doctor.waitTime} دقيقة</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <MapPin className="w-4 h-4 flex-shrink-0" />
                              <span className="text-sm line-clamp-1">{doctor.clinicLocation}</span>
                            </div>
                            {doctor.bio && (
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {doctor.bio}
                              </p>
                            )}
                          </div>

                          {/* Rating and Price */}
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

                          {/* Action Buttons */}
                          <div className="flex gap-2 pt-2">
                            <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                              <Calendar className="w-4 h-4 mr-2" />
                              احجز موعد
                            </Button>
                            <Button variant="outline" className="flex-1">
                              <MessageSquare className="w-4 h-4 mr-2" />
                              استشارة
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
                    disabled={!displayDoctors || displayDoctors.length < 12}
                  >
                    التالي
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">لم يتم العثور على أطباء</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
