// hooks/useBusLocations.ts
import { useEffect, useState } from "react";
import {
  BusLocation,
  subscribeBusLocations,
} from "../services/busLocationService";

export const useBusLocations = () => {
  const [busLocations, setBusLocations] = useState<BusLocation[]>([]);

  useEffect(() => {
    let unsub: (() => void) | undefined;

    const init = async () => {
      unsub = await subscribeBusLocations((busLocation) => {
        console.log("New bus location received:", busLocation);

        setBusLocations((prev) => {
          const index = prev.findIndex(
            (b) => b.additional.bus_id === busLocation.additional.bus_id
          );
          if (index !== -1) {
            prev[index] = busLocation;
            return [...prev];
          }
          return [...prev, busLocation];
        });
      });
    };

    init();

    return () => {
      if (unsub) unsub();
    };
  }, []);

  return { busLocations };
};
