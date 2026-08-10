// Web Audio API chimes for ticket verification
export function playBeep(type) {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        
        if (type === 'success') {
            // High-pitched double chime for VALID ticket
            const osc1 = ctx.createOscillator();
            const gain1 = ctx.createGain();
            osc1.connect(gain1);
            gain1.connect(ctx.destination);
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(880, ctx.currentTime); // A5
            gain1.gain.setValueAtTime(0.3, ctx.currentTime);
            osc1.start();
            osc1.stop(ctx.currentTime + 0.12);

            setTimeout(() => {
                const osc2 = ctx.createOscillator();
                const gain2 = ctx.createGain();
                osc2.connect(gain2);
                gain2.connect(ctx.destination);
                osc2.type = 'sine';
                osc2.frequency.setValueAtTime(1174.66, ctx.currentTime); // D6
                gain2.gain.setValueAtTime(0.3, ctx.currentTime);
                osc2.start();
                osc2.stop(ctx.currentTime + 0.25);
            }, 120);
        } else if (type === 'error' || type === 'already_used') {
            // Sawtooth low warning alarm for ALREADY USED or INVALID
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(260, ctx.currentTime);
            osc.frequency.setValueAtTime(180, ctx.currentTime + 0.15);
            gain.gain.setValueAtTime(0.4, ctx.currentTime);
            osc.start();
            osc.stop(ctx.currentTime + 0.4);
        }
    } catch (e) {
        console.error("Audio feedback error:", e);
    }
}
