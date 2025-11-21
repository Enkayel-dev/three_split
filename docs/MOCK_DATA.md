# Mock Data & Portfolio Content

## Overview

This document contains all mock content for the Enkayel Studios Liquid Glass portfolio website. This data will be used during development and can be replaced with real content when available.

---

## Business Profile

### Company Information

```json
{
  "company": {
    "name": "Enkayel Studios",
    "tagline": "Crafting Systems, Spaces, and Software That Work as One",
    "founded": "2019",
    "location": "Vancouver, BC, Canada",
    "email": "hello@enkayel.studio",
    "phone": "+1 (604) 555-0123"
  }
}
```

### About Statement

> Enkayel Studios is a multi-disciplinary consultancy that bridges the gap between physical and digital worlds. We combine expertise in business operations, custom software development, and architectural design to create holistic solutions that transform how organizations work.

> Our approach is rooted in systems thinking—understanding that every business is an interconnected ecosystem where processes, technology, and physical spaces all influence each other. By addressing all three dimensions, we help our clients achieve efficiency gains that wouldn't be possible with isolated solutions.

---

## Service Offerings

### Business Operations Consulting

```json
{
  "service": "Business Operations Consulting",
  "tagline": "Streamline processes. Eliminate waste. Scale with confidence.",
  "description": "We analyze your current operations, identify inefficiencies, and design optimized workflows that reduce overhead and improve outcomes. Our data-driven approach ensures measurable results.",
  "capabilities": [
    "Process mapping and analysis",
    "Workflow automation design",
    "KPI dashboard development",
    "Standard operating procedure (SOP) creation",
    "Change management consulting",
    "Operational efficiency audits"
  ]
}
```

### Custom Software Development

```json
{
  "service": "Custom Software Development",
  "tagline": "Built for your exact needs. Scalable from day one.",
  "description": "We design and build custom web applications, dashboards, and automation tools tailored to your specific business requirements. From concept to deployment, we handle the entire lifecycle.",
  "capabilities": [
    "Web application development",
    "Interactive dashboards and analytics",
    "Workflow automation tools",
    "API integrations",
    "Database design and optimization",
    "Progressive web apps (PWA)"
  ]
}
```

### Construction & Architecture

```json
{
  "service": "Construction & Architecture",
  "tagline": "Spaces that work as hard as you do.",
  "description": "We provide full design-build services for residential and commercial projects. Our integrated approach ensures that your physical space supports your operational goals.",
  "capabilities": [
    "Architectural design",
    "Space planning and optimization",
    "Residential construction",
    "Commercial renovation",
    "Sustainable building practices",
    "Project management"
  ]
}
```

---

## Portfolio: Consulting Case Studies

### Case Study 1: The Brew Lab

```json
{
  "id": "consulting-1",
  "title": "The Brew Lab",
  "type": "Operations Automation",
  "client": "Boutique Coffee Roastery & Cafe",
  "location": "Vancouver, BC",
  "duration": "3 months",
  "year": "2024",
  "summary": "25% reduction in operational overhead through automated inventory and scheduling systems.",
  "challenge": "The Brew Lab was experiencing rapid growth but struggling with manual inventory tracking, inconsistent staff scheduling, and fragmented customer data. The owner was spending 15+ hours per week on administrative tasks that could be automated.",
  "solution": "We developed a comprehensive operations dashboard that integrates inventory management, staff scheduling, and customer analytics. The system automatically tracks stock levels, generates purchase orders when supplies run low, and optimizes staff schedules based on historical traffic patterns.",
  "results": [
    "25% reduction in operational overhead",
    "12 hours/week saved on administrative tasks",
    "30% reduction in inventory waste",
    "Improved staff satisfaction with predictable scheduling"
  ],
  "technologies": ["React", "Node.js", "PostgreSQL", "Supabase"],
  "testimonial": {
    "quote": "Enkayel transformed how we run our business. I can finally focus on coffee instead of spreadsheets.",
    "author": "Sarah Chen",
    "role": "Owner, The Brew Lab"
  },
  "images": [
    "/images/consulting/brew-lab-dashboard.jpg",
    "/images/consulting/brew-lab-inventory.jpg"
  ]
}
```

### Case Study 2: Urban Threads

