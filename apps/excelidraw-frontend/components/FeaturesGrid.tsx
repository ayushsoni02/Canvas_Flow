"use client";

import { motion } from "framer-motion";
import { Zap, Settings2, Lock } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Real-time Sync",
    description:
      "Ultra-low latency WebSockets ensure every stroke appears instantly across all connected clients. No lag, no conflicts.",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: Settings2,
    title: "Custom Engine",
    description:
      "Built from scratch without heavy Canvas API dependencies. Lightweight, fast, and fully customizable rendering.",
    gradient: "from-violet-500 to-indigo-500",
  },
  {
    icon: Lock,
    title: "Privacy First",
    description:
      "Persistent rooms with secure JWT authentication. Your data stays protected with end-to-end encryption.",
    gradient: "from-emerald-500 to-teal-500",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
    },
  },
};

export function FeaturesGrid() {
  return (
    <section id="features" className="py-24 sm:py-32 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Built for Performance
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Every component is engineered for speed and reliability, giving your
            team the best collaborative experience.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group relative p-6 sm:p-8 rounded-2xl glass-card hover:border-slate-700 transition-all duration-300"
            >
              {/* Icon */}
              <div
                className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} mb-6 shadow-lg`}
              >
                <feature.icon className="w-6 h-6 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-slate-400 leading-relaxed">
                {feature.description}
              </p>

              {/* Subtle hover glow */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-violet-500/5 via-transparent to-indigo-500/5" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
