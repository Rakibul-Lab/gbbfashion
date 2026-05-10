'use client'

import { motion } from 'framer-motion'
import { Truck, ShieldCheck, Tag, Headphones } from 'lucide-react'

const features = [
  {
    icon: Truck,
    title: 'Nationwide Shipping',
    description: 'We ship across the country. Orders processed within 1-2 business days.',
  },
  {
    icon: ShieldCheck,
    title: 'Money Back Guarantee',
    description: 'Not satisfied? Contact us within 7 days for a full refund.',
  },
  {
    icon: Tag,
    title: 'Exclusive Offers',
    description: 'Save big with our deals and limited-time discounts on AI solutions.',
  },
  {
    icon: Headphones,
    title: '24/7 Expert Support',
    description: 'Our team is here for you anytime, day or night.',
  },
]

export function TrustBar() {
  return (
    <section className="py-10 sm:py-14 bg-white border-t border-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className="flex flex-col items-center text-center"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-teal-600 mb-3">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1">{feature.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-[200px]">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
