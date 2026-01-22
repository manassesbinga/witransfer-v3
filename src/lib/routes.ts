export const ROUTES = {
  public: {
    home: "/",
    history: "/history",
    search: {
      rental: "/search/rental",
      transfer: "/search/transfer",
      carDetails: (id: string) => `/search/${id}`,
    },
    booking: {
      details: (id: string) => `/booking/${id}`,
      checkout: (id: string) => `/booking/checkout/${id}`,
    },
  },
  private: {
    portal: {
      dashboard: "/login",
      invite: "/login/invite",
    },
    admin: {
      dashboard: "/admin",
      audit: "/admin/audit",
      bookings: "/admin/bookings",
      cars: "/admin/cars",
      categories: "/admin/categories",
      partners: {
        list: "/admin/partners",
        details: (id: string) => `/admin/partners/${id}`,
      },
      roles: "/admin/roles",
      rules: "/admin/rules",
      settings: "/admin/settings",
      transfers: "/admin/transfers",
      users: "/admin/users",
    },
  },
} as const;

export const API_ROUTES = {
  admin: {
    fleetCars: "/api/admin/fleet-cars",
    invite: "/api/admin/invite",
    listingBookings: "/api/admin/listing-bookings",
    listingCategories: "/api/admin/listing-categories",
    listingPartners: "/api/admin/listing-partners",
    listingExtras: "/api/admin/listing-extras",
    login: "/api/admin/login",
    roles: "/api/admin/roles",
    stats: "/api/admin/stats",
    users: "/api/admin/users",
  },
  auth: {
    sendOtp: "/api/auth/send-otp",
  },
  bookings: "/api/bookings",
  calculate: "/api/calculate",
  drafts: "/api/drafts",
  search: {
    cars: "/api/search/cars",
    data: "/api/search/data",
  },
  sendEmail: "/api/send-email",
  test: "/api/test",
  transfers: "/api/transfers",
} as const;

export type AppRoutes = typeof ROUTES;
export type ApiRoutes = typeof API_ROUTES;
