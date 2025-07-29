import ScrapPricingPage from "../components/Prices";
import Footer from "../components/Footer";
import Hero from "../components/Hero";
import HowWeWork from "../components/HowWeWork";
import WhyUs from "../components/WhyUs";

export default function Home() {
  return (
    <main className="bg-[#FCF9F2]">
      <Hero/> 
      <ScrapPricingPage />
      <HowWeWork />
      <WhyUs />
      <Footer /> 
    </main>
  );
}
