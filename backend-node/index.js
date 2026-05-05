import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import * as cheerio from 'cheerio';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 8000;

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

if (!supabase) {
    console.warn("Warning: Supabase credentials not found. DB insertion will be skipped.");
}

// Initialize Gemini
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
if (!genAI) {
    console.warn("Warning: Gemini API Key not found. AI Prompt generation will be skipped.");
}

/**
 * Scrapes a website and extracts its visible text content cleanly.
 */
async function scrapeWebsite(url) {
    if (!url) return "No URL provided.";
    
    // Ensure URL has protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }

    try {
        console.log(`Scraping website: ${url}`);
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
            timeout: 5000
        });
        
        const $ = cheerio.load(response.data);
        
        // Remove scripts, styles, noscript, etc.
        $('script, style, noscript, iframe, img, svg').remove();
        
        let text = $('body').text();
        
        // Clean up whitespace
        text = text.replace(/\s+/g, ' ').trim();
        
        // Truncate to first 3000 characters to avoid massive context limits
        return text.substring(0, 3000);
    } catch (error) {
        console.error(`Error scraping website ${url}:`, error.message);
        return `Failed to extract website content: ${error.message}`;
    }
}

app.post('/api/save-agent-config', async (req, res) => {
    try {
        const payload = req.body;
        console.log("Received payload for configuration generation:", JSON.stringify(payload, null, 2));
        
        // 1. Scrape Website for extra context
        let extractedWebsiteSummary = "N/A";
        if (payload.website_url) {
            extractedWebsiteSummary = await scrapeWebsite(payload.website_url);
        }

        // 2. Save to Supabase (if configured)
        /*
        if (supabase) {
            const dbPayload = { ...payload };
            // Ensure no extra fields cause errors
            const { error } = await supabase.from('agent_configs_v2').insert([dbPayload]);
            if (error) {
                console.error("Supabase insert error:", error);
            }
        }
        */

        // 3. Generate Prompt using Google Gemini
        let generatedPrompt = null;
        if (genAI) {
            const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
            
            const prompt = `You are an expert AI calling agent designer.

Create a highly effective calling agent configuration.

Business Info:
- Name: ${payload.business_name || 'N/A'}
- Type: ${payload.business_type || 'N/A'}
- Size: ${payload.business_size || 'N/A'}
- Website: ${payload.website_url || 'N/A'}
- Target Audience: ${payload.target_audience || 'N/A'}

Agent Setup:
- Type: ${payload.agent_type || 'N/A'}
- Goal: ${payload.primary_goal || 'N/A'}

Communication:
- Tone: ${payload.tone || 'N/A'}
- Language: ${payload.language || 'N/A'}
- Style: ${payload.response_style || 'N/A'}

Rules:
- Conversation Rules: ${payload.conversation_rules || 'N/A'}
- Restricted Topics: ${payload.restricted_topics || 'N/A'}
- Escalation: ${payload.escalation_condition || 'N/A'}

Knowledge Base:
- Product Details: ${payload.product_details || 'N/A'}
- FAQs: ${payload.faqs || 'N/A'}

Website Insights (Extracted automatically from the provided URL):
- ${extractedWebsiteSummary}

Custom Instructions:
- ${payload.custom_instructions || 'N/A'}

Return the configuration strictly as a JSON object with no markdown formatting or extra text.

OUTPUT FORMAT (STRICT JSON):
{
  "agent_identity": "string",
  "agent_role": "string",
  "conversation_strategy": "string",
  "opening_script": "string",
  "key_questions": ["string"],
  "handling_objections": ["string"],
  "knowledge_usage": "string",
  "rules": ["string"],
  "fallback_response": "string",
  "closing_script": "string"
}`;

            try {
                const result = await model.generateContent({
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    generationConfig: {
                        responseMimeType: "application/json",
                    }
                });
                
                const aiResponseText = result.response.text();
                try {
                    generatedPrompt = JSON.parse(aiResponseText);
                } catch (parseError) {
                    console.error("Failed to parse Gemini output as JSON", parseError);
                    generatedPrompt = { raw_output: aiResponseText };
                }
            } catch (geminiError) {
                console.error("Gemini API Error:", geminiError);
                generatedPrompt = { error: "Gemini API failed: " + geminiError.message };
            }
        }

        console.log("Returning result to frontend:", JSON.stringify({
            status: "success",
            has_generated_prompt: !!generatedPrompt,
            prompt_error: generatedPrompt?.error || null
        }, null, 2));

        res.json({
            status: "success",
            message: "Configuration saved successfully.",
            extracted_website_summary_length: extractedWebsiteSummary.length,
            generated_prompt: generatedPrompt
        });

    } catch (error) {
        console.error("API Route Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Serve static frontend in production
app.use(express.static(path.join(__dirname, '../frontend-next/out')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend-next/out', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
