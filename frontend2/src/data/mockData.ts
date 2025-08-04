import { Product, Seller, Category } from '../types';

export const sellers: Seller[] = [
  {
    id: '1',
    name: 'Priya Sharma',
    city: 'Jaipur',
    state: 'Rajasthan',
    avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=200',
    story: 'Priya has been crafting traditional Rajasthani textiles for over 15 years, learning the art from her grandmother. She specializes in block printing and natural dyeing techniques.',
    specialties: ['Block Printing', 'Natural Dyeing', 'Cotton Textiles'],
    rating: 4.8,
    totalProducts: 45,
    yearsOfExperience: 15
  },
  {
    id: '2',
    name: 'Ramesh Kumar',
    city: 'Khurja',
    state: 'Uttar Pradesh',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200',
    story: 'Master potter Ramesh comes from a family of ceramicists in Khurja, known as the pottery capital of India. His work combines traditional techniques with contemporary designs.',
    specialties: ['Ceramic Pottery', 'Glazing', 'Traditional Designs'],
    rating: 4.9,
    totalProducts: 32,
    yearsOfExperience: 20
  },
  {
    id: '3',
    name: 'Meera Devi',
    city: 'Channapatna',
    state: 'Karnataka',
    avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=200',
    story: 'Meera is a skilled woodcarver specializing in Channapatna toys and decorative items. She uses only natural colors and traditional lacquering techniques.',
    specialties: ['Wood Carving', 'Toy Making', 'Natural Lacquering'],
    rating: 4.7,
    totalProducts: 28,
    yearsOfExperience: 12
  },
  {
    id: '4',
    name: 'Arjun Patel',
    city: 'Kutch',
    state: 'Gujarat',
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=200',
    story: 'Arjun is a master craftsman from Kutch, specializing in intricate mirror work and embroidery. His family has been practicing this art for generations.',
    specialties: ['Mirror Work', 'Embroidery', 'Traditional Textiles'],
    rating: 4.8,
    totalProducts: 38,
    yearsOfExperience: 18
  }
];

export const categories: Category[] = [
  {
    id: 'textiles',
    name: 'Textiles & Fabrics',
    image: 'https://images.pexels.com/photos/6292652/pexels-photo-6292652.jpeg?auto=compress&cs=tinysrgb&w=300',
    icon: 'Shirt',
    productCount: 145
  },
  {
    id: 'pottery',
    name: 'Pottery & Ceramics',
    image: 'https://images.pexels.com/photos/1081199/pexels-photo-1081199.jpeg?auto=compress&cs=tinysrgb&w=300',
    icon: 'Cookie',
    productCount: 89
  },
  {
    id: 'jewelry',
    name: 'Jewelry & Accessories',
    image: 'https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg?auto=compress&cs=tinysrgb&w=300',
    icon: 'Gem',
    productCount: 76
  },
  {
    id: 'woodwork',
    name: 'Woodwork & Furniture',
    image: 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=300',
    icon: 'TreePine',
    productCount: 54
  },
  {
    id: 'metalwork',
    name: 'Metalwork & Brass',
    image: 'https://images.pexels.com/photos/6045247/pexels-photo-6045247.jpeg?auto=compress&cs=tinysrgb&w=300',
    icon: 'Wrench',
    productCount: 67
  },
  {
    id: 'home-decor',
    name: 'Home Decor',
    image: 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=300',
    icon: 'Home',
    productCount: 112
  }
];

