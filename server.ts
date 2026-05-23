import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { createClient } from '@supabase/supabase-js';
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const isSupabaseConfigured = supabaseUrl && 
                             supabaseUrl.startsWith('http') && 
                             supabaseAnonKey && 
                             !supabaseAnonKey.includes('YOUR_');

const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {
      auth: {
        getUser: async (token: string) => {
          if (token === 'mock-token') {
            return {
              data: {
                user: { id: 'mock-user-123', email: 'guest@example.com' }
              },
              error: null
            };
          }
          return { data: { user: null }, error: new Error("Invalid token") };
        }
      }
    } as any;

const app = express();
const PORT = 3000;

app.use(express.json());

const isGeminiConfigured = process.env.GEMINI_API_KEY && 
                           process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY' &&
                           !process.env.GEMINI_API_KEY.includes('YOUR_');

let ai: any = null;
if (isGeminiConfigured) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
} else {
  console.warn("WARNING: GEMINI_API_KEY is not set or is placeholder. AI analysis will run in simulated demo mode.");
}

function getMockAnalysis(decision: string, type: string) {
  const dec = decision.toLowerCase();
  
  if (type === "pros_cons") {
    let pros = [
      { id: "p1", text: "Exciting New Experience", explanation: "Embarking on this decision opens up new possibilities, learning opportunities, and breaks the monotony of your current routine." },
      { id: "p2", text: "Long-term Growth Potential", explanation: "This path is highly aligned with personal development and provides valuable skills and network for the future." },
      { id: "p3", text: "Personal Alignment", explanation: "Deep down, this choice resonates with your core values and long-term aspirations." }
    ];
    let cons = [
      { id: "c1", text: "Initial Learning Curve & Effort", explanation: "Starting this path will require significant time, energy, and pushing through comfort zones early on." },
      { id: "c2", text: "Opportunity Cost", explanation: "Choosing this means committing resources and attention that could otherwise be spent on other alternatives or leisure." },
      { id: "c3", text: "Risk of the Unknown", explanation: "There are elements of this path that cannot be fully predicted, which can lead to anxiety or unexpected challenges." }
    ];
    let summary = `This decision represents a high-growth but high-effort path. The pros highlight personal growth and long-term alignment, while the cons center on the immediate sacrifice of comfort and the cognitive load of navigating uncertainty.`;

    if (dec.includes("job") || dec.includes("career") || dec.includes("quit") || dec.includes("work")) {
      pros = [
        { id: "p1", text: "Career Advancement & Upskilling", explanation: "This move is a strong catalyst for professional growth, exposing you to new industries, technologies, or leadership dynamics." },
        { id: "p2", text: "Potential for Better Compensation", explanation: "A career transition or new job offer typically yields higher starting leverage and financial scaling than staying put." },
        { id: "p3", text: "Fresh Start & Motivation", explanation: "Entering a new professional environment will revitalize your daily routine, boost energy levels, and reduce burnout." }
      ];
      cons = [
        { id: "c1", text: "Loss of Familiarity & Comfort", explanation: "You will leave behind established relationships, a clear understanding of expectations, and the ease of a familiar routine." },
        { id: "c2", text: "Onboarding Stress", explanation: "The first 3 to 6 months will require immense effort to prove your capability, adapt to team culture, and learn new workflows." },
        { id: "c3", text: "Risk of cultural mismatch", explanation: "There is always a slight chance the new company culture or leadership style might not align with your working preferences." }
      ];
      summary = `A transition in your career is a powerful growth engine but demands a heavy toll in short-term adaptation energy. The upside is professional renewal and potential compensation scaling, while the downside is the emotional tax of proving yourself anew in an unproven environment.`;
    } else if (dec.includes("buy") || dec.includes("car") || dec.includes("house") || dec.includes("spend")) {
      pros = [
        { id: "p1", text: "Immediate Utility & Convenience", explanation: "This purchase solves an immediate paint point, upgrading your quality of life, mobility, or living standards." },
        { id: "p2", text: "Asset Ownership & Security", explanation: "Acquiring this physical asset builds personal equity and offers a sense of long-term stability and accomplishment." },
        { id: "p3", text: "Pride of Ownership", explanation: "There is an emotional reward in acquiring something of value that you have worked hard to afford." }
      ];
      cons = [
        { id: "c1", text: "Financial Liquidity Reduction", explanation: "A major financial outlay reduces your cash reserves, limiting your ability to respond to emergencies or other investment options." },
        { id: "c2", text: "Maintenance & Depreciation Costs", explanation: "Beyond the sticker price, this asset will require ongoing operational costs, insurance, taxes, or will lose value over time." },
        { id: "c3", text: "Buyer's Remorse Risk", explanation: "There is a risk that the initial excitement of the purchase will fade quickly, leaving you with financial commitments and less utility than expected." }
      ];
      summary = `This purchase offers strong immediate utility and comfort, but it must be balanced against the reduction in your overall liquid capital and the long-term cost of upkeep. Ensure the utility highly exceeds the financial load.`;
    }

    return { pros, cons, summary };
  } else if (type === "swot") {
    let strengths = [
      "High intrinsic motivation and personal interest in this direction",
      "Leverages existing skills and experiences",
      "Strong emotional reward and alignment with personal values"
    ];
    let weaknesses = [
      "Lack of specific specialized experience in this new domain",
      "Requires substantial reallocation of time and focus",
      "Potential financial or energy strain during the initial phase"
    ];
    let opportunities = [
      "Expanding personal network into a new community or industry",
      "Building a versatile skillset that makes you highly adaptable",
      "Creating secondary opportunities that are not currently visible"
    ];
    let threats = [
      "Unexpected changes in market conditions or personal circumstances",
      "Burnout from balancing this with existing responsibilities",
      "Potential loss of momentum if early results are slow to materialize"
    ];
    let summary = "The SWOT analysis indicates that the primary strength lies in your internal drive and leverageable skills. The biggest opportunities are long-term adaptability and network growth. However, you must proactively manage the threat of burnout and the weakness of limited domain-specific knowledge by planning a realistic schedule.";

    if (dec.includes("job") || dec.includes("career") || dec.includes("quit") || dec.includes("work")) {
      strengths = [
        "Proven professional skills and adaptable work ethic",
        "Opportunity to escape a stagnant environment or role",
        "Strong resume addition showing active growth and adaptability"
      ];
      weaknesses = [
        "Leaving a highly secure or comfortable current position",
        "Initial drop in domain-specific authority inside a new team",
        "Ramp-up time required to master new internal systems"
      ];
      opportunities = [
        "Significantly accelerated trajectory toward leadership roles",
        "Substantial compensation bump and negotiation leverage",
        "Exposures to high-impact projects and fresh mentorship"
      ];
      threats = [
        "New team dynamic or manager alignment might be challenging",
        "Macroeconomic fluctuations impacting the new industry or company",
        "Short-term stress spilling over into personal life"
      ];
    }

    return { strengths, weaknesses, opportunities, threats, summary };
  } else {
    let options = [
      {
        name: "Option A: Proceed with the choice",
        points: [
          "Enables active progress rather than analysis paralysis.",
          "Opens immediate opportunities for feedback and learning.",
          "Requires stepping out of your comfort zone, building resilience."
        ]
      },
      {
        name: "Option B: Maintain current status quo",
        points: [
          "Provides immediate predictability and low cognitive stress.",
          "Conserves energy and resources for a more opportune time.",
          "Limits exposure to failure, but also halts active growth."
        ]
      }
    ];
    let conclusion = "Proceeding is generally recommended if you have a safety margin and are feeling stagnant. Maintaining the status quo is wiser if you are currently facing high baseline stress in other areas of your life.";

    if (dec.includes("job") || dec.includes("career") || dec.includes("quit") || dec.includes("work")) {
      options = [
        {
          name: "Make the career transition",
          points: [
            "High growth potential, exposure to new challenges.",
            "Higher financial rewards and negotiation leverage.",
            "Refreshes daily energy, beats complacency."
          ]
        },
        {
          name: "Stay in current position",
          points: [
            "Maximum security, established trust, and comfort.",
            "Low stress, predictable work-life balance.",
            "Minimal growth potential; risk of feeling stagnant or falling behind market standards."
          ]
        }
      ];
      conclusion = "A career transition is highly recommended if the new role offers a clear skill gap you want to bridge or a significant upgrade in compensation/culture. Stay only if you need a period of stability to focus on critical personal matters.";
    }

    return { options, conclusion };
  }
}

