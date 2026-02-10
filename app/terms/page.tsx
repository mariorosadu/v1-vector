"use client"

import { SimpleHeader } from "@/components/simple-header"
import { Footer } from "@/components/footer"

export default function TermsPage() {
  return (
    <main className="bg-[#0f0f0f]">
      <SimpleHeader />
      
      <div className="pt-32 md:pt-40 pb-12 md:pb-20 px-6 md:px-12">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-3xl md:text-5xl font-light text-white mb-8">
            Terms of Service
          </h1>
          
          <div className="prose prose-invert max-w-none">
            <div className="space-y-6 text-white/70 leading-relaxed">
              <p>
                Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>

              <section className="mt-8">
                <h2 className="text-xl md:text-2xl font-light text-white mb-4">Acceptance of Terms</h2>
                <p>
                  By accessing and using VECTÖR's platform and services, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                </p>
              </section>

              <section className="mt-8">
                <h2 className="text-xl md:text-2xl font-light text-white mb-4">Use of Services</h2>
                <p>
                  You may use our services only for lawful purposes and in accordance with these Terms. You agree not to use our services in any way that could damage, disable, or impair our platform or interfere with any other party's use of our services.
                </p>
              </section>

              <section className="mt-8">
                <h2 className="text-xl md:text-2xl font-light text-white mb-4">Intellectual Property</h2>
                <p>
                  The content, features, and functionality of VECTÖR's platform are owned by us and are protected by international copyright, trademark, and other intellectual property laws. Our research methodologies, analysis frameworks, and tools are proprietary to VECTÖR.
                </p>
              </section>

              <section className="mt-8">
                <h2 className="text-xl md:text-2xl font-light text-white mb-4">User Content</h2>
                <p>
                  You retain ownership of any content you submit through our platform, including responses to mapping sessions and analysis inputs. By submitting content, you grant VECTÖR a license to use, modify, and analyze this content for research and service improvement purposes.
                </p>
              </section>

              <section className="mt-8">
                <h2 className="text-xl md:text-2xl font-light text-white mb-4">Limitation of Liability</h2>
                <p>
                  VECTÖR provides its services "as is" without warranties of any kind. We shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use our services.
                </p>
              </section>

              <section className="mt-8">
                <h2 className="text-xl md:text-2xl font-light text-white mb-4">Changes to Terms</h2>
                <p>
                  We reserve the right to modify these Terms of Service at any time. We will notify users of any material changes by updating the date at the top of this page. Your continued use of our services after such modifications constitutes acceptance of the updated terms.
                </p>
              </section>

              <section className="mt-8">
                <h2 className="text-xl md:text-2xl font-light text-white mb-4">Contact Information</h2>
                <p>
                  For questions about these Terms of Service, please contact us through our platform.
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
