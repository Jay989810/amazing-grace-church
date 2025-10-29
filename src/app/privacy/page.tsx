import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - Amazing Grace Baptist Church',
  description: 'Privacy policy for Amazing Grace Baptist Church website.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-primary mb-8">Privacy Policy</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-muted-foreground mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">Information We Collect</h2>
              <p className="text-muted-foreground mb-4">
                We collect information you provide directly to us, such as when you:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-2">
                <li>Contact us through our contact form</li>
                <li>Subscribe to our newsletter</li>
                <li>Register for events</li>
                <li>Interact with our website</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">How We Use Your Information</h2>
              <p className="text-muted-foreground mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Send you technical notices and support messages</li>
                <li>Respond to your comments and questions</li>
                <li>Communicate with you about events and activities</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">Information Sharing</h2>
              <p className="text-muted-foreground mb-4">
                We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">Contact Us</h2>
              <p className="text-muted-foreground mb-4">
                If you have any questions about this Privacy Policy, please contact us at:
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
