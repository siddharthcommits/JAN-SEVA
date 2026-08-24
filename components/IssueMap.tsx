"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Info, Crosshair, RefreshCcw } from "lucide-react";

type Props = {
  issues: any[];
};

export default function IssueMap({ issues }: Props) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapId] = useState(() => "map-" + Math.random().toString(36).substring(2, 9));

  // Map Initialization Effect
  useEffect(() => {
    if (!mapContainer.current) return;

    let timer: any;
    let mapInstance: any;

    const startMap = () => {
      const mapplsObj = (window as any).mappls;
      if (!mapplsObj || !mapplsObj.Map) {
        timer = setTimeout(startMap, 300);
        return;
      }

      try {
        if (!mapRef.current) {
          // Centering Logic (Unambiguous object format)
          let center = { lat: 28.6139, lng: 77.2090 };
          
          // Clear any ghost DOM elements from strict mode
          if (mapContainer.current) {
            mapContainer.current.innerHTML = "";
          }

          const map = new mapplsObj.Map(mapContainer.current, {
            center: center,
            zoom: 12,
            zoomControl: true,
          });

          mapRef.current = map;
          
          map.on("load", () => {
            setLoading(false);
            // Trigger multiple resize events to ensure the canvas fills the container
            const forceResize = () => {
              window.dispatchEvent(new Event('resize'));
              if (mapRef.current?.resize) mapRef.current.resize();
            };
            
            forceResize();
            setTimeout(forceResize, 100);
            setTimeout(forceResize, 500);
            setTimeout(forceResize, 1000);
            
            // Try to get user location after load
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition((pos) => {
                const { latitude, longitude } = pos.coords;
                map.setCenter({ lat: latitude, lng: longitude });
                map.setZoom(14);
              }, (err) => {
                console.warn("Location access denied", err);
              }, { enableHighAccuracy: true });
            }
          });
        }
      } catch (err: any) {
        console.error("Map startup failed:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    startMap();

    return () => {
      if (timer) clearTimeout(timer);
      if (mapRef.current) {
         // Some Mappls versions use remove(), some don't.
         // We'll safely null it so the next effect run can re-initialize it.
         mapRef.current = null;
      }
    };
  }, []); // Remove mapId dependency to prevent unnecessary re-runs

  // Marker Update Effect
  useEffect(() => {
    const mapplsObj = (window as any).mappls;
    if (!mapRef.current || !mapplsObj || loading) return;

    // Remove existing markers if any
    markersRef.current.forEach(m => {
      try {
        if (m.setMap) m.setMap(null);
        else if (m.remove) m.remove();
      } catch (e) {}
    });
    markersRef.current = [];

    // Also clear any legacy markers by class as a backup
    const legacyMarkers = document.querySelectorAll('.custom-marker, .mappls-marker-class');
    legacyMarkers.forEach(m => m.remove());

    issues.forEach((issue) => {
      if (issue.latitude && issue.longitude) {
        try {
          // Status color logic (matching reports page)
          let dotColor = "#01080bff"; // Default (Blue)
          const status = (issue.status || "").toLowerCase();
          
          if (status.includes("progress")) {
            dotColor = "#fb923c"; // In Progress (Orange)
          } else if (status.includes("resolved") || status.includes("verified") || status.includes("approved")) {
            dotColor = "#138808"; // Resolved (Green - India Green)
          } else if (status.includes("delayed") || status.includes("rejected")) {
            dotColor = "#ef4444"; // Delayed/Rejected (Red)
          }

          if (mapplsObj.Marker) {
            // Create a custom pin SVG as a string (Mappls V3 expects string for html property)
            // Using a proper pin shape instead of a dot
            const pinHtml = `
              <div class="custom-pin-marker" style="cursor: pointer; width: 34px; height: 42px; position: relative;">
                <div style="position: absolute; top: 0; left: 50%; transform: translateX(-50%) translateY(-100%);">
                  <svg width="34" height="42" viewBox="0 0 34 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17 0C7.61 0 0 7.61 0 17C0 29.75 17 42 17 42C17 42 34 29.75 34 17C34 7.61 26.39 0 17 0Z" fill="${dotColor}" stroke="white" stroke-width="2"/>
                    <circle cx="17" cy="17" r="6" fill="white"/>
                  </svg>
                  ${(status.includes('reported') || status.includes('pending') || status === 'filed') ? `
                    <div style="position: absolute; top: 0; left: 0; width: 34px; height: 34px; background: ${dotColor}; border-radius: 50%; z-index: -1; animation: marker-pulse 2s infinite; opacity: 0.5;"></div>
                  ` : ''}
                </div>
                <style>
                  @keyframes marker-pulse {
                    0% { transform: scale(1); opacity: 0.5; }
                    100% { transform: scale(2.5); opacity: 0; }
                  }
                  .custom-pin-marker:hover { filter: brightness(1.1) drop-shadow(0 0 8px ${dotColor}); }
                </style>
              </div>
            `;

            const marker = new mapplsObj.Marker({
              map: mapRef.current,
              position: { lat: issue.latitude, lng: issue.longitude },
              html: pinHtml,
              popupHtml: `
                <div style="padding: 16px; color: #1a1a1a; min-width: 240px; font-family: 'Inter', sans-serif; background: white; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                    <span style="font-size: 10px; font-weight: 800; color: ${dotColor}; text-transform: uppercase; letter-spacing: 0.1em; background: ${dotColor}15; padding: 3px 8px; border-radius: 6px; border: 1px solid ${dotColor}30;">${issue.category || 'General'}</span>
                    <span style="font-size: 9px; color: #999; font-weight: 600;">REPORT ID: ${issue.id.substring(0, 6)}</span>
                  </div>
                  <h4 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 800; line-height: 1.3; color: #000;">${issue.title}</h4>
                  <div style="display: flex; flex-direction: column; gap: 12px; border-top: 1px solid #f0f0f0; padding-top: 12px; margin-top: 4px;">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                      <div style="display: flex; flex-direction: column;">
                        <span style="font-size: 10px; color: #777; font-weight: 700; text-transform: uppercase;">Status</span>
                        <span style="font-size: 12px; font-weight: 800; color: ${dotColor}">${issue.status.replace('_', ' ')}</span>
                      </div>
                      <a href="/reports/${issue.id}" target="_blank" style="background: #000; color: #fff; text-decoration: none; font-size: 11px; font-weight: 800; padding: 8px 14px; border-radius: 8px; text-transform: uppercase; letter-spacing: 0.05em; transition: all 0.2s; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">Details</a>
                    </div>
                  </div>
                </div>
              `,
              popupOptions: {
                offset: [0, -40],
                maxWidth: "320px"
              }
            });

            markersRef.current.push(marker);
          }
        } catch (e) {
          console.error("Marker placement failed:", e);
        }
      }
    });

  }, [issues, loading]);

  return (
    <div className="relative w-full h-[75vh] rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl bg-zinc-900/50">
      {loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#38bdf8]"></div>
        </div>
      )}
      {/* Map Actions Overlay */}
      <div className="absolute top-6 right-6 flex flex-col gap-3 z-10">
        <button 
          onClick={() => {
            if (navigator.geolocation) {
               navigator.geolocation.getCurrentPosition((pos) => {
                 mapRef.current?.setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                 mapRef.current?.setZoom(14);
               });
            }
          }}
          className="p-3 bg-black/80 backdrop-blur-md border border-white/10 rounded-xl text-white hover:text-[#38bdf8] transition-all shadow-xl"
          title="Find My Location"
        >
          <Crosshair className="w-5 h-5" />
        </button>
        <button 
          onClick={() => {
            window.dispatchEvent(new Event('resize'));
            if (issues.length > 0) {
               const avgLat = issues.reduce((acc, i) => acc + i.latitude, 0) / issues.length;
               const avgLng = issues.reduce((acc, i) => acc + i.longitude, 0) / issues.length;
               mapRef.current?.setCenter({ lat: avgLat, lng: avgLng });
               mapRef.current?.setZoom(12);
            }
          }}
          className="p-3 bg-black/80 backdrop-blur-md border border-white/10 rounded-xl text-white hover:text-[#38bdf8] transition-all shadow-xl"
          title="Recenter and Fix View"
        >
          <RefreshCcw className="w-5 h-5" />
        </button>
      </div>

      <div ref={mapContainer} className="w-full h-full" id={mapId} />
      
      {/* Legend Overlay */}
      <div className="absolute bottom-6 left-6 p-4 bg-[#1a1a1a]/90 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl flex flex-col gap-3 min-w-[150px] z-10 font-mono">
        <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1 border-b border-white/10 pb-2">Status Key</h5>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-[#38bdf8]" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">Reported</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-[#fb923c]" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">Solving</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-[#138808]" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">Fixed</span>
        </div>
      </div>
    </div>
  );
}
