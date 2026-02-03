import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { skillsText, dimensions } = await request.json()

    // TODO: Replace this with actual LLM call using your preferred AI service
    // For now, we'll return a mock response
    
    // Example of what the LLM should do:
    // 1. Analyze the skillsText
    // 2. For each dimension, assign a value from 0-10 based on the skills mentioned
    // 3. Return an object mapping dimension names to values

    // Mock implementation - replace with actual LLM call
    const mockSkillData: { [key: string]: number } = {}
    
    // First, try to parse explicit values in format "Dimension Name X.X"
    const text = skillsText
    let hasExplicitValues = false
    
    dimensions.forEach((dimension: string) => {
      // Try to find "dimension X.X" or "dimension: X.X" pattern
      const patterns = [
        new RegExp(`${dimension}\\s*:?\\s*(\\d+\\.?\\d*)`, 'i'),
        new RegExp(`${dimension}\\s+(\\d+\\.?\\d*)`, 'i')
      ]
      
      for (const pattern of patterns) {
        const match = text.match(pattern)
        if (match && match[1]) {
          const value = parseFloat(match[1])
          if (!isNaN(value) && value >= 0 && value <= 10) {
            mockSkillData[dimension] = value
            hasExplicitValues = true
            console.log(`[v0 API] Parsed explicit value for ${dimension}: ${value}`)
            break
          }
        }
      }
    })
    
    // If no explicit values found, fall back to keyword matching
    if (!hasExplicitValues) {
      // Create a seed from the text to ensure consistent but different results per unique input
      const textHash = text.split('').reduce((acc, char) => {
        return ((acc << 5) - acc) + char.charCodeAt(0)
      }, 0)
      
      // Simple seeded random function
      const seededRandom = (seed: number, min: number, max: number) => {
        const x = Math.sin(seed) * 10000
        const random = x - Math.floor(x)
        return Math.floor(random * (max - min + 1)) + min
      }
      
      const lowerText = text.toLowerCase()
      const wordCount = text.split(/\s+/).length
      
      dimensions.forEach((dimension: string, index: number) => {
      let value = 0
        const dimensionSeed = textHash + index
        
        // Keyword-based scoring with multiple levels
        if (dimension === "Senioridade real") {
          if (lowerText.includes("senior") || lowerText.includes("lead") || lowerText.includes("principal") || lowerText.includes("staff")) {
            value = seededRandom(dimensionSeed, 7, 10)
          } else if (lowerText.includes("mid") || lowerText.includes("pleno") || lowerText.includes("intermediate")) {
            value = seededRandom(dimensionSeed, 4, 7)
          } else if (lowerText.includes("junior") || lowerText.includes("entry")) {
            value = seededRandom(dimensionSeed, 2, 5)
          } else {
            value = seededRandom(dimensionSeed, 3, 6)
          }
        } else if (dimension === "Arquitetura de sistemas") {
          const keywords = ["arquitetura", "architecture", "design patterns", "microservices", "distributed", "system design", "scalability"]
          const matches = keywords.filter(kw => lowerText.includes(kw)).length
          value = matches > 0 ? seededRandom(dimensionSeed, 5 + matches, 10) : seededRandom(dimensionSeed, 1, 4)
        } else if (dimension === "Cloud & infra") {
          const keywords = ["aws", "azure", "gcp", "cloud", "kubernetes", "docker", "devops", "terraform", "infrastructure"]
          const matches = keywords.filter(kw => lowerText.includes(kw)).length
          value = matches > 0 ? seededRandom(dimensionSeed, 4 + matches, 9) : seededRandom(dimensionSeed, 1, 4)
        } else if (dimension === "ML / AI aplicado") {
          const keywords = ["machine learning", "ai", "ml", "deep learning", "neural network", "model", "tensorflow", "pytorch"]
          const matches = keywords.filter(kw => lowerText.includes(kw)).length
          value = matches > 0 ? seededRandom(dimensionSeed, 5 + matches, 10) : seededRandom(dimensionSeed, 0, 3)
        } else if (dimension === "Data engineering") {
          const keywords = ["data", "etl", "pipeline", "spark", "hadoop", "data warehouse", "big data", "sql"]
          const matches = keywords.filter(kw => lowerText.includes(kw)).length
          value = matches > 0 ? seededRandom(dimensionSeed, 4 + matches, 9) : seededRandom(dimensionSeed, 1, 4)
        } else if (dimension === "Liderança / ownership") {
          const keywords = ["lead", "liderança", "manager", "ownership", "team", "mentor", "leadership"]
          const matches = keywords.filter(kw => lowerText.includes(kw)).length
          value = matches > 0 ? seededRandom(dimensionSeed, 5 + matches, 10) : seededRandom(dimensionSeed, 2, 5)
        } else if (dimension === "Produto & negócio") {
          const keywords = ["produto", "product", "business", "negócio", "strategy", "roadmap", "stakeholder"]
          const matches = keywords.filter(kw => lowerText.includes(kw)).length
          value = matches > 0 ? seededRandom(dimensionSeed, 4 + matches, 9) : seededRandom(dimensionSeed, 1, 4)
        } else if (dimension === "Growth / métricas / ROI") {
          const keywords = ["growth", "metrics", "roi", "kpi", "analytics", "conversion", "revenue"]
          const matches = keywords.filter(kw => lowerText.includes(kw)).length
          value = matches > 0 ? seededRandom(dimensionSeed, 4 + matches, 9) : seededRandom(dimensionSeed, 1, 4)
        } else if (dimension === "Pesquisa acadêmica") {
          const keywords = ["phd", "research", "academic", "paper", "publication", "thesis", "conference"]
          const matches = keywords.filter(kw => lowerText.includes(kw)).length
          value = matches > 0 ? seededRandom(dimensionSeed, 6 + matches, 10) : seededRandom(dimensionSeed, 0, 3)
        } else if (dimension === "Comunicação executiva") {
          const keywords = ["presentation", "stakeholder", "executive", "communication", "public speaking"]
          const matches = keywords.filter(kw => lowerText.includes(kw)).length
          value = matches > 0 ? seededRandom(dimensionSeed, 4 + matches, 9) : seededRandom(dimensionSeed, 2, 5)
        } else if (dimension === "Escopo de impacto") {
          const keywords = ["company-wide", "organization", "strategic", "cross-functional", "enterprise"]
          const teamKeywords = ["team", "squad", "department"]
          if (keywords.some(kw => lowerText.includes(kw))) {
            value = seededRandom(dimensionSeed, 7, 10)
          } else if (teamKeywords.some(kw => lowerText.includes(kw))) {
            value = seededRandom(dimensionSeed, 4, 7)
          } else {
            value = seededRandom(dimensionSeed, 2, 5)
          }
        } else if (dimension === "Raridade de perfil") {
          // Calculate based on text uniqueness and length
          const uniquenessScore = Math.min(wordCount / 20, 1)
          value = seededRandom(dimensionSeed + wordCount, 3, 8) + Math.floor(uniquenessScore * 2)
        }
        
        // Ensure value is between 0 and 10
        value = Math.min(Math.max(value, 0), 10)
        
        if (value > 0) {
          mockSkillData[dimension] = value
        }
      })
    }

    return NextResponse.json({
      success: true,
      skillData: mockSkillData,
    })
  } catch (error) {
    console.error("Error parsing skills:", error)
    return NextResponse.json(
      { success: false, error: "Failed to parse skills" },
      { status: 500 }
    )
  }
}
