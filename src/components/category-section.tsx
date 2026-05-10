'use client'

import { useStore } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { Activity, Shield, Wifi, Bot, BarChart3 } from 'lucide-react'

const categories = [
  {
    id: 'diagnostics',
    title: 'AI Diagnostics',
    description: 'Advanced scanning and inspection tools powered by artificial intelligence for precise fault detection.',
    icon: Activity,
    color: 'from-teal-500 to-teal-600',
    bgLight: 'bg-teal-50',
    textColor: 'text-teal-600',
    count: 3,
  },
  {
    id: 'predictive',
    title: 'Predictive Maintenance',
    description: 'Machine learning engines that forecast equipment failures and schedule preventive maintenance.',
    icon: Shield,
    color: 'from-emerald-500 to-emerald-600',
    bgLight: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    count: 2,
  },
  {
    id: 'monitoring',
    title: 'Smart Monitoring',
    description: 'IoT sensor networks and hubs providing real-time equipment health monitoring and instant alerts.',
    icon: Wifi,
    color: 'from-cyan-500 to-cyan-600',
    bgLight: 'bg-cyan-50',
    textColor: 'text-cyan-600',
    count: 2,
  },
  {
    id: 'robotic',
    title: 'Robotic Maintenance',
    description: 'Autonomous robots and drones performing repairs and inspections in hazardous environments.',
    icon: Bot,
    color: 'from-amber-500 to-amber-600',
    bgLight: 'bg-amber-50',
    textColor: 'text-amber-600',
    count: 2,
  },
  {
    id: 'analytics',
    title: 'AI Analytics',
    description: 'Deep learning platforms that transform raw data into actionable maintenance insights.',
    icon: BarChart3,
    color: 'from-violet-500 to-violet-600',
    bgLight: 'bg-violet-50',
    textColor: 'text-violet-600',
    count: 3,
  },
]

export function CategorySection() {
  const { setView, setCategoryFilter } = useStore()

  return (
    <section className="py-16 sm:py-20 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-bold text-slate-900"
          >
            Solutions by Category
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-3 text-lg text-slate-500 max-w-2xl mx-auto"
          >
            Explore our comprehensive suite of AI-powered maintenance tools across five key categories
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, index) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className="group rounded-xl border-slate-200 hover:shadow-xl hover:shadow-teal-500/5 transition-all duration-300 cursor-pointer h-full"
                onClick={() => {
                  setCategoryFilter(cat.id)
                  setView('shop')
                }}
              >
                <CardContent className="p-6">
                  <div className={`inline-flex items-center justify-center h-12 w-12 rounded-xl ${cat.bgLight} mb-4 group-hover:scale-110 transition-transform`}>
                    <cat.icon className={`h-6 w-6 ${cat.textColor}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{cat.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{cat.description}</p>
                  <div className="mt-4 flex items-center gap-2">
                    <span className={`text-sm font-medium ${cat.textColor}`}>{cat.count} Products</span>
                    <span className="text-slate-300">→</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
