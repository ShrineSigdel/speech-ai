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
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
  audioFile: z.instanceof(File).refine(file => file.type === 'audio/mpeg', {
    message: "Please upload a valid MP3 file.",
  }),
})

export default function Component() {
  const [isLoading, setIsLoading] = useState(false)
  const [transcript, setTranscript] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(true)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      audioFile: undefined,
    },
  })

  const handleAudioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    if (file) {
      form.setValue('audioFile', file)
    }
  }

  const handleTranscribe = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const result = await form.trigger()
    if (!result) {
      return
    }

    const file = form.getValues('audioFile')
    if (!file) {
      return
    }

    setIsLoading(true)
    setIsFormOpen(false)

    const formData = new FormData()
    formData.append('audioFile', file)

    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()
      setTranscript(data.transcript)
    } catch (err) {
      console.error(err)
      setTranscript("An error occurred during transcription.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleTranscriptClick = () => {
    setIsFormOpen(true)
    setTranscript(null)
  }

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto mt-8">
        <CardContent className="flex items-center justify-center h-40">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Transcribing...</span>
        </CardContent>
      </Card>
    )
  }

  if (transcript) {
    return (
      <Card className="w-full max-w-md mx-auto mt-8" onClick={handleTranscriptClick}>
        <CardContent className="p-6">
          <Textarea
            value={transcript}
            readOnly
            className="w-full h-40 resize-none focus:outline-none"
          />
          <p className="text-sm text-muted-foreground mt-2">Click to transcribe another audio file</p>
        </CardContent>
      </Card>
    )
  }

  if (isFormOpen) {
    return (
      <Card className="w-full max-w-md mx-auto mt-8">
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={handleTranscribe} className="space-y-6">
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
              <Button type="submit" className="w-full">Transcribe</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    )
  }

  return null
}