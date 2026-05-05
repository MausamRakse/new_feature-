import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
    try {
        // Wait, @google/generative-ai doesn't natively expose listModels in 0.x sometimes? Let's check fetch
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const data = await response.json();
        console.log("Available models:");
        if (data.models) {
            data.models.forEach(m => console.log(m.name, m.supportedGenerationMethods));
        } else {
            console.log(data);
        }
    } catch (e) {
        console.error(e);
    }
}

listModels();
