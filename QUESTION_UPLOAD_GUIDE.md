# UdaYantu Question Bank Upload Guide
## Supporting Mathematical, Reasoning, Physics & Chemistry Questions with Diagrams and Equations

---

## Overview

The question bank now supports **advanced content** including:
- ✅ Mathematical equations and formulas (LaTeX support)
- ✅ Physics diagrams and formulas
- ✅ Chemistry molecular structures and equations
- ✅ Reasoning questions with visual diagrams
- ✅ Inline equations in question text and options
- ✅ Explanation diagrams and formulas

---

## Quick Start: 3 Upload Methods

### Method 1: Basic Upload (No Diagrams)
For simple text-based questions - just provide the basic information.

### Method 2: Advanced Upload with LaTeX Equations
For mathematical and scientific content with inline equations.

### Method 3: Premium Upload with Diagrams
For questions with visual diagrams, graphs, or molecular structures.

---

## File Format Details

### CSV Format

#### Basic Format (8 columns)
```
Question, QuestionImageUrl, QuestionLaTeX, Option1, Option2, Option3, Option4, CorrectAnswer, Explanation, Category
```

#### Extended Format (20 columns - with Option Images/LaTeX)
```
Question, QuestionImageUrl, QuestionLaTeX, Option1, Option2, Option3, Option4, 
Option1Image, Option2Image, Option3Image, Option4Image,
CorrectAnswer, Explanation, ExplanationImageUrl, ExplanationLaTeX, Category,
Option1LaTeX, Option2LaTeX, Option3LaTeX, Option4LaTeX
```

### JSON Format

#### Basic Structure
```json
[
  {
    "question": "What is 2 + 2?",
    "options": ["3", "4", "5", "6"],
    "correctAnswer": 1,
    "explanation": "2 + 2 = 4",
    "category": "Mathematical"
  }
]
```

#### Extended Structure (with Diagrams & LaTeX)
```json
[
  {
    "question": "Solve for x",
    "questionLaTeX": "$2x + 5 = 13$",
    "questionImageUrl": "https://example.com/diagram.png",
    "options": ["x = 2", "x = 3", "x = 4", "x = 5"],
    "optionLaTeX": ["$x = 2$", "$x = 3$", "$x = 4$", "$x = 5$"],
    "optionImages": ["url1", "url2", null, null],
    "correctAnswer": 2,
    "explanation": "Solving the equation...",
    "explanationLaTeX": "$2x = 8$, $x = 4$",
    "explanationImageUrl": "https://example.com/solution.png",
    "category": "Mathematical"
  }
]
```

---

## Examples by Subject

### Mathematical Questions

#### Example 1: Equation Solving
```csv
"Solve: $x^2 - 5x + 6 = 0$","","$x^2 - 5x + 6 = 0$","$x = 2, 3$","$x = 1, 6$","$x = 2, 4$","$x = 3, 5$","1","Factor as $(x-2)(x-3)=0$, so $x=2$ or $x=3$","Mathematical"
```

#### Example 2: Algebra with Fractions
```csv
"Simplify: $\frac{2a^2b}{4ab^2}$","","$\frac{2a^2b}{4ab^2}$","$\frac{a}{2b}$","$\frac{2a}{b}$","$ab$","$\frac{1}{2ab}$","1","Cancel common factors: $\frac{2a^2b}{4ab^2} = \frac{a}{2b}$","Mathematical"
```

#### Example 3: Integration (Calculus)
```csv
"Integrate: $\int 2x \, dx$","","$\int 2x \, dx$","$x^2 + C$","$x + C$","$2x^2 + C$","$\frac{x^2}{2} + C$","1","$\int 2x \, dx = 2 \cdot \frac{x^2}{2} + C = x^2 + C$","Mathematical"
```

---

### Physics Questions

