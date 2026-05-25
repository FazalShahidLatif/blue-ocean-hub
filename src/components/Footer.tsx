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
              <a href="#" className="w-10 h-10 rounded-full bg-ocean-800 flex items-center justify-center text-slate-400 hover:bg-cyan hover:text-ocean-950 transition-all">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-ocean-800 flex items-center justify-center text-slate-400 hover:bg-cyan hover:text-ocean-950 transition-all">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-white mb-6 uppercase text-[10px] tracking-[0.3em]">Insights</h4>
            <ul className="space-y-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
              <li><Link to="/passive-income" className="hover:text-cyan transition-colors block">Passive Income</Link></li>
              <li><Link to="/investing" className="hover:text-cyan transition-colors block">Investing</Link></li>
              <li><Link to="/freelancing" className="hover:text-cyan transition-colors block">Freelancing</Link></li>
              <li><Link to="/saving-money" className="hover:text-cyan transition-colors block">Saving Money</Link></li>
            </ul>
          </div>

          <div className="md:col-span-1">
            <h4 className="font-bold text-white mb-6 uppercase text-[10px] tracking-[0.3em]">Company</h4>
            <ul className="space-y-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
              <li><Link to="/page/about-us" className="hover:text-cyan transition-colors block">About Us</Link></li>
              <li><Link to="/page/contact" className="hover:text-cyan transition-colors block">Contact</Link></li>
              <li><Link to="/page/advertise" className="hover:text-cyan transition-colors block text-cyan">Advertise With Us</Link></li>
              <li><Link to="/page/privacy-policy" className="hover:text-cyan transition-colors block">Privacy Policy</Link></li>
              <li><Link to="/page/gdpr-compliance" className="hover:text-cyan transition-colors block">GDPR Compliance</Link></li>
              <li><Link to="/page/editorial-policy" className="hover:text-cyan transition-colors block">Editorial Policy</Link></li>
              <li><Link to="/page/cookie-policy" className="hover:text-cyan transition-colors block">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-ocean-800 text-xs text-slate-500 uppercase tracking-widest gap-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <p>© 2026 Blue Ocean Hub. All rights reserved.</p>
            <span className="hidden md:block">|</span>
            <a href="https://saasskul.com" target="_blank" rel="nofollow noopener noreferrer" className="hover:text-cyan transition-colors uppercase">Developed by SaaSSkul Pakistan</a>
          </div>
          <div className="flex gap-8">
            <Link to="/page/system-status" className="hover:text-white transition-colors">Status</Link>
            <Link to="/page/terms-of-service" className="hover:text-white transition-colors">Terms</Link>
            <button onClick={() => document.getElementById('newsletter')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition-colors uppercase">Newsletter</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
