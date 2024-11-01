// app/api/sentiment/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';
import { extractJSON } from '@/app/utils/extractJSON';
export async function POST(req: Request) {
    const { transcript } = await req.json();
    console.log('Transcript:', transcript);

    if (!transcript) {
        return NextResponse.json({ error: 'Transcript is required.' }, { status: 400 });
    }
    const prompt = `Analyze the following speech transcript and return valuable insights in JSON format. Focus on overall sentiment, notable phrases, structure, and linguistic style. Structure the JSON as follows:
    {
        "overall_sentiment": {
            "positive": 0.0,
            "negative": 0.0,
            "neutral": 0.0,
            "motivational": 0.0,
            "inspirational": 0.0,
            "pragmatic": 0.0,
            "reflective": 0.0
        },
        "notable_phrases": [
            {
                "phrase": "string",
                "impact": 0.0
            }
        ],
        "structure_analysis": {
            "introduction_clarity": 0.0,
            "logical_flow": 0.0,
            "conclusion_strength": 0.0,
            "engagement_level": 0.0
        },
        "linguistic_style": {
            "formality": 0.0,
            "conciseness": 0.0,
            "use_of_imagery": 0.0,
            "emphasis_on_action": 0.0
        }
    }
    Transcript: "${transcript}"`;
    const options = {
        method: 'POST',
        url: 'https://chatgpt-best-price.p.rapidapi.com/v1/chat/completions',
        headers: {
            'x-rapidapi-key': '74d487ac18mshedcb47a5300808dp18b539jsnac96efae5b68',
            'x-rapidapi-host': 'chatgpt-best-price.p.rapidapi.com',
            'Content-Type': 'application/json'
        },
        data: {
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ]
        }
    };


    try {
        const response = await axios.request(options);
        const messageContent = response.data.choices[0].message.content;
        const filteredMessage = extractJSON(messageContent);
        return NextResponse.json(filteredMessage);
    } catch (error) {
        console.error(error);
    }
}

