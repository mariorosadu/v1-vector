"use client"

import { SimpleHeader } from "@/components/simple-header"
import { Footer } from "@/components/footer"

export default function PrivacyPage() {
  return (
    <main className="bg-[#0f0f0f]">
      <SimpleHeader />
      
      <div className="pt-32 md:pt-40 pb-12 md:pb-20 px-6 md:px-12">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-3xl md:text-5xl font-light text-white mb-8">
            Privacy Policy
          </h1>
          
          <div className="prose prose-invert max-w-none">
            <div className="space-y-6 text-white/70 leading-relaxed">
              <p>
                Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>

              <section className="mt-8">
                <h2 className="text-xl md:text-2xl font-light text-white mb-4">Information We Collect</h2>
                <p>
                  VECTÖR collects information that you provide directly to us when using our platform, including when you participate in problem surface mapping sessions, use our analysis tools, or communicate with us.
                </p>
              </section>

              <section className="mt-8">
                <h2 className="text-xl md:text-2xl font-light text-white mb-4">How We Use Your Information</h2>
                <p>
                  We use the information we collect to provide, maintain, and improve our services, to develop new features, and to protect VECTÖR and our users. Your data helps us understand cognitive patterns and decision-making processes to enhance our research and tools.
                </p>
              </section>

              <section className="mt-8">
                <h2 className="text-xl md:text-2xl font-light text-white mb-4">Data Storage and Security</h2>
                <p>
                  We implement appropriate technical and organizational measures to protect your personal information against unauthorized or unlawful processing, accidental loss, destruction, or damage. Your responses and analysis data are stored securely in encrypted databases.
                </p>
              </section>

              <section className="mt-8">
                <h2 className="text-xl md:text-2xl font-light text-white mb-4">Your Rights</h2>
                <p>
                  You have the right to access, update, or delete your personal information at any time. You may also object to or restrict certain processing of your data. To exercise these rights, please contact us using the information provided below.
                </p>
              </section>

              <section className="mt-8">
                <h2 className="text-xl md:text-2xl font-light text-white mb-4">Contact Us</h2>
                <p>
                  If you have any questions about this Privacy Policy, please contact us through our platform or via email.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
