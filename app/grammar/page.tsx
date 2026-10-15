import GrammarApp from "@/components/GrammarApp";
import { CURRICULUM } from "@/lib/curriculum";

export const metadata = { title: "Qrammatika · English Quiz Room" };

export default function GrammarPage() {
  return <GrammarApp curriculum={CURRICULUM} />;
}
