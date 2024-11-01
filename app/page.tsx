'use client'

import { useState } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormItem,
    FormLabel,
    FormDescription,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { analyzeText } from './utils/textAnalysis'

const formSchema = z.object({
    audioFile: z.instanceof(File).refine(file => file.type === 'audio/mpeg', {
        message: "Please upload a valid MP3 file.",
    }),
})

interface TextData {
    words: number;
    chars: number;
}

export default function AudioTranscription() {
    const [isLoading, setIsLoading] = useState(false)
    const [isAnalysisLoading, setIsAnalysisLoading] = useState(false)
    const [transcript, setTranscript] = useState<string | null>(null)
    const [confidenceScore, setConfidenceScore] = useState<number>()
    const [textData, setTextData] = useState<TextData | null>(null)
    const [sentimentData, setSentimentData] = useState<any | null>(null)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { audioFile: undefined },
    })

    const handleAudioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null
        if (file) form.setValue('audioFile', file)
    }

    const handleTranscribe = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const isValid = await form.trigger();
        if (!isValid) return;

        const file = form.getValues('audioFile');
        if (!file) return;

        setIsLoading(true);

        const formData = new FormData();
        formData.append('audioFile', file);

        try {
            const response = await fetch('/api/transcribe', { method: 'POST', body: formData });
            const data = await response.json();
            setConfidenceScore(Math.round(data.confidence * 100));
            setTranscript(data.transcript);
            setTextData(analyzeText(data.transcript));

            setIsAnalysisLoading(true);
            const sentimentResponse = await fetch('/api/sentiment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transcript: data.transcript }),
            });
            const sentiment = await sentimentResponse.json();
            setSentimentData(sentiment);
            setIsAnalysisLoading(false);
        } catch (err) {
            console.error('Transcription Error:', err);
            setTranscript("An error occurred during transcription.");
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setTranscript(null);
        setSentimentData(null);
        form.reset();
    }

    return (
        <div className="w-full max-w-4xl mx-auto mt-8 p-6 bg-slate-50">
            <h1 className="text-4xl font-bold text-slate-800 mb-8 text-center">Audio Transcription & Analysis</h1>

            {isLoading && (
                <Card className="mb-6 bg-white shadow-lg">
                    <CardContent className="flex items-center justify-center h-40">
                        <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
                        <span className="ml-2 text-lg font-semibold text-slate-700">Transcribing...</span>
                    </CardContent>
                </Card>
            )}

            {isAnalysisLoading && (
                <Card className="mb-6 bg-white shadow-lg">
                    <CardContent className="flex items-center justify-center h-40">
                        <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
                        <span className="ml-2 text-lg font-semibold text-slate-700">Analyzing...</span>
                    </CardContent>
                </Card>
            )}

            {transcript && (
                <Card className="mb-6 bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer" onClick={resetForm}>
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-slate-800">Transcript</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            value={transcript}
                            readOnly
                            className="w-full h-40 resize-none focus:outline-none text-slate-700 bg-slate-50"
                        />
                        <div className="mt-4 text-lg font-semibold text-slate-700">Confidence: <span className="text-slate-900">{confidenceScore}%</span></div>
                    </CardContent>
                </Card>
            )}

            {sentimentData && (
                <Card className="mb-6 bg-white shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-slate-800">Sentiment Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-xl font-bold mb-2 text-slate-700">Overall Sentiment</h3>
                                <ul className="space-y-1">
                                    {Object.entries(sentimentData.overall_sentiment).map(([key, value]) => (
                                        <li key={key} className="capitalize text-slate-600"><span className="font-semibold text-slate-800">{key}:</span> {value}</li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2 text-slate-700">Notable Phrases</h3>
                                <ul className="space-y-1">
                                    {sentimentData.notable_phrases.map((phraseObj: any, index: number) => (
                                        <li key={index} className="text-slate-600">
                                            <span className="font-semibold text-slate-800">"{phraseObj.phrase}"</span> - Impact: {phraseObj.impact}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2 text-slate-700">Structure Analysis</h3>
                                <ul className="space-y-1">
                                    {Object.entries(sentimentData.structure_analysis).map(([key, value]) => (
                                        <li key={key} className="capitalize text-slate-600"><span className="font-semibold text-slate-800">{key}:</span> {value}</li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2 text-slate-700">Linguistic Style</h3>
                                <ul className="space-y-1">
                                    {Object.entries(sentimentData.linguistic_style).map(([key, value]) => (
                                        <li key={key} className="capitalize text-slate-600"><span className="font-semibold text-slate-800">{key}:</span> {value}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {!transcript && !isLoading && (
                <Card className="bg-white shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-slate-800">Upload Audio</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={handleTranscribe} className="space-y-6">
                                <FormItem>
                                    <FormLabel className="text-lg font-semibold text-slate-700">Audio File</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="file"
                                            accept="audio/mpeg"
                                            onChange={handleAudioChange}
                                            className="text-slate-700 bg-slate-50 border-slate-300 focus:border-slate-500 focus:ring-slate-500"
                                        />
                                    </FormControl>
                                    <FormDescription className="text-slate-600">
                                        Please upload a valid MP3 audio file for transcription.
                                    </FormDescription>
                                    <FormMessage className="text-red-500" />
                                </FormItem>
                                <Button type="submit" className="w-full bg-slate-700 hover:bg-slate-800 text-white font-bold py-2 px-4 rounded transition-colors duration-300">
                                    Transcribe
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}