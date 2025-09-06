'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Calendar, Clock, User, ArrowLeft, Share2, Brain, Zap, Heart, TrendingUp } from 'lucide-react'

export default function ViralContentPsychology() {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <section className="pt-24 pb-8">
        <div className="container">
          <Link 
            href="/blog" 
            className="inline-flex items-center gap-2 text-[var(--accent)] hover:gap-3 transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span 
                className="inline-block px-4 py-2 text-sm font-medium rounded-full mb-6"
                style={{ background: 'var(--accent)', color: 'white' }}
              >
                Content
              </span>

              <h1 className="mb-6">
                The Psychology of Viral Content: What Makes 
                <span className="text-gradient block mt-2">Posts Shareable</span>
              </h1>

              <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                  <User className="w-5 h-5" />
                  <span>Dr. Lisa Park</span>
                </div>
                <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                  <Calendar className="w-5 h-5" />
                  <span>January 5, 2025</span>
                </div>
                <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                  <Clock className="w-5 h-5" />
                  <span>7 min read</span>
                </div>
                <button className="flex items-center gap-2 text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors">
                  <Share2 className="w-5 h-5" />
                  <span>Share</span>
                </button>
              </div>
            </motion.div>

            <motion.article
              className="prose prose-lg max-w-none"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              style={{ color: 'var(--text-primary)' }}
            >
              <div className="w-full h-64 md:h-96 rounded-xl mb-8 bg-gradient-to-br from-[var(--accent)] to-[var(--accent-hover)] opacity-20"></div>

              <p className="text-xl leading-relaxed mb-8" style={{ color: 'var(--text-secondary)' }}>
                Viral content isn't random—it's psychological. Understanding the mental triggers that compel people to share content can transform your social media strategy and exponentially increase your reach.
              </p>

              <h2 style={{ color: 'var(--text-primary)' }}>The Science Behind Sharing</h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                When someone shares your content, they're not just spreading information—they're making a statement about themselves. People share content that makes them look knowledgeable, caring, funny, or aligned with their values. Understanding this self-presentation motive is key to creating shareable content.
              </p>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 my-8">
                <div className="card p-6 text-center">
                  <Brain className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--accent)' }} />
                  <h3 style={{ color: 'var(--text-primary)' }}>Cognitive</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>Makes them look smart</p>
                </div>
                <div className="card p-6 text-center">
                  <Heart className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--accent)' }} />
                  <h3 style={{ color: 'var(--text-primary)' }}>Emotional</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>Evokes strong feelings</p>
                </div>
                <div className="card p-6 text-center">
                  <Zap className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--accent)' }} />
                  <h3 style={{ color: 'var(--text-primary)' }}>Social</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>Connects with others</p>
                </div>
                <div className="card p-6 text-center">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--accent)' }} />
                  <h3 style={{ color: 'var(--text-primary)' }}>Practical</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>Provides real value</p>
                </div>
              </div>

              <h2 style={{ color: 'var(--text-primary)' }}>The 6 Psychological Triggers of Viral Content</h2>

              <h3 style={{ color: 'var(--text-primary)' }}>1. High-Arousal Emotions</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Content that evokes strong emotions—whether positive (awe, excitement, amusement) or negative (anger, anxiety)—gets shared more than neutral content. The key is emotional intensity, not just positivity.
              </p>

              <div className="card my-8 p-6" style={{ background: 'var(--bg-soft)', border: '1px solid var(--border)' }}>
                <h3 style={{ color: 'var(--accent)' }}>🧠 Psychology Insight</h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  High-arousal emotions activate the sympathetic nervous system, making people more likely to take action—including sharing your content.
                </p>
              </div>

              <h3 style={{ color: 'var(--text-primary)' }}>2. Social Currency</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                People share content that makes them look good to their social circle. This includes insider knowledge, exclusive information, or content that aligns with their identity and values.
              </p>

              <h3 style={{ color: 'var(--text-primary)' }}>3. Practical Value</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Useful content gets shared because people want to help others. Tips, hacks, tutorials, and actionable advice have inherent shareability because they provide genuine value to the recipient.
              </p>

              <h3 style={{ color: 'var(--text-primary)' }}>4. Stories and Narratives</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Humans are wired for storytelling. Content that tells a compelling story—whether it's a personal journey, a case study, or a narrative arc—is more memorable and shareable than dry facts or statistics.
              </p>

              <h3 style={{ color: 'var(--text-primary)' }}>5. Public Visibility</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Content that's easy to see and share gets more traction. This includes visually striking images, clear calls-to-action, and content formats that are optimized for each platform's sharing mechanisms.
              </p>

              <h3 style={{ color: 'var(--text-primary)' }}>6. Triggers and Timing</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Content that connects to ongoing conversations, trending topics, or regular triggers (like Monday motivation or Friday feelings) has built-in shareability because it's contextually relevant.
              </p>

              <h2 style={{ color: 'var(--text-primary)' }}>Applying Psychology to Your Content Strategy</h2>

              <h3 style={{ color: 'var(--text-primary)' }}>The SHARES Framework:</h3>
              <ul style={{ color: 'var(--text-secondary)' }}>
                <li><strong>S</strong>ocial Currency - Does this make the sharer look good?</li>
                <li><strong>H</strong>igh Emotion - Does this evoke a strong feeling?</li>
                <li><strong>A</strong>ccessible - Is this easy to understand and share?</li>
                <li><strong>R</strong>elevant - Is this timely and contextually appropriate?</li>
                <li><strong>E</strong>ngaging - Does this invite interaction and response?</li>
                <li><strong>S</strong>tory-driven - Does this tell a compelling narrative?</li>
              </ul>

              <div className="card my-8 p-6" style={{ background: 'var(--bg-soft)', border: '1px solid var(--border)' }}>
                <h3 style={{ color: 'var(--accent)' }}>📝 Content Audit Exercise</h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Look at your last 10 posts. Rate each one (1-5) on the SHARES criteria. Your highest-performing content likely scores well across multiple categories.
                </p>
              </div>

              <h2 style={{ color: 'var(--text-primary)' }}>Content Formats That Leverage Psychology</h2>

              <h3 style={{ color: 'var(--text-primary)' }}>Before/After Transformations</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                These tap into multiple triggers: they tell a story, provide social proof, and often evoke emotions like hope or inspiration.
              </p>

              <h3 style={{ color: 'var(--text-primary)' }}>Controversial Takes (Done Respectfully)</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Well-reasoned contrarian viewpoints generate discussion and shares because they challenge conventional thinking and provide social currency for those who agree.
              </p>

              <h3 style={{ color: 'var(--text-primary)' }}>Behind-the-Scenes Content</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                This provides insider access (social currency) and humanizes your brand through storytelling, making it highly shareable among engaged followers.
              </p>

              <div className="card my-8 p-6" style={{ background: 'linear-gradient(135deg, var(--accent-muted), var(--accent))', color: 'white' }}>
                <h3>Want to Create More Viral Content?</h3>
                <p className="mb-4 text-white/90">
                  Our content strategists use psychological principles to help creators consistently produce shareable content that grows their audience organically.
                </p>
                <Link href="/contact" className="btn-primary bg-white text-[var(--accent)] hover:bg-white/90">
                  Get Your Content Strategy
                </Link>
              </div>

              <h2 style={{ color: 'var(--text-primary)' }}>The Ethics of Psychological Triggers</h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                While understanding psychology can help you create more engaging content, it's important to use these insights ethically. Focus on providing genuine value, telling authentic stories, and building real connections with your audience. The goal isn't manipulation—it's communication that resonates.
              </p>
            </motion.article>

            <motion.div
              className="card mt-12 p-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-hover)] flex items-center justify-center text-white font-bold text-xl">
                  LP
                </div>
                <div>
                  <h3 style={{ color: 'var(--text-primary)' }}>Dr. Lisa Park</h3>
                  <p className="mb-3" style={{ color: 'var(--text-secondary)' }}>
                    Behavioral psychologist and digital marketing researcher specializing in the psychology of social media engagement and viral content.
                  </p>
                  <Link href="/contact" className="text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors">
                    Connect with Dr. Park →
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
