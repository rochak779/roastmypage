import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!firecrawlApiKey) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!lovableApiKey) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'AI not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format URL
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    console.log('Scraping URL:', formattedUrl);

    // Step 1: Scrape the website using Firecrawl
    const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: formattedUrl,
        formats: ['markdown', 'html'],
        onlyMainContent: false,
      }),
    });

    const scrapeData = await scrapeResponse.json();

    if (!scrapeResponse.ok || !scrapeData.success) {
      console.error('Firecrawl API error:', scrapeData);
      return new Response(
        JSON.stringify({ success: false, error: scrapeData.error || 'Failed to scrape page' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const pageContent = scrapeData.data?.markdown || '';
    const pageHtml = scrapeData.data?.html || '';
    const metadata = scrapeData.data?.metadata || {};

    console.log('Scraped page. Title:', metadata.title);
    console.log('Content length:', pageContent.length);

    // Step 2: Analyze with AI
    const systemPrompt = `You are a brutally honest landing page critic. Your job is to roast landing pages and give actionable feedback. Be direct, witty, and sometimes harsh - but always constructive. Focus on what's actually on the page.

Analyze the landing page and return a JSON response with this exact structure:
{
  "score": <number 0-100>,
  "roasts": [
    {
      "category": "<short category like 'Headline', 'CTA', 'Social Proof', 'Speed', 'Mobile', 'Clarity', 'Trust', 'Design', 'Copy'>",
      "title": "<punchy, specific title about what's wrong or right>",
      "description": "<2-3 sentences explaining the issue with specific examples from the page>",
      "severity": "<'critical' | 'warning' | 'good'>"
    }
  ]
}

Guidelines:
- Give 4-7 roasts total
- Be SPECIFIC - reference actual text, elements, or issues you see on the page
- Score harshly: 0-40 is bad, 41-70 is mediocre, 71-100 is good
- Include at least 2 critical issues if the page has obvious problems
- Include at least 1 good thing if you can find any
- Focus on: headline clarity, value proposition, CTAs, social proof, trust signals, copy quality, structure
- Be funny but not mean-spirited`;

    const userPrompt = `Analyze this landing page and roast it:

URL: ${formattedUrl}
Title: ${metadata.title || 'Unknown'}
Description: ${metadata.description || 'None'}

Page Content:
${pageContent.substring(0, 8000)}

${pageHtml.includes('<form') ? 'Note: Page has forms' : ''}
${pageHtml.includes('testimonial') || pageHtml.includes('review') ? 'Note: Page may have testimonials' : ''}
${pageHtml.includes('logo') ? 'Note: Page has logo references' : ''}`;

    console.log('Calling AI for analysis...');

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ success: false, error: 'AI credits exhausted. Please add credits.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      return new Response(
        JSON.stringify({ success: false, error: 'AI analysis failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content || '';

    console.log('AI response received, parsing...');

    // Parse the AI response
    let roastResult;
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        roastResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.log('Raw AI response:', aiContent);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to parse AI analysis' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate and sanitize the result
    const score = Math.max(0, Math.min(100, roastResult.score || 50));
    const roasts = (roastResult.roasts || []).map((r: any) => ({
      category: String(r.category || 'General').substring(0, 20),
      title: String(r.title || 'Issue found').substring(0, 100),
      description: String(r.description || 'No details provided').substring(0, 500),
      severity: ['critical', 'warning', 'good'].includes(r.severity) ? r.severity : 'warning',
    }));

    console.log('Roast complete! Score:', score, 'Issues found:', roasts.length);

    return new Response(
      JSON.stringify({
        success: true,
        score,
        roasts,
        metadata: {
          title: metadata.title,
          url: formattedUrl,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in roast-page function:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
