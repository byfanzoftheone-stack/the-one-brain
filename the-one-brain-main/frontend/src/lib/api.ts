type AnyObj = Record<string, any>;

export function api(base: string){
  const u = (p: string) => base.replace(/\/$/, '') + p;

  async function post(path: string, body: AnyObj){
    const res = await fetch(u(path), {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(body),
    });
    if(!res.ok) throw new Error(await res.text());
    return await res.json();
  }

  return {
    createUser: (display_name: string) => post('/api/user/create', {display_name}),
    createCompanion: (user_id: number, name: string, stage: string) => post('/api/companion/create', {user_id, name, stage}),
    chat: (user_id: number, companion_id: number, user_text: string, audience_mode: string) =>
      post('/api/chat/reply', {user_id, companion_id, user_text, audience_mode}),
  };
}
