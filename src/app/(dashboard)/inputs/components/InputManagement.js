"use client";

import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";

export default function InputManagement({ isOpen, onClose, editingInput, onSave, context }) {
  const [formData, setFormData] = useState({
    name: "", description: "", type: "numeric", target: "", unit: "", frequency: "DAILY", weight: 10,
    change_reason: ""
  });

  useEffect(() => {
    if (editingInput) {
      setFormData({
        name: editingInput.name || "",
        description: editingInput.description || "",
        type: editingInput.type || "numeric",
        target: editingInput.target || "",
        unit: editingInput.unit || "",
        frequency: editingInput.frequency || "DAILY",
        weight: editingInput.weight || 10,
        change_reason: ""
      });
    } else {
      setFormData({ name: "", description: "", type: "numeric", target: "", unit: "", frequency: "DAILY", weight: 10, change_reason: "" });
    }
  }, [editingInput]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData, editingInput);
  };

  return (
    <div className="fixed inset-0 z-50 bg-orange-600/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-8 w-full max-w-2xl relative border border-slate-100 my-8">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-50 transition-colors">
          <X className="w-5 h-5" />
        </button>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-900">{editingInput ? "Evolve Input" : "Add New Input"}</h2>
          <p className="text-sm text-slate-500 mt-1">Translate strategy into operational behavior</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Input Name</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm" placeholder="e.g. Cold Calls" />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
              <input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm" placeholder="What exactly does this entail?" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Measurement Type</label>
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm">
                <option value="numeric">Numeric (Count)</option>
                <option value="duration">Duration (Time)</option>
                <option value="binary">Binary (Done/Not Done)</option>
                <option value="percentage">Percentage (%)</option>
                <option value="currency">Currency</option>
                <option value="quantity">Quantity</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Target per Frequency</label>
              <input required type="number" value={formData.target} onChange={e => setFormData({...formData, target: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm" placeholder="e.g. 20" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Unit</label>
              <input type="text" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm" placeholder="e.g. calls, min, %" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Frequency</label>
              <select value={formData.frequency} onChange={e => setFormData({...formData, frequency: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm">
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Weight (%)</label>
              <input type="number" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm" placeholder="10" />
              <p className="text-xs text-slate-500 mt-1.5">Determines how much this input contributes to the daily execution score.</p>
            </div>

            {editingInput && (
              <div className="md:col-span-2 bg-orange-50 rounded-xl border border-orange-100 p-5 mt-2">
                <label className="block text-sm font-medium text-orange-800 mb-1">Reason for Changing</label>
                <p className="text-sm text-orange-600/80 mb-3">You are modifying an active input. A new version will be created, and history will be preserved.</p>
                <select required value={formData.change_reason} onChange={e => setFormData({...formData, change_reason: e.target.value})} className="w-full bg-white border border-orange-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm">
                  <option value="" disabled>Select a reason...</option>
                  <option value="Target was too easy">Target was too easy</option>
                  <option value="Target was unrealistic">Target was unrealistic</option>
                  <option value="Strategy changed">Strategy changed</option>
                  <option value="Circumstances changed">Circumstances changed</option>
                  <option value="Replacing old input">Replacing this input</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            )}
          </div>
          
          <div className="pt-6 mt-6 flex flex-col md:flex-row justify-between gap-4 border-t border-slate-100">
            {editingInput ? (
              <div className="flex gap-3">
                <button type="button" onClick={() => onSave({ ...formData, status: "archived" }, editingInput, true)} className="px-5 py-2.5 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors">Archive</button>
                <button type="button" onClick={() => onSave({ ...formData, status: "paused" }, editingInput, true)} className="px-5 py-2.5 rounded-lg text-sm font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 transition-colors">Pause</button>
              </div>
            ) : <div />}
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
              <button type="submit" className="bg-orange-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors shadow-sm">{editingInput ? "Evolve Input" : "Add Input"}</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
