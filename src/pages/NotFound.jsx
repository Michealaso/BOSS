import { Link } from 'react-router-dom';
export default function NotFound() { return <section className="container page-section narrow"><div className="empty-state"><div className="eyebrow">404</div><h1>That page isn't here.</h1><p>Use the marketplace to find a website or chatbot.</p><Link className="primary-button" to="/">Go home</Link></div></section>; }
