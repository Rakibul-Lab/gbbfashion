// Shared constants for categories and sub-categories
// This file can be imported by both client and server code

export const subCategoryMap: Record<string, string> = {
  'AI Diagnostic Scanner Pro': 'handheld-scanners',
  'AI Vision Inspector': 'vision-systems',
  'ThermalAI Scanner': 'thermal-imaging',
  'PredictFlow Engine': 'prediction-engines',
  'PredictGuard Shield': 'safety-systems',
  'SmartSensor Hub X1': 'sensor-hubs',
  'SensorNet Mesh Pro': 'mesh-networks',
  'RoboMaint Arm S5': 'robotic-arms',
  'AutoFix Drone V2': 'maintenance-drones',
  'Neural Analytics Platform': 'analytics-platforms',
  'DeepMetrics Engine': 'analytics-platforms',
  'MaintenanceOS Cloud': 'cloud-solutions',
}

export const categorySubCategories: Record<string, { value: string; label: string }[]> = {
  diagnostics: [
    { value: 'handheld-scanners', label: 'Handheld Scanners' },
    { value: 'vision-systems', label: 'Vision Systems' },
    { value: 'thermal-imaging', label: 'Thermal Imaging' },
  ],
  predictive: [
    { value: 'prediction-engines', label: 'Prediction Engines' },
    { value: 'safety-systems', label: 'Safety Systems' },
  ],
  monitoring: [
    { value: 'sensor-hubs', label: 'Sensor Hubs' },
    { value: 'mesh-networks', label: 'Mesh Networks' },
  ],
  robotic: [
    { value: 'robotic-arms', label: 'Robotic Arms' },
    { value: 'maintenance-drones', label: 'Maintenance Drones' },
  ],
  analytics: [
    { value: 'analytics-platforms', label: 'Analytics Platforms' },
    { value: 'cloud-solutions', label: 'Cloud Solutions' },
  ],
}

export const primeDropBadges = ['Premium', 'Best Seller', 'Popular']
