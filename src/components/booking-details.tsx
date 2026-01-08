import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Car,
  Users,
  Luggage,
  Briefcase,
  MapPin,
  Calendar,
  AlertCircle,
  Check,
} from "lucide-react";

export function BookingDetails() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-4">
        <Button variant="link" className="text-[#006CE4] p-0">
          Back to Agent results
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Booking confirmation banner */}
          <div className="bg-[#E8F5E9] border border-[#4CAF50] rounded-lg p-4 flex items-center gap-3">
            <Check className="h-6 w-6 text-[#4CAF50]" />
            <div>
              <div className="font-semibold">
                Free cancellation up to 48 hours before pick-up
              </div>
            </div>
          </div>

          {/* Car details */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start gap-4 mb-4">
              <Badge className="bg-[#006CE4]">Top Pick</Badge>
            </div>

            <div className="flex gap-6">
              <div className="w-64">
                <img
                  src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop&q=80"
                  alt="Opel Astra"
                  className="w-full h-auto object-contain"
                />
              </div>

              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">
                  Opel Astra{" "}
                  <span className="text-base font-normal text-[#006CE4]">
                    or similar medium car
                  </span>
                </h2>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-gray-600" />
                    <span>5 seats</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Car className="h-5 w-5 text-gray-600" />
                    <span>Manual</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Luggage className="h-5 w-5 text-gray-600" />
                    <span>1 Large bag</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-gray-600" />
                    <span>1 Small bag</span>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 mt-0.5 text-gray-400" />
                    <span>Unlimited mileage</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-sm font-semibold text-[#006CE4] mb-1">
                    Humberto Delgado Airport
                  </div>
                  <div className="text-sm text-gray-600">Shuttle Bus</div>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Alamo_Rent_a_Car_logo.svg/120px-Alamo_Rent_a_Car_logo.svg.png"
                    alt="Alamo"
                    className="h-6"
                  />
                  <div className="flex items-center gap-2">
                    <div className="bg-[#003580] text-white px-2 py-1 rounded font-bold text-sm">
                      8.3
                    </div>
                    <div className="text-sm">
                      <div className="font-semibold">Very good</div>
                      <div className="text-gray-500">6304+ reviews</div>
                    </div>
                  </div>
                  <Button variant="link" className="text-[#006CE4] p-0 ml-auto">
                    Important info
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Great choice section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-bold mb-4">Great choice!</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-[#4CAF50] mt-0.5" />
                  <span className="text-sm">Customer rating 8/10</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-[#4CAF50] mt-0.5" />
                  <span className="text-sm">Easy to find counter</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-[#4CAF50] mt-0.5" />
                  <span className="text-sm">Well-maintained cars</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-[#4CAF50] mt-0.5" />
                  <span className="text-sm">Most popular fuel policy</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-[#4CAF50] mt-0.5" />
                  <span className="text-sm">Helpful counter staff</span>
                </div>
              </div>
            </div>
          </div>

          {/* Included in the price */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-bold mb-4">Included in the price</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-[#4CAF50] mt-0.5" />
                <div>
                  <div className="font-semibold">
                    Theft Protection (Waiver with ZAR 47,267 excess)
                  </div>
                  <div className="text-sm text-gray-600">
                    Help pay for the vehicle if it's stolen or damaged
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-[#4CAF50] mt-0.5" />
                <div>
                  <div className="font-semibold">
                    Collision Damage (Waiver with ZAR 47,267 excess)
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-[#4CAF50] mt-0.5" />
                <div>
                  <div className="font-semibold">Unlimited mileage</div>
                </div>
              </div>
            </div>
          </div>

          {/* Pick-up checklist */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-bold mb-4">Your pick-up checklist</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                <div className="text-sm font-semibold">Arrive on time</div>
              </div>
              <div className="text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                <div className="text-sm font-semibold">
                  What to bring with you
                </div>
              </div>
              <div className="text-center">
                <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                <div className="text-sm font-semibold">Refundable deposit</div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Price breakdown */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-4">
            <h3 className="text-lg font-bold mb-4">Pick-up and drop-off</h3>

            <div className="space-y-4 mb-6">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-[#006CE4] text-white flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">
                    Sun, 28 Dec · 10:00
                  </div>
                  <div className="text-sm text-[#006CE4] font-semibold">
                    Humberto Delgado Airport
                  </div>
                  <Button
                    variant="link"
                    className="text-[#006CE4] p-0 h-auto text-sm"
                  >
                    View pick-up instructions
                  </Button>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-[#006CE4] text-white flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">
                    Wed, 31 Dec · 10:00
                  </div>
                  <div className="text-sm text-[#006CE4] font-semibold">
                    Humberto Delgado Airport
                  </div>
                  <Button
                    variant="link"
                    className="text-[#006CE4] p-0 h-auto text-sm"
                  >
                    View drop-off instructions
                  </Button>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-bold mb-3">Car price breakdown</h4>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span>Car hire charge</span>
                  <span className="font-semibold">ZAR 1,362.71</span>
                </div>
                <div className="flex justify-between">
                  <span>Price for 3 days</span>
                  <span className="font-semibold">ZAR 1,362.71</span>
                </div>
              </div>

              <div className="bg-[#E3F2FD] p-4 rounded-lg mb-4">
                <div className="flex items-start gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-[#006CE4] mt-0.5" />
                  <div>
                    <div className="font-semibold text-sm">
                      Price for 3 days
                    </div>
                    <div className="text-sm">
                      At the time of rent, the average rent cost for this type
                      of vehicle in Humberto Delgado Airport was ZAR 1,362.71
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-bold">Total</span>
                  <span className="text-2xl font-bold">ZAR 1,363</span>
                </div>
              </div>

              <Button className="w-full bg-[#008009] hover:bg-[#006607] h-12 text-lg font-semibold">
                Go to website
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
