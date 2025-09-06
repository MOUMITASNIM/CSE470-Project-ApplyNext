const ChatHistory = require('../models/ChatHistory');
const { v4: uuidv4 } = require('uuid');

// Predefined responses for the chatbot
const botResponses = {
  greetings: [
    "Hello! 👋 Welcome to our Study Abroad platform. I'm your personal study abroad assistant, here to help you navigate your international education journey. How can I assist you today?",
    "Hi there! 🌟 I'm excited to help you explore study abroad opportunities. Whether you're looking for courses, scholarships, or need guidance on applications, I'm here for you. What would you like to know?",
    "Welcome! 🎓 I'm your dedicated study abroad assistant. I can help you find the perfect program, understand application processes, payment methods, requirements, and much more. Feel free to ask me anything!",
    "Hey! 👋 Great to see you here! I'm here to make your study abroad journey as smooth as possible. From finding programs to completing applications, I've got you covered. What can I help you with?"
  ],
  
  farewell: [
    "Thank you for using our platform! Good luck with your study abroad journey!",
    "Goodbye! Feel free to come back anytime if you have more questions.",
    "Have a great day! Best wishes for your studies abroad!"
  ],
  
  thanks: [
    "You're welcome! Is there anything else I can help you with?",
    "Happy to help! Let me know if you need anything else.",
    "Glad I could assist! Feel free to ask more questions."
  ],
  
  about: [
    "🌍 This is a comprehensive study abroad platform designed to make international education accessible! Here's what we offer:\n\n📚 **Course Database**: Thousands of programs from top universities worldwide\n💰 **Scholarship Opportunities**: Merit-based and need-based funding options\n📝 **Streamlined Applications**: Apply to multiple programs through one platform\n💳 **Secure Payments**: Safe application fee processing via Stripe\n📊 **Application Tracking**: Monitor your application status in real-time\n🎯 **Personalized Matching**: Find programs that fit your profile\n\nWe're your one-stop solution for studying abroad!",
    "🎓 Welcome to your gateway to international education! Our platform connects ambitious students with world-class universities. We've partnered with institutions across 50+ countries to bring you:\n\n✨ **Premium Programs**: Undergraduate, graduate, and PhD opportunities\n🏆 **Exclusive Scholarships**: Up to 100% funding available\n🚀 **Fast Applications**: Complete applications in minutes, not hours\n📱 **Mobile-Friendly**: Apply anywhere, anytime\n🤝 **Expert Support**: 24/7 assistance throughout your journey\n\nYour dream education is just a click away!",
    "🌟 This platform revolutionizes how students access international education! We've created an ecosystem where:\n\n🔍 **Smart Search**: AI-powered program recommendations\n📋 **Simplified Process**: One application, multiple universities\n💡 **Transparent Pricing**: Clear application fees, no hidden costs\n📈 **Success Tracking**: Real-time application progress\n🌐 **Global Network**: 500+ partner universities worldwide\n📞 **Personal Guidance**: Dedicated support team\n\nJoin thousands of students who've found their perfect study abroad match with us!"
  ],
  
  howToApply: [
    "📝 **Complete Application Guide**:\n\n🔍 **Step 1: Browse & Search**\n- Use our advanced filters (country, field, level, fees)\n- Read program details and requirements carefully\n- Check application deadlines\n\n📋 **Step 2: Start Application**\n- Click 'Apply Now' on your chosen program\n- Fill out personal information form\n- Upload required documents (transcripts, CV, etc.)\n\n💳 **Step 3: Payment**\n- Pay application fee securely via Stripe\n- Fees range from $50-$200 per program\n- Get instant payment confirmation\n\n📊 **Step 4: Track Progress**\n- Monitor application status in your dashboard\n- Receive email updates on progress\n- University reviews typically take 2-4 weeks\n\n✅ **Step 5: Decision**\n- Get notified of admission decisions\n- Accept offers and proceed with enrollment\n\nNeed help with any specific step?",
    "🚀 **Quick Application Process**:\n\n**Phase 1: Preparation** (15-30 mins)\n- Create account and complete profile\n- Gather documents (transcripts, test scores, CV)\n- Research programs and shortlist favorites\n\n**Phase 2: Application** (20-45 mins per program)\n- Fill application form with personal/academic details\n- Upload documents in PDF format\n- Write compelling personal statement\n\n**Phase 3: Payment & Submission** (5 mins)\n- Review application thoroughly\n- Pay application fee via secure Stripe checkout\n- Submit and receive confirmation email\n\n**Phase 4: Follow-up** (Ongoing)\n- Check dashboard for status updates\n- Respond to university requests promptly\n- Prepare for interviews if required\n\n💡 **Pro Tip**: Apply to 3-5 programs to maximize your chances!",
    "📚 **Detailed Application Walkthrough**:\n\n**🎯 Before You Start:**\n- Ensure you meet minimum requirements\n- Have all documents ready in English\n- Check application deadlines (apply 2-3 months early)\n\n**📝 Application Form Sections:**\n1. **Personal Info**: Name, contact, nationality\n2. **Academic History**: Education background, GPA\n3. **Test Scores**: IELTS/TOEFL, GRE/GMAT if required\n4. **Experience**: Work/research experience\n5. **Essays**: Personal statement, motivation letter\n6. **References**: Contact details for recommenders\n\n**📎 Required Documents:**\n- Official transcripts (translated if needed)\n- English proficiency certificates\n- CV/Resume (academic format)\n- Passport copy\n- Recommendation letters (2-3)\n- Portfolio (for creative programs)\n\n**💰 Payment Process:**\n- Application fees are non-refundable\n- Secure payment via Stripe\n- Multiple payment methods accepted\n- Instant receipt generation\n\nReady to start your application journey?"
  ],
  
  payment: [
    "💳 **Secure Payment System**:\n\n🔒 **Payment Security**\n- All payments processed via Stripe (industry-leading security)\n- SSL encryption for all transactions\n- No card details stored on our servers\n- PCI DSS compliant payment processing\n\n💰 **Application Fees**\n- Range: $50 - $200 per program\n- Clearly displayed on each course/scholarship card\n- Non-refundable once submitted\n- Instant payment confirmation\n\n💳 **Accepted Payment Methods**\n- Visa, Mastercard, American Express\n- Debit and credit cards\n- International cards accepted\n- Multiple currencies supported\n\n📊 **Payment Tracking**\n- View all payments in your dashboard\n- Download payment receipts\n- Track application status post-payment\n- Email confirmations for all transactions\n\n**Test Card**: 4242 4242 4242 4242 (for testing)",
    "🏦 **Payment Process Explained**:\n\n**Step 1: Application Review**\n- Complete your application form\n- Review all information carefully\n- Check application fee amount\n\n**Step 2: Secure Checkout**\n- Click 'Proceed to Payment'\n- Enter card details in secure Stripe form\n- Verify payment amount and currency\n\n**Step 3: Payment Confirmation**\n- Receive instant payment confirmation\n- Application automatically submitted to university\n- Email receipt sent immediately\n\n**Step 4: Post-Payment**\n- Application status updates in dashboard\n- Payment history available anytime\n- Support available for any payment issues\n\n💡 **Payment Tips**:\n- Ensure sufficient funds before payment\n- Use the same name as on your application\n- Keep payment receipts for your records\n- Contact support for payment issues within 24 hours",
    "💸 **Payment FAQ**:\n\n**Q: Why do I need to pay an application fee?**\nA: Application fees cover university processing costs, document verification, and administrative expenses. This ensures serious applications and helps universities manage their review process efficiently.\n\n**Q: Are application fees refundable?**\nA: No, application fees are non-refundable once submitted, even if your application is rejected. This is standard practice across all universities.\n\n**Q: Can I pay for multiple applications at once?**\nA: Currently, each application requires separate payment. This ensures proper tracking and university-specific processing.\n\n**Q: What if my payment fails?**\nA: Your application will be saved as a draft. You can retry payment anytime. Common issues: insufficient funds, expired cards, or international restrictions.\n\n**Q: Is it safe to enter my card details?**\nA: Absolutely! We use Stripe's secure payment processing. Your card details are encrypted and never stored on our servers.\n\n**Q: Can I get a receipt?**\nA: Yes! You'll receive an email receipt immediately after payment, and can download receipts from your dashboard anytime."
  ],
  
  requirements: [
    "📋 **Common Application Requirements**:\n\n🎓 **Academic Documents**\n- Official transcripts from all institutions\n- Degree certificates (if graduated)\n- GPA calculation (minimum 2.5-3.0 typically)\n- Academic records translated to English\n\n🗣️ **English Proficiency** (Non-native speakers)\n- IELTS: Minimum 6.0-7.5 overall\n- TOEFL iBT: Minimum 80-100\n- PTE Academic: Minimum 58-65\n- Duolingo: Minimum 105-120\n\n📝 **Written Documents**\n- Statement of Purpose (500-1000 words)\n- Personal Statement/Motivation Letter\n- CV/Resume (academic format)\n- Research Proposal (for research programs)\n\n👥 **References**\n- 2-3 academic/professional references\n- Contact details and relationship to applicant\n- Recommendation letters on letterhead\n\n📊 **Standardized Tests** (Program-specific)\n- GRE: Required for many graduate programs\n- GMAT: Required for MBA programs\n- SAT/ACT: Required for undergraduate programs\n\nCheck each program's specific requirements!",
    "🔍 **Requirements by Program Level**:\n\n**🎓 Undergraduate Programs**\n- High school transcripts/certificates\n- SAT/ACT scores (US programs)\n- English proficiency test\n- Personal statement\n- 1-2 recommendation letters\n- Extracurricular activities list\n\n**📚 Master's Programs**\n- Bachelor's degree transcripts\n- GRE/GMAT scores (field-dependent)\n- English proficiency test\n- Statement of purpose\n- 2-3 recommendation letters\n- Work experience (preferred)\n- Portfolio (creative fields)\n\n**🔬 PhD Programs**\n- Master's degree transcripts\n- GRE scores (most fields)\n- English proficiency test\n- Research proposal (detailed)\n- 3 academic references\n- Publications/research experience\n- Interview (often required)\n\n**💼 MBA Programs**\n- Bachelor's degree\n- GMAT/GRE scores\n- Work experience (2-5 years)\n- Essays/personal statements\n- Professional references\n- Interview\n\n**📜 Diploma/Certificate Programs**\n- Relevant educational background\n- Work experience\n- English proficiency\n- Motivation letter",
    "📊 **Document Preparation Guide**:\n\n**📄 Academic Transcripts**\n- Request official sealed transcripts\n- Get translations if not in English\n- Calculate GPA using WES or similar service\n- Include all institutions attended\n\n**🏆 Test Scores**\n- Take tests 3-6 months before application\n- Send official scores directly to universities\n- Retake if scores are below requirements\n- Consider test prep courses\n\n**✍️ Personal Statements**\n- Start with compelling opening\n- Explain motivation and goals\n- Highlight relevant experience\n- Connect to specific program\n- Proofread multiple times\n\n**📞 References**\n- Choose people who know you well\n- Provide them with your CV and goals\n- Give 4-6 weeks notice\n- Follow up politely\n- Provide recommendation forms\n\n**💡 Pro Tips**:\n- Start document preparation 6 months early\n- Keep digital copies of everything\n- Check expiry dates on test scores\n- Verify document authentication requirements\n- Consider professional editing services"
  ],
  
  courses: [
    "We offer a wide variety of courses from universities worldwide including undergraduate, graduate, PhD, diploma, and certificate programs in various fields of study.",
    "Our course catalog includes programs from top universities across different countries, levels, and fields of study. You can filter by country, level, field, or university.",
    "Browse our extensive course collection featuring programs from prestigious universities worldwide in fields like Engineering, Business, Medicine, Arts, and more."
  ],
  
  scholarships: [
    "We offer various scholarships from universities and organizations worldwide. Scholarships can cover tuition fees, living expenses, or both. Check eligibility requirements for each scholarship.",
    "Our scholarship database includes merit-based, need-based, and field-specific scholarships from universities globally. Each scholarship has different eligibility criteria and benefits.",
    "Find scholarships that match your profile! We have scholarships for different academic levels, fields of study, and countries. Some cover full tuition, others partial funding."
  ],
  
  countries: [
    "We have programs available in many countries including USA, UK, Canada, Australia, Germany, France, Netherlands, and many more. Each country offers unique opportunities and experiences.",
    "Popular study destinations include United States, United Kingdom, Canada, Australia, Germany, and France. We also have programs in many other countries worldwide.",
    "Study abroad in top destinations: USA, UK, Canada, Australia, Germany, France, Netherlands, Sweden, and many more countries with excellent education systems."
  ],
  
  fees: [
    "💰 **Application Fee Structure**:\n\n**📊 Fee Ranges by Program Type**\n- **Undergraduate Programs**: $50 - $150\n- **Master's Programs**: $75 - $200\n- **PhD Programs**: $100 - $250\n- **MBA Programs**: $150 - $300\n- **Certificate/Diploma**: $25 - $100\n\n**🏛️ Fee Ranges by University Tier**\n- **Top-Tier Universities**: $150 - $300 (Harvard, MIT, Oxford)\n- **Mid-Tier Universities**: $75 - $150 (State universities, regional)\n- **Emerging Universities**: $50 - $100 (Newer programs, developing countries)\n\n**🌍 Regional Variations**\n- **USA**: $75 - $300 (highest fees globally)\n- **UK**: £50 - £150 ($60 - $180)\n- **Canada**: CAD $100 - $250 ($75 - $190)\n- **Australia**: AUD $100 - $200 ($65 - $130)\n- **Germany**: €25 - €75 ($25 - $80)\n- **Netherlands**: €50 - €100 ($55 - $110)\n\n**💳 Payment Information**\n- All fees processed via secure Stripe payment\n- Non-refundable once application submitted\n- Multiple payment methods accepted\n- Instant confirmation and receipt\n\n**💡 Fee Tips**\n- Fees displayed clearly on each program card\n- Budget for multiple applications\n- Some universities waive fees for financial hardship",
    "📋 **What Application Fees Cover**:\n\n**🔍 University Processing Costs**\n- Application review by admissions committee\n- Document verification and authentication\n- Academic transcript evaluation\n- Reference check and validation\n- Interview coordination (if required)\n\n**📊 Administrative Services**\n- Application system maintenance\n- Communication and status updates\n- Decision notification process\n- Document storage and management\n- Student support services\n\n**🎯 Quality Assurance**\n- Ensures serious applications only\n- Reduces spam and incomplete applications\n- Maintains application review standards\n- Supports fair evaluation process\n\n**💰 Fee Comparison with Direct Applications**\n- **Our Platform**: $50 - $200 (same as university fees)\n- **Direct University**: $50 - $300 (often higher)\n- **Other Agents**: $100 - $500 (markup included)\n- **Our Advantage**: No markup, transparent pricing\n\n**🔄 Refund Policy**\n- **Non-refundable**: Once application submitted\n- **Technical Issues**: Full refund if payment error\n- **Duplicate Payments**: Automatic refund processed\n- **University Closure**: Full refund if program cancelled\n\n**📈 Value Proposition**\n- Same fees as direct university applications\n- Additional support and guidance included\n- Application tracking and status updates\n- Multiple program applications in one platform",
    "💡 **Application Fee Strategy & Budgeting**:\n\n**📊 Budget Planning**\n- **Conservative Approach**: 3-5 applications = $200 - $750\n- **Moderate Approach**: 6-8 applications = $400 - $1,200\n- **Aggressive Approach**: 10-15 applications = $750 - $2,250\n\n**🎯 Smart Application Strategy**\n- **Reach Schools** (30%): Top-tier, competitive programs\n- **Target Schools** (50%): Good fit, realistic chances\n- **Safety Schools** (20%): High acceptance probability\n\n**💰 Cost-Saving Tips**\n1. **Research Thoroughly**: Apply only to programs you're genuinely interested in\n2. **Fee Waivers**: Check if you qualify for financial hardship waivers\n3. **Early Applications**: Some universities offer reduced fees for early applicants\n4. **Bulk Applications**: Plan all applications together to avoid rushed decisions\n5. **Scholarship Applications**: Many scholarships don't charge application fees\n\n**📅 Payment Timeline**\n- **6 months before**: Start budgeting for application fees\n- **3 months before**: Begin applications, pay fees gradually\n- **Application deadlines**: Ensure all payments completed on time\n\n**🔍 Hidden Costs to Consider**\n- **Test Fees**: IELTS/TOEFL ($200-$300), GRE/GMAT ($300-$400)\n- **Document Costs**: Transcript fees ($10-$50 per copy)\n- **Translation**: Document translation ($20-$100 per document)\n- **Courier**: Express document delivery ($50-$150)\n\n**💳 Payment Methods Accepted**\n- Visa, Mastercard, American Express\n- Debit cards (international accepted)\n- Multiple currencies supported\n- Secure Stripe processing\n- Instant payment confirmation"
  ],
  
  documents: [
    "Required documents typically include: Academic transcripts, English proficiency test scores, letters of recommendation, personal statement/essay, CV/resume, and passport copy.",
    "Common documents needed: Official transcripts, IELTS/TOEFL scores, recommendation letters, statement of purpose, resume, and identification documents.",
    "Document checklist: Transcripts, English test scores, recommendation letters, personal statement, CV, passport copy. Some programs may require additional documents."
  ],
  
  deadlines: [
    "📅 **Application Deadline Guide**:\n\n**🌍 Common Deadline Patterns**\n- **Fall Intake (September)**: Deadlines January-May\n- **Spring Intake (January)**: Deadlines August-October\n- **Summer Intake (May)**: Deadlines December-February\n\n**🎓 Deadlines by Program Level**\n- **Undergraduate**: December-February (for fall start)\n- **Master's Programs**: December-April (varies by field)\n- **PhD Programs**: December-January (earlier for funding)\n- **MBA Programs**: October-April (multiple rounds)\n\n**🏛️ University-Specific Patterns**\n- **Top-Tier Universities**: Earlier deadlines (December-February)\n- **State Universities**: Later deadlines (March-June)\n- **International Programs**: Rolling admissions available\n\n**💰 Scholarship Deadlines**\n- **Government Scholarships**: 12-18 months before start\n- **University Scholarships**: Same as program deadlines\n- **External Scholarships**: Vary widely, check individually\n\n**⚠️ Important Notes**\n- Deadlines are final - no extensions typically given\n- Some programs have multiple application rounds\n- Early applications often have better funding chances\n- Check time zones for international applications",
    "⏰ **Strategic Timeline Planning**:\n\n**📊 Optimal Application Timeline**\n- **12-18 months before**: Research programs, build profile\n- **9-12 months before**: Take standardized tests, request transcripts\n- **6-9 months before**: Write essays, secure recommendations\n- **3-6 months before**: Submit applications (early is better)\n- **1-3 months before**: Follow up, prepare for interviews\n\n**🎯 Application Round Strategy**\n- **Round 1 (Early)**: Best scholarship chances, less competition\n- **Round 2 (Regular)**: Standard deadline, moderate competition\n- **Round 3 (Late)**: Limited spots, higher competition\n- **Rolling Admissions**: Apply early for best chances\n\n**📅 Monthly Application Calendar**\n- **January**: Research programs, plan timeline\n- **February-March**: Take IELTS/TOEFL, GRE/GMAT\n- **April-May**: Request transcripts, contact referees\n- **June-July**: Write personal statements, essays\n- **August-September**: Submit early applications\n- **October-November**: Submit regular deadline applications\n- **December**: Final applications, interview prep\n\n**🚨 Deadline Management Tips**\n- Set personal deadlines 2-4 weeks before official deadlines\n- Use calendar reminders and application tracking sheets\n- Submit applications during business hours (better support)\n- Keep confirmation emails and application numbers\n- Have backup plans if technical issues occur",
    "📋 **Deadline Types & Considerations**:\n\n**📊 Application Deadline Categories**\n- **Priority Deadline**: Early deadline with scholarship consideration\n- **Regular Deadline**: Standard application deadline\n- **Final Deadline**: Last possible submission date\n- **Rolling Admissions**: Applications reviewed as received\n\n**🌍 Regional Deadline Patterns**\n- **USA**: December-February (fall), August-October (spring)\n- **UK**: January 15 (UCAS), varies for postgraduate\n- **Canada**: December-March (varies by province)\n- **Australia**: October-December (February start)\n- **Germany**: March-July (October start), September-January (April start)\n\n**⚡ Last-Minute Application Tips**\n- **Document Preparation**: Have everything ready weeks early\n- **Technical Issues**: Submit early to avoid server overload\n- **Time Zones**: Check university's local time for deadlines\n- **Weekend Deadlines**: Submit by Friday to ensure processing\n- **Payment Processing**: Allow time for payment confirmation\n\n**📈 Success Rate by Timing**\n- **Early Applications**: 15-25% higher acceptance rates\n- **Regular Deadline**: Standard acceptance rates\n- **Late Applications**: 10-20% lower acceptance rates\n- **Rolling Admissions**: Earlier = better chances\n\n**💡 Pro Tips**\n- Apply to reach schools early when competition is lower\n- Use application fee waivers for early submissions\n- Submit complete applications rather than rushing incomplete ones\n- Keep track of all deadlines in a master spreadsheet\n- Consider time differences for international applications"
  ],
  
  support: [
    "Our support team is here to help! You can contact us through this chat, email, or phone. We assist with applications, technical issues, and general inquiries.",
    "Need help? I'm here 24/7 to answer your questions. For complex issues, you can also contact our human support team through email or phone.",
    "We provide comprehensive support throughout your study abroad journey. From application guidance to technical support, we're here to help you succeed."
  ],
  
  default: [
    "I'm here to help with questions about our study abroad platform. You can ask me about courses, scholarships, applications, payments, requirements, or any other study abroad topics!",
    "I can help you with information about our platform, application process, payments, requirements, and general study abroad questions. What would you like to know?",
    "Feel free to ask me about courses, scholarships, applications, payments, requirements, countries, deadlines, or any other questions about studying abroad!",
    "I'm your study abroad assistant! Ask me about programs, applications, payments, requirements, or anything else related to studying abroad."
  ]
};

