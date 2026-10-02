import { Compass, Twitter, Mail } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="py-20 border-t border-ocean-800 bg-ocean-900/30">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded bg-cyan flex items-center justify-center">
                <Compass className="text-ocean-950 w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight uppercase">BlueOceanHub</span>
            </div>
            <p className="text-slate-400 max-w-sm mb-8 leading-relaxed">
              South Asia's premier **Financial Magazine Publication**. We provide strategic intelligence and institutional-grade research for educational and informational purposes only.
            </p>
            <div className="flex gap-4">
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Blue Ocean Hub Twitter Profile" 
                title="Blue Ocean Hub Twitter Profile"
                className="w-10 h-10 rounded-full bg-ocean-800 flex items-center justify-center text-slate-300 hover:bg-cyan hover:text-ocean-950 transition-all"
              >
                <Twitter className="w-5 h-5" aria-hidden="true" />
                <span className="sr-only">Twitter Profile</span>
              </a>
              <a 
                href="mailto:contact@blueoceanhub.info" 
                aria-label="Send email to Blue Ocean Hub Editorial Desk" 
                title="Send email to Blue Ocean Hub Editorial Desk"
                className="w-10 h-10 rounded-full bg-ocean-800 flex items-center justify-center text-slate-300 hover:bg-cyan hover:text-ocean-950 transition-all"
              >
                <Mail className="w-5 h-5" aria-hidden="true" />
                <span className="sr-only">Contact Email</span>
              </a>
            </div>
          </div>
          
          <div>
            <h2 className="font-bold text-white mb-6 uppercase text-xs tracking-[0.3em]">Intelligence Hubs</h2>
            <ul className="space-y-3.5 text-xs font-semibold tracking-wider text-slate-300">
              <li><Link to="/passive-income" className="hover:text-cyan transition-colors block">Passive Income</Link></li>
              <li><Link to="/investing" className="hover:text-cyan transition-colors block">Investing &amp; PSX</Link></li>
              <li><Link to="/freelancing" className="hover:text-cyan transition-colors block">Freelance Scaling</Link></li>
              <li><Link to="/saving-money" className="hover:text-cyan transition-colors block">Tax &amp; Wealth Saving</Link></li>
              <li><Link to="/dollar-earning" className="hover:text-cyan transition-colors block">Dollar Earning &amp; LLCs</Link></li>
            </ul>
          </div>

          <div>
            <h2 className="font-bold text-white mb-6 uppercase text-xs tracking-[0.3em]">Tactical Toolkits</h2>
            <ul className="space-y-3.5 text-xs font-semibold tracking-wider text-slate-300">
              <li>
                <Link to="/toolkit" className="text-cyan hover:underline transition-colors block font-bold">
                  Strategic Tool Hub (All Engines)
                </Link>
              </li>
              <li>
                <Link to="/toolkit#pseb-tax-calculator" className="hover:text-cyan transition-colors block">
                  PSEB Tax &amp; Remittance Calculator
                </Link>
              </li>
              <li>
                <Link to="/toolkit#nomad-travel-logistics" className="hover:text-cyan transition-colors block">
                  Nomad Travel &amp; Logistics Optimizer
                </Link>
              </li>
              <li>
                <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="hover:text-cyan transition-colors block text-slate-400">
                  Search Engine XML Sitemap
                </a>
              </li>
              <li>
                <a href="/news-sitemap.xml" target="_blank" rel="noopener noreferrer" className="hover:text-cyan transition-colors block text-slate-400">
                  Google News Sitemap
                </a>
              </li>
              <li>
                <a href="/llms.txt" target="_blank" rel="noopener noreferrer" className="hover:text-cyan transition-colors block text-slate-400">
                  LLMs.txt Resource Spec
                </a>
              </li>
              <li>
                <a href="/all.txt" target="_blank" rel="noopener noreferrer" className="hover:text-cyan transition-colors block text-slate-400">
                  Full Plaintext Deep Archive
                </a>
              </li>
            </ul>
          </div>

          <div className="md:col-span-1">
            <h2 className="font-bold text-white mb-6 uppercase text-xs tracking-[0.3em]">Editorial &amp; Legal</h2>
            <ul className="space-y-3.5 text-xs font-semibold tracking-wider text-slate-300">
              <li><Link to="/page/about-us" className="hover:text-cyan transition-colors block">About Us &amp; Standards</Link></li>
              <li><Link to="/page/contact" className="hover:text-cyan transition-colors block">Contact Editorial Desk</Link></li>
              <li><Link to="/page/editorial-policy" className="hover:text-cyan transition-colors block">Editorial Integrity Policy</Link></li>
              <li><Link to="/page/advertise" className="hover:text-cyan transition-colors block text-cyan">Advertise With Us</Link></li>
              <li><Link to="/page/privacy-policy" className="hover:text-cyan transition-colors block">Privacy Disclosures</Link></li>
              <li><Link to="/page/affiliate-disclosure" className="hover:text-cyan transition-colors block text-cyan/90">Affiliate Disclosure</Link></li>
              <li><Link to="/page/gdpr-compliance" className="hover:text-cyan transition-colors block">GDPR Compliance</Link></li>
              <li><Link to="/page/cookie-policy" className="hover:text-cyan transition-colors block">Cookie Policy</Link></li>
              <li><Link to="/page/terms-of-service" className="hover:text-cyan transition-colors block">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-ocean-800 text-xs text-slate-300 uppercase tracking-widest gap-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <p>© 2026 Blue Ocean Hub. All rights reserved.</p>
            <span className="hidden md:block">|</span>
            <a 
              href="https://saasskul.com" 
              target="_blank" 
              rel="nofollow noopener noreferrer" 
              aria-label="Visit SaaSSkul Pakistan - Platform Developer"
              className="hover:text-cyan transition-colors uppercase"
            >
              Product of SaaSSkul
            </a>
          </div>
          <div className="flex gap-8 items-center">
            <Link 
              to="/indexing-console" 
              aria-label="Access Google Indexing Automation Console"
              className="hover:text-cyan text-cyan transition-colors font-bold uppercase tracking-widest text-[9.5px] border border-cyan/25 px-2.5 py-1 rounded"
            >
              Google Indexing
            </Link>
            <Link 
              to="/page/system-status" 
              aria-label="View System Operational Status"
              className="hover:text-white transition-colors"
            >
              Status
            </Link>
            <Link 
              to="/page/terms-of-service" 
              aria-label="Read Terms of Service and Compliance"
              className="hover:text-white transition-colors"
            >
              Terms
            </Link>
            <button 
              type="button"
              onClick={() => document.getElementById('newsletter')?.scrollIntoView({ behavior: 'smooth' })} 
              aria-label="Scroll to newsletter subscription form"
              className="hover:text-white transition-colors uppercase cursor-pointer"
            >
              Newsletter
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
