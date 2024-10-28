import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';


const url = "https://api.deepgram.com/v1/listen";
const apiKey = process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY // Replace with your actual API key

export async function POST(req: NextRequest) {
    try {
        console.log(apiKey)
        const formData = await req.formData();
        const audioFile = formData.get('audioFile') as File;

        if (!audioFile) {
            return NextResponse.json({ error: `Audio file is required` })
        }

        const filename = `${uuidv4()}.mp3`;
        const filePath = path.join(process.cwd(), 'public', 'uploads', filename);

        const buffer = Buffer.from(await audioFile.arrayBuffer())
        await fs.promises.writeFile(filePath, buffer);

        const audioStream = fs.createReadStream(filePath);

        const headers = {
            "Authorization": `Token ${apiKey}`,
            "Content-Type": 'audio/mpeg',
        }

        const response = await axios.post(url, audioStream, { headers })
        const transcriptResponse = response.data.results.channels[0].alternatives[0]

        return NextResponse.json(transcriptResponse)

    } catch (error) {
        console.error('Error during transcription:', error);
        const errorMessage = (error as Error).message;
        return NextResponse.json({ error: `Transcription failed: ${errorMessage}` }, { status: 500 });
    }
}