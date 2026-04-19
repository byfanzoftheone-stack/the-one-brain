export async function composeAvatar(apiBase: string, stage: string, img1: File, img2: File, img3: File){
  const url = apiBase.replace(/\/$/, '') + '/api/avatar/compose';
  const fd = new FormData();
  fd.append('stage', stage);
  fd.append('img1', img1);
  fd.append('img2', img2);
  fd.append('img3', img3);
  const res = await fetch(url, { method: 'POST', body: fd });
  if(!res.ok) throw new Error(await res.text());
  return await res.blob();
}
