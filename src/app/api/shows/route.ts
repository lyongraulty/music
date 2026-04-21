import { NextResponse } from "next/server";
import { fetchUpcomingShows } from "@/lib/calendar";

export const revalidate = 900;

export async function GET() {
  try {
    const events = await fetchUpcomingShows(8);
    return NextResponse.json({ events });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Calendar unavailable";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
