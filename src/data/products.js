export const websites = [
  {
    id: 'restaurant-pro', type: 'website', name: 'Ember Dining', category: 'Restaurant', price: 79, badge: 'Popular',
    description: 'An editorial restaurant website with rich food photography, menu storytelling, reservations and direct ordering.',
    features: ['Responsive design', 'Digital menu', 'WhatsApp CTA', 'Booking flow', 'Google Maps section'],
    colors: ['#6f3928', '#1f1612'],
    images: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=88',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=88',
      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1200&q=88',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=88',
      'https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&w=1200&q=88'
    ], delivery: '2–4 business days', revisions: '2 revision rounds', preview: '/preview/site/restaurant-pro'
  },
  {
    id: 'business-pro', type: 'website', name: 'Northstar Business', category: 'Business', price: 99, badge: 'Best value',
    description: 'A polished company website for service firms, agencies and growing brands that need authority and clarity.',
    features: ['5-page structure', 'Lead capture', 'Services section', 'Case studies', 'Contact form'],
    colors: ['#27364a', '#101827'],
    images: [
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=88',
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=88',
      'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=88',
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=88',
      'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1200&q=88'
    ], delivery: '2–4 business days', revisions: '2 revision rounds', preview: '/preview/site/business-pro'
  },
  {
    id: 'store-pro', type: 'website', name: 'Forme Store', category: 'E-commerce', price: 149, badge: 'New',
    description: 'A fashion-forward storefront with editorial product photography, collections, product detail pages and direct ordering.',
    features: ['Product catalog', 'Collection pages', 'Order CTA', 'Categories', 'Mobile-first'],
    colors: ['#8b735b', '#24211e'],
    images: [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=88',
      'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=1200&q=88',
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=88',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=88',
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=88'
    ], delivery: '3–5 business days', revisions: '2 revision rounds', preview: '/preview/site/store-pro'
  },
  {
    id: 'portfolio-pro', type: 'website', name: 'Amani Creative', category: 'Portfolio', price: 59, badge: '',
    description: 'A visual portfolio for photographers, designers, artists and developers who want the work to lead.',
    features: ['Project gallery', 'About section', 'Testimonials', 'Contact CTA', 'Fast layout'],
    colors: ['#493d55', '#14121a'],
    images: [
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=88',
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=88',
      'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=88',
      'https://images.unsplash.com/photo-1545235617-9465d2a55698?auto=format&fit=crop&w=1200&q=88',
      'https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=1200&q=88'
    ], delivery: '1–3 business days', revisions: '2 revision rounds', preview: '/preview/site/portfolio-pro'
  }
];

export const chatbots = [
  { id: 'support-ai', type: 'chatbot', name: 'Support AI', category: 'Customer support', price: 69, badge: 'Popular', description: 'Answers FAQs, captures leads and directs customers to the right channel.', features: ['FAQ answers', 'Lead capture', 'Business hours', 'Escalation prompts', 'Website widget'], delivery: '2–3 business days', revisions: '1 setup revision', preview: '/preview/bot/support-ai' },
  { id: 'booking-ai', type: 'chatbot', name: 'Booking AI', category: 'Appointments', price: 89, badge: 'Business', description: 'Guides visitors through bookings and collects the details your team needs.', features: ['Service selection', 'Customer details', 'Booking intent', 'FAQ support', 'Follow-up CTA'], delivery: '2–4 business days', revisions: '1 setup revision', preview: '/preview/bot/booking-ai' },
  { id: 'sales-ai', type: 'chatbot', name: 'Sales AI', category: 'Sales', price: 119, badge: 'Growth', description: 'A sales assistant that helps visitors compare products and take the next step.', features: ['Product guidance', 'Objection handling', 'Lead capture', 'Offer prompts', 'CTA routing'], delivery: '3–5 business days', revisions: '1 setup revision', preview: '/preview/bot/sales-ai' }
];

export const allProducts = [...websites, ...chatbots];
