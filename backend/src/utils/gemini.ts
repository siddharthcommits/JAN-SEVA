import { GoogleGenAI, Type } from "@google/genai";
import axios from "axios";

// Initialize the Google GenAI SDK. 
// It will automatically pick up GEMINI_API_KEY from environment if not passed explicitly,
// but we'll pass it explicitly to be safe.
const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not defined in the environment variables.");
    }
    return new GoogleGenAI({ apiKey });
};

// Helper function to fetch an image from a URL and convert it to Gemini's inlineData format
async function imageUrlToGenerativePart(url: string) {
    try {
        const response = await axios.get(url, { responseType: "arraybuffer" });
        const buffer = Buffer.from(response.data, "binary");
        const mimeType = response.headers["content-type"] || "image/jpeg";
        return {
            inlineData: {
                data: buffer.toString("base64"),
                mimeType,
            },
        };
    } catch (error) {
        console.error(`Failed to fetch image from URL: ${url}`, error);
        throw new Error(`Failed to process image from URL for AI analysis: ${url}`);
    }
}

export interface AIAnalysisResult {
    title: string;
    category: "road" | "garbage" | "sewage" | "water" | "electricity";
    enrichedDescription: string;
    severity: "low" | "medium" | "critical";
    isRealIssue: boolean;
    confidence: number;
    reasoning: string;
}

export interface AIDuplicateResult {
    isDuplicate: boolean;
    duplicateIssueId?: string;
    reasoning: string;
}

export interface AIResolutionResult {
    isResolved: boolean;
    qualityScore: number;
    reasoning: string;
}

export interface AIWardInsightsResult {
    summary: string;
    criticalAreas: string[];
    trendAnalysis: string;
    resourceAllocationRecommendations: string[];
}

/**
 * Analyzes reported issue description and optional images.
 */
export async function analyzeIssueWithAI(
    description: string,
    imageUrls: string[] = []
): Promise<AIAnalysisResult> {
    const ai = getGeminiClient();
    const contents: any[] = [
        "Analyze the following user-submitted description and any accompanying photos of a civic issue. " +
        "Perform these checks:\n" +
        "1. Determine if this is a real civic infrastructure or community issue (e.g. pothole, garbage, sewer leak, power outage, broken streetlight). " +
        "Set isRealIssue to false if it is unrelated, spam, private property issue, or offensive.\n" +
        "2. Categorize it into one of: 'road', 'garbage', 'sewage', 'water', or 'electricity'.\n" +
        "3. Generate a concise, clear title (max 6-8 words).\n" +
        "4. Enrich the description by correcting grammar, spelling, and adding standard civic terminology.\n" +
        "5. Assess the urgency/severity: 'low', 'medium', or 'critical'.\n\n" +
        `User Description: ${description}`
    ];

    // Download and append any images to the prompt
    for (const url of imageUrls) {
        const imagePart = await imageUrlToGenerativePart(url);
        contents.push(imagePart);
    }

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "A short, descriptive title for the issue." },
                    category: {
                        type: Type.STRING,
                        enum: ["road", "garbage", "sewage", "water", "electricity"],
                        description: "The category this civic issue falls under."
                    },
                    enrichedDescription: { type: Type.STRING, description: "A grammatically corrected, formal version of the description." },
                    severity: {
                        type: Type.STRING,
                        enum: ["low", "medium", "critical"],
                        description: "Urgency and risk severity of the issue."
                    },
                    isRealIssue: { type: Type.BOOLEAN, description: "Whether this represents a genuine public/civic issue." },
                    confidence: { type: Type.NUMBER, description: "Confidence score between 0.0 and 1.0." },
                    reasoning: { type: Type.STRING, description: "Brief explanation of the category, severity, and authenticity decision." }
                },
                required: ["title", "category", "enrichedDescription", "severity", "isRealIssue", "confidence", "reasoning"],
            }
        }
    });

    const text = response.text;
    if (!text) {
        throw new Error("Empty response received from Gemini API");
    }
    return JSON.parse(text) as AIAnalysisResult;
}

/**
 * Compares a new issue with existing nearby issues to identify if it is a duplicate.
 */
