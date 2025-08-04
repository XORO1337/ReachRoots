import React from 'react';
import { Category } from '../types';
import { categories } from '../data/mockData';
import * as Icons from 'lucide-react';

interface CategoriesProps {
  onCategorySelect: (categoryId: string) => void;
}

const Categories: React.FC<CategoriesProps> = ({ onCategorySelect }) => {
  const getIcon = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName];
    return IconComponent ? <IconComponent className="h-8 w-8" /> : null;
  };

  return (
    <section className="py-16 bg-white" id="categories">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Explore Craft Categories
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover authentic handmade products across various traditional craft categories, 
            each representing centuries of cultural heritage and artisan expertise.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <div
              key={category.id}
              onClick={() => onCategorySelect(category.id)}
              className="group cursor-pointer bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute top-4 left-4 bg-white/90 p-2 rounded-lg">
                  <div className="text-orange-600">
                    {getIcon(category.icon)}
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                  {category.name}
                </h3>
                <p className="text-gray-600 mb-4">
                  {category.productCount} products available
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-orange-600 font-medium">
                    Explore Collection →
                  </span>
                  <div className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-medium">
                    {category.productCount}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-8 lg:p-12 text-center">
          <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
            Can't Find What You're Looking For?
          </h3>
          <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
            Our network of skilled artisans can create custom pieces tailored to your specific requirements. 
            Get in touch to discuss your unique needs.
          </p>
          <button className="bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors">
            Request Custom Products
          </button>
        </div>
      </div>
    </section>
  );
};

export default Categories;