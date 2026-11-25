/**
 * JOURNAL — SAMPLE CONTENT
 * HV Nutrition has no published articles yet. These are clearly-labelled
 * drafts to show the editorial layout. They avoid medical or dosage advice;
 * replace or have them reviewed by a qualified professional before publishing.
 */
export const articles = [
  {
    slug: "choosing-a-whey-protein",
    title: "Choosing a whey protein",
    cover: "Whey",
    tone: "dark",
    category: "Protein",
    readTime: "4 min",
    excerpt: "What to look at on the label before you buy your next tub.",
    body: [
      "Most people pick a protein by flavour and price. Both matter — you’ll be drinking it a lot — but the label tells you more than the front of the tub does.",
      "Start with the protein per serving and the serving size together. Two tubs can both say “24g protein” but use different scoop sizes, which changes how much you actually get per rupee.",
      "Then look at what else is listed: amino acids such as BCAAs, added sugars, and the ingredient list. If you have allergies or dietary requirements, the ingredient list and allergen statement are what count.",
      "Finally, buy from a seller who can tell you where the product came from. If you’re unsure, ask before you buy.",
    ],
  },
  {
    slug: "creatine-the-basics",
    title: "Creatine, the basics",
    cover: "Creatine",
    tone: "light",
    category: "Creatine",
    readTime: "3 min",
    excerpt: "Flavoured or unflavoured, small pack or large — how to choose.",
    body: [
      "Creatine monohydrate is one of the most common sports supplements on the shelf. On our shelf it comes in two broad styles: unflavoured, which you add to another drink, and flavoured, which you mix with water.",
      "Pack size is mostly about value and how long a tub lasts you — check the servings count printed on the label rather than the weight alone.",
      "Follow the directions on the product’s label, and talk to a doctor or qualified professional first if you have a medical condition, are pregnant, or take medication.",
    ],
  },
  {
    slug: "building-a-simple-routine",
    title: "Building a simple supplement routine",
    cover: "Routine",
    tone: "ink",
    category: "Training",
    readTime: "4 min",
    excerpt: "Start with food and training. Add one thing at a time.",
    body: [
      "Supplements are the last few percent, not the foundation. Training consistently, eating enough, and sleeping well do most of the work.",
      "If you do add supplements, add one at a time. It’s easier to see what you like, what you tolerate, and what’s worth paying for.",
      "Keep it simple, read the labels, and ask us if you’re not sure which product fits what you’re doing.",
    ],
  },
];

export const getArticle = (slug) => articles.find((a) => a.slug === slug) ?? null;
