// Put our Hindi voice/music mix onto a video made by ANY engine.
//   node mux.mjs <engine-video.mp4> [out.mp4] [audio.wav]
// Scales/pads the picture to 1080x1920 30fps if needed, trims or holds the last frame to match the audio length,
// encodes H.264 yuv420p + AAC with faststart.
import fs from 'fs';
import { execSync } from 'child_process';

const [vid, out = 'reel_final.mp4', aud = 'build/audio.wav'] = process.argv.slice(2);
if (!vid || !fs.existsSync(vid)) throw new Error('usage: node mux.mjs <video.mp4> [out.mp4] [audio.wav]');
const aDur = parseFloat(execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${aud}"`).toString());
const vDur = parseFloat(execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${vid}"`).toString());
console.log(`video ${vDur.toFixed(2)}s, audio ${aDur.toFixed(2)}s`);
if (Math.abs(vDur - aDur) > 1) console.log('WARNING: durations differ by >1s; the engine probably did not follow build/cues.json');
const vf = 'scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=0xF1F1F4,fps=30,tpad=stop_mode=clone:stop_duration=3';
execSync(`ffmpeg -y -loglevel error -i "${vid}" -i "${aud}" -vf "${vf}" -map 0:v -map 1:a -t ${aDur.toFixed(3)} -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart "${out}"`);
console.log('wrote', out);
