import React, { useEffect, useRef, useState } from "react";

type Props = {
  latitude: number;
  longitude: number;
  onChange?: (lat: number, lng: number) => void;
};

export default function MapPicker({ latitude, longitude, onChange }: Props) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!mapContainer.current) return;

    const initMap = () => {
      if (typeof window === "undefined") return;
      const mappls = (window as any).mappls;
      
      if (!mappls) {
        setTimeout(initMap, 500);
        return;
      }

      if (!mapRef.current) {
        try {
          const map = new mappls.Map(mapContainer.current, {
            center: [longitude, latitude],
            zoom: 15,
          });

          mapRef.current = map;
          setLoading(false);

          const marker = new mappls.Marker({
            map: map,
            position: { lat: latitude, lng: longitude },
            draggable: true,
          });

          marker.on("dragend", () => {
              const pos = marker.getPosition();
              onChange && onChange(pos.lat, pos.lng);
          });
          
          markerRef.current = marker;
        } catch (error) {
          console.error("MapPicker init error:", error);
          setLoading(false);
        }
      } else {
        mapRef.current.setCenter([longitude, latitude]);
        if (markerRef.current) markerRef.current.setPosition({ lat: latitude, lng: longitude });
      }
    };

    initMap();

    return () => {
      // Persistence handled by ref
    };
  }, [latitude, longitude, onChange]);

  return (
    <div className="relative w-full h-64 rounded-xl overflow-hidden border border-white/10 shadow-lg">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-sm">
           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#38bdf8]"></div>
        </div>
      )}
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}
