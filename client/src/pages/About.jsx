import { Link } from "react-router-dom";

const PRINCIPLES = [
  {
    title: "Transparent",
    text: "Clear prices, real photographs and honest descriptions on every listing.",
  },
  {
    title: "Personal",
    text: "Speak directly with the owner. No call centres and no chasing for answers.",
  },
  {
    title: "Informed",
    text: "Up-to-date market knowledge to help you buy, sell or rent with confidence.",
  },
];

export default function About() {
  return (
    <div>
      <section className="border-b border-neutral-200">
        <div className="page py-16 sm:py-24">
          <p className="eyebrow">About us</p>
          <h1 className="heading mt-4 max-w-4xl text-4xl sm:text-6xl">
            A trusted name in Sri Lankan real estate.
          </h1>
        </div>
      </section>

      <section className="page grid grid-cols-1 gap-12 py-16 sm:py-24 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="eyebrow">Who we are</p>
        </div>
        <div className="space-y-6 text-lg leading-relaxed text-neutral-700 lg:col-span-8">
          <p>
            Own Property is a trusted real estate agency dedicated to helping
            buyers, sellers, and investors find the right property across Sri Lanka.
            We specialize in the sale of lands, houses, apartments, and commercial
            properties, offering reliable service and expert guidance throughout
            every step of the buying and selling process.
          </p>
          <p>
            Our mission is to make property transactions simple, transparent, and
            hassle-free by connecting clients with quality listings and providing
            professional support. Whether you’re searching for your dream home, a
            valuable investment, or the perfect piece of land, Own Property is
            committed to helping you make the right choice with confidence.
          </p>
          <p>
            At Own Property, customer satisfaction is at the heart of everything we
            do. Our experienced team is committed to delivering personalized
            service, honest advice, and up-to-date market insights to ensure every
            client has a smooth and successful real estate experience. With a
            growing portfolio of verified property listings and a passion for
            excellence, we strive to make finding or selling property easier,
            faster, and more rewarding.
          </p>
        </div>
      </section>

      <section className="border-y border-neutral-200">
        <div className="page grid grid-cols-1 divide-y divide-neutral-200 md:grid-cols-3 md:divide-x md:divide-y-0">
          {PRINCIPLES.map((principle, index) => (
            <div key={principle.title} className="py-12 md:px-8 md:first:pl-0 md:last:pr-0">
              <p className="font-display text-sm font-semibold text-neutral-400">0{index + 1}</p>
              <h2 className="heading mt-6 text-2xl">{principle.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-neutral-600">{principle.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="page flex flex-col items-start gap-8 py-20 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="heading max-w-xl text-3xl sm:text-4xl">Ready to find your next property?</h2>
        <Link to="/search" className="btn-primary">
          Browse properties
        </Link>
      </section>
    </div>
  );
}
