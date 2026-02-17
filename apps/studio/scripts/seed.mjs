import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-05-08" });

// --- Helpers ---

function block(text) {
  return {
    _type: "block",
    _key: crypto.randomUUID().slice(0, 8),
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: crypto.randomUUID().slice(0, 8), text, marks: [] }],
  };
}

function richText(...paragraphs) {
  return paragraphs.map((t) => block(t));
}

function customUrl(type, value, openInNewTab = false) {
  const base = { _type: "customUrl", type, openInNewTab, href: "#" };
  if (type === "external") return { ...base, external: value };
  if (type === "email") return { ...base, email: value };
  if (type === "internal") return { ...base, internal: { _type: "reference", _ref: value } };
  return base;
}

function key() {
  return crypto.randomUUID().slice(0, 8);
}

// --- Singletons ---

const settings = {
  _id: "settings",
  _type: "settings",
  label: "Global Settings",
  siteTitle: "Turbo Store",
  siteDescription:
    "Your one-stop destination for premium products. Discover curated collections, trending items, and exclusive deals crafted for the modern shopper.",
  contactEmail: "hello@turbostore.com",
  socialLinks: {
    linkedin: "https://linkedin.com/company/turbostore",
    facebook: "https://facebook.com/turbostore",
    twitter: "https://x.com/turbostore",
    instagram: "https://instagram.com/turbostore",
    youtube: "https://youtube.com/@turbostore",
  },
};

const navbar = {
  _id: "navbar",
  _type: "navbar",
  label: "Main Navigation",
  columns: [
    {
      _type: "navbarLink",
      _key: key(),
      name: "Home",
      url: customUrl("external", "/"),
    },
    {
      _type: "navbarLink",
      _key: key(),
      name: "About",
      url: customUrl("external", "/about"),
    },
    {
      _type: "navbarLink",
      _key: key(),
      name: "Blog",
      url: customUrl("external", "/blog"),
    },
    {
      _type: "navbarLink",
      _key: key(),
      name: "Contact",
      url: customUrl("email", "hello@turbostore.com"),
    },
  ],
  buttons: [
    {
      _type: "button",
      _key: key(),
      text: "Shop Now",
      variant: "default",
      url: customUrl("external", "/products"),
    },
  ],
};

const footer = {
  _id: "footer",
  _type: "footer",
  label: "Footer",
  subtitle:
    "Premium products for the modern lifestyle. Quality you can trust, style you will love.",
  columns: [
    {
      _type: "footerColumn",
      _key: key(),
      title: "Company",
      links: [
        { _type: "footerColumnLink", _key: key(), name: "About Us", url: customUrl("external", "/about") },
        { _type: "footerColumnLink", _key: key(), name: "Blog", url: customUrl("external", "/blog") },
        { _type: "footerColumnLink", _key: key(), name: "Careers", url: customUrl("external", "/careers") },
      ],
    },
    {
      _type: "footerColumn",
      _key: key(),
      title: "Support",
      links: [
        { _type: "footerColumnLink", _key: key(), name: "Help Center", url: customUrl("external", "/help") },
        { _type: "footerColumnLink", _key: key(), name: "Contact Us", url: customUrl("email", "support@turbostore.com") },
        { _type: "footerColumnLink", _key: key(), name: "Returns", url: customUrl("external", "/returns") },
      ],
    },
    {
      _type: "footerColumn",
      _key: key(),
      title: "Legal",
      links: [
        { _type: "footerColumnLink", _key: key(), name: "Privacy Policy", url: customUrl("external", "/privacy") },
        { _type: "footerColumnLink", _key: key(), name: "Terms of Service", url: customUrl("external", "/terms") },
      ],
    },
  ],
};

const blogIndex = {
  _id: "blogIndex",
  _type: "blogIndex",
  title: "Blog",
  description: "Insights, tutorials, and stories from our team. Stay up to date with the latest trends in e-commerce and product design.",
  slug: { _type: "slug", current: "blog" },
  displayFeaturedBlogs: "yes",
  featuredBlogsCount: "3",
};

// --- Authors ---

const author1Id = "author-jane-doe";
const author2Id = "author-alex-smith";

const authors = [
  {
    _id: author1Id,
    _type: "author",
    name: "Jane Doe",
    position: "Head of Content",
    bio: "Jane has over 10 years of experience in content strategy and digital marketing. She loves helping brands tell their stories.",
  },
  {
    _id: author2Id,
    _type: "author",
    name: "Alex Smith",
    position: "Product Designer",
    bio: "Alex is a product designer with a passion for creating beautiful and functional user experiences. Previously at Shopify and Figma.",
  },
];

// --- FAQs ---

const faq1Id = "faq-shipping";
const faq2Id = "faq-returns";
const faq3Id = "faq-payment";
const faq4Id = "faq-sizing";

