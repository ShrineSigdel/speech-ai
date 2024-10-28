'use client';

import { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormItem,
    FormLabel,
    FormDescription,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// Define a simple schema for file validation
const formSchema = z.object({
    audioFile: z.instanceof(File).refine(file => file.type === 'audio/mpeg', {
        message: "Please upload a valid MP3 file.",
    }),
});

export default function Home() {
    const [transcript, setTranscript] = useState<string | null>(null);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            audioFile: undefined, // Initialize with null
        },
    });

    const handleAudioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null;
        if (file) {
            form.setValue('audioFile', file); // Update form state directly
        }
    };

    const handleTranscribe = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // Prevent default form submission behavior

        // Trigger validation
        const result = await form.trigger();
        if (!result) {
            alert('Please upload a valid MP3 file');
            return;
        }

        const file = form.getValues('audioFile');
        if (!file) {
            alert('Please select an audio file');
            return;
        }

        const formData = new FormData();
        formData.append('audioFile', file);

        const response = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData,
        });

        try {
            const data = await response.json();
            console.log("Deepgram api: ");
            console.log(data)

        }
        catch (err) {
            console.log(err)
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={handleTranscribe} className="space-y-8">
                <FormItem>
                    <FormLabel>Audio File</FormLabel>
                    <FormControl>
                        <Input
                            type="file"
                            accept="audio/mpeg"
                            onChange={handleAudioChange}
                        />
                    </FormControl>
                    <FormDescription>
                        Please upload a valid MP3 audio file for transcription.
                    </FormDescription>
                    <FormMessage />
                </FormItem>
                <Button type="submit">Transcribe</Button>
            </form>
        </Form>
    );
}
