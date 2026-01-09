import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

let genAI: GoogleGenerativeAI | null = null;

function getGenAI() {
    if (!genAI) {
        if (!process.env.GEMINI_API_KEY) {
            console.warn('GEMINI_API_KEY is missing. AI features will be disabled.');
            return null;
        }
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
    return genAI;
}

export function getModel(): GenerativeModel {
    const ai = getGenAI();
    if (!ai) {
        throw new Error('GEMINI_API_KEY is not configured');
    }
    return ai.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
}