#### Example 1: Force and Acceleration
```json
{
  "question": "A 2 kg mass is pulled by a 10 N force. What is its acceleration?",
  "questionImageUrl": "https://example.com/force-diagram.png",
  "options": ["2 m/s²", "5 m/s²", "10 m/s²", "20 m/s²"],
  "correctAnswer": 1,
  "explanation": "Using F = ma, we get a = F/m = 10/2 = 5 m/s²",
  "explanationImageUrl": "https://example.com/force-solution.png",
  "category": "Physics"
}
```

#### Example 2: Projectile Motion
```csv
"A projectile is launched at 45° with initial velocity 20 m/s. Find max height.","https://example.com/projectile.png","$h_{max} = \frac{(v_0 sin\theta)^2}{2g}$","20.4 m","10.2 m","40.8 m","5.1 m","1","$h_{max} = \frac{(20 \times 0.707)^2}{2 \times 10} = 10.2$ m","Physics"
```

#### Example 3: Optics - Lens Formula
```csv
"Using lens formula: $\frac{1}{f} = \frac{1}{u} + \frac{1}{v}$","","$\frac{1}{f} = \frac{1}{u} + \frac{1}{v}$","$f = uv$","$f = \frac{uv}{u+v}$","$f = u + v$","$u = v$","2","The lens formula calculates focal length from object and image distances","Physics"
```

---

### Chemistry Questions

#### Example 1: Atomic Structure
```json
{
  "question": "Which element has electron configuration 1s² 2s² 2p⁶ 3s¹?",
  "options": ["Neon (Ne)", "Sodium (Na)", "Magnesium (Mg)", "Aluminum (Al)"],
  "correctAnswer": 1,
  "explanation": "Sodium (Na) has atomic number 11 with configuration 1s² 2s² 2p⁶ 3s¹ = 11 electrons",
  "category": "Chemistry"
}
```

#### Example 2: Chemical Equations
```csv
"Balance: $H_2 + O_2 \rightarrow H_2O$","","$H_2 + O_2 \\rightarrow H_2O$","$2H_2 + O_2 \\rightarrow 2H_2O$","$H_2 + 2O_2 \\rightarrow H_2O$","$H_2 + O_2 \\rightarrow 2H_2O$","$3H_2 + O_2 \\rightarrow 3H_2O$","1","Balance oxygen: need 2 on both sides, so $2H_2 + O_2 \\rightarrow 2H_2O$","Chemistry"
```

#### Example 3: Redox Reactions
```csv
"In the reaction $2KMnO_4 + ... $, MnO_4^- is ___","https://example.com/redox.png","$MnO_4^-$","Oxidized","Reduced","Dehydrated","Neutralized","2","Mn goes from +7 to +2, so it is reduced (gains electrons)","Chemistry"
```

---

### Reasoning Questions

#### Example 1: Visual Reasoning
```json
{
  "question": "What comes next in this sequence?",
  "questionImageUrl": "https://example.com/sequence-image.png",
  "options": [
    "Pattern A",
    "Pattern B",
    "Pattern C",
    "Pattern D"
  ],
  "optionImages": [
    "https://example.com/pattern-a.png",
    "https://example.com/pattern-b.png",
    "https://example.com/pattern-c.png",
    "https://example.com/pattern-d.png"
  ],
  "correctAnswer": 2,
  "explanation": "The pattern increases by one triangle each step",
  "category": "Reasoning"
}
```

#### Example 2: Logical Reasoning
```csv
"If A is taller than B, and B is taller than C, then___","","","A is taller than C","C is taller than A","A equals C","Cannot determine","1","By transitivity: A > B and B > C means A > C","Reasoning"
```

---

## LaTeX Reference Guide

### Common Mathematical Notations

