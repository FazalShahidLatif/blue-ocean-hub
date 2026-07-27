import { useState } from "react";
import { motion } from "motion/react";
import { TrendingUp, Calculator, Globe, Layers, ArrowRight, DollarSign, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function Toolkit() {
  const [usdIncome, setUsdIncome] = useState<number>(2500);
  const [exchangeRate, setExchangeRate] = useState<number>(278.50);

  // Math logic for Tax Savings Estimator
  const monthlyPkr = usdIncome * exchangeRate;
  const annualPkr = monthlyPkr * 12;

  // Default Tax Rate without PSEB / Filer Status (approx 10% - 15% slabs)
  const defaultTaxRate = 0.125;
  const defaultTaxAnnualPkr = annualPkr * defaultTaxRate;

  // PSEB Registered 0.25% Reduced Export Credit Tax Rate
  const psebTaxRate = 0.0025;
  const psebTaxAnnualPkr = annualPkr * psebTaxRate;

  // Total Annual Savings
  const annualSavingsPkr = defaultTaxAnnualPkr - psebTaxAnnualPkr;
  const annualSavingsUsd = annualSavingsPkr / exchangeRate;

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
    <section id="toolkit" className="py-20 border-t border-ocean-800 bg-ocean-950">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-cyan text-[10px] font-bold uppercase tracking-[0.3em] bg-cyan/10 px-3.5 py-1.5 rounded-full border border-cyan/20 mb-4 inline-block">
            Proprietary Intelligence Engines
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white font-display">Strategic Tool Hub</h2>
          <p className="text-slate-400 max-w-xl mx-auto text-base">
            Tactical calculators and intelligence tools designed to give South Asian founders and remote earners an unfair tax & compliance advantage.
          </p>
        </div>

        {/* INTERACTIVE FREELANCER TAX & REMITTANCE SAVINGS CALCULATOR */}
        <div className="mb-16 p-8 md:p-10 rounded-2xl bg-gradient-to-br from-ocean-900 via-ocean-900/90 to-ocean-950 border border-cyan/30 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Calculator className="w-72 h-72 text-cyan" />
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Input Form Column */}
            <div className="lg:col-span-6 space-y-6">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan animate-pulse" />
                <h3 className="text-xl md:text-2xl font-bold text-white font-display">
                  2026 PSEB Tax & Remittance Savings Estimator
                </h3>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Estimate how much tax you save legally by registering with PSEB and filing under FBR Section 154A (0.25% export tax credit) vs default withholding.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase font-bold tracking-wider text-slate-400 mb-2">
                    Monthly USD Inward Remittance ($)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan font-bold">$</span>
                    <input 
                      type="number" 
                      value={usdIncome}
                      onChange={(e) => setUsdIncome(Math.max(0, Number(e.target.value)))}
                      className="w-full pl-8 pr-4 py-3 bg-ocean-950 border border-ocean-700 rounded-xl text-white font-bold text-lg focus:border-cyan focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs uppercase font-bold tracking-wider text-slate-400">
                      USD / PKR Exchange Rate
                    </label>
                    <span className="text-xs text-cyan font-mono">1 USD = {exchangeRate} PKR</span>
                  </div>
                  <input 
                    type="range" 
                    min="250" 
                    max="320" 
                    step="0.5"
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(Number(e.target.value))}
                    className="w-full accent-cyan cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Live Calculation Output Column */}
            <div className="lg:col-span-6 bg-ocean-950/80 p-6 md:p-8 rounded-xl border border-ocean-800 space-y-6">
              <div className="flex items-center justify-between border-b border-ocean-800 pb-4">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Gross Annual Income</span>
                <span className="text-lg font-bold text-white font-mono">
                  PKR {annualPkr.toLocaleString('en-PK')}
                  <span className="text-xs text-slate-400 font-normal ml-1">(${ (usdIncome * 12).toLocaleString() })</span>
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Standard Non-PSEB Tax Burden (~12.5%):</span>
                  <span className="text-red-400 font-mono font-bold">PKR {defaultTaxAnnualPkr.toLocaleString('en-PK')}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">PSEB Registered Export Tax (0.25%):</span>
                  <span className="text-emerald-400 font-mono font-bold">PKR {psebTaxAnnualPkr.toLocaleString('en-PK')}</span>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-cyan/10 border border-cyan/30 text-center">
                <span className="text-[10px] uppercase tracking-widest font-bold text-cyan mb-1 block">Your Legal Net Annual Tax Savings</span>
                <div className="text-2xl md:text-3xl font-extrabold text-white tracking-tight font-display text-cyan">
                  PKR {annualSavingsPkr.toLocaleString('en-PK')}
                </div>
                <span className="text-xs text-slate-300 font-semibold block mt-1">
                  ≈ ${Math.round(annualSavingsUsd).toLocaleString()} USD kept in your pocket every year!
                </span>
              </div>

              <Link 
                to="/article/pseb-registration-tax-filer-guide-2026" 
                className="w-full py-3 bg-cyan text-ocean-950 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-cyan/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan/20"
              >
                <span>Read PSEB 2026 Registration Guide</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </div>

        {/* TOOL GRID */}
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
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{tool.status}</span>
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
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{tool.status}</span>
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
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{tool.status}</span>
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