export async function detectDuplicateIssue(
    newIssue: { title: string; description: string; category: string },
    nearbyIssues: { id: string; title: string; description: string; category: string }[]
): Promise<AIDuplicateResult> {
    if (nearbyIssues.length === 0) {
        return { isDuplicate: false, reasoning: "No nearby issues to compare." };
    }

    const ai = getGeminiClient();
    const prompt = 
        "You are a civic data validator. We have a newly reported issue and a list of existing open issues in the same area. " +
        "Determine if the new issue is a duplicate of any existing issue. " +
        "Issues are duplicates if they describe the exact same problem at the exact same spot (e.g. 'Pothole in front of Starbucks' and 'giant hole on road near Starbucks'). " +
        "If they are different problems or separate locations, they are NOT duplicates.\n\n" +
        `New Issue:\n- Title: ${newIssue.title}\n- Category: ${newIssue.category}\n- Description: ${newIssue.description}\n\n` +
        `Existing Nearby Issues:\n` +
        nearbyIssues.map(i => `- ID: ${i.id}\n  Title: ${i.title}\n  Category: ${i.category}\n  Description: ${i.description}`).join("\n\n");

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    isDuplicate: { type: Type.BOOLEAN, description: "True if the new issue is a duplicate of one of the existing issues." },
                    duplicateIssueId: { type: Type.STRING, description: "The ID of the existing issue that this is a duplicate of, if any. Leave empty or null if not a duplicate." },
                    reasoning: { type: Type.STRING, description: "Explanation of why this is or is not a duplicate." }
                },
                required: ["isDuplicate", "reasoning"]
            }
        }
    });

    const text = response.text;
    if (!text) {
        throw new Error("Empty response received from Gemini API");
    }
    return JSON.parse(text) as AIDuplicateResult;
}

/**
 * Verifies if an issue has been resolved by comparing the original image/description with the resolution proof image.
 */
export async function verifyResolutionWithAI(
    issueDescription: string,
    originalImageUrls: string[],
    resolutionImageUrls: string[]
): Promise<AIResolutionResult> {
    if (resolutionImageUrls.length === 0) {
        throw new Error("At least one resolution proof image is required.");
    }

    const ai = getGeminiClient();
    const contents: any[] = [
        "You are a civic inspector validating if an reported issue has been successfully resolved based on photos. " +
        "Compare the original issue description and the original photos (before) with the resolution photos (after). " +
        "Check if the problem (e.g. pothole, broken light, dump pile) described has been repaired/cleared. " +
        "Assign a quality score from 1 (very poor/fake resolution) to 10 (perfect, high quality repair).\n\n" +
        `Original Issue Description: ${issueDescription}\n`
    ];

    // Append original images as "before"
    contents.push("--- ORIGINAL IMAGES (BEFORE) ---");
    for (const url of originalImageUrls) {
        const part = await imageUrlToGenerativePart(url);
        contents.push(part);
    }

    // Append resolution images as "after"
    contents.push("--- RESOLUTION IMAGES (AFTER) ---");
    for (const url of resolutionImageUrls) {
        const part = await imageUrlToGenerativePart(url);
        contents.push(part);
    }

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    isResolved: { type: Type.BOOLEAN, description: "True if the resolution images confirm that the original issue has been resolved." },
                    qualityScore: { type: Type.NUMBER, description: "Score from 1 to 10 evaluating the quality/completeness of the resolution." },
                    reasoning: { type: Type.STRING, description: "Detailed feedback on the resolution compared to the original issue." }
                },
                required: ["isResolved", "qualityScore", "reasoning"]
            }
        }
    });

    const text = response.text;
    if (!text) {
        throw new Error("Empty response received from Gemini API");
    }
    return JSON.parse(text) as AIResolutionResult;
}

/**
 * Generates predictive and descriptive insights for a given ward's issues.
 */
export async function getWardInsightsWithAI(
    wardInfo: { name: string; number: number; city: string },
    issues: { category: string; status: string; upvotes: number; description: string; createdAt: Date }[]
): Promise<AIWardInsightsResult> {
    const ai = getGeminiClient();
    
    const issueSummary = issues.map(i => 
        `- Category: ${i.category}\n  Status: ${i.status}\n  Urgency (Upvotes): ${i.upvotes}\n  Description: ${i.description}\n  Reported: ${new Date(i.createdAt).toLocaleDateString()}`
    ).join("\n\n");

    const prompt = 
        `You are a senior urban planner and predictive analyst. Generate a strategic report for Ward #${wardInfo.number} (${wardInfo.name}, ${wardInfo.city}) based on the local issues reported by citizens. ` +
        "Analyze trends, identify critical hotspots, and give concrete resource allocation recommendations.\n\n" +
        `Ward: ${wardInfo.name} (Ward #${wardInfo.number})\n` +
        `Total Issues: ${issues.length}\n` +
        `Issues List:\n${issueSummary}`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    summary: { type: Type.STRING, description: "Overall summary of the ward's health, including critical problem areas." },
                    criticalAreas: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific high-priority problems or locations that require immediate intervention." },
                    trendAnalysis: { type: Type.STRING, description: "Analysis of whether certain types of issues (e.g. water leaks, sewage) are rising or falling, and their implications." },
                    resourceAllocationRecommendations: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Actionable recommendations on how the municipal budget or manpower should be distributed." }
                },
                required: ["summary", "criticalAreas", "trendAnalysis", "resourceAllocationRecommendations"]
            }
        }
    });

    const text = response.text;
    if (!text) {
        throw new Error("Empty response received from Gemini API");
    }
    return JSON.parse(text) as AIWardInsightsResult;
}
