"use client";

import { useEffect, useRef } from "react";
import type {
  Map as LeafletMap,
  Marker,
  LayerGroup,
  Polyline,
} from "leaflet";
import "leaflet/dist/leaflet.css";
import type { ServiceCategory, Shop } from "@/lib/shops";

const COLOR: Record<ServiceCategory, string> = {
  mechanics: "var(--color-primary)",
  towing: "var(--color-chart-3)",
  rentals: "var(--color-accent)",
};

const GLYPH: Record<ServiceCategory, string> = {
  mechanics: "M",
  towing: "T",
  rentals: "R",
};

export function RescueMap({
  center,
  hasLocation,
  activeCategory,
}: {
  center: { lat: number; lng: number };
  hasLocation: boolean;
  activeCategory: ServiceCategory;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const layerRef = useRef<LayerGroup | null>(null);
  const routeLayerRef = useRef<LayerGroup | null>(null);
  const userMarkerRef = useRef<Marker | null>(null);

  // Keeps track of the latest center to avoid stale async renders.
  const centerRef = useRef(center);

  useEffect(() => {
    centerRef.current = center;
  }, [center]);

  /*
   * ---------------------------------------------------------
   * RECENTER MAP WHEN LOCATION CHANGES
   * ---------------------------------------------------------
   *
   * This is the important fix.
   *
   * When ResqApp gets the user's GPS coordinates, `center`
   * changes. We immediately move the existing Leaflet map
   * to those coordinates instead of waiting for provider
   * API loading to finish.
   */
useEffect(() => {
  const map = mapRef.current;

  if (!map) return;

  const lat = center.lat;
  const lng = center.lng;

  // Move the existing map to the new location
  map.flyTo(
    [lat, lng],
    hasLocation ? 15 : 13,
    {
      animate: true,
      duration: 0.25,
    },
  );

  // Move existing user marker without recreating it
  if (userMarkerRef.current) {
    userMarkerRef.current.setLatLng([lat, lng]);
  }
}, [center.lat, center.lng, hasLocation]);

  useEffect(() => {
    let cancelled = false;

    async function showRoute(
      L: any,
      map: LeafletMap,
      provider: Shop,
    ) {
      if (
        provider.lat === undefined ||
        provider.lng === undefined
      ) {
        return;
      }

      routeLayerRef.current?.clearLayers();

      try {
        // Always use the latest known location.
        const currentCenter = centerRef.current;

        const url =
          `https://router.project-osrm.org/route/v1/driving/` +
          `${currentCenter.lng},${currentCenter.lat};${provider.lng},${provider.lat}` +
          `?overview=full&geometries=geojson`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Route request failed");
        }

        const data = await response.json();

        if (
          !data.routes ||
          !data.routes.length ||
          !data.routes[0].geometry
        ) {
          throw new Error("No route found");
        }

        const route = data.routes[0];

        const coordinates = route.geometry.coordinates.map(
          ([lng, lat]: [number, number]) => [lat, lng],
        );

        const polyline: Polyline = L.polyline(
          coordinates,
          {
            color: "#2563eb",
            weight: 6,
            opacity: 0.85,
          },
        );

        if (!routeLayerRef.current) return;

        polyline.addTo(routeLayerRef.current);

        const distanceKm =
          route.distance / 1000;

        const durationMin =
          Math.round(route.duration / 60);

        L.popup()
          .setLatLng([
            provider.lat,
            provider.lng,
          ])
          .setContent(
            `
              <div style="min-width:180px">
                <strong>${provider.name}</strong>
                <br/>
                <span>
                  🚗 ${distanceKm.toFixed(1)} km
                </span>
                <br/>
                <span>
                  ⏱️ ${durationMin} min approx.
                </span>
              </div>
            `,
          )
          .openOn(map);

        map.fitBounds(
          polyline.getBounds(),
          {
            padding: [50, 50],
            animate: true,
          },
        );
      } catch (error) {
        console.error("Route error:", error);

        L.popup()
          .setLatLng([
            provider.lat,
            provider.lng,
          ])
          .setContent(
            `
              <strong>Route unavailable</strong>
              <br/>
              Please try again.
            `,
          )
          .openOn(map);
      }
    }

    async function render(L: any) {
      if (
        cancelled ||
        !mapRef.current ||
        !layerRef.current ||
        !routeLayerRef.current
      ) {
        return;
      }

      const map = mapRef.current;
      const layer = layerRef.current;

      layer.clearLayers();
      routeLayerRef.current.clearLayers();

      /*
       * Use the latest center instead of a possibly stale
       * center captured by an older async render.
       */
      const currentCenter = centerRef.current;

      // Remove old user marker.
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
      }

      // User location marker
      const ui = L.divIcon({
        className: "user-location-marker",
        html: `
          <div class="user-location-pulse">
            <div class="user-location-dot"></div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      userMarkerRef.current = L.marker(
        [
          currentCenter.lat,
          currentCenter.lng,
        ],
        {
          icon: ui,
          zIndexOffset: 1000,
        },
      )
        .addTo(map)
        .bindPopup(
          hasLocation
            ? "You are here"
            : "Approximate area",
        );

      // Get providers
      let providers: Shop[] = [];

      try {
        const r = await fetch(
          `/api/shops?lat=${currentCenter.lat}&lng=${currentCenter.lng}&category=${activeCategory}`,
          {
            cache: "no-store",
          },
        );

        if (r.ok) {
          providers =
            (await r.json()).providers || [];
        }
      } catch (error) {
        console.error(
          "Provider fetch error:",
          error,
        );
      }

      // If component was unmounted while waiting
      if (cancelled) return;

      // Provider markers
      providers.forEach((s) => {
        if (
          s.lat === undefined ||
          s.lng === undefined
        ) {
          return;
        }

        const icon = L.divIcon({
          className: "",
          html: `
            <div
              style="
                display:flex;
                align-items:center;
                justify-content:center;
                width:30px;
                height:30px;
                border-radius:9999px 9999px 9999px 2px;
                transform:rotate(-45deg);
                background:${COLOR[s.category]};
                color:white;
                font-weight:800;
                font-size:12px;
                border:2px solid white;
                box-shadow:0 2px 6px rgba(0,0,0,.3);
              "
            >
              <span style="transform:rotate(45deg)">
                ${GLYPH[s.category]}
              </span>
            </div>
          `,
          iconSize: [30, 30],
          iconAnchor: [15, 28],
        });

        const marker = L.marker(
          [s.lat, s.lng],
          { icon },
        ).addTo(layer);

        const distanceText =
          s.distanceKm !== undefined
            ? s.distanceKm < 0.1
              ? "<1"
              : s.distanceKm.toFixed(1)
            : "N/A";

        marker.bindPopup(`
          <div style="min-width:200px">
            <strong>${s.name}</strong>
            <br/>
            <span>${distanceText} km away</span>
            <br/>
            <button
              id="route-btn-${s.id}"
              style="
                margin-top:10px;
                width:100%;
                padding:8px 12px;
                border:none;
                border-radius:8px;
                background:#2563eb;
                color:white;
                font-weight:600;
                cursor:pointer;
              "
            >
              🗺️ Get Route
            </button>
          </div>
        `);

        marker.on("popupopen", () => {
          const button =
            document.getElementById(
              `route-btn-${s.id}`,
            );

          if (button) {
            button.onclick = () => {
              showRoute(
                L,
                map,
                s,
              );
            };
          }
        });
      });

      /*
       * Final safety recenter.
       *
       * Provider loading ke baad bhi map latest GPS
       * location par hi rahega.
       */
      // const latestCenter =
      //   centerRef.current;

      // map.setView(
      //   [
      //     latestCenter.lat,
      //     latestCenter.lng,
      //   ],
      //   hasLocation ? 14 : 13,
      //   {
      //     animate: true,
      //   },
      // );

      // if (userMarkerRef.current) {
      //   userMarkerRef.current.setLatLng([
      //     latestCenter.lat,
      //     latestCenter.lng,
      //   ]);
      // }
    }

    async function init() {
      const L = await import("leaflet");

      if (
        cancelled ||
        !containerRef.current ||
        mapRef.current
      ) {
        return;
      }

      const map = L.map(
        containerRef.current,
        {
          center: [
            centerRef.current.lat,
            centerRef.current.lng,
          ],
          zoom: 13,
        },
      );

      L.tileLayer(
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          maxZoom: 19,
          attribution:
            "&copy; OpenStreetMap contributors",
        },
      ).addTo(map);

      layerRef.current =
        L.layerGroup().addTo(map);

      routeLayerRef.current =
        L.layerGroup().addTo(map);

      mapRef.current = map;

      render(L);
    }

    if (mapRef.current) {
      import("leaflet").then(
        (L) => {
          render(L);
        },
      );
    } else {
      init();
    }

    return () => {
      cancelled = true;
    };
  }, [
    center.lat,
    center.lng,
    hasLocation,
    activeCategory,
  ]);

  // Cleanup Leaflet map
  useEffect(
    () => () => {
      mapRef.current?.remove();
      mapRef.current = null;
      userMarkerRef.current = null;
      layerRef.current = null;
      routeLayerRef.current = null;
    },
    [],
  );

  return (
    <div
      ref={containerRef}
      role="application"
      aria-label="Map of nearby emergency road services"
      className="h-full w-full"
    />
  );
}