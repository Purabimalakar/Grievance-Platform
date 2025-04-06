
// Common keywords that might indicate high priority or urgent grievances
const HIGH_PRIORITY_KEYWORDS = [
  "urgent",
  "emergency",
  "danger",
  "critical",
  "immediate",
  "serious",
  "life-threatening",
  "death",
  "dying"
];

const URGENT_KEYWORDS = [
  "kill",
  "murder",
  "harm",
  "beaten",
  "assault",
  "violence",
  "threat",
  "weapon",
  "gun",
  "knife",
  "accident",
  "fire",
  "flood",
  "collapse"
];

/**
 * Detects the priority level of a grievance based on keywords in the title and description
 * @param title - The grievance title
 * @param description - The grievance description
 * @returns The detected priority level: "normal", "high", or "urgent"
 */
export const detectPriority = (title: string, description: string = ""): "normal" | "high" | "urgent" => {
  const text = `${title} ${description}`.toLowerCase();
  
  // Check for urgent keywords first
  for (const keyword of URGENT_KEYWORDS) {
    if (text.includes(keyword)) {
      return "urgent";
    }
  }
  
  // Then check for high priority keywords
  for (const keyword of HIGH_PRIORITY_KEYWORDS) {
    if (text.includes(keyword)) {
      return "high";
    }
  }
  
  // Default to normal priority
  return "normal";
};

/**
 * Gets the detected keywords from a text
 * @param text - The text to analyze
 * @returns An array of detected keywords
 */
export const getDetectedKeywords = (text: string): string[] => {
  const lowerText = text.toLowerCase();
  const detectedWords = [];
  
  // Check for urgent keywords first as they are more critical
  for (const keyword of URGENT_KEYWORDS) {
    if (lowerText.includes(keyword)) {
      detectedWords.push(keyword);
    }
  }
  
  // Then check for high priority keywords
  for (const keyword of HIGH_PRIORITY_KEYWORDS) {
    if (lowerText.includes(keyword)) {
      detectedWords.push(keyword);
    }
  }
  
  return detectedWords;
};
