import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function POST(request) {
  try {
    const { data: systems } = await supabase
      .from("systems")
      .select("id")
      .eq("status", "active")
      .limit(1);

    if (!systems || systems.length === 0) {
      return NextResponse.json({ error: "No active system found." }, { status: 404 });
    }

    const activeSys = systems[0];
    
    const today = new Date();
    today.setHours(0,0,0,0);
    const dateStr = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0];

    // Update the system start date to today, which resets all overdue review calculations
    const { error } = await supabase
      .from("systems")
      .update({ start_date: dateStr, is_frozen: false })
      .eq("id", activeSys.id);

    if (error) {
      throw error;
    }

    // We also delete any draft reviews from the past that were auto-generated but left uncompleted
    const { error: reviewError } = await supabase
      .from("reviews")
      .delete()
      .eq("system_id", activeSys.id)
      .eq("status", "DRAFT");
      
    if (reviewError) {
      console.warn("Failed to delete draft reviews on reset", reviewError);
    }

    return NextResponse.json({ success: true, message: "System reset successfully." });
  } catch (error) {
    console.error("System Reset Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