// Function to get bot response based on user message
const getBotResponse = (userMessage) => {
  const message = userMessage.toLowerCase().trim();
  
  // Greetings
  if (message.match(/^(hi|hello|hey|good morning|good afternoon|good evening|hola|bonjour)/)) {
    return getRandomResponse(botResponses.greetings);
  }
  
  // Farewell
  if (message.match(/(bye|goodbye|see you|farewell|exit|quit|later|ciao)/)) {
    return getRandomResponse(botResponses.farewell);
  }
  
  // Thanks
  if (message.match(/(thank|thanks|appreciate|thx|ty)/)) {
    return getRandomResponse(botResponses.thanks);
  }
  
  // About the platform - What is this site?
  if (message.match(/(what is this|about|platform|website|site|what does this do|tell me about)/)) {
    return getRandomResponse(botResponses.about);
  }
  
  // How to apply - Application process
  if (message.match(/(how to apply|how do i apply|apply|application process|steps|procedure|process)/)) {
    return getRandomResponse(botResponses.howToApply);
  }
  
  // Payment related - Payment methods
  if (message.match(/(payment|pay|fee|cost|price|stripe|how much|money|billing|charge)/)) {
    return getRandomResponse(botResponses.payment);
  }
  
  // Requirements - What do I need?
  if (message.match(/(requirement|document|need|eligibility|what do i need|prerequisites|criteria)/)) {
    return getRandomResponse(botResponses.requirements);
  }
  
  // Courses - What courses are available?
  if (message.match(/(course|program|degree|study|major|subject|field)/)) {
    return getRandomResponse(botResponses.courses);
  }
  
  // Scholarships - Scholarship information
  if (message.match(/(scholarship|funding|financial aid|grant|bursary|money help)/)) {
    return getRandomResponse(botResponses.scholarships);
  }
  
  // Countries - Where can I study?
  if (message.match(/(countr|where|destination|location|usa|uk|canada|australia|germany|france)/)) {
    return getRandomResponse(botResponses.countries);
  }
  
  // Fees - Application fees
  if (message.match(/(application fee|fee|cost to apply|how much to apply|charges)/)) {
    return getRandomResponse(botResponses.fees);
  }
  
  // Documents - What documents needed?
  if (message.match(/(document|paper|transcript|certificate|ielts|toefl|recommendation|cv|resume)/)) {
    return getRandomResponse(botResponses.documents);
  }
  
  // Deadlines - When to apply?
  if (message.match(/(deadline|when|time|date|last date|due date|cutoff)/)) {
    return getRandomResponse(botResponses.deadlines);
  }
  
  // Support - Help and contact
  if (message.match(/(help|support|contact|assistance|problem|issue|stuck)/)) {
    return getRandomResponse(botResponses.support);
  }
  
  // Default response for unmatched queries
  return getRandomResponse(botResponses.default);
};

