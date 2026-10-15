import QuizApp from "@/components/QuizApp";
import { CURRICULUM } from "@/lib/curriculum";

export default function Home() {
  return <QuizApp curriculum={CURRICULUM} />;
}
