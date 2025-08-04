import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, MapPin, Award } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative bg-gradient-to-r from-orange-50 to-amber-50 py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center px-4 py-2 bg-orange-100 rounded-full text-orange-700 text-sm font-medium">
              <Award className="h-4 w-4 mr-2" />
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
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/signup"
                className="bg-orange-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center justify-center"
              >
                Start Shopping
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <button className="border-2 border-orange-600 text-orange-600 px-8 py-4 rounded-lg font-semibold hover:bg-orange-50 transition-colors">
                Meet Our Artisans
              </button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">500+</div>
                <div className="text-gray-600">Skilled Artisans</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">50+</div>
                <div className="text-gray-600">Cities Connected</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">10K+</div>
                <div className="text-gray-600">Happy Customers</div>
              </div>
            </div>
          </div>
          
          {/* Image Content */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <img
                  src="https://images.pexels.com/photos/6292652/pexels-photo-6292652.jpeg?auto=compress&cs=tinysrgb&w=300"
                  alt="Traditional textiles"
                  className="rounded-lg shadow-lg w-full h-48 object-cover"
                />
                <img
                  src="https://images.pexels.com/photos/1081199/pexels-photo-1081199.jpeg?auto=compress&cs=tinysrgb&w=300"
                  alt="Pottery crafts"
                  className="rounded-lg shadow-lg w-full h-32 object-cover"
                />
              </div>
              <div className="space-y-4 pt-8">
                <img
                  src="https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=300"
                  alt="Wooden crafts"
                  className="rounded-lg shadow-lg w-full h-32 object-cover"
                />
                <img
                  src="https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg?auto=compress&cs=tinysrgb&w=300"
                  alt="Jewelry and accessories"
                  className="rounded-lg shadow-lg w-full h-48 object-cover"
                />
              </div>
            </div>
            
            {/* Floating Cards */}
            <div className="absolute -top-4 -left-4 bg-white p-4 rounded-lg shadow-lg">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-orange-600" />
                <div>
                  <div className="font-semibold text-sm">Direct from Artisans</div>
                  <div className="text-xs text-gray-600">No middlemen</div>
                </div>
              </div>
            </div>
            
            <div className="absolute -bottom-4 -right-4 bg-white p-4 rounded-lg shadow-lg">
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-orange-600" />
                <div>
                  <div className="font-semibold text-sm">Pan-India Network</div>
                  <div className="text-xs text-gray-600">50+ cities covered</div>
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