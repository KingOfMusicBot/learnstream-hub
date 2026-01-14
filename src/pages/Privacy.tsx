import { Layout } from '@/components/layout/Layout';
import { AdBanner } from '@/components/ads/AdBanner';

export default function Privacy() {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-hero py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-primary-foreground mb-4">
            Privacy Policy
          </h1>
          <p className="text-primary-foreground/90">
            Last updated: January 2025
          </p>
        </div>
      </section>

      <AdBanner position="top" />

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto prose prose-lg">
            <h2>1. Introduction</h2>
            <p>
              EduLearn ("we," "our," or "us") is committed to protecting your privacy. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard 
              your information when you visit our website and use our services.
            </p>

            <h2>2. Information We Collect</h2>
            <h3>2.1 Personal Information</h3>
            <p>
              We may collect personal information that you provide directly to us, including:
            </p>
            <ul>
              <li>Name and email address when you create an account</li>
              <li>Username and profile information</li>
              <li>Communications you send to us</li>
              <li>Course progress and learning data</li>
            </ul>

            <h3>2.2 Automatically Collected Information</h3>
            <p>
              When you access our website, we automatically collect certain information:
            </p>
            <ul>
              <li>IP address and browser type</li>
              <li>Device information and operating system</li>
              <li>Pages visited and time spent on pages</li>
              <li>Referring website addresses</li>
            </ul>

            <h2>3. Use of Cookies and Tracking Technologies</h2>
            <p>
              We use cookies, web beacons, and similar tracking technologies to:
            </p>
            <ul>
              <li>Remember your preferences and settings</li>
              <li>Understand how you use our website</li>
              <li>Personalize your experience</li>
              <li>Deliver targeted advertisements</li>
            </ul>

            <h2>4. Third-Party Advertising</h2>
            <p>
              We use third-party advertising companies, including Google AdSense, to 
              serve ads when you visit our website. These companies may use cookies 
              and similar technologies to collect information about your visits to 
              this and other websites to provide relevant advertisements.
            </p>
            <p>
              Google, as a third-party vendor, uses cookies to serve ads on our site. 
              Google's use of the DART cookie enables it to serve ads based on your 
              visit to our site and other sites on the Internet. You may opt out of 
              the use of the DART cookie by visiting the Google ad and content network 
              privacy policy at{' '}
              <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer">
                https://policies.google.com/technologies/ads
              </a>.
            </p>

            <h2>5. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide, maintain, and improve our services</li>
              <li>Process your registration and manage your account</li>
              <li>Track your learning progress</li>
              <li>Send you updates, newsletters, and marketing communications</li>
              <li>Respond to your comments and questions</li>
              <li>Analyze usage patterns and trends</li>
              <li>Display personalized advertisements</li>
            </ul>

            <h2>6. Sharing of Information</h2>
            <p>
              We may share your information with:
            </p>
            <ul>
              <li>Service providers who assist in our operations</li>
              <li>Advertising partners, including Google AdSense</li>
              <li>Analytics providers to help us understand site usage</li>
              <li>Legal authorities when required by law</li>
            </ul>

            <h2>7. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect 
              your personal information against unauthorized access, alteration, 
              disclosure, or destruction. However, no method of transmission over the 
              Internet is 100% secure.
            </p>

            <h2>8. Your Rights</h2>
            <p>
              Depending on your location, you may have the right to:
            </p>
            <ul>
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your personal information</li>
              <li>Opt out of marketing communications</li>
              <li>Opt out of targeted advertising</li>
            </ul>

            <h2>9. Children's Privacy</h2>
            <p>
              Our services are not directed to children under 13. We do not knowingly 
              collect personal information from children under 13. If you believe a 
              child has provided us with personal information, please contact us.
            </p>

            <h2>10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you 
              of any changes by posting the new Privacy Policy on this page and 
              updating the "Last updated" date.
            </p>

            <h2>11. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <ul>
              <li>Email: privacy@edulearn.com</li>
              <li>Address: 123 Education Street, San Francisco, CA 94102</li>
            </ul>
          </div>
        </div>
      </section>

      <AdBanner position="bottom" />
    </Layout>
  );
}
