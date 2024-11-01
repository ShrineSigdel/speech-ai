export function extractJSON(input: string) {
    const jsonMatch = input.match(/{[\s\S]*}/); // Match everything from the first { to the last }
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null; // Parse the JSON if found, else return null
}