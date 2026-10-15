import TeacherPanel from "@/components/TeacherPanel";
import { CURRICULUM } from "@/lib/curriculum";

export const metadata = { title: "Müəllim paneli · English Quiz Room" };

export default function TeacherPage() {
  return <TeacherPanel curriculum={CURRICULUM} />;
}