```json
{
  "id": "consulting-2",
  "title": "Urban Threads",
  "type": "Retail Process Streamlining",
  "client": "Multi-Location Clothing Retailer",
  "location": "Greater Vancouver Area",
  "duration": "6 months",
  "year": "2023",
  "summary": "40% fewer errors across 5 store locations through unified SOPs and automated reporting.",
  "challenge": "Urban Threads had expanded to 5 locations but each store operated with different procedures. Inconsistent practices led to inventory discrepancies, varied customer experiences, and management blind spots.",
  "solution": "We conducted a comprehensive audit of all locations, identified best practices, and developed standardized operating procedures. We then built a cross-location reporting system that aggregates data in real-time, giving management visibility into all stores from a single dashboard.",
  "results": [
    "40% reduction in operational errors",
    "Unified procedures across all 5 locations",
    "Real-time visibility into inventory and sales",
    "Reduced training time for new employees by 50%"
  ],
  "technologies": ["Notion", "Airtable", "Zapier", "Custom dashboards"],
  "testimonial": {
    "quote": "For the first time, I can see what's happening across all my stores without making phone calls.",
    "author": "Marcus Rodriguez",
    "role": "Founder, Urban Threads"
  },
  "images": [
    "/images/consulting/urban-threads-sop.jpg",
    "/images/consulting/urban-threads-dashboard.jpg"
  ]
}
```

### Case Study 3: Peak Performance Gym

```json
{
  "id": "consulting-3",
  "title": "Peak Performance Gym",
  "type": "Membership & Scheduling Optimization",
  "client": "Boutique Fitness Studio",
  "location": "North Vancouver, BC",
  "duration": "2 months",
  "year": "2024",
  "summary": "35% increase in class attendance through optimized scheduling and automated member communication.",
  "challenge": "The gym was experiencing high member churn and low class attendance despite quality instructors. Analysis revealed that class times didn't align with member preferences and communication was inconsistent.",
  "solution": "We analyzed member data to identify optimal class times, redesigned the schedule based on actual demand patterns, and implemented automated reminder and follow-up communications. We also created a feedback loop to continuously optimize offerings.",
  "results": [
    "35% increase in class attendance",
    "20% reduction in member churn",
    "Automated communication system",
    "Data-driven class scheduling"
  ],
  "technologies": ["MindBody API", "Custom analytics", "Twilio"],
  "testimonial": {
    "quote": "Our classes are now full, and members feel more connected to our community.",
    "author": "Jennifer Walsh",
    "role": "Director, Peak Performance Gym"
  },
  "images": [
    "/images/consulting/peak-schedule.jpg"
  ]
}
```

### Case Study 4: Coastal Imports

```json
{
  "id": "consulting-4",
  "title": "Coastal Imports",
  "type": "Supply Chain Optimization",
  "client": "Import/Distribution Company",
  "location": "Richmond, BC",
  "duration": "4 months",
  "year": "2023",
  "summary": "Reduced order fulfillment time by 45% through warehouse reorganization and process automation.",
  "challenge": "Coastal Imports was struggling with slow order fulfillment, frequent picking errors, and poor inventory visibility. Growth was constrained by operational bottlenecks.",
  "solution": "We redesigned the warehouse layout based on item velocity analysis, implemented a barcode scanning system for inventory tracking, and automated the order routing process. We also created real-time dashboards for inventory and fulfillment metrics.",
  "results": [
    "45% faster order fulfillment",
    "90% reduction in picking errors",
    "Real-time inventory accuracy",
    "Capacity to handle 2x order volume"
  ],
  "technologies": ["Warehouse management system", "Barcode scanning", "Custom dashboards"],
  "testimonial": {
    "quote": "We were drowning in orders. Now we can actually grow without hiring a huge team.",
    "author": "David Park",
    "role": "Operations Manager, Coastal Imports"
  },
  "images": [
    "/images/consulting/coastal-warehouse.jpg"
  ]
}
```

---

## Portfolio: Software Projects

### Project 1: Liquid Ledger

```json
{
  "id": "software-1",
  "title": "Liquid Ledger",
  "type": "Financial Dashboard",
  "client": "Internal Product",
  "year": "2024",
  "summary": "Personal and business finance tracking with automated categorization and visual analytics.",
  "description": "Liquid Ledger is a modern financial dashboard that helps individuals and small businesses track income, expenses, and cash flow. The interface features interactive visualizations, automated transaction categorization, and budget alerts.",
  "features": [
    "Bank account integration via Plaid",
    "Automated transaction categorization",
    "Interactive spending visualizations",
    "Custom budget creation and alerts",
    "Cash flow forecasting",
    "Export to CSV/PDF"
  ],
  "technologies": ["React", "TypeScript", "Node.js", "Plaid API", "D3.js", "PostgreSQL"],
  "status": "Live",
  "url": "https://liquidledger.app",
  "images": [
    "/images/software/liquid-ledger-dashboard.jpg",
    "/images/software/liquid-ledger-analytics.jpg"
  ]
}
```

### Project 2: Drake Bartends Admin Portal

