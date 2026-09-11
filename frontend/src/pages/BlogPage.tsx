import { Link } from "react-router-dom"

const blogPosts = [
  {
    slug: "why-preventive-screening-matters",
    title: "Why Preventive Screening Matters More Than You Think",
    category: "Prevention",
    excerpt:
      "Most people only visit a doctor when something feels wrong. But by then, many conditions have already progressed silently. Here is why regular screening could change everything.",
    image: "/images/blog-preventive-screening.jpg",
  },
  {
    slug: "7-tests-every-adult-should-have",
    title: "7 Tests Every Adult Should Have Done at Least Once",
    category: "Testing",
    excerpt:
      "From blood glucose to cholesterol panels, there are key tests that every adult should complete at least once. We break down what they are and why they matter.",
    image: "/images/blog-blood-test.jpg",
  },
  {
    slug: "cholesterol-numbers-explained",
    title: "What Your Cholesterol Numbers Actually Mean",
    category: "Education",
    excerpt:
      "HDL, LDL, triglycerides — the numbers can feel overwhelming. We explain what each one means and when you should be concerned.",
    image: "/images/blog-cholesterol.jpg",
  },
  {
    slug: "hiv-testing-what-to-expect",
    title: "HIV Testing: What to Expect and Why It's Worth Doing",
    category: "Testing",
    excerpt:
      "HIV testing is quick, confidential, and could save your life. We walk you through the process from start to finish so you know exactly what to expect.",
    image: "/images/blog-hiv-testing.jpg",
  },
  {
    slug: "blood-sugar-vs-hba1c",
    title:
      "The Difference Between Blood Sugar and HbA1c — Explained Simply",
    category: "Education",
    excerpt:
      "One tells you what is happening right now. The other tells you the story of the last three months. Understanding both is key to managing diabetes risk.",
    image: "/images/blog-diabetes-hba1c.jpg",
  },
  {
    slug: "high-blood-pressure-signs",
    title:
      "Signs You Might Have High Blood Pressure (And Not Know It)",
    category: "Prevention",
    excerpt:
      "High blood pressure is called the 'silent killer' for a reason. Learn the subtle signs and why regular monitoring matters more than you think.",
    image: "/images/blog-blood-pressure.jpg",
  },
  {
    slug: "hepatitis-b-test",
    title: "When Should You Get a Hepatitis B Test?",
    category: "Lifestyle",
    excerpt:
      "Hepatitis B can stay hidden in your body for decades. Here is when you should get tested and what the results mean for your health.",
    image: "/images/blog-hepatitis-screening.jpg",
  },
]

export function BlogPage() {
  return (
    <>
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          PAGE HERO
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="bg-[var(--color-forest)] px-[24px] py-[80px] md:px-[80px] text-center">
        <div className="mx-auto max-w-[1200px]">
          <h1 className="font-serif text-[40px] md:text-[52px] text-white mb-6">
            Health Tips &amp; Insights
          </h1>
          <p className="font-sans text-[17px] text-white/75 leading-[1.75] max-w-[560px] mx-auto">
            Practical health information written in plain language — no jargon, no scare tactics. Just honest, useful content to help you take better care of yourself.
          </p>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          BLOG CARDS
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="bg-[var(--color-off-white)] py-[80px] px-[24px] md:px-[80px]">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]">
            {blogPosts.map((post) => (
              <article
                key={post.slug}
                className="rounded-[var(--radius-lg)] bg-white border border-[var(--color-border)] overflow-hidden transition-all duration-250 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-1"
              >
                {/* TODO: connect to CMS or blog API */}
                {/* Image area */}
                <div className="relative h-[200px] bg-[var(--color-surface-2)] overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="h-full w-full object-cover"
                  />
                  {/* Category tag */}
                  <span className="absolute top-3 left-3 rounded-full bg-[var(--color-lime)] px-[10px] py-[3px] font-sans text-[11px] font-bold uppercase text-white">
                    {post.category}
                  </span>
                </div>

                {/* Card body */}
                <div className="p-[24px]">
                  <div className="font-sans text-[12px] font-medium uppercase text-[var(--color-text-muted)] mb-2">
                    June 2025
                  </div>
                  <h3 className="font-sans text-[18px] font-semibold text-[var(--color-forest)] leading-[1.4] mb-3">
                    {post.title}
                  </h3>
                  <p className="font-sans text-[14px] text-[var(--color-text-secondary)] leading-[1.65] mb-4">
                    {post.excerpt}
                    {/* // TODO: replace with real article content */}
                  </p>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="font-sans text-[13px] font-semibold text-[var(--color-forest)] hover:text-[var(--color-lime-dark)] transition-colors"
                  >
                    Read More &rarr;
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
