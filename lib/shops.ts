export type ServiceCategory = "mechanics" | "towing" | "rentals";
export type Shop = {
  id: string
  name: string
  category: ServiceCategory
  rating: number
  reviews: number
  phone: string
  whatsapp: string
  open?: boolean
  eta: string
  tags: string[]
  lat?: number
  lng?: number
  address?: string
  verified?: boolean
  distanceKm?: number
  source?: string
  offset?: { north: number; east: number }

  services?: {
    vehicleRepair?: boolean
    emergencyAssistance?: boolean
  }
}
export const CATEGORY_LABELS: Record<ServiceCategory, string> = {
  mechanics: "Mechanics & Garages",
  towing: "Towing Services",
  rentals: "Emergency Rental Cars",
};
export const SHOPS: Shop[] = [
  {
    id: "m1",
    name: "ResQ Highway Auto Care",
    category: "mechanics",
    rating: 4.8,
    reviews: 214,
    phone: "+919876543210",
    whatsapp: "919876543210",
    open: true,
    eta: "",
    tags: ["Engine", "Battery", "Tyres"],
    lat: 28.166,
    lng: 77.668,
  },
  {
    id: "m2",
    name: "24x7 Mobile Auto Works",
    category: "mechanics",
    rating: 4.6,
    reviews: 158,
    phone: "+919812345670",
    whatsapp: "919812345670",
    open: true,
    eta: "",
    tags: ["Diagnostics", "Brakes"],
    lat: 28.173,
    lng: 77.681,
  },
  {
    id: "t1",
    name: "ResQ Heavy Towing",
    category: "towing",
    rating: 4.7,
    reviews: 341,
    phone: "+918765432109",
    whatsapp: "918765432109",
    open: true,
    eta: "",
    tags: ["Flatbed", "Heavy duty"],
    lat: 28.151,
    lng: 77.649,
  },
  {
    id: "t2",
    name: "Highway Recovery 24x7",
    category: "towing",
    rating: 4.5,
    reviews: 187,
    phone: "+918790654321",
    whatsapp: "918790654321",
    open: true,
    eta: "",
    tags: ["Winch out", "Accident"],
    lat: 28.182,
    lng: 77.662,
  },
  {
    id: "r1",
    name: "ResQ Emergency Rentals",
    category: "rentals",
    rating: 4.6,
    reviews: 129,
    phone: "+919765432108",
    whatsapp: "919765432108",
    open: true,
    eta: "",
    tags: ["Instant pickup", "SUV"],
    lat: 28.16,
    lng: 77.675,
  },
];
export const DEFAULT_CENTER = { lat: 26.4499, lng: 80.3319 };
export function distanceKm(offset: { north: number; east: number }) {
  return Math.sqrt(offset.north ** 2 + offset.east ** 2);
}
