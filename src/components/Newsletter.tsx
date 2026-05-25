import { Send, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export default function Newsletter() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <section id="newsletter" className="py-20">
      <div className="container mx-auto px-6">
        <div className="relative overflow-hidden bg-gradient-to-br from-cyan/20 to-accent/20 border border-cyan/10 rounded-3xl p-8 md:p-16 text-center">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5"></div>
          
          <div className="relative z-10 max-w-2xl mx-auto">
            {submitted ? (
              <div className="animate-in fade-in zoom-in duration-500 py-4">
                <div className="w-20 h-20 bg-cyan/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-cyan" />
                </div>
                <h2 className="text-3xl md:text-5xl font-bold mb-4">Strategic Intel Confirmed</h2>
                <p className="text-slate-400 text-lg">
                  Welcome to the Hub. Your first report is being processed.
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-3xl md:text-5xl font-bold mb-6">Join the 1% of Strategic Founders</h2>
                <p className="text-slate-400 text-lg mb-10">
                  Get weekly "Blue Ocean" reports delivered to your inbox. No fluff, just untapped gaps and implementation guides.
                </p>
                
                <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto" onSubmit={(e) => {
                  e.preventDefault();
                  setSubmitted(true);
                }}>
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="flex-grow px-6 py-4 rounded-xl bg-ocean-950 border border-ocean-800 focus:border-cyan outline-none text-white transition-colors"
                    required
                  />
                  <button className="btn-primary flex items-center justify-center gap-2 whitespace-nowrap">
                    Get Early Access
                    <Send className="w-4 h-4" />
                  </button>
                </form>
                
                <p className="mt-6 text-xs text-slate-500 uppercase tracking-widest">
                  Join 12,542+ subscribers already getting the edge.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
