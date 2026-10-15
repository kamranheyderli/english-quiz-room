import ListeningApp from "@/components/ListeningApp";
import { CURRICULUM, STORIES } from "@/lib/curriculum";

export const metadata = { title: "Listening · English Quiz Room" };

export default function ListeningPage() {
  return <ListeningApp curriculum={CURRICULUM} stories={STORIES} />;
}
