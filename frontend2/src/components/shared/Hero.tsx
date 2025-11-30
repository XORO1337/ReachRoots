import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, MapPin, Award } from 'lucide-react';
<<<<<<< HEAD
import { useHeroShowcase } from '../../hooks/useHeroShowcase';

const Hero: React.FC = () => {
=======
import { useTranslation } from 'react-i18next';
import { useHeroShowcase } from '../../hooks/useHeroShowcase';

const Hero: React.FC = () => {
  const { t } = useTranslation();
>>>>>>> fixed-repo/main
  const { products, loading, error } = useHeroShowcase();

  // Fallback images in case of no data or loading
  const fallbackImages = [
    "https://images.pexels.com/photos/6292652/pexels-photo-6292652.jpeg?auto=compress&cs=tinysrgb&w=300",
    "https://images.pexels.com/photos/1081199/pexels-photo-1081199.jpeg?auto=compress&cs=tinysrgb&w=300",
    "https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=300",
    "https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg?auto=compress&cs=tinysrgb&w=300"
  ];

  // Get images from products or use fallbacks
  const getShowcaseImages = () => {
    if (loading || error) return fallbackImages;
    
    const allProducts = [
      ...products.textiles,
      ...products.pottery,
      ...products.wooden,
      ...products.jewelry
    ];
    
    if (allProducts.length === 0) return fallbackImages;
    
    return allProducts
      .filter(product => product.images && product.images.length > 0)
      .map(product => product.images[0])
      .slice(0, 4);
  };

  const showcaseImages = getShowcaseImages();
  return (
    <section className="relative bg-gradient-to-r from-orange-50 to-amber-50 py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center px-4 py-2 bg-orange-100 rounded-full text-orange-700 text-sm font-medium">
              <Award className="h-4 w-4 mr-2" />
<<<<<<< HEAD
              Authentic Handmade Crafts
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Connect with
              <span className="text-orange-600 block">Skilled Artisans</span>
              Across India
            </h1>
            
            <p className="text-xl text-gray-600 max-w-2xl">
              Discover authentic handmade crafts directly from talented artisans in tier 2 and tier 3 cities. 
              Support traditional craftsmanship while sourcing unique products for your business.
=======
              {t('hero.badge')}
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
              {t('hero.titleLine1')}
              <span className="text-orange-600 block">{t('hero.titleLine2')}</span>
              {t('hero.titleLine3')}
            </h1>
            
            <p className="text-xl text-gray-600 max-w-2xl">
              {t('hero.description')}
>>>>>>> fixed-repo/main
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/signup"
                className="bg-orange-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center justify-center"
              >
<<<<<<< HEAD
                Start Shopping
=======
                {t('hero.startShopping')}
>>>>>>> fixed-repo/main
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link 
                to="/artisans/top"
                className="border-2 border-orange-600 text-orange-600 px-8 py-4 rounded-lg font-semibold hover:bg-orange-50 transition-colors text-center"
              >
<<<<<<< HEAD
                Meet Our Artisans
=======
                {t('hero.meetArtisans')}
>>>>>>> fixed-repo/main
              </Link>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">500+</div>
<<<<<<< HEAD
                <div className="text-gray-600">Skilled Artisans</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">50+</div>
                <div className="text-gray-600">Cities Connected</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">10K+</div>
                <div className="text-gray-600">Happy Customers</div>
=======
                <div className="text-gray-600">{t('hero.stats.artisans')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">50+</div>
                <div className="text-gray-600">{t('hero.stats.cities')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">10K+</div>
                <div className="text-gray-600">{t('hero.stats.customers')}</div>
>>>>>>> fixed-repo/main
              </div>
            </div>
          </div>
          
          {/* Image Content */}
          <div className="relative">
            {loading ? (
              // Loading skeleton
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="rounded-lg bg-gray-200 animate-pulse w-full h-48"></div>
                  <div className="rounded-lg bg-gray-200 animate-pulse w-full h-32"></div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="rounded-lg bg-gray-200 animate-pulse w-full h-32"></div>
                  <div className="rounded-lg bg-gray-200 animate-pulse w-full h-48"></div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="relative group">
                    <img
                      src={showcaseImages[0] || fallbackImages[0]}
                      alt="Traditional textiles"
                      className="rounded-lg shadow-lg w-full h-48 object-cover transition-transform group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = fallbackImages[0];
                      }}
                    />
                    {products.textiles.length > 0 && (
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-end">
                        <div className="p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-sm font-semibold">{products.textiles[0]?.name}</p>
                          <p className="text-xs">₹{products.textiles[0]?.price}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="relative group">
                    <img
                      src={showcaseImages[1] || fallbackImages[1]}
                      alt="Pottery crafts"
                      className="rounded-lg shadow-lg w-full h-32 object-cover transition-transform group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = fallbackImages[1];
                      }}
                    />
                    {products.pottery.length > 0 && (
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-end">
                        <div className="p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-sm font-semibold">{products.pottery[0]?.name}</p>
                          <p className="text-xs">₹{products.pottery[0]?.price}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="relative group">
                    <img
                      src={showcaseImages[2] || fallbackImages[2]}
                      alt="Wooden crafts"
                      className="rounded-lg shadow-lg w-full h-32 object-cover transition-transform group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = fallbackImages[2];
                      }}
                    />
                    {products.wooden.length > 0 && (
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-end">
                        <div className="p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-sm font-semibold">{products.wooden[0]?.name}</p>
                          <p className="text-xs">₹{products.wooden[0]?.price}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="relative group">
                    <img
                      src={showcaseImages[3] || fallbackImages[3]}
                      alt="Jewelry and accessories"
                      className="rounded-lg shadow-lg w-full h-48 object-cover transition-transform group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = fallbackImages[3];
                      }}
                    />
                    {products.jewelry.length > 0 && (
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-end">
                        <div className="p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-sm font-semibold">{products.jewelry[0]?.name}</p>
                          <p className="text-xs">₹{products.jewelry[0]?.price}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Floating Cards */}
            <div className="absolute -top-4 -left-4 bg-white p-4 rounded-lg shadow-lg">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-orange-600" />
                <div>
<<<<<<< HEAD
                  <div className="font-semibold text-sm">Direct from Artisans</div>
                  <div className="text-xs text-gray-600">No middlemen</div>
=======
                  <div className="font-semibold text-sm">{t('hero.directFromArtisans')}</div>
                  <div className="text-xs text-gray-600">{t('hero.noMiddlemen')}</div>
>>>>>>> fixed-repo/main
                </div>
              </div>
            </div>
            
            <div className="absolute -bottom-4 -right-4 bg-white p-4 rounded-lg shadow-lg">
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-orange-600" />
                <div>
<<<<<<< HEAD
                  <div className="font-semibold text-sm">Pan-India Network</div>
                  <div className="text-xs text-gray-600">50+ cities covered</div>
=======
                  <div className="font-semibold text-sm">{t('hero.panIndiaNetwork')}</div>
                  <div className="text-xs text-gray-600">{t('hero.citiesCovered')}</div>
>>>>>>> fixed-repo/main
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;