import React from 'react';
<<<<<<< HEAD
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
=======
import { useTranslation } from 'react-i18next';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  const { t } = useTranslation();
>>>>>>> fixed-repo/main
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-orange-400">RootsReach</h3>
            <p className="text-gray-300 leading-relaxed">
<<<<<<< HEAD
              Connecting authentic artisans from tier 2 and tier 3 cities with distributors and buyers worldwide. 
              Empowering traditional craftsmanship through modern technology.
=======
              {t('footer.aboutDesc')}
>>>>>>> fixed-repo/main
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
<<<<<<< HEAD
            <h4 className="text-lg font-semibold">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-orange-400 transition-colors">About Us</a></li>
              <li><a href="#" className="text-gray-300 hover:text-orange-400 transition-colors">How It Works</a></li>
              <li><a href="#" className="text-gray-300 hover:text-orange-400 transition-colors">Become a Seller</a></li>
              <li><a href="#" className="text-gray-300 hover:text-orange-400 transition-colors">Quality Assurance</a></li>
              <li><a href="#" className="text-gray-300 hover:text-orange-400 transition-colors">Bulk Orders</a></li>
=======
            <h4 className="text-lg font-semibold">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-orange-400 transition-colors">{t('footer.about')}</a></li>
              <li><a href="#" className="text-gray-300 hover:text-orange-400 transition-colors">{t('footer.howItWorks')}</a></li>
              <li><a href="#" className="text-gray-300 hover:text-orange-400 transition-colors">{t('footer.becomeSeller')}</a></li>
              <li><a href="#" className="text-gray-300 hover:text-orange-400 transition-colors">{t('footer.qualityAssurance')}</a></li>
              <li><a href="#" className="text-gray-300 hover:text-orange-400 transition-colors">{t('footer.bulkOrders')}</a></li>
>>>>>>> fixed-repo/main
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
<<<<<<< HEAD
            <h4 className="text-lg font-semibold">Categories</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-orange-400 transition-colors">Textiles & Fabrics</a></li>
              <li><a href="#" className="text-gray-300 hover:text-orange-400 transition-colors">Pottery & Ceramics</a></li>
              <li><a href="#" className="text-gray-300 hover:text-orange-400 transition-colors">Jewelry & Accessories</a></li>
              <li><a href="#" className="text-gray-300 hover:text-orange-400 transition-colors">Woodwork & Furniture</a></li>
              <li><a href="#" className="text-gray-300 hover:text-orange-400 transition-colors">Home Decor</a></li>
=======
            <h4 className="text-lg font-semibold">{t('navigation.categories')}</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-orange-400 transition-colors">{t('categories.textiles')}</a></li>
              <li><a href="#" className="text-gray-300 hover:text-orange-400 transition-colors">{t('categories.pottery')}</a></li>
              <li><a href="#" className="text-gray-300 hover:text-orange-400 transition-colors">{t('categories.jewelry')}</a></li>
              <li><a href="#" className="text-gray-300 hover:text-orange-400 transition-colors">{t('categories.woodwork')}</a></li>
              <li><a href="#" className="text-gray-300 hover:text-orange-400 transition-colors">{t('footer.homeDecor')}</a></li>
>>>>>>> fixed-repo/main
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
<<<<<<< HEAD
            <h4 className="text-lg font-semibold">Contact Us</h4>
=======
            <h4 className="text-lg font-semibold">{t('footer.contactUs')}</h4>
>>>>>>> fixed-repo/main
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-orange-400" />
                <span className="text-gray-300">1800-ROOTS-1</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-orange-400" />
                <span className="text-gray-300">gamerroyale441@gmail.com</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-orange-400 mt-0.5" />
                <span className="text-gray-300">
                  Adarsh Nagar <br />
                  New Delhi, India 110033
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
<<<<<<< HEAD
              © 2025 RootsReach. All rights reserved. Empowering artisans, enriching lives.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-orange-400 text-sm transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-400 text-sm transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-400 text-sm transition-colors">
                Cookie Policy
=======
              © 2025 {t('footer.copyright')}
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-orange-400 text-sm transition-colors">
                {t('footer.privacyPolicy')}
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-400 text-sm transition-colors">
                {t('footer.termsOfService')}
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-400 text-sm transition-colors">
                {t('footer.cookiePolicy')}
>>>>>>> fixed-repo/main
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;