/**
 * Question Parser Utility with Support for Diagrams, Equations, and LaTeX
 * Handles parsing of questions from CSV, Excel, and JSON formats with detailed error suggestions
 * Supports mathematical, reasoning, physics, and chemistry content with diagrams and equations
 */

export interface ParsedQuestion {
  question: string;
  questionImageUrl?: string;  // URL to diagram/image in question
  questionLaTeX?: string;     // LaTeX formula for question (e.g., $\frac{a}{b}$)
  options: [string, string, string, string];
  optionImages?: [string?, string?, string?, string?];  // URLs for option diagrams
  optionLaTeX?: [string?, string?, string?, string?];   // LaTeX formulas for options
  correctAnswer: 0 | 1 | 2 | 3;
  explanation: string;
  explanationImageUrl?: string;  // URL to explanation diagram
  explanationLaTeX?: string;     // LaTeX formula in explanation
  category: string;
}

export interface ParseError {
  type: 'parse' | 'validation' | 'format';
  row?: number;
  field?: string;
  value?: string;
  message: string;
  suggestion: string;
}

/**
 * Parse CSV format with support for diagrams and equations
 * Extended format supports up to 16 columns:
 * Question, QuestionImageUrl, QuestionLaTeX, Option1, Option2, Option3, Option4, 
 * Option1Image, Option2Image, Option3Image, Option4Image, CorrectAnswer, Explanation, ExplanationImageUrl, ExplanationLaTeX, Category
 */
