'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  DollarSign, 
  BarChart3, 
  Users, 
  TrendingUp, 
  ArrowRight,
  CheckCircle,
  Target,
  Zap,
  Shield,
  Clock,
  Award,
  Lightbulb
} from 'lucide-react'

export default function Services() {
  const services = [
    {
      id: 'monetization',
      icon: DollarSign,
      title: 'Monetization Strategy',
      subtitle: 'Tailor-made plans to help you unlock income potential',
      description: 'Transform your social media presence into multiple revenue streams with our comprehensive monetization strategies.',
      features: [
        'Identify your audience\'s buying habits and preferences',
        'Create sustainable monetization streams that align with your brand',
        'Optimize brand deals, sponsored content, and product placements',
        'Develop pricing strategies for maximum profitability',
        'Set up affiliate marketing programs and partnerships',
        'Create digital products and subscription models'
      ],
      benefits: [
        'Increase revenue by 200-400% within 6 months',
        'Diversify income sources for financial stability',
        'Build long-term sustainable business model',
        'Maximize earning potential from existing audience'
      ],
      process: [
        'Comprehensive audience and niche analysis',
        'Revenue opportunity assessment',
        'Custom monetization strategy development',
        'Implementation and optimization',
        'Performance tracking and scaling'
      ]
    },
    {
      id: 'content',
      icon: BarChart3,
      title: 'Content Optimization',
      subtitle: 'Boost visibility and engagement with data-backed insights',
      description: 'Maximize your content\'s reach and engagement through strategic optimization and data-driven improvements.',
      features: [
        'Analyze and refine posting schedules for maximum reach',
        'Improve engagement rates through content optimization',
        'Use trend-based optimization for viral potential',
        'A/B test different content formats and styles',
        'Optimize hashtag strategies and SEO elements',
        'Create content calendars and planning systems'
      ],
      benefits: [
        'Increase engagement rates by 150-300%',
        'Boost organic reach and visibility',
        'Improve content quality and consistency',
        'Save time with streamlined content processes'
      ],
      process: [
        'Content audit and performance analysis',
        'Competitor research and trend identification',
        'Content strategy development',
        'Implementation and testing',
        'Continuous optimization and improvement'
      ]
    },
    {
      id: 'growth',
      icon: Users,
      title: 'Audience Growth',
      subtitle: 'Expand your following with proven organic + paid methods',
      description: 'Build a loyal, engaged community through strategic growth tactics that attract your ideal audience.',
      features: [
        'Strategic campaigns for targeted follower acquisition',
        'Paid growth strategies with measurable ROI',
        'Build authentic engagement communities',
        'Cross-platform growth and audience expansion',
        'Influencer collaboration and networking',
        'Community management and engagement strategies'
      ],
      benefits: [
        'Grow follower count by 50,000-100,000+ in 90 days',
        'Improve audience quality and engagement',
        'Build stronger community connections',
        'Expand reach across multiple platforms'
      ],
      process: [
        'Target audience identification and research',
        'Growth strategy development',
        'Campaign setup and launch',
        'Community building and engagement',
        'Performance monitoring and scaling'
      ]
    },
    {
      id: 'revenue',
      icon: TrendingUp,
      title: 'Revenue Streams',
      subtitle: 'Diversify and secure long-term income',
      description: 'Create multiple income sources to build a stable, scalable business that generates revenue 24/7.',
      features: [
        'Set up brand partnerships & collaboration networks',
        'Develop digital products & subscription services',
        'Build a scalable online business model',
        'Create passive income streams',
        'Establish licensing and merchandising opportunities',
        'Develop coaching and consulting services'
      ],
      benefits: [
        'Create 5-10 different revenue streams',
        'Generate passive income while you sleep',
        'Build long-term financial security',
        'Scale business beyond social media'
      ],
      process: [
        'Revenue stream opportunity analysis',
        'Business model development',
        'Product/service creation and launch',
        'Sales funnel optimization',
        'Scaling and automation'
      ]
    }
  ]

  const packages = [
    {
      name: 'Starter',
      price: '$2,997',
      period: '/month',
      description: 'Perfect for emerging influencers ready to monetize',
      features: [
        'Monetization strategy development',
        'Content optimization (up to 20 posts/month)',
        'Basic audience growth tactics',
        'Monthly strategy calls',
        'Email support',
        'Performance reporting'
      ],
      popular: false
    },
    {
      name: 'Professional',
      price: '$4,997',
      period: '/month',
      description: 'Comprehensive growth for established creators',
      features: [
        'All Starter features',
        'Advanced audience growth campaigns',
        'Revenue stream development',
        'Brand partnership facilitation',
        'Weekly strategy calls',
        'Priority support',
        'Custom content calendar',
        'Competitor analysis'
      ],
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'Full-service solution for top-tier influencers',
      features: [
        'All Professional features',
        'Dedicated account manager',
        'Custom business development',
        'Legal and contract support',
        'Multi-platform management',
        '24/7 support',
        'Quarterly business reviews',
        'Custom integrations'
      ],
      popular: false
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
              Our <span className="gradient-text">Services</span>
            </h1>
            <p className="text-xl lg:text-2xl text-white/80 leading-relaxed">
              We provide end-to-end solutions for influencers and theme pages who want to 
              monetize and grow effectively.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Detail Sections */}
      {services.map((service, index) => (
        <section 
          key={service.id} 
          id={service.id}
          className={`section-padding ${index % 2 === 0 ? 'bg-dark-800/30' : ''}`}
        >
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className={index % 2 === 0 ? '' : 'lg:order-2'}
              >
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-primary-500/20 rounded-lg mr-4">
                    <service.icon className="w-8 h-8 text-primary-400" />
                  </div>
                  <div>
                    <h2 className="text-3xl lg:text-4xl font-display font-bold">{service.title}</h2>
                    <p className="text-primary-400 font-medium">{service.subtitle}</p>
                  </div>
                </div>
                
                <p className="text-xl text-white/80 mb-8 leading-relaxed">
                  {service.description}
                </p>

                <div className="space-y-4 mb-8">
                  {service.features.map((feature, featureIndex) => (
                    <motion.div
                      key={feature}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: featureIndex * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-start space-x-3"
                    >
                      <CheckCircle className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                      <span className="text-white/80">{feature}</span>
                    </motion.div>
                  ))}
                </div>

                <Link href="/contact" className="btn-primary">
                  {service.id === 'monetization' && 'Start Monetizing Today'}
                  {service.id === 'content' && 'Optimize My Content'}
                  {service.id === 'growth' && 'Grow My Audience'}
                  {service.id === 'revenue' && 'Unlock My Revenue Streams'}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: index % 2 === 0 ? 30 : -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className={`space-y-6 ${index % 2 === 0 ? '' : 'lg:order-1'}`}
              >
                {/* Benefits Card */}
                <div className="glass-effect p-6 rounded-2xl">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Target className="w-5 h-5 text-primary-400 mr-2" />
                    Key Benefits
                  </h3>
                  <ul className="space-y-2">
                    {service.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-start space-x-2">
                        <Zap className="w-4 h-4 text-primary-400 flex-shrink-0 mt-0.5" />
                        <span className="text-white/80 text-sm">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Process Card */}
                <div className="glass-effect p-6 rounded-2xl">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Clock className="w-5 h-5 text-primary-400 mr-2" />
                    Our Process
                  </h3>
                  <ol className="space-y-2">
                    {service.process.map((step, stepIndex) => (
                      <li key={step} className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-primary-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-primary-400 text-xs font-semibold">{stepIndex + 1}</span>
                        </div>
                        <span className="text-white/80 text-sm">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      ))}

      {/* Pricing Section */}
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
              Choose Your <span className="gradient-text">Growth Plan</span>
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Flexible packages designed to fit your needs and budget
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <motion.div
                key={pkg.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`glass-effect p-8 rounded-2xl hover-glow relative ${
                  pkg.popular ? 'border-2 border-primary-500' : ''
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">{pkg.name}</h3>
                  <div className="flex items-baseline justify-center mb-4">
                    <span className="text-4xl font-bold gradient-text">{pkg.price}</span>
                    <span className="text-white/60 ml-1">{pkg.period}</span>
                  </div>
                  <p className="text-white/70">{pkg.description}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {pkg.features.map((feature) => (
                    <li key={feature} className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                      <span className="text-white/80">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link 
                  href="/contact" 
                  className={`block w-full text-center py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                    pkg.popular 
                      ? 'btn-primary' 
                      : 'btn-secondary'
                  }`}
                >
                  Get Started
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Our Services */}
      <section className="section-padding">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-display font-bold mb-6">
              Why Choose Our <span className="gradient-text">Services</span>?
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Shield,
                title: 'Proven Results',
                description: '500+ successful campaigns with measurable outcomes'
              },
              {
                icon: Award,
                title: 'Expert Team',
                description: 'Industry professionals with years of experience'
              },
              {
                icon: Lightbulb,
                title: 'Custom Strategies',
                description: 'Tailored approaches for your unique audience'
              },
              {
                icon: Zap,
                title: 'Fast Implementation',
                description: 'Quick setup and rapid results delivery'
              }
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500/20 rounded-full mb-4">
                  <item.icon className="w-8 h-8 text-primary-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-white/70">{item.description}</p>
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
              Ready to Transform Your <span className="gradient-text">Social Media</span> Into a Business?
            </h2>
            <p className="text-xl text-white/80 mb-8 leading-relaxed">
              Don't wait any longer. Start your journey to financial freedom and business success today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/contact" className="btn-primary text-lg px-8 py-4">
                Get Your Free Strategy Call
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link href="/case-studies" className="btn-secondary text-lg px-8 py-4">
                See Success Stories
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
