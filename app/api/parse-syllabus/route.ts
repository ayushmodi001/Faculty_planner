import { NextRequest, NextResponse } from 'next/server';
// Import directly from lib to avoid index.js side-effects/buggy test logic
// @ts-ignore
import pdfParse from 'pdf-parse/lib/pdf-parse.js';

export async function POST(req: NextRequest) {
    console.log("Parsing PDF...");
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        let text = '';

        if (file.type === 'application/pdf') {
            try {
                const data = await pdfParse(buffer);
                text = data.text;
                console.log("Successfully extracted text. Length:", text.length);
            } catch (pdfError: any) {
                console.error("pdf-parse Error:", pdfError);
                throw new Error(`PDF extraction failed: ${pdfError.message}`);
            }
        } else if (file.type === 'text/plain') {
            text = buffer.toString('utf-8');
        } else {
            return NextResponse.json({ error: "Unsupported file type. Use PDF or TXT." }, { status: 400 });
        }

        // Clean up the text
        const cleanedText = text
            .replace(/\r\n/g, '\n')
            .replace(/\n\s*\n/g, '\n\n') // Consolidate multiple newlines
            .trim();

        if (!cleanedText || cleanedText.length === 0) {
            return NextResponse.json({ error: "Extracted text is empty. The PDF might be scanned or image-based." }, { status: 400 });
        }

        return NextResponse.json({ text: cleanedText });

    } catch (error: any) {
        console.error("PDF Extraction Handler Error:", error);
        return NextResponse.json({
            error: "Failed to parse file. Ensure it is a valid text-based PDF.",
            details: error.message
        }, { status: 500 });
    }
}
