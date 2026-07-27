import { motion } from "motion/react";
import { ArrowRight, Clock, Eye, Award, Star, BookOpen, ChevronRight } from "lucide-react";
import { ARTICLES, Article } from "../data/articles";
import { CATEGORIES, CategoryData } from "../data/categories";
import { Link } from "react-router-dom";

export default function MagazineGrid() {
  const todayStr = new Date().toISOString().split("T")[0];
  const publishedArticles = ARTICLES.filter(a => a.pubDate <= todayStr);

  // Group and process articles for each category
  const magazineSections = CATEGORIES.map(category => {
    // Symmetrical normalize
    const catArticles = publishedArticles.filter(
      art => art.category.toLowerCase().replace(/\s+/g, "-") === category.id
    );

    // Sort by publication date descending to get the newest
    const sorted = [...catArticles].sort(
      (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    );

    if (sorted.length === 0) return null;

    // Allocate roles deterministically to map user request:
    // Latest post, one previous post, one views choice, one editors choice
    const latestPost = sorted[0];
    const previousPost = sorted[1] || sorted[0];
    
    // For Views choice, use 3rd post if available, otherwise fallback
    const viewsChoice = sorted[2] || sorted[0];
    
    // For Editors choice, use 4th post if available, otherwise fallback to index 1 or 0
    const editorsChoice = sorted[3] || sorted[1] || sorted[0];

    return {
      category,
      latestPost,
      previousPost,
      viewsChoice,
      editorsChoice,
      hasMultiple: sorted.length > 1
    };
  }).filter(Boolean);

  return (
    <section id="magazine-hq" className="py-24 bg-ocean-950 border-t border-ocean-900">
      <div className="container mx-auto px-6">
        
        {/* Section Header */}
        <div className="mb-20 text-center max-w-3xl mx-auto">
          <span className="text-cyan text-[10px] font-bold uppercase tracking-[0.3em] bg-cyan/10 px-3.5 py-1.5 rounded-full border border-cyan/20">
            Intelligence Compendium
          </span>
          <h2 className="text-4xl md:text-6xl font-bold text-white mt-6 mb-6 tracking-tight leading-[1.1]">
            The Strategic <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan to-blue-400">Magazine</span>
          </h2>
          <p className="text-slate-400 text-lg md:text-xl font-light">
            Curated market logs, structured into specialized intelligence desks. Designed for high-contrast legibility and deep insight.
          </p>
        </div>

        {/* Categories Sections Grid */}
        <div className="space-y-32">
          {magazineSections.map((sec, idx) => {
            if (!sec) return null;
            const { category, latestPost, previousPost, viewsChoice, editorsChoice } = sec;

            return (
              <div 
                key={category.id} 
                className="border-b border-ocean-900/80 pb-20 last:border-none last:pb-0"
                id={`magazine-desk-${category.id}`}
              >
                {/* Category Header Bar */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="w-1.5 h-6 bg-cyan rounded-full"></span>
                      <span className="text-slate-400 text-xs font-mono tracking-widest uppercase">
                        DESK 0{idx + 1}
                      </span>
                    </div>
                    <h3 className="text-2xl md:text-4xl font-bold text-white uppercase tracking-tight font-sans">
                      {category.title.split("—")[0].trim()}
                    </h3>
                  </div>
                  
                  <Link 
                    to={`/${category.id}`}
                    className="inline-flex items-center gap-2 text-cyan font-bold uppercase tracking-widest text-xs hover:text-white transition-colors group"
                  >
                    View Entire Desk
                    <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

                {/* Magazine Layout Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                  
                  {/* COLUMN 1: Premium Feature - Latest Post (Large Card) */}
                  <div className="lg:col-span-6 flex flex-col">
                    <Link 
                      to={`/${latestPost.postType || 'article'}/${latestPost.id}`}
                      className="glass-card flex-grow flex flex-col justify-between group p-8 lg:p-10 border border-white/5 hover:border-cyan/30 hover:shadow-2xl hover:shadow-cyan/5 transition-all duration-300 relative overflow-hidden"
                    >
                      {/* Ambient background glow inside cards */}
                      <div className="absolute -top-10 -right-10 w-44 h-44 bg-cyan/10 blur-[80px] pointer-events-none group-hover:bg-cyan/15 transition-all duration-300"></div>
                      
                      <div>
                        {/* Meta Tags */}
                        <div className="flex items-center gap-4 mb-8">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan/10 text-cyan text-[10px] font-mono font-bold uppercase tracking-widest rounded border border-cyan/20">
                            <BookOpen className="w-3 h-3" />
                            LATEST INTEL
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {latestPost.readingTime} MIN READ
                          </span>
                        </div>

                        {/* Title & Description */}
                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-6 group-hover:text-cyan transition-colors leading-[1.25] font-sans tracking-tight">
                          {latestPost.title}
                        </h3>
                        
                        <p className="text-slate-300 text-base md:text-lg leading-relaxed mb-8 max-w-2xl font-light">
                          {latestPost.description}
                        </p>
                      </div>

                      {/* Footer bar */}
                      <div className="pt-6 border-t border-ocean-800/80 flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-mono tracking-wider font-semibold uppercase">
                          BY {latestPost.author.toUpperCase()}
                        </span>
                        <div className="flex items-center gap-1.5 text-cyan text-xs font-bold uppercase tracking-widest bg-cyan/5 px-3 py-1.5 rounded group-hover:bg-cyan/10 transition-colors">
                          READ FULL INSIGHT
                          <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  </div>

                  {/* COLUMN 2: Sub-Feature - Previous Post */}
                  <div className="lg:col-span-3 flex flex-col">
                    <Link 
                      to={`/${previousPost.postType || 'article'}/${previousPost.id}`}
                      className="glass-card flex-grow flex flex-col justify-between group p-6 border border-white/5 hover:border-cyan/30 hover:shadow-2xl hover:shadow-cyan/5 transition-all duration-300 relative overflow-hidden"
                    >
                      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-slate-500/5 blur-[50px] pointer-events-none"></div>

                      <div>
                        {/* Meta Tags */}
                        <div className="flex items-center gap-3 mb-6">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-slate-800/80 text-slate-300 text-[9px] font-mono uppercase tracking-wider rounded border border-white/5">
                            PREVIOUS BRIEF
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono">
                            {previousPost.readingTime} MIN
                          </span>
                        </div>

                        {/* Title & Description */}
                        <h3 className="text-lg font-bold text-slate-100 mb-4 group-hover:text-cyan transition-colors leading-[1.3] tracking-tight">
                          {previousPost.title}
                        </h3>
                        
                        <p className="text-slate-300 text-xs leading-relaxed mb-6 font-light line-clamp-3">
                          {previousPost.description}
                        </p>
                      </div>

                      {/* Footer bar */}
                      <div className="pt-4 border-t border-ocean-900 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(previousPost.pubDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                        </span>
                        <span className="text-[10px] text-cyan font-bold uppercase tracking-wider">
                          READ BRIEF
                        </span>
                      </div>
                    </Link>
                  </div>

                  {/* COLUMN 3: Picks - Views Choice & Editors Choice */}
                  <div className="lg:col-span-3 flex flex-col gap-6">
                    
                    {/* Views Choice Card */}
                    <Link 
                      to={`/${viewsChoice.postType || 'article'}/${viewsChoice.id}`}
                      className="glass-card flex-grow flex flex-col justify-between group p-6 border border-white/5 hover:border-cyan/20 transition-all duration-300 bg-gradient-to-br from-ocean-900/40 to-ocean-950/60"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[9px] font-mono font-bold uppercase tracking-wider rounded border border-emerald-500/15">
                            <Eye className="w-2.5 h-2.5" />
                            VIEWS CHOICE
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono">
                            POPULAR INTEL
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-100 group-hover:text-cyan transition-colors leading-[1.3] line-clamp-2">
                          {viewsChoice.title}
                        </h3>
                      </div>
                      <div className="pt-3 mt-4 border-t border-ocean-900/50 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 font-mono uppercase">RETRIEVAL KEY</span>
                        <span className="text-cyan font-semibold group-hover:underline uppercase tracking-wide">VIEW</span>
                      </div>
                    </Link>

                    {/* Editors Choice Card */}
                    <Link 
                      to={`/${editorsChoice.postType || 'article'}/${editorsChoice.id}`}
                      className="glass-card flex-grow flex flex-col justify-between group p-6 border border-white/5 hover:border-cyan/20 transition-all duration-300 bg-gradient-to-br from-ocean-900/40 to-ocean-950/60"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 text-amber-400 text-[9px] font-mono font-bold uppercase tracking-wider rounded border border-amber-500/15">
                            <Award className="w-2.5 h-2.5" />
                            EDITORS CHOICE
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono">
                            RECOMMENDED
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-100 group-hover:text-cyan transition-colors leading-[1.3] line-clamp-2">
                          {editorsChoice.title}
                        </h3>
                      </div>
                      <div className="pt-3 mt-4 border-t border-ocean-900/50 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 font-mono uppercase">SECP METRIC</span>
                        <span className="text-cyan font-semibold group-hover:underline uppercase tracking-wide">VIEW</span>
                      </div>
                    </Link>

                  </div>

                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
