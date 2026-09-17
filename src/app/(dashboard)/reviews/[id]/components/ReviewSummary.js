import { useState } from "react";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ReviewSummary({ reviewState, onBack }) {
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const handleComplete = async () => {
    setSaving(true);
    try {
      let versionId = null;
      if (reviewState.milestoneAchieved) {
        const snapshot = {
          inputs: reviewState.inputs,
          milestone: reviewState.milestone,
          aiAnalysis: reviewState.aiAnalysis
        };
        
        const { data: vData } = await supabase.from("system_versions").insert({
          system_id: reviewState.system.id,
          snapshot,
          version_number: 1
        }).select();
        
        versionId = vData?.[0]?.id;
      }

      if (reviewState.milestoneAchieved && reviewState.inputChanges.length > 0) {
        for (const change of reviewState.inputChanges) {
          const oldInput = reviewState.inputs.find(i => i.id === change.id);
          if (!oldInput) continue;

          if (change.action === 'ARCHIVE' || change.action === 'PAUSE' || change.action === 'REPLACE') {
            await supabase.from("input_definitions").update({
              active_status: false,
              status: change.action.toLowerCase(),
              end_date: new Date().toISOString()
            }).eq("id", change.id);
          }

          if (change.action === 'INCREASE' || change.action === 'REDUCE') {
            await supabase.from("input_definitions").update({
              active_status: false,
              status: 'archived',
              end_date: new Date().toISOString()
            }).eq("id", change.id);

            await supabase.from("input_definitions").insert({
              system_id: reviewState.system.id,
              weekly_milestone_id: oldInput.weekly_milestone_id,
              name: oldInput.name,
              target: change.newTarget,
              frequency: oldInput.frequency,
              unit: oldInput.unit,
              active_status: true,
              version_group_id: oldInput.version_group_id || oldInput.id,
              previous_version_id: oldInput.id,
              change_reason: `Milestone achieved. Action: ${change.action}`
            });
          }
        }
      }

      if (reviewState.milestoneAchieved && reviewState.milestone) {
        await supabase.from("weekly_milestones").update({
          status: 'completed'
        }).eq("id", reviewState.milestone.id);
      }

      await supabase.from("reviews").insert({
        system_id: reviewState.system.id,
        type: "WEEKLY",
        status: "COMPLETED",
        summary: reviewState.aiAnalysis?.summary || "Completed manual review",
        investigation: reviewState.aiAnalysis
      });

      const nextReview = new Date();
      nextReview.setDate(nextReview.getDate() + 7);
      await supabase.from("systems").update({
        is_frozen: false,
        next_review_date: nextReview.toISOString()
      }).eq("id", reviewState.system.id);

      if (reviewState.milestoneAchieved && reviewState.milestone) {
        router.push(`/results?milestone=${reviewState.milestone.id}&handoff=true`);
      } else {
        router.push("/dashboard");
      }
      
    } catch (err) {
      console.error("Failed to finalize review:", err);
      setSaving(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-center py-12">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
        <Check className="w-8 h-8 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Investigation Complete</h2>
      <p className="text-sm text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
        Your operating system has been analyzed. 
        {reviewState.milestoneAchieved 
          ? " Your new system version will be snapshotted and inputs evolved. Next, you will record your exact results." 
          : " The system will continue tracking execution for the next period."}
      </p>

      <div className="flex justify-center gap-4">
        <button 
          onClick={onBack}
          disabled={saving}
          className="text-gray-600 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
        >
          Back
        </button>
        <button 
          onClick={handleComplete}
          disabled={saving}
          className="bg-orange-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          Commit System Version
        </button>
      </div>
    </div>
  );
}
