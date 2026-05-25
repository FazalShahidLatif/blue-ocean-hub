import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { FAQItem } from "../data/faqs";

interface FAQSectionProps {
  items: FAQItem[];
  title?: string;
  subtitle?: string;
  className?: string;
}

export default function FAQSection({
  items,
  title = "Frequently Asked Questions",
  subtitle = "Strategic answers to standard financial, regulatory, and growth questions.",
  className = "",
}: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleIndex = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className={`py-16 border-t border-ocean-800 ${className}`} id="faq">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan/10 rounded-full border border-cyan/20 text-cyan text-xs font-semibold uppercase tracking-widest mb-4">
            <HelpCircle className="w-3.5 h-3.5" />
            Knowledge Base
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-none mb-4">
            {title}
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        <div className="space-y-4">
          {items.map((item, idx) => {
            const isOpen = openIndex === idx;

            // Generate unique IDs for accessibility
            const buttonId = `faq-btn-${idx}`;
            const panelId = `faq-panel-${idx}`;

            return (
              <div
                key={idx}
                className="rounded-2xl bg-ocean-900/60 border border-ocean-800 transition-all hover:bg-ocean-900 overflow-hidden"
              >
                <button
                  id={buttonId}
                  onClick={() => toggleIndex(idx)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  className="w-full flex items-center justify-between p-6 text-left group transition-colors"
                >
                  <span className="font-bold text-white text-md md:text-lg tracking-tight group-hover:text-cyan transition-colors pr-4">
                    {item.question}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full bg-ocean-800 flex items-center justify-center border border-ocean-700/50 text-slate-400 group-hover:text-cyan group-hover:border-cyan/30 transition-all shrink-0 ${
                      isOpen ? "rotate-180 bg-cyan/10 border-cyan/20 text-cyan" : ""
                    }`}
                  >
                    <ChevronDown className="w-4 h-4 transition-transform duration-300" />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-6 pt-1 text-slate-300 leading-relaxed text-sm md:text-base border-t border-ocean-800/10">
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
