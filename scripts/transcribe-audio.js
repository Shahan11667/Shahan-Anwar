const fs = require('fs');
const path = require('path');
const { OggOpusDecoder } = require('ogg-opus-decoder');
const wav = require('node-wav');

function resampleTo16k(channelData, origRate) {
  if (origRate === 16000) return channelData;
  const targetRate = 16000;
  const targetLength = Math.round((channelData.length * targetRate) / origRate);
  const resampled = new Float32Array(targetLength);
  for (let i = 0; i < targetLength; i++) {
    const origIdx = Math.floor((i * origRate) / targetRate);
    resampled[i] = channelData[origIdx] || 0;
  }
  return resampled;
}

async function main() {
  const filePath = process.argv[2];
  const requestedLang = process.argv[3] || 'auto';

  if (!filePath || !fs.existsSync(filePath)) {
    console.error(JSON.stringify({ success: false, error: 'File not found' }));
    process.exit(1);
  }

  const buffer = fs.readFileSync(filePath);
  let audioSamples = null;

  const magic = buffer.slice(0, 4).toString('ascii');

  if (magic === 'OggS') {
    // WhatsApp voice note / Ogg Opus
    const decoder = new OggOpusDecoder();
    await decoder.ready;
    const decoded = await decoder.decodeFile(buffer);
    if (decoded.channelData && decoded.channelData.length > 0) {
      audioSamples = resampleTo16k(decoded.channelData[0], decoded.sampleRate);
    }
  } else if (magic === 'RIFF') {
    // WAV format
    const decoded = wav.decode(buffer);
    if (decoded.channelData && decoded.channelData.length > 0) {
      audioSamples = resampleTo16k(decoded.channelData[0], decoded.sampleRate);
    }
  } else {
    // Try Ogg Opus decode fallback
    try {
      const decoder = new OggOpusDecoder();
      await decoder.ready;
      const decoded = await decoder.decodeFile(buffer);
      if (decoded.channelData && decoded.channelData.length > 0) {
        audioSamples = resampleTo16k(decoded.channelData[0], decoded.sampleRate);
      }
    } catch (e) {
      // not ogg
    }
  }

  if (!audioSamples || audioSamples.length === 0) {
    console.error(JSON.stringify({ success: false, error: 'Unsupported audio container. Please upload .ogg, .opus, or .wav' }));
    process.exit(1);
  }

  const { pipeline } = await import('@xenova/transformers');
  const transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny', {
    quantized: true,
  });

  let textResult = '';
  let languageUsed = requestedLang;

  if (requestedLang !== 'auto') {
    const result = await transcriber(audioSamples, {
      language: requestedLang,
      task: 'transcribe',
      chunk_length_s: 30,
    });
    textResult = (result && result.text) ? result.text.trim() : '';
  } else {
    // Try auto
    const result = await transcriber(audioSamples, {
      task: 'transcribe',
      chunk_length_s: 30,
    });
    textResult = (result && result.text) ? result.text.trim() : '';

    // If auto-detect returned empty string on short/noisy audio, try Urdu fallback, then English
    if (!textResult) {
      const urduResult = await transcriber(audioSamples, {
        language: 'urdu',
        task: 'transcribe',
        chunk_length_s: 30,
      });
      if (urduResult && urduResult.text && urduResult.text.trim()) {
        textResult = urduResult.text.trim();
        languageUsed = 'urdu';
      } else {
        const enResult = await transcriber(audioSamples, {
          language: 'english',
          task: 'transcribe',
          chunk_length_s: 30,
        });
        if (enResult && enResult.text && enResult.text.trim()) {
          textResult = enResult.text.trim();
          languageUsed = 'english';
        }
      }
    }
  }

  console.log(JSON.stringify({
    success: true,
    text: textResult,
    language: languageUsed,
    duration: (audioSamples.length / 16000).toFixed(1)
  }));
}

main().catch(err => {
  console.error(JSON.stringify({ success: false, error: err.message }));
  process.exit(1);
});
