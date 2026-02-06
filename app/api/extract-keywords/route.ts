import { generateText } from "ai"

export async function POST(request: Request) {
  const { answers } = await request.json()

  if (!answers || !Array.isArray(answers) || answers.length === 0) {
    return Response.json({ error: "Invalid input" }, { status: 400 })
  }

  try {
    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: `You are an expert in problem surface mapping and contextual analysis. Your task is to identify the most relevant and impactful concepts from user responses.

A user has provided the following context:

1. What problem are you trying to solve?
   "${answers[0]}"

2. Who is affected by this problem?
   "${answers[1]}"

3. What are the main challenges or obstacles?
   "${answers[2]}"

TASK: Extract exactly 6 keywords that capture the core themes, concepts, and critical elements from this specific context.

KEYWORD SELECTION CRITERIA:
- Choose words/phrases that appear directly in or are strongly implied by the user's actual responses
- Prioritize specificity over generality - reflect what the user actually said, not generic problem-solving terms
- Select keywords that represent: main problem elements, key stakeholders, critical challenges, desired outcomes, constraints, or resources
- Each keyword should be 1-3 words, using Title Case
- Ensure diversity - don't pick 6 variations of the same concept

DESCRIPTION REQUIREMENTS:
- Each description must be context-specific, reflecting HOW this keyword relates to THIS particular problem
- Avoid generic phrases like "key aspect of the problem" or "important factor"
- Descriptions should reference or paraphrase the user's actual context
- Maximum 80 characters per description
- Capture the essence of why this keyword matters in THIS specific situation

EXAMPLE OF GOOD vs BAD:
User says: "Students struggle to afford textbooks, causing them to fall behind in coursework"

❌ BAD:
- Keyword: "Challenge"
- Description: "Main obstacle in the problem"

✅ GOOD:
- Keyword: "Textbook Costs"
- Description: "Financial barrier preventing students from accessing course materials"

Respond ONLY with a JSON object in this exact format:
{
  "nodes": [
    {
      "keyword": "Keyword1",
      "description": "Context-specific description from user's actual problem"
    },
    {
      "keyword": "Keyword2",
      "description": "Context-specific description from user's actual problem"
    },
    {
      "keyword": "Keyword3",
      "description": "Context-specific description from user's actual problem"
    },
    {
      "keyword": "Keyword4",
      "description": "Context-specific description from user's actual problem"
    },
    {
      "keyword": "Keyword5",
      "description": "Context-specific description from user's actual problem"
    },
    {
      "keyword": "Keyword6",
      "description": "Context-specific description from user's actual problem"
    }
  ]
}`,
    })

    // Parse the LLM response
    const parsed = JSON.parse(text)
    
    if (!parsed.nodes || !Array.isArray(parsed.nodes) || parsed.nodes.length !== 6) {
      throw new Error("Invalid response format")
    }

    return Response.json({ 
      nodes: parsed.nodes,
      connections: []
    })
  } catch (error) {
    console.error("[v0] Error extracting keywords:", error)
    
    // Fallback: extract context-specific keywords from answers
    const contextText = answers.join(" ")
    const allWords = contextText
      .toLowerCase()
      .replace(/[^a-z\s]/g, "")
      .split(" ")
      .filter((word: string) => word.length > 4)
      .slice(0, 6)
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))

    const fallbackKeywords = allWords.length === 6 ? allWords : ["Challenge", "Stakeholder", "Solution", "Impact", "Resources", "Goals"]
    
    // Create context-aware descriptions by extracting surrounding text
    const nodes = fallbackKeywords.map(keyword => {
      const lowerKeyword = keyword.toLowerCase()
      const contextIndex = contextText.toLowerCase().indexOf(lowerKeyword)
      let description = "Core element mentioned in the problem context"
      
      if (contextIndex !== -1) {
        // Extract surrounding words for context
        const words = contextText.split(" ")
        const keywordIndex = words.findIndex(w => w.toLowerCase().includes(lowerKeyword))
        if (keywordIndex !== -1) {
          const start = Math.max(0, keywordIndex - 3)
          const end = Math.min(words.length, keywordIndex + 4)
          const snippet = words.slice(start, end).join(" ")
          description = snippet.length > 80 ? snippet.slice(0, 77) + "..." : snippet
        }
      }
      
      return {
        keyword,
        description
      }
    })
    
    return Response.json({ 
      nodes,
      connections: []
    })
  }
}
