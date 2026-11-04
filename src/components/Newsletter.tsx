import { CheckCircle2 } from "lucide-react";
import { useState } from "react";

const GOOGLE_FORM_EMBED_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSfdvB4amW4-L64GzO6cAiQLYvTlLrSCK6RK8Pc4FSSs5L5J8g/embeddedform";

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
                <p className="text-slate-300 text-lg">
                  Welcome to the Hub. Your first report is being processed.
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-3xl md:text-5xl font-bold mb-6">Join the 1% of Strategic Founders</h2>
                <p className="text-slate-200 text-lg mb-10">
                  Get weekly "Blue Ocean" reports delivered to your inbox. No fluff, just untapped gaps and implementation guides.
                </p>
                
                {/* Embedded Google Form — responses go to the Lead Capture sheet */}
                <div className="w-full max-w-xl mx-auto">
                  <iframe
                    src={GOOGLE_FORM_EMBED_URL}
                    width="100%"
                    height="620"
                    frameBorder="0"
                    marginHeight={0}
                    marginWidth={0}
                    title="Blue Ocean Hub - Lead Capture Form"
                    className="rounded-xl border border-cyan/20 bg-white"
                  >
                    Loading…
                  </iframe>
                </div>

                <p className="mt-6 text-xs text-slate-300 uppercase tracking-widest font-semibold">
                  Get weekly strategic intelligence delivered to your inbox.
                </p>

                <button
                  type="button"
                  onClick={() => setSubmitted(true)}
                  className="mt-4 text-xs text-cyan/70 hover:text-cyan underline cursor-pointer"
                >
                  Already submitted? Confirm below.
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
