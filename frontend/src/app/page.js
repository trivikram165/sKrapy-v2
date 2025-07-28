import ScrapPricingPage from "../components/Prices";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Hero from "../components/Hero";
import HowWeWork from "../components/HowWeWork";
import WhyUs from "../components/WhyUs";

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <ScrapPricingPage />
      <HowWeWork />
      <WhyUs />
      <Footer />
    </main>
  );
}
