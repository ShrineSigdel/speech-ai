export const analyzeText = (text: string) => {
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length
    const charCount = text.length

    return {
        words: wordCount,
        chars: charCount,
    }
}