const faqs = [
  {
    _id: faq1Id,
    _type: "faq",
    title: "How long does shipping take?",
    richText: richText(
      "Standard shipping takes 5-7 business days within the US. Express shipping is available for 2-3 business day delivery.",
      "International orders typically arrive within 10-14 business days depending on destination."
    ),
  },
  {
    _id: faq2Id,
    _type: "faq",
    title: "What is your return policy?",
    richText: richText(
      "We offer a 30-day return policy for all unworn and undamaged items. Simply initiate a return through your account dashboard.",
      "Refunds are processed within 5-7 business days after we receive the returned item."
    ),
  },
  {
    _id: faq3Id,
    _type: "faq",
    title: "What payment methods do you accept?",
    richText: richText(
      "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, Apple Pay, Google Pay, and Shop Pay.",
      "All transactions are secured with industry-standard SSL encryption."
    ),
  },
  {
    _id: faq4Id,
    _type: "faq",
    title: "How do I find my size?",
    richText: richText(
      "Each product page includes a detailed size guide. We recommend measuring yourself and comparing against our size chart for the best fit.",
      "If you are between sizes, we generally recommend sizing up for a more comfortable fit."
    ),
  },
];

// --- Pages ---

const aboutPage = {
  _id: "page-about",
  _type: "page",
  title: "About Us",
  description:
    "Learn about Turbo Store's mission to deliver premium products with exceptional quality and outstanding customer service worldwide.",
  slug: { _type: "slug", current: "about" },
  pageBuilder: [
    {
      _type: "cta",
      _key: key(),
      eyebrow: "Our Story",
      title: "Built for the Modern Shopper",
      richText: richText(
        "We started Turbo Store with a simple belief: everyone deserves access to premium products without the premium price tag.",
        "Our team carefully curates every product in our catalog, ensuring it meets our high standards for quality, design, and sustainability."
      ),
      buttons: [
        {
          _type: "button",
          _key: key(),
          text: "Get in Touch",
          variant: "default",
          url: customUrl("email", "hello@turbostore.com"),
        },
      ],
    },
    {
      _type: "featureCardsIcon",
      _key: key(),
      eyebrow: "Why Choose Us",
      title: "What Sets Us Apart",
      richText: richText("We are committed to delivering an exceptional shopping experience from start to finish."),
      cards: [
        {
          _type: "featureCardIcon",
          _key: key(),
          icon: "package",
          title: "Free Shipping",
          richText: richText("Enjoy free standard shipping on all orders over $50. No hidden fees, no surprises."),
        },
        {
          _type: "featureCardIcon",
          _key: key(),
          icon: "shield",
          title: "Quality Guarantee",
          richText: richText("Every product is tested and vetted by our team. If it does not meet our standards, it does not make the cut."),
        },
        {
          _type: "featureCardIcon",
          _key: key(),
          icon: "headphones",
          title: "24/7 Support",
          richText: richText("Our customer support team is here around the clock to help you with any questions or concerns."),
        },
      ],
    },
  ],
};

// --- Blogs ---

const blogs = [
  {
    _id: "blog-getting-started",
    _type: "blog",
    title: "Getting Started with Your New Products",
    description:
      "A comprehensive guide to unboxing, setting up, and getting the most out of your new Turbo Store purchases from day one.",
    slug: { _type: "slug", current: "getting-started" },
    publishedAt: "2026-01-15",
    authors: [{ _type: "reference", _ref: author1Id, _key: key() }],
    richText: richText(
      "Congratulations on your new purchase! In this guide, we will walk you through everything you need to know to get started.",
      "First, carefully unbox your product and inspect it for any damage during shipping. If you notice anything unusual, contact our support team immediately.",
      "Next, read through the included documentation. We have designed our products to be intuitive, but a quick review of the basics will help you get the most out of your purchase.",
      "Finally, do not forget to register your product on our website. This ensures you receive warranty coverage and access to exclusive content and updates."
    ),
  },
  {
    _id: "blog-sustainable-shopping",
    _type: "blog",
    title: "The Future of Sustainable Shopping",
    description:
      "Exploring how sustainable practices are reshaping the e-commerce landscape and what it means for conscious consumers everywhere.",
    slug: { _type: "slug", current: "sustainable-shopping" },
    publishedAt: "2026-02-01",
    authors: [{ _type: "reference", _ref: author2Id, _key: key() }],
    richText: richText(
      "Sustainability is no longer a trend — it is a necessity. At Turbo Store, we are committed to reducing our environmental footprint while delivering products you love.",
      "We have partnered with eco-friendly manufacturers who share our vision for a greener future. From packaging to production, every step of our supply chain is designed with the planet in mind.",
      "As consumers, your choices matter. By choosing sustainable products, you are not just making a purchase — you are making a statement about the world you want to live in."
    ),
  },
  {
    _id: "blog-design-trends",
    _type: "blog",
    title: "Top Design Trends for 2026",
    description:
      "From minimalist aesthetics to bold color palettes, discover the design trends that are defining product design in the new year.",
    slug: { _type: "slug", current: "design-trends-2026" },
    publishedAt: "2026-02-10",
    authors: [{ _type: "reference", _ref: author1Id, _key: key() }],
    richText: richText(
      "Design trends are constantly evolving, and 2026 is bringing some exciting changes. Here are the top trends we are seeing across the product landscape.",
      "Minimalism continues to reign supreme, but with a twist. Designers are incorporating organic textures and warm tones to create products that feel both modern and inviting.",
      "Bold color palettes are making a comeback. Expect to see rich jewel tones and unexpected color combinations that make products stand out on the shelf.",
      "Sustainability-driven design is no longer optional. Products are being designed with their entire lifecycle in mind, from materials sourcing to end-of-life recyclability."
    ),
  },
];

