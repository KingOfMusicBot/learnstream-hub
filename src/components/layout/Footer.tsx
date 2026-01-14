import { Link } from 'react-router-dom';
import { BookOpen, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Youtube } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-dark text-primary-foreground">
      {/* AdSense Placeholder - Footer */}
      <div className="container mx-auto px-4 py-4">
        <div className="adsense-placeholder h-24 bg-primary-light/20 border-primary-light/30">
          AdSense Banner - Footer
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center transition-transform group-hover:scale-105">
                <BookOpen className="w-5 h-5 text-secondary-foreground" />
              </div>
              <span className="text-xl font-display font-bold">
                Edu<span className="text-secondary">Learn</span>
              </span>
            </Link>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              Empowering learners worldwide with free, high-quality education. 
              Start your learning journey today.
            </p>
            <div className="flex gap-3">
              {[Facebook, Twitter, Linkedin, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-lg bg-primary-foreground/10 hover:bg-secondary flex items-center justify-center transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { href: '/courses', label: 'All Courses' },
                { href: '/about', label: 'About Us' },
                { href: '/contact', label: 'Contact' },
                { href: '/faq', label: 'FAQ' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-primary-foreground/70 hover:text-secondary text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-4">Legal</h4>
            <ul className="space-y-2">
              {[
                { href: '/privacy', label: 'Privacy Policy' },
                { href: '/terms', label: 'Terms & Conditions' },
                { href: '/disclaimer', label: 'Disclaimer' },
                { href: '/cookies', label: 'Cookie Policy' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-primary-foreground/70 hover:text-secondary text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-primary-foreground/70">
                <Mail className="w-4 h-4 mt-0.5 text-secondary" />
                <span>support@edulearn.com</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-primary-foreground/70">
                <Phone className="w-4 h-4 mt-0.5 text-secondary" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-primary-foreground/70">
                <MapPin className="w-4 h-4 mt-0.5 text-secondary" />
                <span>123 Learning Street<br />Education City, EC 12345</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-primary-foreground/50">
            © {currentYear} EduLearn. All rights reserved.
          </p>
          <p className="text-xs text-primary-foreground/40">
            Made with ❤️ for learners everywhere
          </p>
        </div>
      </div>
    </footer>
  );
}
