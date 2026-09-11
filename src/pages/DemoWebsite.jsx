import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Calendar, Check, Clock3, Mail, MapPin, MessageCircle, Phone, ShoppingBag, Star } from 'lucide-react';
import { websites } from '../data/products';

export default function DemoWebsite() {
  const { id } = useParams();
  const site = websites.find(s => s.id === id) || websites[0];
  if (site.id === 'restaurant-pro') return <RestaurantTemplate site={site}/>;
  if (site.id === 'store-pro') return <StoreTemplate site={site}/>;
  if (site.id === 'portfolio-pro') return <PortfolioTemplate site={site}/>;
  return <BusinessTemplate site={site}/>;
}

function TemplateShell({ site, children }) {
  return <div className="template-page">
    <div className="template-preview-bar"><span>Preview</span><Link to={`/product/${site.type}/${site.id}`}>Get this website <ArrowRight size={14}/></Link></div>
    {children}
  </div>;
}

function RestaurantTemplate({ site }) {
  const [hero, food, room] = site.images;
  return <TemplateShell site={site}>
    <div className="site-restaurant">
      <nav className="site-nav image-nav">
        <strong>EMBER & SPOON</strong>
        <div><a href="#menu">Menu</a><a href="#story">Story</a><a href="#visit">Visit</a><Link className="site-button dark" to="/order" state={{product:site}}>Book a table</Link></div>
      </nav>
      <section className="site-hero restaurant-hero" style={{backgroundImage:`linear-gradient(90deg,rgba(15,12,10,.72),rgba(15,12,10,.2)),url(${hero})`}}>
        <div className="site-hero-copy">
          <span className="kicker">Modern dining · Kampala</span>
          <h1>Good food deserves a place people remember.</h1>
          <p>Seasonal plates, thoughtful drinks and a warm room made for long evenings.</p>
          <div className="site-actions"><a className="site-button light" href="#menu">See the menu</a><a className="site-link-light" href="#visit">Find us <ArrowRight size={15}/></a></div>
        </div>
      </section>
      <section className="image-story-grid" id="story">
        <div className="story-copy"><span className="kicker">The place</span><h2>Built around the table.</h2><p>Ember & Spoon brings fire, fresh ingredients and relaxed hospitality together in the heart of the city.</p><div className="story-points"><span><Check/> Seasonal menu</span><span><Check/> Local ingredients</span><span><Check/> Private dining</span></div></div>
        <img src={room} alt="Warm modern restaurant interior" loading="lazy"/>
      </section>
      <section className="menu-photo-section" id="menu">
        <div className="section-intro"><span className="kicker">Tonight's menu</span><h2>Made to share.</h2><p>A few favourites from the kitchen.</p></div>
        <div className="food-grid">
          <article><img src={food} alt="Restaurant dish" loading="lazy"/><div><span>01</span><h3>Charred chicken</h3><p>Rosemary · lemon · herbs</p><b>$14</b></div></article>
          <article><img src={hero} alt="Restaurant table and dining room" loading="lazy"/><div><span>02</span><h3>Chef's sharing board</h3><p>Seasonal cuts · house pickles</p><b>$22</b></div></article>
          <article><img src={food} alt="Fresh plated food" loading="lazy"/><div><span>03</span><h3>Chocolate tart</h3><p>Salt · cocoa · cream</p><b>$8</b></div></article>
        </div>
      </section>
      <section className="restaurant-quote"><Star fill="currentColor" size={18}/><p>"The kind of place you come for dinner and stay for another round."</p><span>— Guest favourite</span></section>
      <section className="visit-photo" id="visit" style={{backgroundImage:`linear-gradient(90deg,rgba(20,16,12,.84),rgba(20,16,12,.3)),url(${room})`}}>
        <div><span className="kicker">Come by</span><h2>Your table is waiting.</h2><p><MapPin size={15}/> Plot 24, Kololo</p><p><Clock3 size={15}/> Tue–Sun · 12pm–11pm</p><div className="site-actions"><Link className="site-button light" to="/order" state={{product:site}}>Reserve a table</Link><span className="site-contact"><MessageCircle size={16}/> WhatsApp us</span></div></div>
      </section>
    </div>
  </TemplateShell>;
}

function BusinessTemplate({ site }) {
  const [hero, office, team] = site.images;
  return <TemplateShell site={site}>
    <div className="site-business">
      <nav className="site-nav"><strong>NORTHSTAR</strong><div><a href="#services">Services</a><a href="#proof">Results</a><a href="#contact">Contact</a><Link className="site-button dark" to="/order" state={{product:site}}>Start a project</Link></div></nav>
      <section className="split-image-hero">
        <div className="split-image-copy"><span className="kicker">Strategy · Design · Growth</span><h1>Make your next business move your best one.</h1><p>Northstar helps ambitious teams sharpen their brand, digital presence and customer journey.</p><div className="site-actions"><Link className="site-button dark" to="/order" state={{product:site}}>Talk to us <ArrowRight size={15}/></Link><a className="site-link" href="#services">Explore services</a></div></div>
        <div className="hero-image-stack"><img src={hero} alt="Modern professional workspace"/><div className="image-badge"><strong>+42%</strong><span>Lead growth after launch</span></div></div>
      </section>
      <section className="business-image-banner" id="services"><img src={office} alt="Modern office" loading="lazy"/><div><span className="kicker">What we do</span><h2>Clear work. Measurable outcomes.</h2><p>Brand systems, websites and growth operations designed around the job your business needs done.</p></div></section>
      <section className="service-photo-grid">
        <article style={{backgroundImage:`linear-gradient(0deg,rgba(8,15,26,.85),rgba(8,15,26,.1)),url(${team})`}}><span>01</span><h3>Brand systems</h3><p>Identity, positioning and messaging.</p></article>
        <article style={{backgroundImage:`linear-gradient(0deg,rgba(8,15,26,.85),rgba(8,15,26,.1)),url(${office})`}}><span>02</span><h3>Web experiences</h3><p>Digital journeys built to convert attention into action.</p></article>
        <article style={{backgroundImage:`linear-gradient(0deg,rgba(8,15,26,.85),rgba(8,15,26,.1)),url(${hero})`}}><span>03</span><h3>Growth operations</h3><p>Funnels, analytics and content systems.</p></article>
      </section>
      <section className="people-section" id="proof"><div><span className="kicker">The team</span><h2>Serious work, human partnership.</h2><p>Small enough to care, experienced enough to move quickly.</p></div><img src={team} alt="Business team collaborating" loading="lazy"/></section>
      <section className="business-cta-photo" id="contact" style={{backgroundImage:`linear-gradient(90deg,rgba(15,23,42,.86),rgba(15,23,42,.48)),url(${office})`}}><div><span className="kicker">Ready to move?</span><h2>Bring us the problem. We'll help build the next step.</h2><Link className="site-button light" to="/order" state={{product:site}}>Get started <ArrowRight size={15}/></Link></div></section>
    </div>
  </TemplateShell>;
}