| Formula | LaTeX Code |
|---------|-----------|
| Fraction | `$\frac{a}{b}$` |
| Square Root | `$\sqrt{x}$` |
| Exponent | `$x^2$` or `$x^{2n}$` |
| Subscript | `$x_1$` or `$x_{n+1}$` |
| Greek Letters | `$\alpha$`, `$\beta$`, `$\pi$`, `$\theta$` |
| Summation | `$\sum_{i=1}^{n} i$` |
| Integration | `$\int_0^1 x \, dx$` |
| Limit | `$\lim_{x \to 0} f(x)$` |
| Arrow | `$\rightarrow$`, `$\leftarrow$` |
| Plus/Minus | `$\pm$` |
| Infinity | `$\infty$` |
| Approximately | `$\approx$` |

---

## Image URL Requirements

### Hosting Your Diagrams
1. **Upload to a cloud service**: Google Drive, OneDrive, Imgur, etc.
2. **Get direct link**: Ensure it's a direct image URL (not a preview/sharing link)
3. **Format**: PNG, JPG, or WebP (recommended)
4. **Size**: Max 2MB per image
5. **Accessibility**: Ensure URL is publicly accessible

### Example Valid URLs
```
https://imgur.com/abc123.png
https://images.unsplash.com/photo-12345.jpg
https://drive.google.com/uc?id=1abc123&export=download
https://example.com/diagrams/physics-01.png
```

### Testing Your URLs
Before uploading, verify each URL:
1. Paste URL in browser - should load image immediately
2. No login/authentication required
3. Image loads within 2 seconds

---

## Upload Process

### Step 1: Prepare Your File
- Choose CSV or JSON format
- Download template from UdaYantu admin panel
- Fill in all required fields
- Validate all URLs work
- Test with 1-2 questions first

### Step 2: Create Subject
- Click "Subject Management"
- Add new subject (e.g., "Physics - Mechanics")
- Select subject before uploading

### Step 3: Download Template
- Click "CSV Template" or "JSON Template"
- This ensures correct column/field structure

### Step 4: Upload File
- Drag-and-drop or click to browse
- System validates all questions
- Red errors: Must fix before upload
- Yellow warnings: Can proceed

### Step 5: Review Errors
- Read each error carefully
- Follow suggestions provided
- Fix rows and re-upload

### Step 6: Confirm Upload
- Once valid, questions are added to bank
- Check "Questions in [Subject]" to verify
- Edit or delete any questions as needed

---

## Troubleshooting

### Common Errors

#### Error: "CSV has 5 columns but expected 8"
**Cause**: Missing columns
**Fix**: Ensure all columns are present: Question, QuestionImageUrl, QuestionLaTeX, Option1-4, CorrectAnswer, Explanation, Category

#### Error: "Correct answer '5' is invalid"
**Cause**: CorrectAnswer must be 1, 2, 3, or 4
**Fix**: Use 1 for first option, 2 for second, etc.

#### Error: "Invalid URL format"
**Cause**: URL doesn't start with http:// or https://
**Fix**: Ensure full URL including protocol

#### Error: "Option field is empty"
**Cause**: One or more options missing
**Fix**: Provide all 4 options (use "" for empty string if needed)

#### LaTeX Not Rendering
**Cause**: Syntax error in LaTeX code
**Fix**: Test LaTeX at https://www.codecogs.com/latex/eqneditor.php

---

## Best Practices

### 1. Quality Content
- ✅ Clear, concise questions
- ✅ Accurate explanations
- ✅ Verified correct answers
- ✅ Professional diagrams

### 2. Consistent Formatting
- Use same LaTeX style throughout
- Consistent category names
- Proper image sizing
- UTF-8 character encoding

### 3. Image Guidelines
- Use high-resolution diagrams (100+ DPI)
- Ensure text is readable
- Test on mobile devices
- Use consistent styling

### 4. Testing
- Upload sample questions first
- Verify display in assessments
- Test on different devices
- Ask students for feedback

---

## Support

For questions or technical issues:
- Email: support@udayantu.com
- Contact: admin@udayantu.com
- Hours: 9 AM - 6 PM IST, Mon-Fri

---

**Updated**: November 2025
**Version**: 2.0 - Advanced Diagrams & Equations Support
