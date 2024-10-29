// utils/saveFile.ts

import fs from 'fs';
import path from 'path';

export async function saveFile(file: File, filename: string): Promise<string> {
    const filePath = path.join(process.cwd(), 'public', 'uploads', filename);
    const buffer = Buffer.from(await file.arrayBuffer());
    
    await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
    await fs.promises.writeFile(filePath, buffer);

    return filePath;
}
