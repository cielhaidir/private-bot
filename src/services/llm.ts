import Groq from "groq-sdk";

// const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const groq = new Groq({ apiKey: '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' });

const MODEL_ID = "llama-3.2-1b-preview";

/**
 * Send a message to the LLM for parsing financial data.
 * @param {string} message - The user input message to parse.
 * @returns {Promise<{type: string; total: number; desc: string}[]>} - Parsed CSV data.
 */
export async function parseMessage(message: string): Promise<Array<{ type: string; total: number; desc: string }>> {
    try {
        const systemPrompt = `
                You are a financial assistant. Your task is to parse the user's input and output structured financial data in CSV format.
                CSV columns: type (in/out), total (integer), desc (string).
                Your output should be only in CSV format, no extra text or explanation.
            
                Example:
                Input:
                uang keluar:
                seblak 35
                ps2 37
                bensin 61
            
                Output:
                out,35000,seblak
                out,37000,ps2
                out,61000,bensin
            `;

        const response = await groq.chat.completions.create({
            model: MODEL_ID,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message },
            ],
        });

        console.log("Response from LLM:", response);

        const content = response.choices[0]?.message?.content?.trim();
        if (!content) {
            throw new Error("No response from the model.");
        }

        // Parse CSV data from the response
        const rows = content.split("\n").map((row) => {
            const [type, total, desc] = row.split(",").map((val) => val.trim());
            
            // Check for missing or invalid data
            if (!type || isNaN(parseInt(total, 10)) || !desc) {
                return null; // Return null for invalid rows
            }

            return { type, total: parseInt(total, 10), desc };
        }).filter(row => row !== null); // Filter out null rows


        return rows as { type: string; total: number; desc: string }[];
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error parsing message with LLM:", error.message);
        } else {
            console.error("Error parsing message with LLM:", error);
        }
        throw new Error("Failed to parse message.");
    }
}
