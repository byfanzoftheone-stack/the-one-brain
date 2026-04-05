import { useState } from "react";
import { AuthUser, useAuth } from "@/hooks/use-auth";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ADMIN_CODE = "PLAYBETTER_ADMIN";

interface AuthGateProps {
  onAuth: () => void;
}

export function AuthGate({ onAuth }: AuthGateProps) {
  const { login } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [form, setForm] = useState({ email: "", username: "", name: "", password: "", skill: "Beginner", adminCode: "" });
  const [error, setError] = useState("");

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  function handleSubmit() {
    setError("");
    if (!form.email.trim() || !form.password.trim()) { setError("Email and password required"); return; }

    if (mode === "signup") {
      if (!form.name.trim() || !form.username.trim()) { setError("Name and username required"); return; }
    }

    // Store locally (no real server auth yet — swap for JWT when ready)
    const usersRaw = localStorage.getItem("pb_users") || "[]";
    const users: AuthUser[] = JSON.parse(usersRaw);

    if (mode === "login") {
      const found = users.find(u => u.email === form.email && (u as any).password === form.password);
      if (!found) { setError("Invalid email or password"); return; }
      login(found);
    } else {
      if (users.find(u => u.email === form.email)) { setError("Email already registered"); return; }
      const isAdmin = form.adminCode === ADMIN_CODE;
      const newUser: AuthUser & { password: string } = {
        uid: `pb_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        email: form.email.trim().toLowerCase(),
        username: form.username.trim(),
        name: form.name.trim(),
        skill: form.skill as AuthUser["skill"],
        role: isAdmin ? "admin" : "user",
        avatar: null,
        pingSound: null,
        password: form.password,
      };
      users.push(newUser);
      localStorage.setItem("pb_users", JSON.stringify(users));
      const { password, ...userWithoutPw } = newUser;
      login(userWithoutPw);
    }
    onAuth();
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <div className="font-space font-black text-5xl mb-2">
          <span className="text-white">Play</span>
          <span className="text-primary ml-3">Better</span>
        </div>
        <p className="text-gray-400 text-sm">Connect With Local Players</p>
        <p className="text-gray-600 text-xs mt-1 italic">Dedicated to Tricksack</p>
      </div>

      <GlassmorphicCard className="w-full max-w-sm">
        <div className="flex mb-6 rounded-lg overflow-hidden border border-white/10">
          {(["signup", "login"] as const).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`flex-1 py-2 text-sm font-medium transition-all ${mode === m ? "bg-primary text-white" : "text-gray-400 hover:text-white"}`}>
              {m === "signup" ? "Sign Up" : "Log In"}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {mode === "signup" && (
            <>
              <div>
                <Label className="text-gray-300 text-sm">Full Name</Label>
                <Input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Your name" className="mt-1 bg-white/5 border-white/10 text-white" />
              </div>
              <div>
                <Label className="text-gray-300 text-sm">Username / Alias</Label>
                <Input value={form.username} onChange={e => set("username", e.target.value)} placeholder="@alias" className="mt-1 bg-white/5 border-white/10 text-white" />
              </div>
            </>
          )}

          <div>
            <Label className="text-gray-300 text-sm">Email</Label>
            <Input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="you@email.com" className="mt-1 bg-white/5 border-white/10 text-white" />
          </div>

          <div>
            <Label className="text-gray-300 text-sm">Password</Label>
            <Input type="password" value={form.password} onChange={e => set("password", e.target.value)} placeholder="••••••••" className="mt-1 bg-white/5 border-white/10 text-white" />
          </div>

          {mode === "signup" && (
            <>
              <div>
                <Label className="text-gray-300 text-sm">Skill Level</Label>
                <Select value={form.skill} onValueChange={v => set("skill", v)}>
                  <SelectTrigger className="mt-1 bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-white/10">
                    {["Beginner", "Intermediate", "Advanced", "Pro"].map(s => (
                      <SelectItem key={s} value={s} className="text-white">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-gray-300 text-sm">Admin Code <span className="text-gray-500">(optional)</span></Label>
                <Input value={form.adminCode} onChange={e => set("adminCode", e.target.value)} placeholder="Leave blank for regular account" className="mt-1 bg-white/5 border-white/10 text-white" />
              </div>
            </>
          )}

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <Button onClick={handleSubmit} className="w-full bg-primary hover:bg-red-600 text-white font-semibold">
            {mode === "signup" ? "Create Account" : "Log In"}
          </Button>
        </div>
      </GlassmorphicCard>

      <p className="text-gray-600 text-xs mt-6 text-center">By FanzoftheOne</p>
    </div>
  );
}
