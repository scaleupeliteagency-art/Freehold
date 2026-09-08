"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function AdminPromosPage() {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState(20);
  const [expiresAt, setExpiresAt] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchPromos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("promo_codes")
      .select("*")
      .order("created_at", { ascending: false });
      
    if (!error && data) {
      setPromos(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!code || !discount) return;
    setCreating(true);

    const { error } = await supabase
      .from("promo_codes")
      .insert({
        code: code.trim().toUpperCase(),
        discount_percentage: Number(discount),
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
        is_active: true
      });

    if (error) {
      alert("Error creating promo code: " + error.message);
    } else {
      setCode("");
      setDiscount(20);
      setExpiresAt("");
      fetchPromos();
    }
    setCreating(false);
  };

  const handleToggleStatus = async (id, currentStatus) => {
    await supabase
      .from("promo_codes")
      .update({ is_active: !currentStatus })
      .eq("id", id);
    fetchPromos();
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this promo code?")) {
      await supabase
        .from("promo_codes")
        .delete()
        .eq("id", id);
      fetchPromos();
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-serif font-bold text-ink uppercase mb-2">Promo Codes</h1>
          <p className="text-sm text-ink/70">Create and manage discounts for your clients.</p>
        </div>
      </div>

      {/* Create Form */}
      <div className="bg-paper border border-divider p-6 mb-12">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-ink/50 mb-4">Create New Code</h2>
        <form onSubmit={handleCreate} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-ink/70 mb-2">Code</label>
            <input 
              type="text" 
              required
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. LAUNCH20"
              className="w-full bg-white border border-divider text-ink font-mono text-sm py-2 px-3 focus:outline-none focus:border-ink uppercase"
            />
          </div>
          <div className="w-full md:w-32">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-ink/70 mb-2">% Off</label>
            <input 
              type="number" 
              required
              min="1" max="100"
              value={discount}
              onChange={e => setDiscount(e.target.value)}
              className="w-full bg-white border border-divider text-ink font-mono text-sm py-2 px-3 focus:outline-none focus:border-ink"
            />
          </div>
          <div className="flex-1">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-ink/70 mb-2">Expires At (Optional)</label>
            <input 
              type="date" 
              value={expiresAt}
              onChange={e => setExpiresAt(e.target.value)}
              className="w-full bg-white border border-divider text-ink font-mono text-sm py-2 px-3 focus:outline-none focus:border-ink"
            />
          </div>
          <button 
            type="submit"
            disabled={creating}
            className="bg-ink text-paper px-6 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-ink/80 transition-colors disabled:opacity-50 h-[38px]"
          >
            {creating ? "Creating..." : "Create"}
          </button>
        </form>
      </div>

      {/* List */}
      <div className="bg-white border border-divider overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-divider bg-paper text-[10px] uppercase tracking-widest text-ink/50">
              <th className="p-4 font-bold">Code</th>
              <th className="p-4 font-bold">Discount</th>
              <th className="p-4 font-bold">Expiration</th>
              <th className="p-4 font-bold">Status</th>
              <th className="p-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-sm font-mono text-ink/50">Loading codes...</td>
              </tr>
            ) : promos.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-sm font-mono text-ink/50">No promo codes active.</td>
              </tr>
            ) : (
              promos.map(promo => {
                const isExpired = promo.expires_at && new Date(promo.expires_at) < new Date();
                return (
                  <tr key={promo.id} className="border-b border-divider hover:bg-paper/50 transition-colors">
                    <td className="p-4 font-mono font-bold text-ink">{promo.code}</td>
                    <td className="p-4 font-serif font-bold text-lg text-ink">{promo.discount_percentage}% OFF</td>
                    <td className="p-4 text-xs font-mono text-ink/70">
                      {promo.expires_at ? new Date(promo.expires_at).toLocaleDateString() : "Never"}
                      {isExpired && <span className="ml-2 text-red-500 uppercase tracking-widest text-[9px]">Expired</span>}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest border ${
                        promo.is_active && !isExpired ? 'bg-moss/10 text-moss border-moss/20' : 'bg-ink/5 text-ink/50 border-ink/10'
                      }`}>
                        {promo.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleToggleStatus(promo.id, promo.is_active)}
                          className="px-3 py-1 border border-ink text-ink text-[10px] font-bold uppercase tracking-widest hover:bg-ink hover:text-paper transition-colors"
                        >
                          {promo.is_active ? 'Disable' : 'Enable'}
                        </button>
                        <button 
                          onClick={() => handleDelete(promo.id)}
                          className="px-3 py-1 text-red-600 hover:bg-red-50 text-[10px] font-bold uppercase tracking-widest transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
