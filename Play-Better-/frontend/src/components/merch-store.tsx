import { useState, useEffect } from "react";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingBag, Plus, X } from "lucide-react";

interface MerchItem {
  id: string;
  name: string;
  price: string;
  img: string | null;
}

interface MerchStoreProps {
  isAdmin: boolean;
}

const API = import.meta.env.VITE_API_URL || "";

function readFile(file: File): Promise<string> {
  return new Promise(res => {
    const r = new FileReader();
    r.onload = e => res(e.target!.result as string);
    r.readAsDataURL(file);
  });
}

export function MerchStore({ isAdmin }: MerchStoreProps) {
  const [items, setItems] = useState<MerchItem[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", price: "" });
  const [img, setImg] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState("");

  useEffect(() => {
    fetch(`${API}/api/merch`).then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setItems(data);
      })
      .catch(() => {
        setItems([
          { id: "m1", name: "Play Better Tee", price: "28", img: null },
          { id: "m2", name: "PB Snapback", price: "34", img: null },
          { id: "m3", name: "Cue Bag", price: "55", img: null },
        ]);
      });
  }, []);

  async function addItem() {
    if (!form.name) return;
    const body = { name: form.name, price: form.price || "TBD", image: img };
    try {
      const res = await fetch(`${API}/api/merch`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const item = await res.json();
      setItems(prev => [item, ...prev]);
    } catch {
      setItems(prev => [{ id: "m" + Date.now(), name: form.name, price: form.price || "TBD", img }, ...prev]);
    }
    setForm({ name: "", price: "" }); setImg(null); setShowAdd(false);
  }

  async function savePrice(id: string) {
    try {
      await fetch(`${API}/api/merch/${id}/price`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ price: editPrice }) });
    } catch {}
    setItems(prev => prev.map(i => i.id === id ? { ...i, price: editPrice } : i));
    setEditingPrice(null);
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-space font-bold text-xl">Merch</h2>
            <p className="text-gray-400 text-sm">Play Better gear</p>
          </div>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowAdd(true)} size="sm" className="bg-primary hover:bg-red-600 text-white">
            <Plus className="w-4 h-4 mr-1" /> Upload
          </Button>
        )}
      </div>

      {/* Add modal */}
      {showAdd && isAdmin && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <GlassmorphicCard className="w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Upload Merch Item</h3>
              <button onClick={() => setShowAdd(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Item name" className="bg-white/5 border-white/10 text-white" />
              <Input value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="Price (e.g. 28)" className="bg-white/5 border-white/10 text-white" />
              <label className="block border-2 border-dashed border-white/20 rounded-xl p-4 text-center cursor-pointer hover:border-primary transition-colors">
                <p className="text-sm text-gray-400">{img ? "✓ Photo selected" : "Tap to upload photo"}</p>
                <input type="file" accept="image/*" className="hidden" onChange={async e => { if (e.target.files?.[0]) setImg(await readFile(e.target.files[0])); }} />
              </label>
              {img && <img src={img} className="w-full aspect-square object-cover rounded-lg" alt="preview" />}
              <div className="flex space-x-2">
                <Button onClick={() => setShowAdd(false)} variant="outline" className="flex-1 border-white/20 text-gray-400">Cancel</Button>
                <Button onClick={addItem} className="flex-1 bg-primary hover:bg-red-600 text-white">Add Item</Button>
              </div>
            </div>
          </GlassmorphicCard>
        </div>
      )}

      {/* Demo Stripe notice */}
      <div className="mb-4 px-4 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
        <p className="text-yellow-400 text-xs">⚡ Demo mode — add Stripe keys to go live</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {items.map(item => (
          <GlassmorphicCard key={item.id} className="p-0 overflow-hidden">
            <div className="aspect-square bg-white/5 flex items-center justify-center">
              {item.img ? <img src={item.img} className="w-full h-full object-cover" alt={item.name} /> : <ShoppingBag className="w-12 h-12 text-gray-600" />}
            </div>
            <div className="p-3">
              <p className="font-semibold text-sm mb-1">{item.name}</p>
              {isAdmin && editingPrice === item.id ? (
                <div className="flex space-x-1">
                  <Input value={editPrice} onChange={e => setEditPrice(e.target.value)} className="bg-white/5 border-white/10 text-white h-7 text-xs px-2" />
                  <Button onClick={() => savePrice(item.id)} size="sm" className="bg-primary text-white h-7 text-xs px-2">✓</Button>
                </div>
              ) : (
                <p
                  className={`text-primary font-bold ${isAdmin ? "cursor-pointer hover:text-red-400" : ""}`}
                  onClick={() => isAdmin && (setEditingPrice(item.id), setEditPrice(item.price))}
                >
                  {item.price.includes("$") ? item.price : `$${item.price}`}
                  {isAdmin && <span className="text-gray-500 text-xs ml-1">(edit)</span>}
                </p>
              )}
              <Button onClick={() => alert(`DEMO: Checkout for "${item.name}" — add Stripe keys to go live.`)}
                size="sm" className="w-full mt-2 bg-primary hover:bg-red-600 text-white text-xs">
                Order
              </Button>
            </div>
          </GlassmorphicCard>
        ))}
      </div>
    </section>
  );
}
