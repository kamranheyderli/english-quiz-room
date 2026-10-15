import { CURRICULUM } from "@/lib/curriculum";

export function GET() {
  return Response.json(CURRICULUM);
}
