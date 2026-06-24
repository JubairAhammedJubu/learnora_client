import AdvertiseSection from "@/components/AdvertiseSection";
import HeroSlider from "@/components/HeroSlider";
import PopularRoutes from "@/components/PopularRoutes";
import WhyChooseUs from "@/components/WhyChooseUs";
import Image from "next/image";

export default function Home() {
  return (
    <div className="">
      <HeroSlider />
      <AdvertiseSection />
      <PopularRoutes />
      <WhyChooseUs />
    </div>
  );
}
