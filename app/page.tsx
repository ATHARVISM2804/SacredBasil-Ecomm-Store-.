import { getProducts } from "@/lib/catalog/repository";
import { HeroVideo } from "@/components/home/HeroVideo";
import { CollectionShowcase } from "@/components/home/CollectionShowcase";
import { LuxeSpotlight } from "@/components/home/LuxeSpotlight";
import { StudioRail } from "@/components/home/StudioRail";
import { CorporateBand } from "@/components/home/CorporateBand";
import { StoryValues } from "@/components/home/StoryValues";
import { PreviousWork } from "@/components/home/PreviousWork";

export default async function HomePage() {
  const products = await getProducts();
  const luxe = products.find((p) => p.id === "luxe-bath-body-care-kit") ?? products[0];

  return (
    <>
      <HeroVideo />
      <CollectionShowcase products={products} />
      {luxe && <LuxeSpotlight product={luxe} />}
      <StudioRail />
      {luxe && <CorporateBand product={luxe} />}
      <StoryValues />
      <PreviousWork />
    </>
  );
}
