
// src/components/dashboard/tools/map-component.tsx
"use client"
import React, { useEffect, useRef, useState } from 'react';
import { Wrapper, Status } from "@googlemaps/react-wrapper";
import { Skeleton } from '@/components/ui/skeleton';

const Map = ({ center, zoom = 15, style, className }: { center: google.maps.LatLngLiteral, zoom?: number, style?: React.CSSProperties, className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map>();

  useEffect(() => {
    if (ref.current && !map) {
      setMap(new window.google.maps.Map(ref.current, {
        center,
        zoom,
        mapId: "DRISHTI_AI_MAP",
        disableDefaultUI: true,
      }));
    } else if (map) {
      map.setCenter(center);
    }
  }, [ref, map, center, zoom]);

  useEffect(() => {
    if (map) {
      // You can add markers or other map elements here
      new google.maps.marker.AdvancedMarkerElement({
        map,
        position: center,
      });
    }
  }, [map, center]);

  return <div ref={ref} style={style} className={className} />;
};

const render = (status: Status, props: { center: google.maps.LatLngLiteral }) => {
    switch (status) {
        case Status.LOADING:
            return <Skeleton className="w-full h-[250px]" />;
        case Status.FAILURE:
            return <div className="w-full h-[250px] bg-muted rounded-md flex items-center justify-center text-destructive-foreground">Failed to load map. Please check your API key.</div>;
        case Status.SUCCESS:
            return <Map center={props.center} style={{ width: '100%', height: '250px' }} className="rounded-md" />;
    }
};

export const MapComponent = ({ center }: { center: google.maps.LatLngLiteral }) => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
        return <div className="w-full h-[250px] bg-muted rounded-md flex items-center justify-center text-muted-foreground p-4 text-center">Google Maps API key is missing. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file.</div>
    }

    return (
        <Wrapper apiKey={apiKey} render={(status) => render(status, { center })}>
        </Wrapper>
    );
};
