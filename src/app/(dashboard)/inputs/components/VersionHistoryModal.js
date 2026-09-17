"use client";

import { X } from "lucide-react";

export default function VersionHistoryModal({ isOpen, onClose, input, history }) {
  if (!isOpen || !input) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl relative border border-gray-100 my-8">
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-50 transition-colors">
          <X className="w-5 h-5" />
        </button>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900">Version History</h2>
          <p className="text-sm text-gray-500 mt-1">{input.name}</p>
        </div>

        <div className="space-y-6">
          <div className="border-l-2 border-orange-500 pl-5 relative">
            <div className="absolute w-3 h-3 bg-orange-500 rounded-full -left-[7px] top-1 border-2 border-white" />
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Current Version</h3>
            <div className="text-xs text-gray-500 mb-3">{input.start_date ? new Date(input.start_date).toLocaleDateString() : 'Active'} &rarr; Present</div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-gray-500 text-xs block mb-1">Target</span> <span className="font-medium text-gray-900">{input.target} {input.unit}/{input.frequency}</span></div>
                <div><span className="text-gray-500 text-xs block mb-1">Weight</span> <span className="font-medium text-gray-900">{input.weight}%</span></div>
              </div>
            </div>
          </div>

          {history && history.map((ver, idx) => (
            <div key={ver.id} className="border-l-2 border-gray-200 pl-5 relative">
              <div className="absolute w-3 h-3 bg-gray-200 rounded-full -left-[7px] top-1 border-2 border-white" />
              <h3 className="text-sm font-medium text-gray-700 mb-1">Version {history.length - idx}</h3>
              <div className="text-xs text-gray-500 mb-3">{ver.start_date ? new Date(ver.start_date).toLocaleDateString() : ''} &rarr; {ver.end_date ? new Date(ver.end_date).toLocaleDateString() : ''}</div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 text-sm shadow-sm">
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div><span className="text-gray-500 text-xs block mb-1">Target</span> <span className="font-medium text-gray-900">{ver.target} {ver.unit}/{ver.frequency}</span></div>
                  <div><span className="text-gray-500 text-xs block mb-1">Weight</span> <span className="font-medium text-gray-900">{ver.weight}%</span></div>
                </div>
                {ver.change_reason && (
                  <div className="border-t border-gray-100 pt-3 mt-1">
                    <span className="text-gray-500 text-xs block mb-1">Reason for Change</span>
                    <span className="text-gray-700 italic">{ver.change_reason}</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {(!history || history.length === 0) && (
            <p className="text-sm text-gray-500 italic ml-5">No previous versions exist for this input.</p>
          )}
        </div>
      </div>
    </div>
  );
}
