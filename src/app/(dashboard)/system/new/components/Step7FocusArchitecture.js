"use client";

import { useForm } from "react-hook-form";
import useSystemCreationStore from "@/lib/store/useSystemCreationStore";
import { Sparkles, Headphones, Shield, Timer, Coffee, Flame, ArrowLeft, ArrowRight, BellOff, MapPin } from "lucide-react";

export default function Step7FocusArchitecture() {
  const { focusArchitecture, setFocusArchitecture, setStep } = useSystemCreationStore();

  const defaultValues = {
    location: focusArchitecture?.focusTriggers?.location || "Dedicated home desk or silent library corner",
    sound: focusArchitecture?.focusTriggers?.sound || "Brown noise, binaural beats, or ambient synth (no vocals)",
    preWorkRoutine: focusArchitecture?.focusTriggers?.preWorkRoutine || "Clear physical desk, fill water bottle, write top 3 targets on physical index card",
    preparationRitual: focusArchitecture?.focusTriggers?.preparationRitual || "Put phone in another room, take 3 deep belly breaths, set 50-minute timer",
    physicalEnvironment: focusArchitecture?.focusTriggers?.physicalEnvironment || "Clean surface, natural lighting, cool room temperature (68°F / 20°C)",
    
    notificationPolicy: focusArchitecture?.distractionControls?.notificationPolicy || "Absolute Do-Not-Disturb on all devices during focus blocks",
    phonePlacement: focusArchitecture?.distractionControls?.phonePlacement || "In another room or inside locked drawer on silent",
    websiteRestrictions: focusArchitecture?.distractionControls?.websiteRestrictions || "Cold Turkey / Freedom app blocker running during scheduled blocks",
    messageCheckingWindows: focusArchitecture?.distractionControls?.messageCheckingWindows || "12:00 PM and 17:00 PM (twice daily batching)",
    availabilityToOthers: focusArchitecture?.distractionControls?.availabilityToOthers || "Zero availability except urgent phone call from immediate family",

    sessionDuration: focusArchitecture?.focusSessions?.sessionDuration ?? 50,
    breakDuration: focusArchitecture?.focusSessions?.breakDuration ?? 10,
    maxDeepWorkSessionsPerDay: focusArchitecture?.focusSessions?.maxDeepWorkSessionsPerDay ?? 4,
    preferredFocusHours: focusArchitecture?.focusSessions?.preferredFocusHours || "08:30 - 12:30 and 14:00 - 16:30",
  };

  const { register, handleSubmit } = useForm({
    defaultValues,
  });

  const onSubmit = (data) => {
    setFocusArchitecture({
      focusTriggers: {
        location: data.location,
        sound: data.sound,
        preWorkRoutine: data.preWorkRoutine,
        preparationRitual: data.preparationRitual,
        physicalEnvironment: data.physicalEnvironment,
      },
      distractionControls: {
        notificationPolicy: data.notificationPolicy,
        phonePlacement: data.phonePlacement,
        websiteRestrictions: data.websiteRestrictions,
        messageCheckingWindows: data.messageCheckingWindows,
        availabilityToOthers: data.availabilityToOthers,
      },
      focusSessions: {
        sessionDuration: Number(data.sessionDuration),
        breakDuration: Number(data.breakDuration),
        maxDeepWorkSessionsPerDay: Number(data.maxDeepWorkSessionsPerDay),
        preferredFocusHours: data.preferredFocusHours,
      },
    });
    setStep(8);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-600 border border-orange-100 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Stage 7 of 12 — Focus Architecture & Environment
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Engineer Your Deep Work Sanctuary</h2>
          <p className="mt-1 text-sm text-gray-500 max-w-2xl leading-relaxed">
            Willpower is an unreliable fuel. Optimize your sensory triggers, distraction firewalls, and interval pacing to make deep focus effortless and repeatable.
          </p>
        </div>
      </div>

      <hr className="border-gray-100 mb-8" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Focus Triggers */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <MapPin className="w-5 h-5 text-orange-600" />
            <h3 className="text-base font-bold text-gray-900">1. Focus Triggers & Rituals</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Preferred Working Location</label>
              <input
                type="text"
                {...register("location")}
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2 text-sm bg-white text-gray-900 outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Preferred Sound / Music</label>
              <input
                type="text"
                {...register("sound")}
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2 text-sm bg-white text-gray-900 outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Pre-Work Routine</label>
              <input
                type="text"
                {...register("preWorkRoutine")}
                placeholder="What physical steps prepare your mind to work?"
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2 text-sm bg-white text-gray-900 outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Preparation Ritual</label>
              <input
                type="text"
                {...register("preparationRitual")}
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2 text-sm bg-white text-gray-900 outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Physical Environment Specs</label>
              <input
                type="text"
                {...register("physicalEnvironment")}
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2 text-sm bg-white text-gray-900 outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Distraction Controls */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <BellOff className="w-5 h-5 text-orange-600" />
            <h3 className="text-base font-bold text-gray-900">2. Distraction Firewalls</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Notification Policy</label>
              <input
                type="text"
                {...register("notificationPolicy")}
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2 text-sm bg-white text-gray-900 outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Physical Phone Placement</label>
              <input
                type="text"
                {...register("phonePlacement")}
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2 text-sm bg-white text-gray-900 outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Message-Checking Windows</label>
              <input
                type="text"
                {...register("messageCheckingWindows")}
                placeholder="e.g. 12:00 PM and 17:00 PM only"
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2 text-sm bg-white text-gray-900 outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Availability to Others</label>
              <input
                type="text"
                {...register("availabilityToOthers")}
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2 text-sm bg-white text-gray-900 outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Focus Session Parameters */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <Timer className="w-5 h-5 text-orange-600" />
            <h3 className="text-base font-bold text-gray-900">3. Focus Session Pacing</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Session Length
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  {...register("sessionDuration")}
                  className="w-20 font-bold text-base border border-gray-200 rounded px-2.5 py-1.5 bg-white"
                />
                <span className="text-xs text-gray-500">minutes</span>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Break Duration
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  {...register("breakDuration")}
                  className="w-20 font-bold text-base border border-gray-200 rounded px-2.5 py-1.5 bg-white"
                />
                <span className="text-xs text-gray-500">minutes</span>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Daily Session Limit
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  {...register("maxDeepWorkSessionsPerDay")}
                  className="w-20 font-bold text-base border border-gray-200 rounded px-2.5 py-1.5 bg-white"
                />
                <span className="text-xs text-gray-500">blocks / day</span>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Peak Focus Hours
              </label>
              <input
                type="text"
                {...register("preferredFocusHours")}
                className="w-full text-xs font-medium border border-gray-200 rounded px-2 py-1.5 bg-white mt-1"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={() => setStep(6)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to No-To-Do List
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-medium text-sm transition-all shadow-sm"
          >
            Proceed to Perfect Week
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
