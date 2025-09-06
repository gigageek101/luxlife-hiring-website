'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  BarChart3, 
  ArrowRight,
  Star,
  Calendar,
  Target,
  Award,
  Zap
} from 'lucide-react'

export default function CaseStudies() {
  const caseStudies = [
    {
      id: 'client-a',
      name: 'Sarah Johnson',
      handle: '@sarahjfashion',
      category: 'Fashion Influencer',
      initialFollowers: '45K',
      finalFollowers: '250K',
      timeframe: '90 days',
      revenueIncrease: '500%',
      image: '/case-study-1.jpg',
      challenge: 'Sarah had a decent following but struggled to monetize her fashion content effectively. Her engagement was low, and brand partnerships were sporadic.',
      solution: 'We implemented a comprehensive monetization strategy focusing on authentic brand partnerships, created a signature style guide, and optimized her content calendar for maximum engagement.',
      results: [
        'Grew from 45K to 250K followers in 90 days',
        'Increased monthly revenue from $500 to $3,000',
        'Secured 15 brand partnerships with major fashion brands',
        'Improved engagement rate from 2.1% to 8.4%',
        'Launched successful affiliate marketing program'
      ],
      testimonial: 'POSTE MEDIA completely transformed my Instagram business. I went from struggling to make ends meet to having a six-figure income stream. Their strategies actually work!',
      tags: ['Fashion', 'Brand Partnerships', 'Audience Growth']
    },
    {
      id: 'client-b',
      name: 'TechTrends Daily',
      handle: '@techtrendsdaily',
      category: 'Tech Theme Page',
      initialFollowers: '80K',
      finalFollowers: '320K',
      timeframe: '6 months',
      revenueIncrease: '800%',
      image: '/case-study-2.jpg',
      challenge: 'A popular tech theme page with good content but no clear monetization strategy. Revenue was limited to basic sponsored posts.',
      solution: 'We developed a multi-stream revenue model including affiliate marketing, digital products, premium content subscriptions, and strategic brand collaborations.',
      results: [
        'Transformed niche theme page into full-time business',
        'Built steady monthly income of $12,000+ from collaborations',
        'Created and sold 3 successful digital products',
        'Established premium membership program with 500+ subscribers',
        'Increased follower quality and engagement significantly'
      ],
      testimonial: 'What started as a hobby page is now my full-time career. POSTE MEDIA helped me see opportunities I never knew existed and gave me the roadmap to success.',
      tags: ['Theme Page', 'Digital Products', 'Subscription Model']
    },
    {
      id: 'client-c',
      name: 'Emma Rodriguez',
      handle: '@emmalifestyle',
      category: 'Lifestyle Creator',
      initialFollowers: '120K',
      finalFollowers: '420K',
      timeframe: '4 months',
      revenueIncrease: '300%',
      image: '/case-study-3.jpg',
      challenge: 'Emma had a large following but low engagement rates and struggled to convert her audience into paying customers for her lifestyle brand.',
      solution: 'We focused on community building, content optimization, and developing authentic revenue streams that aligned with her personal brand and values.',
      results: [
        'Doubled engagement rate from 3.2% to 7.8% in 60 days',
        'Secured long-term partnerships with 8 major lifestyle brands',
        'Launched successful online course generating $25K in first month',
        'Built email list of 15K+ engaged subscribers',
        'Created sustainable passive income streams'
      ],
      testimonial: 'The team at POSTE MEDIA doesn\'t just focus on numbers - they helped me build a genuine community and create content that truly resonates with my audience.',
      tags: ['Lifestyle', 'Community Building', 'Online Courses']
    }
  ]

  const metrics = [
    { number: '2M+', label: 'Total Followers Generated', icon: Users },
    { number: '$500K+', label: 'Revenue Generated for Clients', icon: DollarSign },
    { number: '400%', label: 'Average Revenue Increase', icon: TrendingUp },
    { number: '500+', label: 'Successful Campaigns', icon: Target }
  ]

  const successFactors = [
    {
      icon: Target,
      title: 'Strategic Planning',
      description: 'Every campaign starts with thorough research and strategic planning tailored to the specific niche and audience.'
    },
    {
      icon: BarChart3,
      title: 'Data-Driven Approach',
      description: 'We use analytics and performance data to continuously optimize strategies and maximize results.'
    },
    {
      icon: Zap,
      title: 'Rapid Implementation',
      description: 'Our proven systems allow for quick implementation and fast results, often within the first 30 days.'
    },
    {
      icon: Award,
      title: 'Ongoing Optimization',
      description: 'Continuous monitoring and optimization ensure sustained growth and long-term success.'
    }
  ]

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="section-padding bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl lg:text-6xl font-display font-bold mb-6">
              Our Results Speak for <span className="gradient-text">Themselves</span>
            </h1>
            <p className="text-xl lg:text-2xl text-white/80 leading-relaxed">
              Real success stories from real influencers who trusted us with their growth journey.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="section-padding bg-dark-800/30">
        <div className="container-custom">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center glass-effect p-6 rounded-2xl"
              >
                <metric.icon className="w-8 h-8 text-primary-400 mx-auto mb-4" />
                <div className="text-3xl lg:text-4xl font-bold gradient-text mb-2">
                  {metric.number}
                </div>
                <div className="text-white/70 text-sm">{metric.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies */}
      {caseStudies.map((study, index) => (
        <section 
          key={study.id}
          className={`section-padding ${index % 2 === 0 ? '' : 'bg-dark-800/30'}`}
        >
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Content */}
              <motion.div
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className={index % 2 === 0 ? '' : 'lg:order-2'}
              >
                <div className="flex items-center space-x-2 mb-4">
                  {study.tags.map((tag) => (
                    <span key={tag} className="bg-primary-500/20 text-primary-300 text-xs px-3 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>

                <h2 className="text-3xl lg:text-4xl font-display font-bold mb-4">
                  {study.name}
                </h2>
                <p className="text-primary-400 font-medium mb-2">{study.handle}</p>
                <p className="text-white/70 mb-6">{study.category}</p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="glass-effect p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold gradient-text">{study.initialFollowers}</div>
                    <div className="text-white/60 text-sm">Starting Followers</div>
                  </div>
                  <div className="glass-effect p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold gradient-text">{study.finalFollowers}</div>
                    <div className="text-white/60 text-sm">Final Followers</div>
                  </div>
                  <div className="glass-effect p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold gradient-text">{study.timeframe}</div>
                    <div className="text-white/60 text-sm">Timeframe</div>
                  </div>
                  <div className="glass-effect p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold gradient-text">{study.revenueIncrease}</div>
                    <div className="text-white/60 text-sm">Revenue Increase</div>
                  </div>
                </div>

                <blockquote className="glass-effect p-6 rounded-lg mb-6">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-white/80 italic leading-relaxed">
                    "{study.testimonial}"
                  </p>
                </blockquote>
              </motion.div>

              {/* Details */}
              <motion.div
                initial={{ opacity: 0, x: index % 2 === 0 ? 30 : -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className={`space-y-6 ${index % 2 === 0 ? '' : 'lg:order-1'}`}
              >
                {/* Challenge */}
                <div className="glass-effect p-6 rounded-2xl">
                  <h3 className="text-xl font-semibold mb-4 text-red-400">The Challenge</h3>
                  <p className="text-white/80 leading-relaxed">{study.challenge}</p>
                </div>

                {/* Solution */}
                <div className="glass-effect p-6 rounded-2xl">
                  <h3 className="text-xl font-semibold mb-4 text-primary-400">Our Solution</h3>
                  <p className="text-white/80 leading-relaxed">{study.solution}</p>
                </div>

                {/* Results */}
                <div className="glass-effect p-6 rounded-2xl">
                  <h3 className="text-xl font-semibold mb-4 text-green-400">The Results</h3>
                  <ul className="space-y-2">
                    {study.results.map((result, resultIndex) => (
                      <li key={resultIndex} className="flex items-start space-x-3">
                        <TrendingUp className="w-4 h-4 text-green-400 flex-shrink-0 mt-1" />
                        <span className="text-white/80 text-sm">{result}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      ))}

      {/* Success Factors */}
      <section className="section-padding bg-dark-800/50">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-display font-bold mb-6">
              What Makes Our <span className="gradient-text">Approach</span> Different?
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              The key factors behind our consistent success across all campaigns
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {successFactors.map((factor, index) => (
              <motion.div
                key={factor.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass-effect p-6 rounded-2xl hover-glow text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500/20 rounded-full mb-4">
                  <factor.icon className="w-8 h-8 text-primary-400" />
                </div>
                <h3 className="text-xl font-semibold mb-4">{factor.title}</h3>
                <p className="text-white/70 leading-relaxed">{factor.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-r from-primary-600/20 to-primary-500/20">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto"
          >
            <h2 className="text-3xl lg:text-4xl font-display font-bold mb-6">
              Want to Be Our Next <span className="gradient-text">Success Story</span>?
            </h2>
            <p className="text-xl text-white/80 mb-8 leading-relaxed">
              Join the ranks of successful influencers who have transformed their social media presence 
              into thriving businesses. Your success story could be next.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/contact" className="btn-primary text-lg px-8 py-4">
                Request a Free Consultation
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link href="/services" className="btn-secondary text-lg px-8 py-4">
                View Our Services
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 mt-12 pt-8 border-t border-white/10">
              <div className="flex items-center space-x-2 text-white/60">
                <Calendar className="w-5 h-5 text-primary-400" />
                <span>Results in 30-90 days</span>
              </div>
              <div className="flex items-center space-x-2 text-white/60">
                <Award className="w-5 h-5 text-primary-400" />
                <span>Proven track record</span>
              </div>
              <div className="flex items-center space-x-2 text-white/60">
                <Target className="w-5 h-5 text-primary-400" />
                <span>Guaranteed results</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
