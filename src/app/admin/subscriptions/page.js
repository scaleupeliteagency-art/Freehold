"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function AdminSubscriptionsPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    // Because we added an RLS policy that lets admins select all from profiles,
    // this will return all users for the admin.
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
      
    if (error) {
      console.error(error);
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateStatus = async (userId, newStatus, newPlan, durationMonths) => {
    let endDate = null;
    
    if (newStatus === "active" && durationMonths > 0) {
      const date = new Date();
      date.setMonth(date.getMonth() + durationMonths);
      endDate = date.toISOString();
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        subscription_status: newStatus,
        subscription_plan: newPlan,
        subscription_end_date: endDate
      })
      .eq("user_id", userId);

    if (error) {
      alert("Error updating user: " + error.message);
    } else {
      fetchUsers(); // refresh the list
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-ink uppercase mb-2">Subscription Management</h1>
        <p className="text-sm text-ink/70">Manage client billing, activate plans, and monitor access.</p>
      </div>

      <div className="bg-white border border-divider overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-divider bg-paper text-[10px] uppercase tracking-widest text-ink/50">
                <th className="p-4 font-bold">User / Email</th>
                <th className="p-4 font-bold">Current Plan</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold">Expiry Date</th>
                <th className="p-4 font-bold text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-sm font-mono text-ink/50">Loading users...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-sm font-mono text-ink/50">No users found.</td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.user_id} className="border-b border-divider hover:bg-paper/50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-sm text-ink">{user.full_name || "Unknown Name"}</div>
                      {/* Because email isn't in profiles by default, we just show user ID or full name. 
                          Ideally, email is synced to profiles via trigger, but we use what we have. */}
                      <div className="text-[10px] font-mono text-ink/50 mt-1">{user.user_id}</div>
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-bold uppercase tracking-widest text-ink">
                        {user.subscription_plan || "None"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest border ${
                        user.subscription_status === 'active' ? 'bg-moss/10 text-moss border-moss/20' :
                        user.subscription_status === 'pending_payment' ? 'bg-ochre/10 text-ochre border-ochre/20' :
                        'bg-ink/5 text-ink/50 border-ink/10'
                      }`}>
                        {user.subscription_status || "Inactive"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-xs font-mono text-ink/70">
                        {user.subscription_end_date ? new Date(user.subscription_end_date).toLocaleDateString() : "—"}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        {user.subscription_status !== 'active' && (
                           <>
                             <button 
                               onClick={() => handleUpdateStatus(user.user_id, "active", user.subscription_plan || "monthly", 1)}
                               className="px-3 py-1 bg-ink text-paper text-[10px] font-bold uppercase tracking-widest hover:bg-ink/80 transition-colors"
                             >
                               Activate (1M)
                             </button>
                             <button 
                               onClick={() => handleUpdateStatus(user.user_id, "active", "yearly", 12)}
                               className="px-3 py-1 bg-ochre text-white text-[10px] font-bold uppercase tracking-widest hover:bg-ochre/80 transition-colors"
                             >
                               Activate (1Y)
                             </button>
                           </>
                        )}
                        {user.subscription_status === 'active' && (
                           <button 
                             onClick={() => handleUpdateStatus(user.user_id, "inactive", null, 0)}
                             className="px-3 py-1 border border-ink text-ink text-[10px] font-bold uppercase tracking-widest hover:bg-ink hover:text-paper transition-colors"
                           >
                             Revoke
                           </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
