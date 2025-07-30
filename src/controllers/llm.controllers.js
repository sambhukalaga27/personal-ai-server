import { asyncHandler } from '../utils/asyncHandler.js';
import { ErrorResponse } from '../utils/ErrorResponse.js';
import { SuccessResponse } from '../utils/SuccessResponse.js';
import { Data } from '../models/data.models.js';
import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY });

export const generateAIResponse = asyncHandler(async (req, res, next) => {
  console.info('generateAIResponse: Started.');

  const { userInput } = req?.body || {};

  if (!userInput) {
    throw new ErrorResponse(400, 'User input is required.');
  }

  try {
    const data = await Data.findOne({ userName: req?.user?.userName });
    let prompt = 'Your Role:\n';
    prompt += data?.initialPrompt || 'You are a helpful AI assistant.';
    prompt += '\n----------------------------';
    prompt += '\n\nUser Data:';
    prompt += `\nUser Name: ${req?.user?.userName}`;
    prompt += `\nUser Email: ${req?.user?.email}`;

    if (data?.txtData) {
      console.info('generateAIResponse: Contains txtData.');
      prompt += '\n----------------------------';
      prompt += '\n\nContext Data:\n';
      prompt += data?.txtData;
    }

    prompt += '\n----------------------------';
    prompt += '\n\nTry not to add any special symbols in the response.';

    prompt += '\n----------------------------';
    prompt += `\n\nUser Input: ${userInput}`;

    const response = await ai.models.generateContent({
      model: process.env.GOOGLE_GENAI_MODEL, // Ex: gemini-2.5-flash-lite
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
    });

    const result = response?.candidates[0]?.content?.parts[0];
    let text = result?.text || 'No response.';
    text = text.replace(/\*/g, '');

    console.info('generateAIResponse: Executed successfully.');
    return res.json(new SuccessResponse(200, text));
  } catch (error) {
    console.error('generateAIResponse error:', error);
    throw new ErrorResponse(500, 'Error generating AI response.', [error?.message]);
  }
});
