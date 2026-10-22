import { getAccommodations } from '../lib/accommodations';
import { HomeContent } from '../components/home-content';

export default async function Home() {
  return <HomeContent accommodations={await getAccommodations()} />;
}
