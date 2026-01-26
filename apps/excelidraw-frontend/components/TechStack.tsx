"use client";

import { motion } from "framer-motion";

const technologies = [
  { name: "Next.js", icon: "▲" },
  { name: "Redis", icon: "◆" },
  { name: "WebSockets", icon: "⚡" },
  { name: "PostgreSQL", icon: "🐘" },
  { name: "Prisma", icon: "△" },
];

export function TechStack() {
  return (
    <section id="tech" className="py-16 border-t border-slate-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center"
        >
          <p className="text-sm text-slate-600 mb-6 uppercase tracking-wider">
            Powered by
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
            {technologies.map((tech, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                <span className="text-lg opacity-50">{tech.icon}</span>
                <span className="text-sm font-medium">{tech.name}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