```json
{
  "id": "software-2",
  "title": "Drake Bartends Admin Portal",
  "type": "Booking & Invoice System",
  "client": "Event Bartending Service",
  "year": "2024",
  "summary": "Complete business management system for event booking, quotes, and invoicing.",
  "description": "A custom-built admin portal for a premium event bartending company. The system handles the entire customer journey from initial inquiry to final invoice, including automated quote generation, contract management, and staff assignment.",
  "features": [
    "Event inquiry management",
    "Automated quote generation",
    "Digital contract signing",
    "Staff scheduling and assignment",
    "Inventory tracking per event",
    "Invoice generation and payment tracking",
    "Customer communication history"
  ],
  "technologies": ["Next.js", "Supabase", "Resend", "Stripe", "DocuSign API"],
  "status": "Live",
  "url": "Private (client dashboard)",
  "images": [
    "/images/software/drake-booking.jpg",
    "/images/software/drake-schedule.jpg"
  ]
}
```

### Project 3: Crypto Analytics Dashboard

```json
{
  "id": "software-3",
  "title": "Crypto Analytics Dashboard",
  "type": "Trading Analytics Platform",
  "client": "Personal Project",
  "year": "2023",
  "summary": "Real-time cryptocurrency analysis with technical indicators and sentiment tracking.",
  "description": "An advanced analytics dashboard for cryptocurrency traders. The platform aggregates data from multiple exchanges, calculates technical indicators (MACD, RSI, Bollinger Bands), and incorporates social sentiment analysis to inform trading decisions.",
  "features": [
    "Real-time price data aggregation",
    "Technical indicator calculations",
    "Social sentiment analysis",
    "Custom alert system",
    "Portfolio tracking",
    "Historical backtesting"
  ],
  "technologies": ["React", "Python", "FastAPI", "WebSockets", "Redis", "TensorFlow"],
  "status": "Beta",
  "url": "Private",
  "images": [
    "/images/software/crypto-dashboard.jpg",
    "/images/software/crypto-indicators.jpg"
  ]
}
```

---

## Portfolio: Construction Projects

### Project 1: Modern Luxury Residence

```json
{
  "id": "construction-1",
  "title": "Modern Luxury Residence",
  "type": "Residential Design-Build",
  "client": "Private Client",
  "location": "West Vancouver, BC",
  "year": "2023",
  "squareFootage": 4200,
  "summary": "Full design-build of a contemporary luxury home with ocean views and sustainable features.",
  "description": "A ground-up construction of a modern luxury residence perched on the hillside of West Vancouver. The design maximizes ocean views through floor-to-ceiling windows while integrating sustainable building practices including solar panels, rainwater harvesting, and high-efficiency HVAC.",
  "features": [
    "4,200 sq ft over 3 levels",
    "Floor-to-ceiling glass walls",
    "Solar panel array",
    "Rainwater harvesting system",
    "Smart home integration",
    "Heated floors throughout",
    "Custom millwork and cabinetry"
  ],
  "challenges": [
    "Steep hillside construction",
    "Maximizing views while ensuring privacy",
    "Integrating sustainable systems seamlessly"
  ],
  "duration": "18 months",
  "images": [
    "/images/construction/modern-luxury-exterior.jpg",
    "/images/construction/modern-luxury-interior.jpg",
    "/images/construction/modern-luxury-floorplan.jpg"
  ]
}
```

### Project 2: Adaptive Workspace

```json
{
  "id": "construction-2",
  "title": "Adaptive Workspace",
  "type": "Commercial Office Renovation",
  "client": "Tech Startup HQ",
  "location": "Gastown, Vancouver",
  "year": "2024",
  "squareFootage": 6500,
  "summary": "Interior renovation transforming a heritage building into a modern, flexible workspace.",
  "description": "A complete interior renovation of a heritage building in Gastown to serve as headquarters for a growing tech startup. The design balances respect for the building's history with modern workplace needs, featuring modular furniture systems, acoustic management, and collaboration zones.",
  "features": [
    "6,500 sq ft open concept",
    "Modular furniture systems",
    "Phone booths and focus rooms",
    "Collaboration and lounge areas",
    "Exposed brick and beam preservation",
    "Integrated AV systems",
    "Biophilic design elements"
  ],
  "challenges": [
    "Working within heritage building constraints",
    "Acoustic management in open space",
    "Supporting both collaboration and focused work"
  ],
  "duration": "6 months",
  "images": [
    "/images/construction/adaptive-workspace-main.jpg",
    "/images/construction/adaptive-workspace-lounge.jpg",
    "/images/construction/adaptive-workspace-floorplan.jpg"
  ]
}
```

### Project 3: Boutique Retail Shop

