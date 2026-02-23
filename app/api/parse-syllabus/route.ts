import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore
import PDFParser from 'pdf2json';

export async function POST(req: NextRequest) {
    console.log("Parsing PDF with pdf2json...");
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        let text = '';

        if (file.type === 'application/pdf') {
            const parser = new PDFParser(null, 1 as unknown as boolean); // 1 = text content enabled

            text = await new Promise((resolve, reject) => {
                parser.on("pdfParser_dataError", (errData: any) => {
                    console.error("PDF Parser Error:", errData.parserError);
                    reject(errData.parserError);
                });

                parser.on("pdfParser_dataReady", () => {
                    // getRawTextContent() returns the text content from the parsed PDF
                    const rawText = parser.getRawTextContent();
                    resolve(rawText);
                });

                try {
                    parser.parseBuffer(buffer);
                } catch (e) {
                    reject(e);
                }
            });

        } else if (file.type === 'text/plain') {
            text = buffer.toString('utf-8');
        } else {
            return NextResponse.json({ error: "Unsupported file type. Use PDF or TXT." }, { status: 400 });
        }

        // Clean up the text (pdf2json sometimes leaves artifacts)
        // It often has page breaks like ----------------Page (0) Break----------------
        const cleanedText = text
            .replace(/----------------Page \(\d+\) Break----------------/g, '\n')
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
