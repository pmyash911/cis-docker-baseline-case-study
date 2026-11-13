import { AboutSection } from "@/components/about-section";
import { Approach } from "@/components/approach";
import { Capabilities } from "@/components/capabilities";
import { ContactBand } from "@/components/contact-band";
import { Hero } from "@/components/hero";
import { SectionDivider } from "@/components/section-divider";
import { SelectedWork } from "@/components/selected-work";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="flex-1 pt-16">
        <Hero />
        <SectionDivider />
        <Capabilities />
        <SectionDivider />
        <SelectedWork />
        <SectionDivider />
        <Approach />
        <SectionDivider />
        <AboutSection />
        <ContactBand />
      </main>
      <SiteFooter />
    </>
  );
}
