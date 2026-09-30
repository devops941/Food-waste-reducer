import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Refrigerator, 
  TrendingUp, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  ShieldCheck,
  ChefHat,
  DollarSign
} from 'lucide-react';
import { Button, Card, StatusBadge, Badge } from '../components/ui';

export function LandingPage() {
  const sampleExpiringItems = [
    { name: 'Organic Baby Spinach', expiryDate: new Date(Date.now() + 86400000).toISOString(), qty: '1 bag', category: 'Produce' },
    { name: 'Greek Plain Yogurt', expiryDate: new Date(Date.now() + 172800000).toISOString(), qty: '500g tub', category: 'Dairy' },
    { name: 'Sourdough Bread', expiryDate: new Date(Date.now() + 259200000).toISOString(), qty: '4 slices', category: 'Bakery' },
  ];

  return (
    <div className="space-y-20 sm:space-y-28 pb-12">
      
      {/* Hero Section */}
      <section className="pt-6 sm:pt-12 text-center max-w-3xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sage-100 text-sage-800 border border-sage-200/80 text-xs font-medium animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-sage-600" />
          <span>Mindful Cooking for Conscious Homes</span>
        </div>

        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold text-charcoal tracking-tight leading-[1.15]">
          Cook what you have. <br />
          <span className="text-sage-600 italic">Waste less.</span>
        </h1>

        <p className="text-base sm:text-lg text-charcoal-muted max-w-xl mx-auto font-normal leading-relaxed">
          Pantry Fresh organizes your ingredients, alerts you before food spoils, and instantly turns near-expiry items into wholesome meals.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <Link to="/register" className="w-full sm:w-auto">
            <Button
              variant="primary"
              size="lg"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full sm:w-auto shadow-soft"
            >
              Start Saving Food — It’s Free
            </Button>
          </Link>
          <Link to="/login" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Explore Demo
            </Button>
          </Link>
        </div>

        {/* Quick Social Proof / Assurance */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-charcoal-muted">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-status-fresh" />
            No credit card needed
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-sage-600" />
            Save ~$1,500 / year on groceries
          </span>
        </div>
      </section>

      {/* Interactive Visual Teaser: How Pantry Fresh Works */}
      <section className="relative">
        <div className="bg-gradient-to-b from-sage-100/70 to-cream-200/50 rounded-3xl p-6 sm:p-10 border border-sage-200/60 shadow-soft">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-semibold text-sage-700 tracking-wider uppercase">Live Preview</span>
                <h3 className="font-serif text-xl sm:text-2xl font-medium text-charcoal">
                  Use These First Today
                </h3>
              </div>
              <Link to="/register">
                <Button variant="secondary" size="sm" rightIcon={<ChefHat className="w-4 h-4" />}>
                  Generate Recipes From These
                </Button>
              </Link>
            </div>

            {/* Teaser Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {sampleExpiringItems.map((item, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 border border-charcoal-border/70 shadow-soft-sm space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium text-sm text-charcoal leading-snug">{item.name}</h4>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-cream-200 text-charcoal-muted shrink-0">
                      {item.category}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-charcoal-muted font-medium">{item.qty}</span>
                    <StatusBadge expiryDate={item.expiryDate} />
                  </div>
                </div>
              ))}
            </div>

            {/* Generated Recipe Teaser */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 border border-sage-200/80 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-terracotta-100 text-terracotta-600 flex items-center justify-center shrink-0">
                  <ChefHat className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-serif text-base font-semibold text-charcoal">
                      Creamy Spinach Sourdough Toast with Poached Egg
                    </h4>
                    <Badge variant="sage" size="sm">Uses 3 pantry items</Badge>
                  </div>
                  <p className="text-xs text-charcoal-muted mt-1">
                    Ready in 12 mins • Uses spinach, greek yogurt, sourdough bread
                  </p>
                </div>
              </div>
              <Link to="/register" className="shrink-0">
                <Button variant="terracotta" size="sm">
                  View Full Recipe
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Simple Feature Cards */}
      <section id="features" className="space-y-10">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-semibold text-sage-600 uppercase tracking-widest">
            Simple & Purpose-Built
          </span>
          <h2 className="font-serif text-3xl font-semibold text-charcoal">
            Everything you need. Nothing you don't.
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-muted">
            Designed to bring calm clarity to your kitchen, prevent waste, and inspire daily home cooking.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Feature 1 */}
          <Card className="p-7 space-y-4" hover>
            <div className="w-12 h-12 rounded-2xl bg-sage-100 text-sage-600 flex items-center justify-center shadow-soft-sm">
              <Refrigerator className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-medium text-charcoal">
              Color-Coded Pantry
            </h3>
            <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
              Never forget what is sitting in your crisper drawer. Automatic visual badges turn from green to amber and red as expiration dates approach.
            </p>
          </Card>

          {/* Feature 2 */}
          <Card className="p-7 space-y-4" hover>
            <div className="w-12 h-12 rounded-2xl bg-terracotta-100 text-terracotta-600 flex items-center justify-center shadow-soft-sm">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-medium text-charcoal">
              Smart Recipe Ideas
            </h3>
            <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
              Our culinary AI looks at your expiring items first and crafts tailored recipes matching your dietary preferences with clear steps.
            </p>
          </Card>

          {/* Feature 3 */}
          <Card className="p-7 space-y-4" hover>
            <div className="w-12 h-12 rounded-2xl bg-cream-200 text-charcoal flex items-center justify-center shadow-soft-sm">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-medium text-charcoal">
              Money & Impact Stats
            </h3>
            <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
              Celebrate your progress with monthly summaries showing actual dollars saved and pounds of food kept out of landfills.
            </p>
          </Card>
        </div>
      </section>

      {/* Impact & Testimonial Section */}
      <section id="impact" className="bg-white rounded-3xl p-8 sm:p-12 border border-charcoal-border/70 shadow-soft">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-xs font-semibold text-terracotta-600 uppercase tracking-widest">
              Household Impact
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-charcoal leading-snug">
              Small daily habits create massive environmental & wallet relief.
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
              The average family throws away over 30% of groceries each year. With gentle reminders and recipe creativity, Pantry Fresh helps you reclaim that value.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-cream-100 rounded-2xl p-5 text-center border border-cream-200">
              <div className="font-serif text-3xl font-bold text-sage-600 mb-1">$1,500+</div>
              <div className="text-xs text-charcoal-muted font-medium">Avg. Annual Savings</div>
            </div>
            <div className="bg-cream-100 rounded-2xl p-5 text-center border border-cream-200">
              <div className="font-serif text-3xl font-bold text-terracotta-600 mb-1">32 lbs</div>
              <div className="text-xs text-charcoal-muted font-medium">Food Rescued / Mo</div>
            </div>
          </div>
        </div>
      </section>

      {/* Calm CTA Banner */}
      <section className="text-center max-w-2xl mx-auto space-y-6 pt-4">
        <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-charcoal">
          Ready to love your pantry again?
        </h2>
        <p className="text-xs sm:text-sm text-charcoal-muted">
          Join households cooking mindfully, saving money, and reducing kitchen waste every single day.
        </p>
        <Link to="/register" className="inline-block">
          <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Create Free Account
          </Button>
        </Link>
      </section>

    </div>
  );
}

export default LandingPage;