```json
{
  "id": "construction-3",
  "title": "Boutique Retail Shop",
  "type": "Retail Renovation",
  "client": "Lifestyle Brand",
  "location": "Kitsilano, Vancouver",
  "year": "2024",
  "squareFootage": 1200,
  "summary": "Storefront redesign featuring high-end finishes, custom displays, and optimized customer flow.",
  "description": "A renovation of a retail storefront for a local lifestyle brand. The design creates an immersive brand experience through custom millwork, strategic lighting, and optimized customer flow patterns that encourage exploration while maintaining clear sightlines to featured products.",
  "features": [
    "1,200 sq ft retail space",
    "Custom display fixtures",
    "Feature lighting system",
    "Flexible merchandising zones",
    "POS integration",
    "Storage optimization"
  ],
  "challenges": [
    "Maximizing display area in compact space",
    "Creating distinct zones within open floor plan",
    "Balancing aesthetics with practical retail needs"
  ],
  "duration": "3 months",
  "images": [
    "/images/construction/boutique-exterior.jpg",
    "/images/construction/boutique-interior.jpg",
    "/images/construction/boutique-details.jpg"
  ]
}
```

---

## Site Content

### Navigation Labels

```json
{
  "navigation": {
    "home": "Home",
    "consulting": "Consulting",
    "software": "Software",
    "construction": "Construction",
    "contact": "Contact"
  }
}
```

### Home Hub Content

```json
{
  "hero": {
    "title": "Crafting Systems, Spaces & Software",
    "subtitle": "Multi-disciplinary consultancy for businesses that think holistically",
    "cta": "Explore Portfolio"
  },
  "cards": [
    {
      "label": "Consulting",
      "description": "Streamline operations",
      "icon": "chart-line"
    },
    {
      "label": "Software",
      "description": "Build custom tools",
      "icon": "code"
    },
    {
      "label": "Construction",
      "description": "Design spaces",
      "icon": "building"
    }
  ]
}
```

### Contact Form Fields

```json
{
  "contact": {
    "heading": "Let's Work Together",
    "subheading": "Tell us about your project",
    "fields": [
      {
        "name": "name",
        "label": "Your Name",
        "type": "text",
        "required": true,
        "placeholder": "John Smith"
      },
      {
        "name": "email",
        "label": "Email Address",
        "type": "email",
        "required": true,
        "placeholder": "john@company.com"
      },
      {
        "name": "service",
        "label": "Service Interest",
        "type": "select",
        "required": false,
        "options": [
          "Business Operations Consulting",
          "Custom Software Development",
          "Construction & Architecture",
          "Multiple Services"
        ]
      },
      {
        "name": "budget",
        "label": "Budget Range",
        "type": "select",
        "required": false,
        "options": [
          "Under $10,000",
          "$10,000 - $50,000",
          "$50,000 - $100,000",
          "$100,000+"
        ]
      },
      {
        "name": "message",
        "label": "Project Details",
        "type": "textarea",
        "required": true,
        "placeholder": "Tell us about your project goals..."
      }
    ],
    "submitLabel": "Send Message",
    "calendarCta": "Or schedule a call",
    "calendarUrl": "https://calendly.com/enkayel/discovery"
  }
}
```

---

## Complete Data Export

### Full Portfolio JSON

```json
{
  "company": {
    "name": "Enkayel Studios",
    "tagline": "Crafting Systems, Spaces, and Software That Work as One"
  },
  "consulting": [
    { "id": "consulting-1", "title": "The Brew Lab", "type": "Operations Automation", "summary": "25% reduction in overhead" },
    { "id": "consulting-2", "title": "Urban Threads", "type": "Retail Process Streamlining", "summary": "40% fewer errors across stores" },
    { "id": "consulting-3", "title": "Peak Performance Gym", "type": "Membership Optimization", "summary": "35% increase in attendance" },
    { "id": "consulting-4", "title": "Coastal Imports", "type": "Supply Chain Optimization", "summary": "45% faster fulfillment" }
  ],
  "software": [
    { "id": "software-1", "title": "Liquid Ledger", "type": "Financial Dashboard", "summary": "Interactive finance tracking" },
    { "id": "software-2", "title": "Drake Bartends Admin", "type": "Booking System", "summary": "Event management platform" },
    { "id": "software-3", "title": "Crypto Analytics", "type": "Trading Dashboard", "summary": "Real-time market analysis" }
  ],
  "construction": [
    { "id": "construction-1", "title": "Modern Luxury Residence", "type": "Residential Design-Build", "summary": "4,200 sq ft luxury home" },
    { "id": "construction-2", "title": "Adaptive Workspace", "type": "Office Renovation", "summary": "6,500 sq ft tech HQ" },
    { "id": "construction-3", "title": "Boutique Retail Shop", "type": "Retail Renovation", "summary": "Premium storefront design" }
  ]
}
```

---

*This mock data represents placeholder content for development. Replace with actual portfolio content and imagery before launch.*
