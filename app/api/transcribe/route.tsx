// app/api/transcribe/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { saveFile } from '@/app/utils/saveFile'
import { transcribeAudio } from '@/app/utils/transcribeAudio';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const audioFile = formData.get('audioFile') as File;

        if (!audioFile) {
            return NextResponse.json({ error: `Audio file is required` }, { status: 400 });
        }

        const filename = `${uuidv4()}.mp3`;
        const filePath = await saveFile(audioFile, filename);

        const transcriptResponse = await transcribeAudio(filePath);
        return NextResponse.json(transcriptResponse);

    } catch (error) {
        console.error('Error during transcription:', error);
        return NextResponse.json({ error: `Transcription failed: ${(error as Error).message}` }, { status: 500 });
    }
}