function StoreTemplate({ site }) {
  const [hero, shop, product] = site.images;
  return <TemplateShell site={site}>
    <div className="site-store">
      <nav className="site-nav"><strong>FORME</strong><div><a href="#new">New in</a><a href="#shop">Shop</a><a href="#about">About</a><Link className="site-button dark" to="/order" state={{product:site}}><ShoppingBag size={15}/> Order site</Link></div></nav>
      <section className="store-full-hero" id="new" style={{backgroundImage:`linear-gradient(90deg,rgba(8,15,20,.7),rgba(8,15,20,.18)),url(${hero})`}}><div><span className="kicker">New collection</span><h1>Objects made to keep.</h1><p>Simple, useful pieces for everyday spaces.</p><a className="site-button light" href="#shop">Shop collection</a></div></section>
      <section className="store-intro" id="about"><span className="kicker">Designed for everyday life</span><h2>Less noise. Better things.</h2><p>FORME brings considered objects, materials and details together in one calm storefront.</p></section>
      <section className="store-products-photo" id="shop">
        <article><img src={shop} alt="Fashion and retail store" loading="lazy"/><div><span>01 · COLLECTION</span><h3>Everyday layers</h3><b>$48</b><Link className="site-link" to="/order" state={{product:site}}>View product <ArrowRight size={14}/></Link></div></article>
        <article><img src={product} alt="Fashion product detail" loading="lazy"/><div><span>02 · HOME</span><h3>Fold tray</h3><b>$26</b><Link className="site-link" to="/order" state={{product:site}}>View product <ArrowRight size={14}/></Link></div></article>
        <article><img src={hero} alt="Modern retail interior" loading="lazy"/><div><span>03 · TEXTILE</span><h3>Linen throw</h3><b>$62</b><Link className="site-link" to="/order" state={{product:site}}>View product <ArrowRight size={14}/></Link></div></article>
      </section>
      <section className="store-feature"><div><span className="kicker">The store experience</span><h2>Products deserve room to breathe.</h2><p>Large imagery, clear details and a checkout journey that keeps the product in focus.</p></div><img src={shop} alt="Retail environment" loading="lazy"/></section>
    </div>
  </TemplateShell>;
}

function PortfolioTemplate({ site }) {
  const [hero, workspace, creative] = site.images;
  return <TemplateShell site={site}>
    <div className="site-portfolio">
      <nav className="site-nav"><strong>AMANI K.</strong><div><a href="#work">Work</a><a href="#about">About</a><Link className="site-button dark" to="/order" state={{product:site}}>Hire me</Link></div></nav>
      <section className="portfolio-image-hero" style={{backgroundImage:`linear-gradient(90deg,rgba(12,10,20,.78),rgba(12,10,20,.22)),url(${hero})`}}><div><span className="kicker">Designer · Photographer · Creative</span><h1>I make brands look impossible to ignore.</h1><p>Selected work across identity, campaigns and digital experiences.</p></div></section>
      <section className="portfolio-intro" id="about"><div><span className="kicker">About</span><h2>Good work starts with a clear idea.</h2></div><p>I work with businesses and creators to turn strong ideas into visual identities, campaigns and digital experiences people remember.</p></section>
      <section className="portfolio-gallery" id="work">
        <figure className="wide"><img src={workspace} alt="Creative workspace" loading="lazy"/><figcaption><span>01</span><strong>Editorial identity</strong></figcaption></figure>
        <figure><img src={creative} alt="Creative studio work" loading="lazy"/><figcaption><span>02</span><strong>Campaign direction</strong></figcaption></figure>
        <figure><img src={hero} alt="Photography project" loading="lazy"/><figcaption><span>03</span><strong>Portrait series</strong></figcaption></figure>
        <figure className="wide"><img src={creative} alt="Creative project" loading="lazy"/><figcaption><span>04</span><strong>Digital experience</strong></figcaption></figure>
      </section>
      <section className="portfolio-contact"><div><span className="kicker">Available for selected projects</span><h2>Have something worth making?</h2><p>Let's talk about the idea, the audience and what the work needs to achieve.</p><Link className="site-button dark" to="/order" state={{product:site}}>Start a conversation <ArrowRight size={15}/></Link></div><div className="contact-stack"><span><Mail size={16}/> hello@example.com</span><span><Phone size={16}/> +256 700 000 000</span></div></section>
    </div>
  </TemplateShell>;
}
