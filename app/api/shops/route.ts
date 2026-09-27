import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ShopModel } from "@/lib/models/Shop";
import { DEFAULT_CENTER, SHOPS } from "@/lib/shops";

type Category = "mechanics" | "towing" | "rentals";

function distanceKm(
  a: number,
  b: number,
  c: number,
  d: number,
) {
  const R = 6371;
  const p = Math.PI / 180;
  const x = (c - a) * p;
  const y = (d - b) * p;

  const q =
    Math.sin(x / 2) ** 2 +
    Math.cos(a * p) *
      Math.cos(c * p) *
      Math.sin(y / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(q));
}

function eta(km: number) {
  return km < 1
    ? "2–5 min"
    : `${Math.max(5, Math.round(km / 0.55))} min`;
}

async function osm(
  lat: number,
  lng: number,
  category: Category,
) {
  if (category === "rentals") return [];

  const kinds =
    category === "towing"
      ? "shop=towing"
      : "shop=car_repair";

  const query = `[out:json][timeout:8];(nwr[${kinds}](around:25000,${lat},${lng}););out center tags;`;

  const r = await fetch(
    "https://overpass-api.de/api/interpreter",
    {
      method: "POST",
      headers: {
        "content-type": "text/plain",
      },
      body: query,
      cache: "no-store",
    },
  );

  if (!r.ok) return [];

  const data = await r.json();

  return (data.elements || [])
    .slice(0, 20)
    .map((e: any) => ({
      id: `osm-${e.type}-${e.id}`,
      name:
        e.tags?.name ||
        (category === "towing"
          ? "Nearby towing service"
          : "Nearby car repair"),
      category,
      rating: 0,
      reviews: 0,
      phone:
        e.tags?.phone ||
        e.tags?.["contact:phone"] ||
        "",
      whatsapp: "",
      tags:
        category === "towing"
          ? ["Towing"]
          : ["Car repair"],
      lat: e.lat ?? e.center?.lat,
      lng: e.lon ?? e.center?.lng,
      address: [
        e.tags?.["addr:street"],
        e.tags?.["addr:city"],
      ]
        .filter(Boolean)
        .join(", "),
      verified: false,
      active: true,
      source: "openstreetmap",
      services: {
        vehicleRepair:
          category === "mechanics",
        emergencyAssistance: true,
      },
    }))
    .filter(
      (x: any) =>
        Number.isFinite(x.lat) &&
        Number.isFinite(x.lng),
    );
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const hasLat = searchParams.has("lat");
  const hasLng = searchParams.has("lng");

  const lat = hasLat
    ? Number(searchParams.get("lat"))
    : DEFAULT_CENTER.lat;

  const lng = hasLng
    ? Number(searchParams.get("lng"))
    : DEFAULT_CENTER.lng;

  const categoryParam =
    searchParams.get("category");

  const category =
    categoryParam as Category | null;

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    return NextResponse.json(
      {
        error: "Valid lat and lng are required",
      },
      { status: 400 },
    );
  }

  if (
    categoryParam &&
    ![
      "mechanics",
      "towing",
      "rentals",
    ].includes(categoryParam)
  ) {
    return NextResponse.json(
      { error: "Invalid category" },
      { status: 400 },
    );
  }

  try {
    let db: any[] = [];

    try {
      await connectDB();

      const filter: any = {
        active: true,
      };

      if (category) {
        filter.category = category;
      }

      /*
       * Vehicle Repair service control
       *
       * If a mechanics shop has disabled Vehicle Repair,
       * it should not be returned to customers.
       *
       * Missing service value is treated as enabled so
       * older shop records continue working normally.
       */
      if (category === "mechanics") {
        filter.$or = [
          {
            "services.vehicleRepair": true,
          },
          {
            "services.vehicleRepair": {
              $exists: false,
            },
          },
        ];
      }

      console.log("SHOP QUERY:", filter);

      const docs =
        await ShopModel.find(filter).lean();

      console.log(
        "SHOPS FROM DATABASE:",
        docs,
      );

      db = docs.map((s: any) => ({
        ...s,

        id: String(s._id),

        services: {
          vehicleRepair:
            s.services?.vehicleRepair ??
            true,

          emergencyAssistance:
            s.services?.emergencyAssistance ??
            true,
        },

        distanceKm: distanceKm(
          lat,
          lng,
          Number(s.lat),
          Number(s.lng),
        ),
      }));

      console.log(
        "PROCESSED SHOPS:",
        db,
      );
    } catch (error) {
      console.error(
        "SHOP DATABASE ERROR:",
        error,
      );
    }

    /*
     * Demo fallback
     */
    if (db.length === 0) {
      console.log(
        "DATABASE RETURNED 0 SHOPS",
      );

      db = SHOPS
        .filter(
          (s) =>
            !category ||
            s.category === category,
        )
        .map((s) => ({
          ...s,
          source: "demo",
          distanceKm: distanceKm(
            lat,
            lng,
            Number(s.lat),
            Number(s.lng),
          ),
        }));

      console.log(
        "DEMO SHOPS:",
        db,
      );
    }

    let providers = db;

    /*
     * OpenStreetMap fallback
     */
    if (
      category &&
      (db.length === 0 ||
        db.every(
          (s: any) =>
            s.distanceKm > 50,
        ))
    ) {
      try {
        const live = await osm(
          lat,
          lng,
          category,
        );

        providers = [
          ...live.map((s: any) => ({
            ...s,
            distanceKm: distanceKm(
              lat,
              lng,
              s.lat,
              s.lng,
            ),
          })),

          ...db.filter(
            (s: any) =>
              s.distanceKm <= 100,
          ),
        ].slice(0, 20);
      } catch {}
    }

    providers.sort(
      (a: any, b: any) =>
        a.distanceKm - b.distanceKm,
    );

    return NextResponse.json({
      providers: providers.map(
        (s: any) => ({
          ...s,
          eta: eta(s.distanceKm),
        }),
      ),

      source: providers.some(
        (s: any) =>
          s.source === "openstreetmap",
      )
        ? "openstreetmap"
        : providers.some(
              (s: any) =>
                s.source === "demo",
            )
          ? "demo"
          : "database",

      location: {
        lat,
        lng,
      },

      usingDefaultLocation:
        !hasLat && !hasLng,
    });
  } catch (e) {
    console.error(
      "Unable to load nearby services:",
      e,
    );

    return NextResponse.json(
      {
        error:
          "Unable to load nearby services",
      },
      { status: 500 },
    );
  }
}