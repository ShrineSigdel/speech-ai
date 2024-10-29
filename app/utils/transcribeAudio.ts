// utils/transcribeAudio.ts

import fs from 'fs';
import axios from 'axios';

const url = "https://api.deepgram.com/v1/listen";
const apiKey = process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY;

export async function transcribeAudio(filePath: string) {
    const audioStream = fs.createReadStream(filePath);

    const headers = {
        "Authorization": `Token ${apiKey}`,
        "Content-Type": 'audio/mpeg',
    };

    const response = await axios.post(url, audioStream, { headers });
    const transcriptResponse = response.data.results.channels[0].alternatives[0];
    return transcriptResponse;
}
