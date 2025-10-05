// Web Search Adapter - Live Implementation
// Provides web search functionality using external search APIs

export interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
  displayUrl: string;
  datePublished?: string;
  score?: number;
}

export interface WebSearchResponse {
  query: string;
  results: WebSearchResult[];
  totalResults: number;
  timeTaken: number;
  source: string;
}

export class WebSearchAdapter {
  private timeout: number;
  private retries: number;
  private backoffMs: number;

  constructor(config = { timeout: 12000, retries: 2, backoffMs: 500 }) {
    this.timeout = config.timeout;
    this.retries = config.retries;
    this.backoffMs = config.backoffMs;
  }

  async execute(input: { query: string; maxResults?: number; language?: string }): Promise<WebSearchResponse> {
    const { query, maxResults = 10, language = 'es' } = input;
    
    if (!query || query.trim().length === 0) {
      throw new Error('Search query is required');
    }

    const startTime = Date.now();
    
    try {
      // Try Google Custom Search API first
      const results = await this.searchWithRetry(async () => {
        return await this.googleCustomSearch(query, maxResults, language);
      });

      return {
        query,
        results,
        totalResults: results.length,
        timeTaken: Date.now() - startTime,
        source: 'Google Custom Search'
      };

    } catch (error) {
      console.error('Primary web search failed, trying fallback:', error);
      
      try {
        // Fallback to Bing Search API
        const results = await this.searchWithRetry(async () => {
          return await this.bingSearch(query, maxResults, language);
        });

        return {
          query,
          results,
          totalResults: results.length,
          timeTaken: Date.now() - startTime,
          source: 'Bing Search'
        };

      } catch (fallbackError) {
        console.error('Fallback web search also failed:', fallbackError);
        
        // Last resort: return structured error response
        return {
          query,
          results: [{
            title: 'Search Service Unavailable',
            url: '#',
            snippet: `Unable to perform web search for "${query}". Both primary and fallback search services are currently unavailable.`,
            displayUrl: 'Search Error'
          }],
          totalResults: 0,
          timeTaken: Date.now() - startTime,
          source: 'Error Response'
        };
      }
    }
  }

  private async searchWithRetry<T>(searchFn: () => Promise<T>): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        
        try {
          const result = await searchFn();
          clearTimeout(timeoutId);
          return result;
        } finally {
          clearTimeout(timeoutId);
        }
      } catch (error) {
        lastError = error as Error;
        console.warn(`Web search attempt ${attempt + 1} failed:`, error);
        
        if (attempt < this.retries) {
          const delay = this.backoffMs * Math.pow(2, attempt);
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError || new Error('Web search failed after all retry attempts');
  }

  private async googleCustomSearch(query: string, maxResults: number, language: string): Promise<WebSearchResult[]> {
    const apiKey = Deno.env.get('GOOGLE_API_KEY');
    const searchEngineId = Deno.env.get('GOOGLE_SEARCH_ENGINE_ID');
    
    if (!apiKey || !searchEngineId) {
      throw new Error('Google Custom Search API not configured');
    }

    const url = new URL('https://www.googleapis.com/customsearch/v1');
    url.searchParams.set('key', apiKey);
    url.searchParams.set('cx', searchEngineId);
    url.searchParams.set('q', query);
    url.searchParams.set('num', Math.min(maxResults, 10).toString());
    url.searchParams.set('hl', language);
    url.searchParams.set('safe', 'active');

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google Search API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.items) {
      return [];
    }

    return data.items.map((item: any) => ({
      title: item.title || 'No title',
      url: item.link || '#',
      snippet: item.snippet || 'No description available',
      displayUrl: item.displayLink || new URL(item.link || '#').hostname,
      datePublished: item.pagemap?.metatags?.[0]?.['article:published_time'],
      score: 1.0
    }));
  }

  private async bingSearch(query: string, maxResults: number, language: string): Promise<WebSearchResult[]> {
    const apiKey = Deno.env.get('BING_SEARCH_API_KEY');
    
    if (!apiKey) {
      throw new Error('Bing Search API not configured');
    }

    const url = 'https://api.bing.microsoft.com/v7.0/search';
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Ocp-Apim-Subscription-Key': apiKey,
        'Accept': 'application/json'
      },
      body: new URLSearchParams({
        q: query,
        count: Math.min(maxResults, 50).toString(),
        mkt: language === 'es' ? 'es-ES' : 'en-US',
        safeSearch: 'Moderate',
        textFormat: 'HTML'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Bing Search API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.webPages?.value) {
      return [];
    }

    return data.webPages.value.map((item: any) => ({
      title: item.name || 'No title',
      url: item.url || '#',
      snippet: item.snippet || 'No description available',
      displayUrl: item.displayUrl || new URL(item.url || '#').hostname,
      datePublished: item.dateLastCrawled,
      score: 1.0
    }));
  }

  // For internal corporate search (if available)
  private async corporateSearch(query: string, maxResults: number): Promise<WebSearchResult[]> {
    const corporateSearchUrl = Deno.env.get('CORPORATE_SEARCH_URL');
    const corporateApiKey = Deno.env.get('CORPORATE_SEARCH_API_KEY');
    
    if (!corporateSearchUrl || !corporateApiKey) {
      throw new Error('Corporate search not configured');
    }

    const response = await fetch(corporateSearchUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${corporateApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query,
        maxResults,
        includeInternal: true,
        includePublic: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Corporate search error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    return (data.results || []).map((item: any) => ({
      title: item.title || 'No title',
      url: item.url || '#',
      snippet: item.summary || item.content?.substring(0, 200) || 'No description available',
      displayUrl: 'Corporate Network',
      datePublished: item.lastModified,
      score: item.relevanceScore || 1.0
    }));
  }
}