// API routes
app.post("/api/analyze", async (req, res) => {
  const { decision, type } = req.body;

  if (!decision || typeof decision !== 'string') {
    return res.status(400).json({ error: "Decision prompt is required and must be a string" });
  }

  if (decision.length > 1000) {
    return res.status(400).json({ error: "Decision prompt is too long (max 1000 characters)" });
  }

  if (!ai) {
    return res.status(503).json({ error: "AI service is not configured (missing API key)" });
  }

  try {
    let systemInstruction = "";
    let responseSchema: any = {};

    if (type === "pros_cons") {
      systemInstruction = "Analyze the given decision and provide a detailed list of pros and cons. Each point should have a title and a brief explanation.";
      responseSchema = {
        type: Type.OBJECT,
        properties: {
          pros: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                text: { type: Type.STRING },
                explanation: { type: Type.STRING }
              },
              required: ["id", "text", "explanation"]
            }
          },
          cons: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                text: { type: Type.STRING },
                explanation: { type: Type.STRING }
              },
              required: ["id", "text", "explanation"]
            }
          },
          summary: { type: Type.STRING }
        },
        required: ["pros", "cons", "summary"]
      };
    } else if (type === "swot") {
      systemInstruction = "Perform a SWOT analysis (Strengths, Weaknesses, Opportunities, Threats) for the given decision.";
      responseSchema = {
        type: Type.OBJECT,
        properties: {
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
          opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
          threats: { type: Type.ARRAY, items: { type: Type.STRING } },
          summary: { type: Type.STRING }
        },
        required: ["strengths", "weaknesses", "opportunities", "threats", "summary"]
      };
    } else {
      // Default / Comparison
      systemInstruction = "Analyze the decision by comparing different options or aspects. Provide a summary and key comparison points.";
      responseSchema = {
        type: Type.OBJECT,
        properties: {
          options: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                points: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["name", "points"]
            }
          },
          conclusion: { type: Type.STRING }
        },
        required: ["options", "conclusion"]
      };
    }

    if (!isGeminiConfigured) {
      const mockData = getMockAnalysis(decision, type);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return res.json(mockData);
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Decision: ${decision}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema
      },
    });

    const rawText = response.text || "{}";
    const cleanedText = rawText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    res.json(JSON.parse(cleanedText));
  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    res.status(500).json({ error: "An internal error occurred during analysis." });
  }
});

// Vite middleware for development
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

setupVite();