export function parseCSV(csvText: string): { questions: ParsedQuestion[], errors: ParseError[] } {
  const lines = csvText.trim().split('\n');
  const questions: ParsedQuestion[] = [];
  const errors: ParseError[] = [];

  if (lines.length < 2) {
    errors.push({
      type: 'format',
      message: 'CSV file is empty or has no data rows',
      suggestion: 'Add at least one question row after the header row',
    });
    return { questions, errors };
  }

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    try {
      const parsed = parseCSVLine(line);
      
      // Support both basic (8 columns) and extended (16 columns) format
      if (parsed.length < 8) {
        errors.push({
          type: 'format',
          row: i + 1,
          message: `Row has ${parsed.length} columns but expected at least 8`,
          suggestion: 'Basic format: Question,QuestionImageUrl,QuestionLaTeX,Option1,Option2,Option3,Option4,CorrectAnswer,Explanation,Category or Extended format with option images/LaTeX',
        });
        continue;
      }

      // Parse basic fields (first 8 columns)
      const question = parsed[0];
      const questionImageUrl = parsed[1]?.trim();
      const questionLaTeX = parsed[2]?.trim();
      const opt1 = parsed[3];
      const opt2 = parsed[4];
      const opt3 = parsed[5];
      const opt4 = parsed[6];
      const correctAnswerStr = parsed[7];
      const explanation = parsed[8] || '';
      const explanationImageUrl = parsed[9]?.trim();
      const explanationLaTeX = parsed[10]?.trim();
      const category = parsed[11] || '';

      // Parse optional image URLs for options (if extended format)
      const optionImage1 = parsed[12]?.trim();
      const optionImage2 = parsed[13]?.trim();
      const optionImage3 = parsed[14]?.trim();
      const optionImage4 = parsed[15]?.trim();

      // Parse optional LaTeX for options (if extended format)
      const optionLaTeX1 = parsed[16]?.trim();
      const optionLaTeX2 = parsed[17]?.trim();
      const optionLaTeX3 = parsed[18]?.trim();
      const optionLaTeX4 = parsed[19]?.trim();

      // Validate required fields
      if (!question?.trim()) {
        errors.push({
          type: 'validation',
          row: i + 1,
          field: 'Question',
          message: 'Question field is empty',
          suggestion: 'Add question text in the first column (or use QuestionImageUrl for diagram)',
        });
        continue;
      }

      if (!opt1?.trim() || !opt2?.trim() || !opt3?.trim() || !opt4?.trim()) {
        errors.push({
          type: 'validation',
          row: i + 1,
          field: 'Options',
          message: 'One or more option fields are empty',
          suggestion: 'Provide all 4 options. Use "" to indicate empty string.',
        });
        continue;
      }

      if (!correctAnswerStr?.trim()) {
        errors.push({
          type: 'validation',
          row: i + 1,
          field: 'CorrectAnswer',
          message: 'Correct answer field is empty',
          suggestion: 'Enter 1, 2, 3, or 4 to indicate which option is correct',
        });
        continue;
      }

      const correctAnswer = parseInt(correctAnswerStr.trim()) - 1;
      if (isNaN(correctAnswer) || correctAnswer < 0 || correctAnswer > 3) {
        errors.push({
          type: 'validation',
          row: i + 1,
          field: 'CorrectAnswer',
          value: correctAnswerStr.trim(),
          message: `Correct answer "${correctAnswerStr.trim()}" is invalid`,
          suggestion: 'Use 1, 2, 3, or 4 only (1 for Option1, 2 for Option2, etc.)',
        });
        continue;
      }

      if (!explanation?.trim()) {
        errors.push({
          type: 'validation',
          row: i + 1,
          field: 'Explanation',
          message: 'Explanation field is empty',
          suggestion: 'Provide explanation for why this is the correct answer',
        });
        continue;
      }

      if (!category?.trim()) {
        errors.push({
          type: 'validation',
          row: i + 1,
          field: 'Category',
          message: 'Category field is empty',
          suggestion: 'Use: Mathematical, Reasoning, Physics, Chemistry, Quantitative, Logical, Verbal, General Knowledge',
        });
        continue;
      }

      // Validate image URLs if provided
      if (questionImageUrl && !isValidUrl(questionImageUrl)) {
        errors.push({
          type: 'validation',
          row: i + 1,
          field: 'QuestionImageUrl',
          value: questionImageUrl,
          message: `Invalid URL format: ${questionImageUrl}`,
          suggestion: 'Provide a valid image URL starting with http:// or https://',
        });
        continue;
      }

      const questionData: ParsedQuestion = {
        question: question.trim(),
        options: [opt1.trim(), opt2.trim(), opt3.trim(), opt4.trim()] as [string, string, string, string],
        correctAnswer: correctAnswer as 0 | 1 | 2 | 3,
        explanation: explanation.trim(),
        category: category.trim(),
      };

      // Add optional fields
      if (questionImageUrl) questionData.questionImageUrl = questionImageUrl;
      if (questionLaTeX) questionData.questionLaTeX = questionLaTeX;
      if (optionImage1 || optionImage2 || optionImage3 || optionImage4) {
        questionData.optionImages = [optionImage1, optionImage2, optionImage3, optionImage4];
      }
      if (optionLaTeX1 || optionLaTeX2 || optionLaTeX3 || optionLaTeX4) {
        questionData.optionLaTeX = [optionLaTeX1, optionLaTeX2, optionLaTeX3, optionLaTeX4];
      }
      if (explanationImageUrl) questionData.explanationImageUrl = explanationImageUrl;
      if (explanationLaTeX) questionData.explanationLaTeX = explanationLaTeX;

      questions.push(questionData);
    } catch (error: any) {
      errors.push({
        type: 'parse',
        row: i + 1,
        message: `Failed to parse row: ${error.message}`,
        suggestion: 'Check for unclosed quotes or special characters. Use "" to escape quotes.',
      });
    }
  }

  if (questions.length === 0 && errors.length === 0) {
    errors.push({
      type: 'format',
      message: 'No valid questions found in CSV',
      suggestion: 'Ensure each row has all required columns with valid data',
    });
  }

  return { questions, errors };
}

/**
 * Parse CSV line with quote handling
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

/**
 * Parse JSON format with support for diagrams and equations
 */
