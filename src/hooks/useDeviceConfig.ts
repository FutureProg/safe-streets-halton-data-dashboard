import { useMediaQuery } from "./useMediaQuery";

/** What the device itself is like, as opposed to how big its screen is. */
export type DeviceConfig = {
  /** Touch is the main way of pointing, with no hover (phones and tablets). */
  isTouchDevice: boolean;
};

export function useDeviceConfig(): DeviceConfig {
  const isTouchDevice = useMediaQuery("(pointer: coarse) and (hover: none)");
  return { isTouchDevice };
}
