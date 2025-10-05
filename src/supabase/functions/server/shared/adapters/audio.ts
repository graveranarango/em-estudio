// Audio Transcription Adapter - Live Implementation
// Transcribes audio files using various ASR services

export interface TranscriptionSegment {
  start: number; // seconds
  end: number; // seconds
  text: string;
  confidence?: number;
  speaker?: string;
}

export interface TranscriptionResponse {
  text: string;
  segments: TranscriptionSegment[];
  language: string;
  confidence: number;
  duration: number; // seconds
  processingTime: number;
  source: string;
  wordCount: number;
}

export class AudioTranscriptionAdapter {
  private timeout: number;
  private retries: number;
  private backoffMs: number;

  constructor(config = { timeout: 30000, retries: 1, backoffMs: 1000 }) {
    this.timeout = config.timeout;
    this.retries = config.retries;
    this.backoffMs = config.backoffMs;
  }

  async execute(input: { 
    url?: string; 
    buffer?: ArrayBuffer; 
    language?: string;
    speakerDiarization?: boolean;
    format?: string;
  }): Promise<TranscriptionResponse> {
    const { 
      url, 
      buffer, 
      language = 'auto', 
      speakerDiarization = false,
      format = 'auto'
    } = input;
    
    const startTime = Date.now();

    if (!url && !buffer) {
      throw new Error('Either URL or buffer must be provided');
    }

    try {
      // Try transcription with retry logic
      const result = await this.transcribeWithRetry(async () => {
        if (buffer) {
          return await this.transcribeAudioBuffer(buffer, language, speakerDiarization, format);
        } else if (url) {
          return await this.transcribeAudioFromURL(url, language, speakerDiarization);
        }
        throw new Error('No valid input provided');
      });

      return {
        ...result,
        processingTime: Date.now() - startTime,
        wordCount: result.text.split(/\s+/).filter(word => word.length > 0).length
      };

    } catch (error) {
      console.error('Audio transcription failed:', error);
      
      // Return error response
      return {
        text: `Error transcribing audio: ${error.message}`,
        segments: [],
        language: 'unknown',
        confidence: 0,
        duration: 0,
        processingTime: Date.now() - startTime,
        source: 'Error Response',
        wordCount: 0
      };
    }
  }

