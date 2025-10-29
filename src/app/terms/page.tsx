import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service - Amazing Grace Baptist Church',
  description: 'Terms of service for Amazing Grace Baptist Church website.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-primary mb-8">Terms of Service</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-muted-foreground mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">Acceptance of Terms</h2>
              <p className="text-muted-foreground mb-4">
                By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">Use License</h2>
              <p className="text-muted-foreground mb-4">
                Permission is granted to temporarily download one copy of the materials on Amazing Grace Baptist Church's website for personal, non-commercial transitory viewing only.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">Disclaimer</h2>
              <p className="text-muted-foreground mb-4">
                The materials on Amazing Grace Baptist Church's website are provided on an 'as is' basis. Amazing Grace Baptist Church makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">Limitations</h2>
              <p className="text-muted-foreground mb-4">
                In no event shall Amazing Grace Baptist Church or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Amazing Grace Baptist Church's website.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">Contact Information</h2>
              <p className="text-muted-foreground mb-4">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-muted-foreground">
                  Email: info@amazinggracechurch.org<br />
                  Phone: +234 XXX XXX XXXX<br />
                  Address: U/Zawu, Gonin Gora, Kaduna State, Nigeria
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
