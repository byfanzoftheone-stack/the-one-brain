// VoiceEngine client: uses Web Speech API (no server dependency)
export function speak(text: string, rate = 1.0, pitch = 1.0){
  try{
    const synth = window.speechSynthesis;
    if(!synth) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = Math.max(0.6, Math.min(1.4, rate));
    u.pitch = Math.max(0.6, Math.min(1.4, pitch));
    synth.speak(u);
  }catch{
    // ignore
  }
}