// Helper function to get random response from array
const getRandomResponse = (responses) => {
  return responses[Math.floor(Math.random() * responses.length)];
};

// Send message and get bot response
const sendMessage = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    const userId = req.user.id;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const currentSessionId = sessionId || uuidv4();

    // Find or create chat history
    let chatHistory = await ChatHistory.findOne({ 
      user: userId, 
      sessionId: currentSessionId 
    });

    if (!chatHistory) {
      chatHistory = new ChatHistory({
        user: userId,
        sessionId: currentSessionId,
        messages: []
      });
    }

    // Add user message
    chatHistory.messages.push({
      sender: 'user',
      message: message.trim(),
      timestamp: new Date()
    });

    // Get bot response
    const botResponse = getBotResponse(message);

    // Add bot response
    chatHistory.messages.push({
      sender: 'bot',
      message: botResponse,
      timestamp: new Date()
    });

    // Update last activity
    chatHistory.lastActivity = new Date();

    await chatHistory.save();

    res.json({
      sessionId: currentSessionId,
      userMessage: message.trim(),
      botResponse: botResponse,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Failed to process message', error: error.message });
  }
};

// Get chat history for user
const getChatHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionId, page = 1, limit = 50 } = req.query;

    const filter = { user: userId };
    if (sessionId) filter.sessionId = sessionId;

    const chatHistories = await ChatHistory.find(filter)
      .sort({ lastActivity: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json(chatHistories);

  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ message: 'Failed to fetch chat history', error: error.message });
  }
};

