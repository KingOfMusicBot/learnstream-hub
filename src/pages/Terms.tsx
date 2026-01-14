import { Layout } from '@/components/layout/Layout';
import { AdBanner } from '@/components/ads/AdBanner';

export default function Terms() {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-hero py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-primary-foreground mb-4">
            Terms of Service
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
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using EduLearn ("the Service"), you accept and agree to 
              be bound by these Terms of Service. If you do not agree to these terms, 
              please do not use our Service.
            </p>

            <h2>2. Description of Service</h2>
            <p>
              EduLearn provides an online learning platform offering free educational 
              courses. The Service is supported by advertisements and may include 
              personalized advertising based on your usage patterns.
            </p>

            <h2>3. User Accounts</h2>
            <h3>3.1 Registration</h3>
            <p>
              To access certain features, you must create an account. You agree to 
              provide accurate, current, and complete information during registration.
            </p>
            <h3>3.2 Account Security</h3>
            <p>
              You are responsible for maintaining the confidentiality of your account 
              credentials and for all activities that occur under your account.
            </p>

            <h2>4. User Conduct</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Use the Service for any unlawful purpose</li>
              <li>Share your account with others</li>
              <li>Attempt to gain unauthorized access to any part of the Service</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Download, copy, or redistribute course content without permission</li>
              <li>Use automated systems to access the Service</li>
              <li>Circumvent any access restrictions or advertising displays</li>
            </ul>

            <h2>5. Intellectual Property</h2>
            <h3>5.1 Course Content</h3>
            <p>
              All course materials, including videos, text, images, and other content, 
              are protected by copyright and other intellectual property laws. You may 
              not reproduce, distribute, or create derivative works without permission.
            </p>
            <h3>5.2 Trademarks</h3>
            <p>
              EduLearn and related logos are trademarks of EduLearn. You may not use 
              these trademarks without our prior written consent.
            </p>

            <h2>6. Advertising</h2>
            <p>
              The Service is ad-supported. By using the Service, you agree to receive 
              advertisements, including personalized advertisements based on your usage 
              and preferences. You agree not to use ad-blocking technology that 
              interferes with the display of advertisements.
            </p>

            <h2>7. Disclaimer of Warranties</h2>
            <p>
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES 
              OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE 
              SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE.
            </p>

            <h2>8. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, EDULEARN SHALL NOT BE LIABLE 
              FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE 
              DAMAGES ARISING OUT OF YOUR USE OF THE SERVICE.
            </p>

            <h2>9. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless EduLearn and its officers, 
              directors, employees, and agents from any claims, damages, losses, or 
              expenses arising from your use of the Service or violation of these Terms.
            </p>

            <h2>10. Termination</h2>
            <p>
              We may terminate or suspend your access to the Service at any time, 
              without prior notice, for conduct that we believe violates these Terms 
              or is harmful to other users, us, or third parties.
            </p>

            <h2>11. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will notify 
              users of any material changes by posting the new Terms on this page. 
              Your continued use of the Service after changes constitutes acceptance.
            </p>

            <h2>12. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the 
              laws of the State of California, without regard to its conflict of law 
              provisions.
            </p>

            <h2>13. Contact Information</h2>
            <p>
              If you have any questions about these Terms, please contact us at:
            </p>
            <ul>
              <li>Email: legal@edulearn.com</li>
              <li>Address: 123 Education Street, San Francisco, CA 94102</li>
            </ul>
          </div>
        </div>
      </section>

      <AdBanner position="bottom" />
    </Layout>
  );
}
