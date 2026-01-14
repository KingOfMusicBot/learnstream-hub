import { Layout } from '@/components/layout/Layout';
import { AdBanner } from '@/components/ads/AdBanner';

export default function Disclaimer() {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-hero py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-primary-foreground mb-4">
            Disclaimer
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
            <h2>General Disclaimer</h2>
            <p>
              The information provided on EduLearn is for general educational purposes 
              only. While we strive to provide accurate and up-to-date information, we 
              make no representations or warranties of any kind, express or implied, 
              about the completeness, accuracy, reliability, suitability, or availability 
              of the information, courses, or related graphics contained on the website.
            </p>

            <h2>Educational Content Disclaimer</h2>
            <p>
              The courses and educational materials on EduLearn are designed to provide 
              general information on various topics. They should not be considered as:
            </p>
            <ul>
              <li>Professional certification or accreditation</li>
              <li>Professional advice (legal, medical, financial, etc.)</li>
              <li>A substitute for formal education or training</li>
              <li>Guaranteed to produce specific outcomes or results</li>
            </ul>

            <h2>No Professional Advice</h2>
            <p>
              The content on this website is not intended to be a substitute for 
              professional advice. Always seek the advice of qualified professionals 
              with any questions you may have regarding specific matters.
            </p>

            <h2>Third-Party Links</h2>
            <p>
              Our website may contain links to third-party websites or services that 
              are not owned or controlled by EduLearn. We have no control over and 
              assume no responsibility for the content, privacy policies, or practices 
              of any third-party websites or services.
            </p>

            <h2>Advertising Disclaimer</h2>
            <p>
              EduLearn displays advertisements through third-party advertising networks, 
              including Google AdSense. These advertisements are provided by external 
              parties and do not constitute endorsement or recommendation by EduLearn. 
              We are not responsible for the content of these advertisements or any 
              products or services advertised.
            </p>

            <h2>User-Generated Content</h2>
            <p>
              If our platform allows user-generated content (comments, reviews, etc.), 
              the views expressed by users do not necessarily reflect the views of 
              EduLearn. We do not endorse or take responsibility for user-generated 
              content.
            </p>

            <h2>Technical Disclaimer</h2>
            <p>
              We do not guarantee that our website will be available at all times or 
              that it will be free from errors, viruses, or other harmful components. 
              We recommend that users maintain appropriate security measures on their 
              devices.
            </p>

            <h2>Results Disclaimer</h2>
            <p>
              Any success stories, testimonials, or examples of results on this website 
              are individual experiences and are not guarantees of future performance. 
              Your results may vary depending on various factors including your 
              dedication, experience, and application of the material.
            </p>

            <h2>Changes to Disclaimer</h2>
            <p>
              We reserve the right to modify this disclaimer at any time. Changes will 
              be effective immediately upon posting to the website. Your continued use 
              of the website constitutes acceptance of any changes.
            </p>

            <h2>Contact Us</h2>
            <p>
              If you have any questions about this Disclaimer, please contact us at:
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
