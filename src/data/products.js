export const websites = [
  {
    id: 'restaurant-pro',
    type: 'website',
    name: 'Restaurant Pro',
    category: 'Restaurant',
    price: 79,
    badge: 'Popular',
    description: 'A conversion-focused restaurant site with menu, reservations and WhatsApp ordering.',
    features: ['Responsive design', 'Digital menu', 'WhatsApp CTA', 'Booking form', 'Google Maps section'],
    colors: ['#ff7a18', '#af002d'],
    delivery: '2–4 business days',
    revisions: '2 revision rounds',
    demo: '/demo/site/restaurant-pro'
  },
  {
    id: 'business-pro',
    type: 'website',
    name: 'Business Pro',
    category: 'Business',
    price: 99,
    badge: 'Best value',
    description: 'Clean company website for service businesses, agencies and growing brands.',
    features: ['5-page structure', 'Lead capture', 'Services section', 'Testimonials', 'Contact form'],
    colors: ['#334155', '#0f172a'],
    delivery: '2–4 business days',
    revisions: '2 revision rounds',
    demo: '/demo/site/business-pro'
  },
  {
    id: 'store-pro',
    type: 'website',
    name: 'Store Pro',
    category: 'E-commerce',
    price: 149,
    badge: 'New',
    description: 'Modern storefront starter with product cards, cart preview and direct ordering.',
    features: ['Product catalog', 'Cart preview', 'Order CTA', 'Categories', 'Mobile-first'],
    colors: ['#06b6d4', '#2563eb'],
    delivery: '3–5 business days',
    revisions: '2 revision rounds',
    demo: '/demo/site/store-pro'
  },
  {
    id: 'portfolio-pro',
    type: 'website',
    name: 'Portfolio Pro',
    category: 'Portfolio',
    price: 59,
    badge: '',
    description: 'Minimal portfolio for creators, freelancers, photographers and developers.',
    features: ['Project gallery', 'About section', 'Testimonials', 'Contact CTA', 'Fast layout'],
    colors: ['#7c3aed', '#111827'],
    delivery: '1–3 business days',
    revisions: '2 revision rounds',
    demo: '/demo/site/portfolio-pro'
  }
];

export const chatbots = [
  {
    id: 'support-ai',
    type: 'chatbot',
    name: 'Support AI',
    category: 'Customer support',
    price: 69,
    badge: 'Popular',
    description: 'Answers FAQs, captures leads and directs customers to the right channel.',
    features: ['FAQ answers', 'Lead capture', 'Business hours', 'Escalation prompts', 'Website widget'],
    delivery: '2–3 business days',
    revisions: '1 setup revision',
    demo: '/demo/bot/support-ai'
  },
  {
    id: 'booking-ai',
    type: 'chatbot',
    name: 'Booking AI',
    category: 'Appointments',
    price: 89,
    badge: 'Business',
    description: 'Guides visitors through bookings and collects the details your team needs.',
    features: ['Service selection', 'Customer details', 'Booking intent', 'FAQ support', 'Follow-up CTA'],
    delivery: '2–4 business days',
    revisions: '1 setup revision',
    demo: '/demo/bot/booking-ai'
  },
  {
    id: 'sales-ai',
    type: 'chatbot',
    name: 'Sales AI',
    category: 'Sales',
    price: 119,
    badge: 'Growth',
    description: 'A sales assistant that helps visitors compare products and take the next step.',
    features: ['Product guidance', 'Objection handling', 'Lead capture', 'Offer prompts', 'CTA routing'],
    delivery: '3–5 business days',
    revisions: '1 setup revision',
    demo: '/demo/bot/sales-ai'
  }
];

export const allProducts = [...websites, ...chatbots];
