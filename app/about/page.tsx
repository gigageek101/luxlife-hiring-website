'use client'

import { motion } from 'framer-motion'

import Link from 'next/link'
import { 
  Target, 
  Eye, 
  Heart, 
  Users, 
  TrendingUp, 
  Shield, 
  Lightbulb,
  Award,
  ArrowRight,
  CheckCircle
} from 'lucide-react'

export default function About() {
  const values = [
    {
      icon: Shield,
      title: 'Transparency',
      description: 'Clear processes, no hidden agendas. We believe in open communication and honest reporting at every step of your journey.'
    },
    {
      icon: TrendingUp,
      title: 'Results-Driven',
      description: 'Every action is aimed at measurable growth. We focus on metrics that matter and deliver tangible outcomes for your business.'
    },
    {
      icon: Lightbulb,
      title: 'Innovation',
      description: 'We stay ahead of trends to keep you ahead of the competition. Our strategies evolve with the ever-changing social media landscape.'
    }
  ]

  const whyChooseUs = [
    'Personalized strategies tailored to your unique audience',
    'Proven track record with 500+ successful campaigns',
    'Data-driven approach with transparent reporting',
    'Dedicated account management and support',
    'Cutting-edge tools and industry insights',
    'Flexible packages to fit any budget'
  ]

  const teamMembers = [
    {
      name: 'Alex Johnson',
      role: 'CEO & Founder',
      description: 'Former Instagram marketing executive with 8+ years of experience helping creators monetize their content.',
      expertise: ['Strategy Development', 'Platform Relations', 'Business Growth']
    },
    {
      name: 'Sarah Chen',
      role: 'Head of Content Strategy',
      description: 'Content optimization specialist who has helped creators achieve over 10M+ total followers.',
      expertise: ['Content Optimization', 'Trend Analysis', 'Audience Growth']
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Revenue Operations Director',
      description: 'Monetization expert specializing in brand partnerships and revenue stream diversification.',
      expertise: ['Monetization', 'Partnerships', 'Revenue Optimization']
    }
  ]

  const achievements = [
    { number: '500+', label: 'Successful Campaigns' },
    { number: '2M+', label: 'Followers Generated' },
    { number: '300%', label: 'Average Revenue Increase' },
    { number: '98%', label: 'Client Retention Rate' }
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
              About <span className="gradient-text">POSTE MEDIA LLC</span>
            </h1>
            <p className="text-xl lg:text-2xl text-white/80 leading-relaxed">
              We are passionate about helping creators succeed in the digital age. Our agency is built for 
              influencers and Instagram theme pages who want more than just likes—they want sustainable 
              growth and real revenue.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center mb-6">
                <Target className="w-8 h-8 text-primary-400 mr-4" />
                <h2 className="text-3xl lg:text-4xl font-display font-bold">Our Mission</h2>
              </div>
              <p className="text-xl text-white/80 leading-relaxed mb-6">
                To empower influencers with strategies that turn their online presence into thriving businesses.
              </p>
              <p className="text-white/70 leading-relaxed">
                We believe every creator has the potential to build a sustainable income from their passion. 
                Our mission is to provide the tools, strategies, and support needed to transform social media 
                influence into lasting financial success.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="glass-effect p-8 rounded-2xl"
            >
              <div className="grid grid-cols-2 gap-6">
                {achievements.map((achievement, index) => (
                  <div key={achievement.label} className="text-center">
                    <div className="text-3xl font-bold gradient-text mb-2">
                      {achievement.number}
                    </div>
                    <div className="text-white/70 text-sm">{achievement.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="section-padding bg-dark-800/30">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-display font-bold mb-6">
              Our <span className="gradient-text">Values</span>
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass-effect p-8 rounded-2xl hover-glow text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500/20 rounded-full mb-6">
                  <value.icon className="w-8 h-8 text-primary-400" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">{value.title}</h3>
                <p className="text-white/70 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl lg:text-4xl font-display font-bold mb-6">
                Why Choose <span className="gradient-text">Us</span>?
              </h2>
              <p className="text-xl text-white/80 mb-8 leading-relaxed">
                Because we don't believe in one-size-fits-all. Every influencer is unique, and so are our solutions.
              </p>
              
              <div className="space-y-4">
                {whyChooseUs.map((reason, index) => (
                  <motion.div
                    key={reason}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center space-x-3"
                  >
                    <CheckCircle className="w-5 h-5 text-primary-400 flex-shrink-0" />
                    <span className="text-white/80">{reason}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="glass-effect p-8 rounded-2xl"
            >
              <div className="text-center">
                <Award className="w-16 h-16 text-primary-400 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold mb-4">Industry Recognition</h3>
                <p className="text-white/70 mb-6">
                  Trusted by top influencers and recognized as a leading agency in social media monetization.
                </p>
                <div className="space-y-3">
                  <div className="text-primary-400 font-semibold">Top 10 Influencer Marketing Agency 2024</div>
                  <div className="text-primary-400 font-semibold">Best Growth Strategy Award 2023</div>
                  <div className="text-primary-400 font-semibold">Client Choice Award 2023</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="section-padding bg-dark-800/30">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-display font-bold mb-6">
              Meet Our <span className="gradient-text">Team</span>
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Experienced professionals dedicated to your success
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass-effect p-8 rounded-2xl hover-glow text-center"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <Users className="w-12 h-12 text-white" />
                </div>
                
                <h3 className="text-xl font-semibold mb-2">{member.name}</h3>
                <div className="text-primary-400 font-medium mb-4">{member.role}</div>
                <p className="text-white/70 text-sm mb-6 leading-relaxed">{member.description}</p>
                
                <div className="space-y-2">
                  {member.expertise.map((skill) => (
                    <div key={skill} className="inline-block bg-primary-500/20 text-primary-300 text-xs px-3 py-1 rounded-full mr-2 mb-2">
                      {skill}
                    </div>
                  ))}
                </div>
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
              Ready to Work With <span className="gradient-text">Industry Experts</span>?
            </h2>
            <p className="text-xl text-white/80 mb-8 leading-relaxed">
              Join the hundreds of successful influencers who have transformed their social media 
              presence into thriving businesses with our expert guidance.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/contact" className="btn-primary text-lg px-8 py-4">
                Start Your Journey Today
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link href="/services" className="btn-secondary text-lg px-8 py-4">
                Explore Our Services
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
