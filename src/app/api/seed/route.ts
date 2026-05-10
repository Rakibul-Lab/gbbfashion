import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

const products = [
  {
    name: 'AI Diagnostic Scanner Pro',
    description: 'Advanced handheld diagnostic tool powered by neural AI. Identifies mechanical issues before they become critical with 99.7% accuracy.',
    price: 2499,
    category: 'diagnostics',
    image: '/products/ai-diagnostic-scanner.png',
    features: 'Real-time AI diagnostics|Holographic display|Wireless connectivity|Pattern recognition engine',
    rating: 4.8,
    inStock: true,
    badge: 'Best Seller',
  },
  {
    name: 'PredictFlow Engine',
    description: 'Enterprise-grade predictive maintenance engine that learns your equipment patterns and forecasts failures weeks in advance.',
    price: 4799,
    category: 'predictive',
    image: '/products/predictflow-engine.png',
    features: 'Machine learning predictions|Real-time monitoring|Auto-scheduling|Multi-system integration',
    rating: 4.9,
    inStock: true,
    badge: 'New',
  },
  {
    name: 'SmartSensor Hub X1',
    description: 'Compact sensor hub that connects up to 128 IoT sensors for comprehensive equipment health monitoring.',
    price: 1299,
    category: 'monitoring',
    image: '/products/smartsensor-hub.png',
    features: '24/7 monitoring|IoT mesh support|Mobile alerts|Cloud analytics',
    rating: 4.6,
    inStock: true,
    badge: 'New',
  },
  {
    name: 'RoboMaint Arm S5',
    description: 'Industrial robotic arm with AI-guided precision for automated repair and maintenance tasks in hazardous environments.',
    price: 8999,
    category: 'robotic',
    image: '/products/robomaint-arm.png',
    features: '6-axis precision|AI-guided repairs|Remote operation|Self-calibrating',
    rating: 4.9,
    inStock: true,
    badge: 'Premium',
  },
  {
    name: 'Neural Analytics Platform',
    description: 'Comprehensive analytics platform that transforms raw maintenance data into actionable insights using deep neural networks.',
    price: 3599,
    category: 'analytics',
    image: '/products/neural-analytics.png',
    features: 'Deep learning models|Custom dashboards|Report generation|API access',
    rating: 4.7,
    inStock: true,
    badge: 'Popular',
  },
  {
    name: 'AI Vision Inspector',
    description: 'High-resolution AI camera system that detects micro-defects invisible to the human eye with sub-millimeter precision.',
    price: 2899,
    category: 'diagnostics',
    image: '/products/ai-vision-inspector.png',
    features: '4K visual inspection|Defect detection|OCR capability|Edge computing',
    rating: 4.5,
    inStock: true,
    badge: 'New',
  },
  {
    name: 'PredictGuard Shield',
    description: 'Advanced safety system that predicts equipment failures and automatically initiates protection protocols to prevent accidents.',
    price: 5499,
    category: 'predictive',
    image: '/products/predictguard-shield.png',
    features: 'Failure prediction|Risk scoring|Safety compliance|Emergency protocols',
    rating: 4.8,
    inStock: true,
    badge: 'Premium',
  },
  {
    name: 'SensorNet Mesh Pro',
    description: 'Industrial-grade mesh network system with self-healing capabilities for reliable sensor data transmission in any environment.',
    price: 1799,
    category: 'monitoring',
    image: '/products/sensornet-mesh.png',
    features: '256-node mesh|Self-healing network|Ultra-low latency|IP67 rated',
    rating: 4.6,
    inStock: true,
    badge: null,
  },
  {
    name: 'AutoFix Drone V2',
    description: 'Autonomous maintenance drone that performs visual inspections and minor repairs in hard-to-reach areas with GPS precision.',
    price: 6299,
    category: 'robotic',
    image: '/products/autofix-drone.png',
    features: 'Autonomous flight|Repair tools|Visual inspection|GPS precision',
    rating: 4.7,
    inStock: true,
    badge: 'Best Seller',
  },
  {
    name: 'DeepMetrics Engine',
    description: 'High-performance analytics engine that processes millions of data points per second for real-time maintenance optimization.',
    price: 4199,
    category: 'analytics',
    image: '/products/deepmetrics-engine.png',
    features: 'Real-time processing|Anomaly detection|Trend analysis|ML pipelines',
    rating: 4.8,
    inStock: true,
    badge: 'Premium',
  },
  {
    name: 'ThermalAI Scanner',
    description: 'Professional thermal imaging scanner with AI-powered anomaly detection for identifying overheating components and insulation failures.',
    price: 3299,
    category: 'diagnostics',
    image: '/products/thermalai-scanner.png',
    features: 'Thermal imaging|Heat mapping|AI anomaly detection|Reporting suite',
    rating: 4.5,
    inStock: true,
    badge: 'Popular',
  },
  {
    name: 'MaintenanceOS Cloud',
    description: 'Cloud-based maintenance management platform with AI recommendations, team collaboration tools, and 100+ integrations.',
    price: 999,
    category: 'analytics',
    image: '/products/maintenanceos-cloud.png',
    features: 'Cloud platform|Team collaboration|Mobile app|Integration hub',
    rating: 4.4,
    inStock: true,
    badge: 'SaaS',
  },
]

export async function POST() {
  try {
    // Check if products already exist
    const existing = await db.product.count()
    if (existing > 0) {
      return NextResponse.json({ message: 'Database already seeded', count: existing })
    }

    const created = await db.product.createMany({ data: products })
    return NextResponse.json({ message: 'Database seeded successfully', count: created.count })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 })
  }
}
