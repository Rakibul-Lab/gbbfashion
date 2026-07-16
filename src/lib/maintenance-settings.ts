/** Maintenance mode settings (client-safe) */

export type MaintenanceSettings = {
  enabled: boolean
  title: string
  message: string
  /** Optional return estimate shown on the page */
  eta: string
}

export const DEFAULT_MAINTENANCE: MaintenanceSettings = {
  enabled: false,
  title: "We'll be back soon",
  message:
    'GBB Fashion is undergoing scheduled maintenance to improve your shopping experience. Thank you for your patience.',
  eta: '',
}

export function normalizeMaintenanceSettings(value: unknown): MaintenanceSettings {
  const src =
    value && typeof value === 'object' ? (value as Partial<MaintenanceSettings>) : {}
  const str = (v: unknown, fallback: string) =>
    typeof v === 'string' ? v.trim() : fallback

  return {
    enabled: src.enabled === true,
    title: str(src.title, DEFAULT_MAINTENANCE.title) || DEFAULT_MAINTENANCE.title,
    message: str(src.message, DEFAULT_MAINTENANCE.message) || DEFAULT_MAINTENANCE.message,
    eta: typeof src.eta === 'string' ? src.eta.trim() : '',
  }
}