// --- Home Page ---

const homePage = {
  _id: "homePage",
  _type: "homePage",
  title: "Turbo Store",
  description:
    "Premium products for the modern lifestyle. Discover curated collections and trending items crafted with quality and care.",
  slug: { _type: "slug", current: "/" },
  pageBuilder: [
    {
      _type: "cta",
      _key: key(),
      eyebrow: "Welcome to Turbo Store",
      title: "Premium Products, Modern Living",
      richText: richText(
        "Discover our curated selection of premium products designed for the modern lifestyle. Quality craftsmanship meets contemporary design."
      ),
      buttons: [
        {
          _type: "button",
          _key: key(),
          text: "Browse Collection",
          variant: "default",
          url: customUrl("external", "/products"),
        },
        {
          _type: "button",
          _key: key(),
          text: "Learn More",
          variant: "outline",
          url: customUrl("external", "/about"),
        },
      ],
    },
    {
      _type: "featureCardsIcon",
      _key: key(),
      eyebrow: "Why Turbo Store",
      title: "Built Different",
      richText: richText("Everything we do is designed to make your shopping experience seamless and enjoyable."),
      cards: [
        {
          _type: "featureCardIcon",
          _key: key(),
          icon: "zap",
          title: "Fast Delivery",
          richText: richText("Get your orders delivered in 2-3 business days with our express shipping option."),
        },
        {
          _type: "featureCardIcon",
          _key: key(),
          icon: "shield-check",
          title: "Secure Checkout",
          richText: richText("Your data is protected with industry-leading encryption and security protocols."),
        },
        {
          _type: "featureCardIcon",
          _key: key(),
          icon: "rotate-ccw",
          title: "Easy Returns",
          richText: richText("Not satisfied? Return any item within 30 days for a full refund, no questions asked."),
        },
      ],
    },
    {
      _type: "faqAccordion",
      _key: key(),
      eyebrow: "Got Questions?",
      title: "Frequently Asked Questions",
      subtitle: "Find quick answers to common questions about our products and services.",
      faqs: [
        { _type: "reference", _ref: faq1Id, _key: key() },
        { _type: "reference", _ref: faq2Id, _key: key() },
        { _type: "reference", _ref: faq3Id, _key: key() },
        { _type: "reference", _ref: faq4Id, _key: key() },
      ],
    },
    {
      _type: "subscribeNewsletter",
      _key: key(),
      title: "Stay in the Loop",
      subTitle: richText("Get the latest product drops, exclusive deals, and style inspiration delivered to your inbox."),
      helperText: richText("No spam, ever. Unsubscribe anytime."),
    },
  ],
};

// --- Seed ---

async function seed() {
  console.log("Seeding Sanity dataset...\n");

  const allDocs = [
    settings,
    navbar,
    footer,
    blogIndex,
    ...authors,
    ...faqs,
    aboutPage,
    ...blogs,
    homePage,
  ];

  const transaction = client.transaction();

  for (const doc of allDocs) {
    transaction.createOrReplace(doc);
  }

  try {
    const result = await transaction.commit();
    console.log(`Created ${allDocs.length} documents.`);
    console.log("Transaction ID:", result.transactionId);

    console.log("\nDone! All documents created and available.");
    console.log("\nCreated:");
    console.log("  - Settings (singleton)");
    console.log("  - Navbar (singleton)");
    console.log("  - Footer (singleton)");
    console.log("  - Blog Index (singleton)");
    console.log("  - Home Page (singleton)");
    console.log(`  - ${authors.length} authors`);
    console.log(`  - ${faqs.length} FAQs`);
    console.log(`  - ${blogs.length} blog posts`);
    console.log("  - 1 about page");
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exit(1);
  }
}

seed();