export function parseJSON(jsonText: string): { questions: ParsedQuestion[], errors: ParseError[] } {
  const questions: ParsedQuestion[] = [];
  const errors: ParseError[] = [];

  let data: any;
  try {
    data = JSON.parse(jsonText);
  } catch (error: any) {
    errors.push({
      type: 'parse',
      message: `Invalid JSON format: ${error.message}`,
      suggestion: 'Ensure your JSON is valid. Use online JSON validators if needed.',
    });
    return { questions, errors };
  }

  if (!Array.isArray(data)) {
    errors.push({
      type: 'format',
      message: 'JSON must be an array of questions',
      suggestion: 'Start with [ and end with ], containing question objects',
    });
    return { questions, errors };
  }

  if (data.length === 0) {
    errors.push({
      type: 'format',
      message: 'JSON array is empty',
      suggestion: 'Add at least one question object to the array',
    });
    return { questions, errors };
  }

  data.forEach((item: any, index: number) => {
    try {
      // Validate question field
      if (!item.question || typeof item.question !== 'string' || !item.question.trim()) {
        errors.push({
          type: 'validation',
          row: index + 1,
          field: 'question',
          message: `Question ${index + 1}: "question" field is missing or empty`,
          suggestion: 'Add "question": "Your question text?" to each object',
        });
        return;
      }

      // Validate options field
      if (!Array.isArray(item.options) || item.options.length !== 4) {
        errors.push({
          type: 'validation',
          row: index + 1,
          field: 'options',
          message: `Question ${index + 1}: "options" must be array of exactly 4 strings`,
          suggestion: `Use "options": ["Option1", "Option2", "Option3", "Option4"]`,
        });
        return;
      }

      // Validate each option
      item.options.forEach((opt: any, i: number) => {
        if (typeof opt !== 'string' || !opt.trim()) {
          errors.push({
            type: 'validation',
            row: index + 1,
            field: `options[${i}]`,
            message: `Question ${index + 1}: Option ${i + 1} is empty or not a string`,
            suggestion: `Provide text for option ${i + 1}`,
          });
        }
      });

      if (item.options.some((o: any) => typeof o !== 'string' || !o.trim())) return;

      // Validate correctAnswer
      const correctAnswer = item.correctAnswer;
      if (correctAnswer === undefined || correctAnswer === null) {
        errors.push({
          type: 'validation',
          row: index + 1,
          field: 'correctAnswer',
          message: `Question ${index + 1}: "correctAnswer" field is missing`,
          suggestion: 'Add "correctAnswer": 0 (or 1, 2, 3 for other options)',
        });
        return;
      }

      if (typeof correctAnswer !== 'number' || correctAnswer < 0 || correctAnswer > 3) {
        errors.push({
          type: 'validation',
          row: index + 1,
          field: 'correctAnswer',
          value: String(correctAnswer),
          message: `Question ${index + 1}: correctAnswer "${correctAnswer}" is invalid (must be 0-3)`,
          suggestion: 'Use 0 for Option1, 1 for Option2, 2 for Option3, 3 for Option4',
        });
        return;
      }

      // Validate explanation
      if (!item.explanation || typeof item.explanation !== 'string' || !item.explanation.trim()) {
        errors.push({
          type: 'validation',
          row: index + 1,
          field: 'explanation',
          message: `Question ${index + 1}: "explanation" field is missing or empty`,
          suggestion: 'Add "explanation": "Why this is the correct answer"',
        });
        return;
      }

      // Validate category
      if (!item.category || typeof item.category !== 'string' || !item.category.trim()) {
        errors.push({
          type: 'validation',
          row: index + 1,
          field: 'category',
          message: `Question ${index + 1}: "category" field is missing or empty`,
          suggestion: 'Use: "Mathematical", "Reasoning", "Physics", "Chemistry", "Quantitative", "Logical", "Verbal"',
        });
        return;
      }

      const questionData: ParsedQuestion = {
        question: item.question.trim(),
        options: item.options.map((o: string) => o.trim()) as [string, string, string, string],
        correctAnswer: correctAnswer as 0 | 1 | 2 | 3,
        explanation: item.explanation.trim(),
        category: item.category.trim(),
      };

      // Add optional fields
      if (item.questionImageUrl && typeof item.questionImageUrl === 'string') {
        questionData.questionImageUrl = item.questionImageUrl;
      }
      if (item.questionLaTeX && typeof item.questionLaTeX === 'string') {
        questionData.questionLaTeX = item.questionLaTeX;
      }
      if (Array.isArray(item.optionImages)) {
        questionData.optionImages = item.optionImages as [string?, string?, string?, string?];
      }
      if (Array.isArray(item.optionLaTeX)) {
        questionData.optionLaTeX = item.optionLaTeX as [string?, string?, string?, string?];
      }
      if (item.explanationImageUrl && typeof item.explanationImageUrl === 'string') {
        questionData.explanationImageUrl = item.explanationImageUrl;
      }
      if (item.explanationLaTeX && typeof item.explanationLaTeX === 'string') {
        questionData.explanationLaTeX = item.explanationLaTeX;
      }

      questions.push(questionData);
    } catch (error: any) {
      errors.push({
        type: 'parse',
        row: index + 1,
        message: `Failed to parse question ${index + 1}: ${error.message}`,
        suggestion: 'Check that all required fields exist with correct types',
      });
    }
  });

  if (questions.length === 0 && errors.length === 0) {
    errors.push({
      type: 'format',
      message: 'No valid questions parsed from JSON',
      suggestion: 'Check the structure and ensure all required fields are present',
    });
  }

  return { questions, errors };
}

