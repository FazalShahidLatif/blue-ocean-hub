import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Clock, Calendar } from "lucide-react";
import { ARTICLES } from "../data/articles";
import { Link } from "react-router-dom";

export default function ArticleListing({ filterCategory }: { filterCategory?: string }) {
  const todayStr = new Date().toISOString().split("T")[0];
  const publishedArticles = ARTICLES.filter(a => a.pubDate <= todayStr);

  const filteredArticles = filterCategory && filterCategory !== 'home'
    ? publishedArticles.filter(a => a.category.toLowerCase() === filterCategory.toLowerCase()) 
    : publishedArticles;

  return (
    <section id="intel-grid" className="py-20 bg-ocean-950">
      <div className="container mx-auto px-6">
        <div className="mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
            {filterCategory ? `${filterCategory} Intel` : "Latest Intelligence"}
          </h2>
          <p className="text-slate-400 max-w-xl text-lg">
            Untapped income streams and financial guides tailored for the South Asian professional.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <AnimatePresence mode="popLayout">
            {filteredArticles.map((article, i) => (
              <motion.div
                key={article.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group"
              >
                <Link 
                  to={`/${article.postType || 'article'}/${article.id}`}
                  className="glass-card h-full flex flex-col border-opacity-50 hover:border-opacity-100 hover:shadow-2xl hover:shadow-cyan/5 transition-all block group"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <span className="px-2 py-1 bg-cyan/10 text-cyan text-[10px] font-bold uppercase tracking-widest rounded border border-cyan/20">
                      {article.category}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock className="w-3 h-3" />
                      {article.readingTime} min read
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan transition-colors leading-tight">
                    {article.title}
                  </h3>
                  
                  <p className="text-slate-400 mb-8 flex-grow leading-relaxed">
                    {article.description}
                  </p>
                  
                  <div className="pt-6 border-t border-ocean-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-semibold uppercase tracking-widest">
                      <Calendar className="w-3 h-3" />
                      {new Date(article.pubDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1 text-cyan text-sm font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                      Read Intel
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredArticles.length === 0 && (
          <div className="text-center py-20 border border-dashed border-ocean-800 rounded-3xl">
            <p className="text-slate-500 italic">No articles found in this category yet. Check back soon for fresh intel.</p>
          </div>
        )}
      </div>
    </section>
  );
}