  private async transcribeWithRetry<T>(transcribeFn: () => Promise<T>): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        
        try {
          const result = await transcribeFn();
          clearTimeout(timeoutId);
          return result;
        } finally {
          clearTimeout(timeoutId);
        }
      } catch (error) {
        lastError = error as Error;
        console.warn(`Transcription attempt ${attempt + 1} failed:`, error);
        
        if (attempt < this.retries) {
          const delay = this.backoffMs * Math.pow(2, attempt);
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError || new Error('Audio transcription failed after all retry attempts');
  }

  private async transcribeAudioFromURL(url: string, language: string, speakerDiarization: boolean): Promise<Omit<TranscriptionResponse, 'processingTime' | 'wordCount'>> {
    console.log('Fetching audio from URL:', url);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch audio: ${response.status} ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'audio/mpeg';
    const format = this.getFormatFromContentType(contentType);
    
    return await this.transcribeAudioBuffer(buffer, language, speakerDiarization, format);
  }

  private async transcribeAudioBuffer(
    buffer: ArrayBuffer, 
    language: string, 
    speakerDiarization: boolean, 
    format: string
  ): Promise<Omit<TranscriptionResponse, 'processingTime' | 'wordCount'>> {
    console.log('Transcribing audio buffer, size:', buffer.byteLength, 'format:', format);

    try {
      // Try OpenAI Whisper first
      return await this.transcribeWithWhisper(buffer, language, format);
    } catch (error) {
      console.warn('Whisper transcription failed, trying Google Speech-to-Text:', error);
      
      try {
        // Fallback to Google Speech-to-Text
        return await this.transcribeWithGoogle(buffer, language, speakerDiarization, format);
      } catch (fallbackError) {
        console.warn('Google STT failed, trying Deepgram:', fallbackError);
        
        try {
          // Second fallback to Deepgram
          return await this.transcribeWithDeepgram(buffer, language, speakerDiarization, format);
        } catch (deepgramError) {
          console.error('All transcription services failed:', deepgramError);
          throw new Error('All transcription services are currently unavailable');
        }
      }
    }
  }

  private async transcribeWithWhisper(
    buffer: ArrayBuffer, 
    language: string, 
    format: string
  ): Promise<Omit<TranscriptionResponse, 'processingTime' | 'wordCount'>> {
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Convert buffer to file
    const audioBlob = new Blob([buffer], { type: this.getMimeType(format) });
    const formData = new FormData();
    formData.append('file', audioBlob, `audio.${format}`);
    formData.append('model', 'whisper-1');
    
    if (language !== 'auto') {
      formData.append('language', language);
    }
    
    // Request with timestamps
    formData.append('response_format', 'verbose_json');
    formData.append('timestamp_granularities[]', 'segment');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Whisper API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    
    // Process segments
    const segments: TranscriptionSegment[] = (result.segments || []).map((seg: any) => ({
      start: seg.start,
      end: seg.end,
      text: seg.text.trim(),
      confidence: seg.avg_logprob ? Math.exp(seg.avg_logprob) : undefined
    }));

    return {
      text: result.text,
      segments,
      language: result.language || language,
      confidence: segments.length > 0 
        ? segments.reduce((sum, seg) => sum + (seg.confidence || 0), 0) / segments.length
        : 0.9, // Default confidence for Whisper
      duration: result.duration || (segments.length > 0 ? segments[segments.length - 1].end : 0),
      source: 'OpenAI Whisper'
    };
  }

  private async transcribeWithGoogle(
    buffer: ArrayBuffer, 
    language: string, 
    speakerDiarization: boolean, 
    format: string
  ): Promise<Omit<TranscriptionResponse, 'processingTime' | 'wordCount'>> {
    const googleApiKey = Deno.env.get('GOOGLE_API_KEY');
    
    if (!googleApiKey) {
      throw new Error('Google API key not configured');
    }

    // Convert audio to base64 for Google API
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(buffer)));
    
    const requestBody = {
      config: {
        encoding: this.getGoogleEncoding(format),
        sampleRateHertz: 16000, // Default, might need adjustment
        languageCode: language === 'auto' ? 'es-ES' : this.getGoogleLanguageCode(language),
        enableWordTimeOffsets: true,
        enableSpeakerDiarization: speakerDiarization,
        diarizationSpeakerCount: speakerDiarization ? 2 : undefined
      },
      audio: {
        content: base64Audio
      }
    };

    const response = await fetch(
      `https://speech.googleapis.com/v1/speech:recognize?key=${googleApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google Speech-to-Text error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    
    if (!result.results || result.results.length === 0) {
      throw new Error('No transcription results from Google Speech-to-Text');
    }

    // Process results
    let fullText = '';
    const segments: TranscriptionSegment[] = [];
    let totalConfidence = 0;
    let maxEndTime = 0;

    for (const resultItem of result.results) {
      const alternative = resultItem.alternatives[0];
      if (!alternative) continue;

      fullText += alternative.transcript + ' ';
      totalConfidence += alternative.confidence || 0;

      // Extract word-level timing if available
      if (alternative.words) {
        let segmentText = '';
        let segmentStart = 0;
        let segmentEnd = 0;
        let wordCount = 0;

        for (const word of alternative.words) {
          if (wordCount === 0) {
            segmentStart = parseFloat(word.startTime?.replace('s', '') || '0');
          }
          segmentEnd = parseFloat(word.endTime?.replace('s', '') || '0');
          segmentText += word.word + ' ';
          wordCount++;

          // Create segment every 10 words or at end
          if (wordCount >= 10 || word === alternative.words[alternative.words.length - 1]) {
            segments.push({
              start: segmentStart,
              end: segmentEnd,
              text: segmentText.trim(),
              confidence: alternative.confidence,
              speaker: word.speakerTag ? `Speaker ${word.speakerTag}` : undefined
            });

            maxEndTime = Math.max(maxEndTime, segmentEnd);
            segmentText = '';
            wordCount = 0;
          }
        }
      } else {
        // No word-level timing, create single segment
        segments.push({
          start: 0,
          end: 0,
          text: alternative.transcript,
          confidence: alternative.confidence
        });
      }
    }

    return {
      text: fullText.trim(),
      segments,
      language: result.results[0]?.languageCode || language,
      confidence: result.results.length > 0 ? totalConfidence / result.results.length : 0,
      duration: maxEndTime,
      source: 'Google Speech-to-Text'
    };
  }

  private async transcribeWithDeepgram(
    buffer: ArrayBuffer, 
    language: string, 
    speakerDiarization: boolean, 
    format: string
  ): Promise<Omit<TranscriptionResponse, 'processingTime' | 'wordCount'>> {
    const deepgramApiKey = Deno.env.get('DEEPGRAM_API_KEY');
    
    if (!deepgramApiKey) {
      throw new Error('Deepgram API key not configured');
    }

    const url = new URL('https://api.deepgram.com/v1/listen');
    url.searchParams.set('model', 'nova-2');
    url.searchParams.set('language', language === 'auto' ? 'es' : language);
    url.searchParams.set('punctuate', 'true');
    url.searchParams.set('timestamps', 'true');
    
    if (speakerDiarization) {
      url.searchParams.set('diarize', 'true');
    }

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Authorization': `Token ${deepgramApiKey}`,
        'Content-Type': this.getMimeType(format)
      },
      body: buffer
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Deepgram API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    
    if (!result.results?.channels?.[0]?.alternatives?.[0]) {
      throw new Error('No transcription results from Deepgram');
    }

    const alternative = result.results.channels[0].alternatives[0];
    const segments: TranscriptionSegment[] = [];

    // Process words into segments
    if (alternative.words) {
      let currentSegment = '';
      let segmentStart = 0;
      let wordCount = 0;

      for (const word of alternative.words) {
        if (wordCount === 0) {
          segmentStart = word.start;
        }

        currentSegment += word.punctuated_word + ' ';
        wordCount++;

        // Create segment every 15 words or at sentence boundaries
        if (wordCount >= 15 || word.punctuated_word.match(/[.!?]$/)) {
          segments.push({
            start: segmentStart,
            end: word.end,
            text: currentSegment.trim(),
            confidence: word.confidence,
            speaker: word.speaker !== undefined ? `Speaker ${word.speaker}` : undefined
          });

          currentSegment = '';
          wordCount = 0;
        }
      }

      // Add remaining text as final segment
      if (currentSegment.trim()) {
        const lastWord = alternative.words[alternative.words.length - 1];
        segments.push({
          start: segmentStart,
          end: lastWord.end,
          text: currentSegment.trim(),
          confidence: lastWord.confidence,
          speaker: lastWord.speaker !== undefined ? `Speaker ${lastWord.speaker}` : undefined
        });
      }
    }

    const duration = result.metadata?.duration || 0;

    return {
      text: alternative.transcript,
      segments,
      language: result.metadata?.detected_language || language,
      confidence: alternative.confidence || 0.8,
      duration,
      source: 'Deepgram Nova-2'
    };
  }

  private getFormatFromContentType(contentType: string): string {
    if (contentType.includes('mp3')) return 'mp3';
    if (contentType.includes('wav')) return 'wav';
    if (contentType.includes('m4a')) return 'm4a';
    if (contentType.includes('flac')) return 'flac';
    if (contentType.includes('ogg')) return 'ogg';
    return 'mp3'; // default
  }

  private getMimeType(format: string): string {
    const mimeTypes: Record<string, string> = {
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav',
      'm4a': 'audio/m4a',
      'flac': 'audio/flac',
      'ogg': 'audio/ogg'
    };
    return mimeTypes[format] || 'audio/mpeg';
  }

  private getGoogleEncoding(format: string): string {
    const encodings: Record<string, string> = {
      'mp3': 'MP3',
      'wav': 'LINEAR16',
      'flac': 'FLAC',
      'ogg': 'OGG_OPUS'
    };
    return encodings[format] || 'LINEAR16';
  }

  private getGoogleLanguageCode(language: string): string {
    const codes: Record<string, string> = {
      'es': 'es-ES',
      'en': 'en-US',
      'fr': 'fr-FR',
      'de': 'de-DE',
      'it': 'it-IT',
      'pt': 'pt-BR'
    };
    return codes[language] || 'es-ES';
  }
}