export const products: Product[] = [
  {
    id: '1',
    name: 'Hand Block Printed Cotton Saree',
    price: 2500,
    originalPrice: 3200,
    image: 'https://images.pexels.com/photos/6292652/pexels-photo-6292652.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'textiles',
    seller: sellers[0],
    description: 'Beautiful hand block printed cotton saree with traditional Rajasthani motifs. Made using natural dyes and eco-friendly printing techniques.',
    materials: ['100% Cotton', 'Natural Dyes', 'Wooden Blocks'],
    craftType: 'Block Printing',
    rating: 4.8,
    reviews: 24,
    inStock: true,
    minOrder: 5
  },
  {
    id: '2',
    name: 'Khurja Blue Pottery Vase Set',
    price: 1800,
    originalPrice: 2400,
    image: 'https://images.pexels.com/photos/1081199/pexels-photo-1081199.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'pottery',
    seller: sellers[1],
    description: 'Exquisite set of 3 blue pottery vases featuring traditional Khurja craftsmanship. Perfect for home decor and gifting.',
    materials: ['Clay', 'Natural Glazes', 'Traditional Pigments'],
    craftType: 'Pottery',
    rating: 4.9,
    reviews: 18,
    inStock: true,
    minOrder: 2
  },
  {
    id: '3',
    name: 'Channapatna Wooden Toy Set',
    price: 1200,
    image: 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'woodwork',
    seller: sellers[2],
    description: 'Traditional Channapatna wooden toys made with natural lacquer. Safe for children and beautifully crafted.',
    materials: ['Ivory Wood', 'Natural Lacquer', 'Vegetable Dyes'],
    craftType: 'Wood Carving',
    rating: 4.7,
    reviews: 32,
    inStock: true,
    minOrder: 10
  },
  {
    id: '4',
    name: 'Kutch Mirror Work Wall Hanging',
    price: 3200,
    originalPrice: 4000,
    image: 'https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'textiles',
    seller: sellers[3],
    description: 'Stunning mirror work wall hanging from Kutch, Gujarat. Features intricate embroidery and traditional mirror work.',
    materials: ['Cotton Fabric', 'Mirrors', 'Silk Thread'],
    craftType: 'Mirror Work',
    rating: 4.8,
    reviews: 15,
    inStock: true,
    minOrder: 3
  },
  {
    id: '5',
    name: 'Handwoven Cotton Table Runner',
    price: 800,
    originalPrice: 1000,
    image: 'https://images.pexels.com/photos/6292652/pexels-photo-6292652.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'textiles',
    seller: sellers[0],
    description: 'Elegant handwoven cotton table runner with traditional patterns. Perfect for dining rooms and special occasions.',
    materials: ['Handspun Cotton', 'Natural Dyes'],
    craftType: 'Handloom Weaving',
    rating: 4.6,
    reviews: 28,
    inStock: true,
    minOrder: 8
  },
  {
    id: '6',
    name: 'Terracotta Garden Planters Set',
    price: 1500,
    image: 'https://images.pexels.com/photos/1081199/pexels-photo-1081199.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'pottery',
    seller: sellers[1],
    description: 'Set of 4 handcrafted terracotta planters with drainage holes. Perfect for indoor and outdoor gardening.',
    materials: ['Terracotta Clay', 'Natural Glazes'],
    craftType: 'Pottery',
    rating: 4.5,
    reviews: 21,
    inStock: true,
    minOrder: 6
  },
  {
    id: '7',
    name: 'Brass Decorative Bowl Set',
    price: 2200,
    image: 'https://images.pexels.com/photos/6045247/pexels-photo-6045247.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'metalwork',
    seller: sellers[1],
    description: 'Handcrafted brass bowls with intricate engravings. Perfect for serving and decoration.',
    materials: ['Pure Brass', 'Traditional Tools'],
    craftType: 'Metal Engraving',
    rating: 4.7,
    reviews: 19,
    inStock: true,
    minOrder: 4
  },
  {
    id: '8',
    name: 'Handmade Jute Bags Collection',
    price: 600,
    originalPrice: 800,
    image: 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'home-decor',
    seller: sellers[3],
    description: 'Eco-friendly jute bags with traditional prints. Set of 3 different sizes for various uses.',
    materials: ['Natural Jute', 'Cotton Handles', 'Eco-friendly Inks'],
    craftType: 'Textile Craft',
    rating: 4.4,
    reviews: 42,
    inStock: true,
    minOrder: 12
  }
];