// Get specific chat session
const getChatSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const chatHistory = await ChatHistory.findOne({ 
      user: userId, 
      sessionId: sessionId 
    });

    if (!chatHistory) {
      return res.status(404).json({ message: 'Chat session not found' });
    }

    res.json(chatHistory);

  } catch (error) {
    console.error('Get chat session error:', error);
    res.status(500).json({ message: 'Failed to fetch chat session', error: error.message });
  }
};

// Admin: Get all chat histories
const getAllChatHistories = async (req, res) => {
  try {
    const { page = 1, limit = 20, userId } = req.query;

    const filter = {};
    if (userId) filter.user = userId;

    const chatHistories = await ChatHistory.find(filter)
      .populate('user', 'firstName lastName email')
      .sort({ lastActivity: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ChatHistory.countDocuments(filter);

    res.json({
      chatHistories,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Get all chat histories error:', error);
    res.status(500).json({ message: 'Failed to fetch chat histories', error: error.message });
  }
};

// Delete chat session
const deleteChatSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const chatHistory = await ChatHistory.findOneAndDelete({ 
      user: userId, 
      sessionId: sessionId 
    });

    if (!chatHistory) {
      return res.status(404).json({ message: 'Chat session not found' });
    }

    res.json({ message: 'Chat session deleted successfully' });

  } catch (error) {
    console.error('Delete chat session error:', error);
    res.status(500).json({ message: 'Failed to delete chat session', error: error.message });
  }
};

module.exports = {
  sendMessage,
  getChatHistory,
  getChatSession,
  getAllChatHistories,
  deleteChatSession
};
