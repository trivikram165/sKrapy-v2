import ScrapPricingPage from "../components/Prices";
import Footer from "../components/Footer";
import Hero from "../components/Hero";
import HowWeWork from "../components/HowWeWork";
import WhyUs from "../components/WhyUs";
import AuthWrapper from "../components/AuthWrapper";

export const metadata = {
  title: "Home",
  description: "Transform your scrap into cash with sKrapy. Get instant quotes for electronics, metals, and recyclable materials. Free doorstep pickup across India with fair pricing and instant payments.",
  openGraph: {
    title: "sKrapy - Turn Your Scrap Into Cash",
    description: "India's leading digital scrap marketplace. Sell electronics, metals, and recyclables with instant quotes and doorstep pickup.",
  },
  alternates: {
    canonical: "https://skrapy.com",
  },
};

export default function Home() {
  return (
    <AuthWrapper>
      <main className="bg-[#FCF9F2]">
        <Hero/> 
        <ScrapPricingPage />
        <HowWeWork />
        <WhyUs />
        <Footer /> 
      </main>
    </AuthWrapper>
  );
}
