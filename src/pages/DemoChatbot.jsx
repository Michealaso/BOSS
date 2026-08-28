import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Bot, Send } from 'lucide-react';
import { chatbots } from '../data/products';

const replies = {
  'support-ai': {
    greeting: 'Hi! I’m the Support AI for this demo business. Ask me about hours, services, pricing, or how to contact the team.',
    rules: [
      ['hours', 'We’re open Monday–Saturday, 8:00am–6:00pm.'],
      ['price', 'Pricing starts from $30 for the starter service.'],
      ['contact', 'You can reach the team on WhatsApp or through the contact form.'],
      ['service', 'We offer website builds, chatbot setup and ongoing support.']
    ]
  },
  'booking-ai': {
    greeting: 'Hello! I can help with bookings. Tell me the service you need and your preferred day.',
    rules: [['book', 'Great. What day would you like to book?'], ['appointment', 'We can help schedule an appointment. Please share the service and preferred time.'], ['hours', 'Appointments are available from 9:00am to 6:00pm.']]
  },
  'sales-ai': {
    greeting: 'Welcome! I can help you choose the right package. What are you trying to achieve?',
    rules: [['website', 'For a business website, I’d recommend Business Pro for a polished multi-section site.'], ['chatbot', 'For customer support, Support AI is the best starting point.'], ['price', 'You can view every package and its starting price in the marketplace.']]
  }
};

function answerFor(id, text) {
  const cfg = replies[id] || replies['support-ai'];
  const lower = text.toLowerCase();
  const match = cfg.rules.find(([keyword]) => lower.includes(keyword));
  return match ? match[1] : 'I can help with common questions, services and next steps. Try asking about pricing, hours, booking, services, or contact details.';
}

export default function DemoChatbot() {
  const { id } = useParams();
  const bot = chatbots.find(b => b.id === id) || chatbots[0];
  const config = replies[bot.id] || replies['support-ai'];
  const [messages, setMessages] = useState([{ from: 'bot', text: config.greeting }]);
  const [input, setInput] = useState('');
  const quick = useMemo(() => bot.id === 'sales-ai' ? ['Which package is best?', 'How much?', 'I need a website'] : bot.id === 'booking-ai' ? ['I need an appointment', 'What are your hours?'] : ['What are your hours?', 'How much?', 'How do I contact you?'], [bot.id]);
  function send(text = input) { const value = text.trim(); if (!value) return; setMessages(m => [...m, { from: 'user', text: value }, { from: 'bot', text: answerFor(bot.id, value) }]); setInput(''); }
  return <section className="container page-section bot-demo-page"><div className="bot-demo-intro"><div><div className="eyebrow"><Bot size={14}/> Live chatbot demo</div><h1>{bot.name}</h1><p>{bot.description}</p></div><Link className="primary-button" to={`/product/chatbot/${bot.id}`}>Get this bot <ArrowRight size={16}/></Link></div><div className="bot-window"><div className="bot-window-header"><div className="bot-avatar"><Bot size={19}/></div><div><strong>{bot.name}</strong><span><i className="status-dot"/> Online</span></div><small>Template preview</small></div><div className="bot-messages">{messages.map((m, i) => <div className={`chat-msg ${m.from}`} key={i}>{m.text}</div>)}</div><div className="quick-row">{quick.map(q => <button key={q} onClick={() => send(q)}>{q}</button>)}</div><div className="chat-compose"><input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Ask the demo bot…"/><button onClick={() => send()}><Send size={17}/></button></div></div></section>;
}
