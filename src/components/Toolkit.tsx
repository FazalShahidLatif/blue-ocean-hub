import { motion } from "motion/react";
import { TrendingUp, Calculator, Globe, Layers } from "lucide-react";
import { Link } from "react-router-dom";

export default function Toolkit() {
  const tools = [
    { 
      name: "PSX Dividend Tracker", 
      desc: "Track historical yields and upcoming payouts for top 50 dividend stocks.", 
      icon: TrendingUp, 
      status: "Alpha",
      extLink: "https://dps.psx.com.pk/payouts"
    },
    { 
      name: "Tax Calculator 2026", 
      desc: "Calculate your take-home salary and tax burden under the latest finance bill.", 
      icon: Calculator, 
      status: "Beta",
      extLink: "https://calcoo.online/finance/pak-tax"
    },
    { 
      name: "Dollar Income Hedge", 
      desc: "Strategy guide on building USD-based savings from within South Asia.", 
      icon: Globe, 
      status: "Article",
      link: "/article/10-passive-income-ideas-pakistan"
    },
    { 
      name: "Broker Comparison", 
      desc: "Unbiased data on commission rates and platform stability for PK brokers.", 
      icon: Layers, 
      status: "Article",
      link: "/article/how-to-open-cdc-account-pakistan"
    },
  ];

  return (
    <section id="toolkit" className="py-20 border-t border-ocean-800">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Strategic Tool Hub</h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Proprietary tools designed to give you an unfair advantage in digital business.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tools.map((tool, i) => (
            <motion.div
              key={tool.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              {tool.link ? (
                <Link 
                  to={tool.link}
                  className="p-6 rounded-2xl bg-ocean-900 border border-ocean-800 transition-all group cursor-pointer hover:border-cyan/50 hover:bg-ocean-800/50 block h-full"
                >
                  <div className="w-12 h-12 rounded-xl bg-cyan/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <tool.icon className="w-6 h-6 text-cyan" />
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-white tracking-tight">{tool.name}</h3>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{tool.status}</span>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {tool.desc}
                  </p>
                </Link>
              ) : tool.extLink ? (
                <a 
                  href={tool.extLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-6 rounded-2xl bg-ocean-900 border border-ocean-800 transition-all group cursor-pointer hover:border-cyan/50 hover:bg-ocean-800/50 block h-full text-left"
                >
                  <div className="w-12 h-12 rounded-xl bg-cyan/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <tool.icon className="w-6 h-6 text-cyan" />
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-white tracking-tight group-hover:text-cyan transition-colors">{tool.name}</h3>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{tool.status}</span>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {tool.desc}
                  </p>
                </a>
              ) : (
                <div className="p-6 rounded-2xl bg-ocean-900 border border-ocean-800 transition-all group h-full">
                  <div className="w-12 h-12 rounded-xl bg-cyan/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <tool.icon className="w-6 h-6 text-cyan" />
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-white tracking-tight">{tool.name}</h3>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{tool.status}</span>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {tool.desc}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