/**
 * Validate URL format
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Detect file format and parse accordingly
 */
export async function parseQuestionFile(file: File): Promise<{ questions: ParsedQuestion[], errors: ParseError[] }> {
  const text = await file.text();

  if (file.name.endsWith('.json')) {
    return parseJSON(text);
  } else if (file.name.endsWith('.csv')) {
    return parseCSV(text);
  } else {
    // Try JSON first, then CSV
    try {
      return parseJSON(text);
    } catch {
      return parseCSV(text);
    }
  }
}

/**
 * Generate CSV template with support for diagrams and equations
 */
export function generateCSVTemplate(): string {
  const headers = [
    'Question',
    'QuestionImageUrl',
    'QuestionLaTeX',
    'Option1',
    'Option2',
    'Option3',
    'Option4',
    'CorrectAnswer',
    'Explanation',
    'ExplanationImageUrl',
    'ExplanationLaTeX',
    'Category',
  ];
  
  const basicExample = [
    '"What is 2 + 2?"',
    '',
    '',
    '3',
    '4',
    '5',
    '6',
    '2',
    '"2 + 2 = 4"',
    '',
    '',
    'Mathematical',
  ];

  const mathExample = [
    '"Solve for x: $2x + 5 = 13$"',
    '',
    '$2x + 5 = 13$',
    '$x = 2$',
    '$x = 3$',
    '$x = 4$',
    '$x = 5$',
    '3',
    '"$2x + 5 = 13$ means $2x = 8$, so $x = 4$"',
    '',
    '$x = \\frac{8}{2} = 4$',
    'Mathematical',
  ];

  return (
    headers.join(',') + '\n' +
    basicExample.join(',') + '\n' +
    mathExample.join(',')
  );
}

/**
 * Generate JSON template with support for diagrams and equations
 */
export function generateJSONTemplate(): string {
  return JSON.stringify(
    [
      {
        question: 'What is the capital of India?',
        options: ['Mumbai', 'New Delhi', 'Bangalore', 'Kolkata'],
        correctAnswer: 1,
        explanation: 'New Delhi is the capital and center of government of India.',
        category: 'General Knowledge',
      },
      {
        question: 'Solve for x: 2x + 5 = 13',
        questionLaTeX: '$2x + 5 = 13$',
        options: ['x = 2', 'x = 3', 'x = 4', 'x = 5'],
        optionLaTeX: ['$x = 2$', '$x = 3$', '$x = 4$', '$x = 5$'],
        correctAnswer: 2,
        explanation: '2x + 5 = 13 means 2x = 8, so x = 4',
        explanationLaTeX: '$2x = 13 - 5 = 8$, $x = \\frac{8}{2} = 4$',
        category: 'Mathematical',
      },
      {
        question: 'Which element has atomic number 6?',
        options: ['Nitrogen', 'Carbon', 'Oxygen', 'Boron'],
        correctAnswer: 1,
        explanation: 'Carbon (C) has atomic number 6 with electron configuration 1s² 2s² 2p²',
        category: 'Chemistry',
      },
      {
        question: 'A force F acts on a mass. Find acceleration.',
        questionImageUrl: 'https://example.com/physics-diagram.png',
        options: ['a = F/m', 'a = m*F', 'a = F+m', 'a = F-m'],
        optionImages: [
          'https://example.com/option1-diagram.png',
          '',
          '',
          ''
        ],
        correctAnswer: 0,
        explanation: 'According to Newton\'s second law, F = ma, therefore a = F/m',
        category: 'Physics',
      },
    ],
    null,
    2
  );
}

/**
 * Validate questions array
 */
export function validateQuestions(questions: ParsedQuestion[]): { valid: boolean; error?: string } {
  if (!Array.isArray(questions) || questions.length === 0) {
    return { valid: false, error: 'Questions array is empty' };
  }

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    if (!q.question || !q.options || q.options.length !== 4 || q.correctAnswer === undefined || !q.explanation) {
      return { valid: false, error: `Question ${i + 1} is incomplete` };
    }
  }

  return { valid: true };
}
