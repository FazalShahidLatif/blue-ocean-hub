import { motion } from "motion/react";
import { Compass, Lightbulb, Zap, TrendingUp, Search, ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <div className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan/30 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 blur-[120px] rounded-full"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan/10 border border-cyan/20 text-cyan text-[10px] font-bold uppercase tracking-[0.2em] mb-8">
              <Zap className="w-3 h-3" />
              Empowering the South Asian professional
            </span>
            <h1 className="text-4xl md:text-8xl font-bold mb-8 leading-[1.05] tracking-tight">
              Strategic <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan">Intelligence</span> for the South Asian Founder
            </h1>
            <p className="text-xl md:text-2xl text-slate-400 mb-12 max-w-2xl mx-auto leading-[1.6]">
              A non-transactional financial publication providing institutional-grade research on income streams, PSX trends, and dollar-earning strategies for **educational purposes only**.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button 
                onClick={() => document.getElementById('intel-grid')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-primary flex items-center justify-center gap-3 !px-8 !py-4 font-bold uppercase tracking-widest text-sm shadow-2xl shadow-cyan/20"
              >
                Explore Insights
                <ArrowRight className="w-4 h-4" />
              </button>
              <button 
                onClick={() => document.getElementById('toolkit')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-outline flex items-center justify-center gap-3 !px-8 !py-4 font-bold uppercase tracking-widest text-sm"
              >
                <Search className="w-4 h-4" />
                Strategic Toolkit
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-ocean-800 pt-12"
          >
            {[
              { label: "Market Gaps", value: "850+", icon: Lightbulb },
              { label: "Daily Intelligence", value: "24/7", icon: Zap },
              { label: "Community", value: "12k+", icon: Compass },
              { label: "Revenue Potential", value: "$10M+", icon: TrendingUp },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <stat.icon className="w-5 h-5 mx-auto mb-3 text-slate-500" />
                <div className="text-2xl font-bold text-white tracking-tight">{stat.value}</div>
                <div className="text-xs uppercase tracking-widest text-slate-500 font-medium">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
