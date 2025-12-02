/**
 * Clippy Web Worker - Runs LLM inference off the main thread
 */

let pipeline = null;

self.onmessage = async function(e) {
  const { type, data } = e.data;

  if (type === 'load') {
    try {
      self.postMessage({ type: 'progress', progress: 5, status: 'Loading Transformers.js...' });

      const { pipeline: createPipeline } = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.0');

      self.postMessage({ type: 'progress', progress: 15, status: 'Initializing pipeline...' });

      // Try WebGPU first, fall back to WASM
      let device = 'webgpu';
      try {
        if (!navigator.gpu) throw new Error('WebGPU not available');
        await navigator.gpu.requestAdapter();
      } catch (e) {
        console.log('[Worker] WebGPU not available, using WASM');
        device = 'wasm';
      }

      self.postMessage({ type: 'progress', progress: 10, status: 'Using ' + device.toUpperCase() + '...' });

      pipeline = await createPipeline(
        'text-generation',
        data.modelId,
        {
          dtype: 'q4',
          device: device,
          progress_callback: function(progress) {
            if (progress.status === 'downloading' || progress.status === 'progress') {
              const pct = Math.round(15 + (progress.progress || 0) * 0.8);
              self.postMessage({ type: 'progress', progress: pct, status: 'Downloading model: ' + Math.round(progress.progress || 0) + '%' });
            } else if (progress.status === 'loading') {
              self.postMessage({ type: 'progress', progress: 95, status: 'Loading into memory...' });
            }
          }
        }
      );

      self.postMessage({ type: 'progress', progress: 100, status: 'Ready!' });
      self.postMessage({ type: 'loaded' });
    } catch (error) {
      self.postMessage({ type: 'error', error: error.message });
    }
  }

  if (type === 'generate') {
    if (!pipeline) {
      self.postMessage({ type: 'error', error: 'Model not loaded' });
      return;
    }

    try {
      const messages = data.messages;
      console.log('[Worker] Starting generation with messages:', messages.length);

      // Create a custom streamer to get tokens as they're generated
      const { TextStreamer } = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.0');

      let streamedText = '';
      const streamer = new TextStreamer(pipeline.tokenizer, {
        skip_prompt: true,
        skip_special_tokens: true,
        callback_function: (text) => {
          streamedText += text;
          console.log('[Worker] Streamed token:', text);
          self.postMessage({ type: 'token', text: streamedText });
        }
      });

      const output = await pipeline(messages, {
        max_new_tokens: 512,
        temperature: 0.7,
        top_p: 0.9,
        do_sample: true,
        streamer: streamer
      });

      console.log('[Worker] Generation complete, output:', output);

      // Extract final response
      const generatedMessages = output[0].generated_text;
      const lastMessage = generatedMessages[generatedMessages.length - 1];
      const response = lastMessage.content || '';

      console.log('[Worker] Final response:', response);
      self.postMessage({ type: 'done', response: response });
    } catch (error) {
      console.error('[Worker] Generation error:', error);
      self.postMessage({ type: 'error', error: error.message });
    }
  }
};
