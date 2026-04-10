"use client";

import { useState, useEffect, useCallback } from "react";

import {
  createCustomLocation,
  deleteCustomLocation,
  updateCustomLocation,
  updateLocationSelections,
} from "@/entities/location/actions";
import { fetchLocations } from "@/entities/location/query";

import type { CustomLocationItem, LocationItem } from "@/entities/location/schema";

function useLocationState(roomCode: string, isOpen: boolean) {
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [customLocations, setCustomLocations] = useState<CustomLocationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadLocations = useCallback(async () => {
    const data = await fetchLocations(roomCode);
    if (data) {
      setLocations(data.locations);
      setCustomLocations(data.customLocations);
    }
    setIsLoading(false);
  }, [roomCode]);

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- legitimate data fetch on dialog open
      void loadLocations();
    }
  }, [isOpen, loadLocations]);

  return {
    locations,
    setLocations,
    customLocations,
    setCustomLocations,
    isLoading,
    refetch: loadLocations,
  };
}

function useBuiltInLocationActions(
  setLocations: React.Dispatch<React.SetStateAction<LocationItem[]>>,
) {
  const toggleLocation = useCallback(
    (locationId: string) => {
      setLocations((previous) =>
        previous.map((loc) => (loc.id === locationId ? { ...loc, selected: !loc.selected } : loc)),
      );
    },
    [setLocations],
  );

  const selectAllCategory = useCallback(
    (category: string) => {
      setLocations((previous) =>
        previous.map((loc) => (loc.category === category ? { ...loc, selected: true } : loc)),
      );
    },
    [setLocations],
  );

  const deselectAllCategory = useCallback(
    (category: string) => {
      setLocations((previous) =>
        previous.map((loc) => (loc.category === category ? { ...loc, selected: false } : loc)),
      );
    },
    [setLocations],
  );

  return { toggleLocation, selectAllCategory, deselectAllCategory };
}

function useCustomLocationActions(
  roomCode: string,
  playerId: string,
  setCustomLocations: React.Dispatch<React.SetStateAction<CustomLocationItem[]>>,
) {
  const saveCustomLocation = useCallback(
    async (input: { id?: string; name: string; roles: string[]; allSpies: boolean }) => {
      if (input.id) {
        const result = await updateCustomLocation({
          code: roomCode,
          playerId,
          locationId: input.id,
          name: input.name,
          roles: input.roles,
          allSpies: input.allSpies,
        });
        if (result.success) {
          setCustomLocations((previous) =>
            previous.map((location) =>
              location.id === input.id
                ? {
                    ...location,
                    name: input.name,
                    allSpies: input.allSpies,
                    roles: input.roles.map((role, index) => ({
                      id: `${input.id}-role-${index}`,
                      name: role,
                    })),
                  }
                : location,
            ),
          );
          return true;
        }
        return false;
      }

      const result = await createCustomLocation({
        code: roomCode,
        playerId,
        name: input.name,
        roles: input.roles,
        allSpies: input.allSpies,
      });
      if (result.success) {
        setCustomLocations((previous) => [...previous, result.data]);
        return true;
      }
      return false;
    },
    [roomCode, playerId, setCustomLocations],
  );

  const handleDeleteCustomLocation = useCallback(
    async (locationId: string) => {
      await deleteCustomLocation({ code: roomCode, playerId, locationId });
      setCustomLocations((previous) => previous.filter((cl) => cl.id !== locationId));
    },
    [roomCode, playerId, setCustomLocations],
  );

  const toggleCustomLocation = useCallback(
    (id: string, checked: boolean) => {
      setCustomLocations((previous) =>
        previous.map((c) => (c.id === id ? { ...c, selected: checked } : c)),
      );
    },
    [setCustomLocations],
  );

  return {
    toggleCustomLocation,
    deleteCustomLocation: handleDeleteCustomLocation,
    saveCustomLocation,
  };
}

export function useLocationData(
  roomCode: string,
  playerId: string,
  isOpen: boolean,
  onOpenChange: (open: boolean) => void,
) {
  const state = useLocationState(roomCode, isOpen);
  const builtIn = useBuiltInLocationActions(state.setLocations);
  const custom = useCustomLocationActions(roomCode, playerId, state.setCustomLocations);

  const saveSelections = useCallback(async () => {
    const selectedIds = state.locations.filter((l) => l.selected).map((l) => l.id);
    await updateLocationSelections({ code: roomCode, playerId, locationIds: selectedIds });
    for (const cl of state.customLocations) {
      await updateCustomLocation({
        code: roomCode,
        playerId,
        locationId: cl.id,
        selected: cl.selected,
      });
    }
    onOpenChange(false);
  }, [state.locations, state.customLocations, roomCode, playerId, onOpenChange]);

  const handleSave = useCallback(() => {
    void saveSelections();
  }, [saveSelections]);

  return {
    locations: state.locations,
    customLocations: state.customLocations,
    isLoading: state.isLoading,
    refetch: state.refetch,
    ...builtIn,
    ...custom,
    handleSave,
  };
}

export type LocationDataReturn = ReturnType<typeof useLocationData>;
