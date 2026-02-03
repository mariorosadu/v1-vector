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
    
    // Simple keyword matching for demo purposes
    const text = skillsText.toLowerCase()
    
    dimensions.forEach((dimension: string) => {
      // Default value
      let value = 0
      
      // Add basic keyword matching logic as placeholder
      if (dimension === "Senioridade real") {
        if (text.includes("senior") || text.includes("lead") || text.includes("principal")) value = 8
        else if (text.includes("mid") || text.includes("pleno")) value = 5
        else if (text.includes("junior")) value = 3
      } else if (dimension === "Arquitetura de sistemas") {
        if (text.includes("arquitetura") || text.includes("architecture") || text.includes("design patterns")) value = 7
      } else if (dimension === "Cloud & infra") {
        if (text.includes("aws") || text.includes("azure") || text.includes("gcp") || text.includes("cloud")) value = 6
      } else if (dimension === "ML / AI aplicado") {
        if (text.includes("machine learning") || text.includes("ai") || text.includes("ml") || text.includes("deep learning")) value = 7
      } else if (dimension === "Data engineering") {
        if (text.includes("data") || text.includes("etl") || text.includes("pipeline")) value = 6
      } else if (dimension === "Liderança / ownership") {
        if (text.includes("lead") || text.includes("liderança") || text.includes("manager") || text.includes("ownership")) value = 7
      } else if (dimension === "Produto & negócio") {
        if (text.includes("produto") || text.includes("product") || text.includes("business") || text.includes("negócio")) value = 6
      } else if (dimension === "Growth / métricas / ROI") {
        if (text.includes("growth") || text.includes("metrics") || text.includes("roi") || text.includes("kpi")) value = 5
      } else if (dimension === "Pesquisa acadêmica") {
        if (text.includes("phd") || text.includes("research") || text.includes("academic") || text.includes("paper")) value = 6
      } else if (dimension === "Comunicação executiva") {
        if (text.includes("presentation") || text.includes("stakeholder") || text.includes("executive")) value = 6
      } else if (dimension === "Escopo de impacto") {
        if (text.includes("company-wide") || text.includes("organization") || text.includes("strategic")) value = 7
        else if (text.includes("team") || text.includes("squad")) value = 5
      } else if (dimension === "Raridade de perfil") {
        // Calculate based on combination of other skills
        value = 5
      }
      
      if (value > 0) {
        mockSkillData[dimension] = value
      }
    })

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
