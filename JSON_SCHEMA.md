# 📋 Universal JSON Schema for IELTS Reading Tests

## **Goal:** One unified structure for all question types with universal key-value pairs

---

## **Root Structure**
```json
{
  "test": {
    "title": "string",
    "type": "IELTS_READING",
    "totalTime": 60,
    "totalQuestions": 40,
    "passages": [...]
  }
}
```

---

## **Passage Structure**
```json
{
  "id": "passage_1",
  "title": "string",
  "passageNumber": 1,
  "recommendedTime": 20,
  "contentUrl": "string (passage text)",
  "questionSections": [...]
}
```

---

## **Universal Question Section Structure**

### **For ALL Question Types:**
```json
{
  "sectionId": "section_1_1",
  "instructions": "string",
  "questionType": "ENUM",
  "optionsList": [],  // ← UNIVERSAL for matching types
  "questions": [...]
}
```

---

## **Question Type Specific Fields**

### **1️⃣ FEATURE_MATCHING**
```json
{
  "sectionId": "section_2_2",
  "instructions": "Look at the following statements...",
  "questionType": "FEATURE_MATCHING",
  "optionsList": ["A - Person 1", "B - Person 2", "C - Person 3"],
  "questions": [
    {
      "questionNumber": 19,
      "questionId": "q19",
      "statement": "Statement text here",
      "correctAnswer": "A"
    }
  ]
}
```

---

### **2️⃣ HEADING_MATCHING**
```json
{
  "sectionId": "section_1_1",
  "instructions": "Which paragraph contains...",
  "questionType": "HEADING_MATCHING",
  "optionsList": ["i - Heading 1", "ii - Heading 2", "iii - Heading 3"],
  "questions": [
    {
      "questionNumber": 14,
      "questionId": "q14",
      "paragraph": "A",
      "correctAnswer": "i"
    }
  ]
}
```

---

### **3️⃣ PARAGRAPH_MATCHING**
```json
{
  "sectionId": "section_2_1",
  "instructions": "Which paragraph contains...",
  "questionType": "PARAGRAPH_MATCHING",
  "questions": [
    {
      "questionNumber": 14,
      "questionId": "q14",
      "information": "Reference to something specific",
      "correctAnswer": "C"
    }
  ]
}
```

---

### **4️⃣ SENTENCE_COMPLETION**
```json
{
  "sectionId": "section_3_2",
  "instructions": "Complete each sentence...",
  "questionType": "SENTENCE_COMPLETION",
  "optionsList": ["A - ending 1", "B - ending 2", "C - ending 3", "D - ending 4"],
  "questions": [
    {
      "questionNumber": 31,
      "questionId": "q31",
      "sentenceStart": "The researchers found that...",
      "correctAnswer": "B"
    }
  ]
}
```

---

### **5️⃣ SUMMARY_COMPLETION**
```json
{
  "sectionId": "section_2_3",
  "instructions": "Complete the summary...",
  "questionType": "SUMMARY_COMPLETION",
  "summaryTitle": "Title of Summary",
  "questions": [
    {
      "questionNumber": 24,
      "questionId": "q24",
      "context": "Text before blank _____ text after blank",
      "correctAnswer": "word"
    }
  ]
}
```

---

### **6️⃣ TABLE_COMPLETION**
```json
{
  "sectionId": "section_1_1",
  "instructions": "Complete the table...",
  "questionType": "TABLE_COMPLETION",
  "tableStructure": {
    "headers": ["Column 1", "Column 2"],
    "rows": [
      {
        "section": "Row Label",
        "comments": [
          "Text with 1_____ blank",
          "More text with 2_____ blank"
        ]
      }
    ]
  },
  "questions": [
    {
      "questionNumber": 1,
      "questionId": "q1",
      "correctAnswer": "answer"
    }
  ]
}
```

---

### **7️⃣ NOTE_COMPLETION**
```json
{
  "sectionId": "section_1_2",
  "instructions": "Complete the notes...",
  "questionType": "NOTE_COMPLETION",
  "notesTitle": "Title of Notes",
  "notesStructure": [
    {
      "period": "Section Header",
      "points": [
        "Point with 7_____ blank",
        "Another point with 8_____ blank"
      ]
    }
  ],
  "questions": [
    {
      "questionNumber": 7,
      "questionId": "q7",
      "correctAnswer": "answer"
    }
  ]
}
```

---

### **8️⃣ MULTIPLE_CHOICE**
```json
{
  "sectionId": "section_3_1",
  "instructions": "Choose the correct letter...",
  "questionType": "MULTIPLE_CHOICE",
  "questions": [
    {
      "questionNumber": 27,
      "questionId": "q27",
      "question": "What is the question?",
      "options": [
        "A - option 1",
        "B - option 2",
        "C - option 3",
        "D - option 4"
      ],
      "correctAnswer": "C"
    }
  ]
}
```

---

### **9️⃣ TRUE_FALSE_NOT_GIVEN**
```json
{
  "sectionId": "section_1_2",
  "instructions": "Write TRUE, FALSE, or NOT GIVEN...",
  "questionType": "TRUE_FALSE_NOT_GIVEN",
  "questions": [
    {
      "questionNumber": 8,
      "questionId": "q8",
      "statement": "Statement to evaluate",
      "correctAnswer": "TRUE"
    }
  ]
}
```

---

### **🔟 YES_NO_NOT_GIVEN**
```json
{
  "sectionId": "section_3_3",
  "instructions": "Write YES, NO, or NOT GIVEN...",
  "questionType": "YES_NO_NOT_GIVEN",
  "questions": [
    {
      "questionNumber": 36,
      "questionId": "q36",
      "statement": "Statement to evaluate",
      "correctAnswer": "YES"
    }
  ]
}
```

---

## **Universal Question Fields**

### **All Questions MUST Have:**
```json
{
  "questionNumber": number,      // 1-40
  "questionId": string,           // "q1", "q2", etc.
  "correctAnswer": string         // Answer value
}
```

### **Question Type Specific Fields:**
| Type | Required Fields |
|------|-----------------|
| FEATURE_MATCHING | statement |
| HEADING_MATCHING | paragraph |
| PARAGRAPH_MATCHING | information |
| SENTENCE_COMPLETION | sentenceStart |
| SUMMARY_COMPLETION | context |
| MULTIPLE_CHOICE | question, options |
| TRUE_FALSE_NOT_GIVEN | statement |
| YES_NO_NOT_GIVEN | statement |
| TABLE_COMPLETION | (none - uses tableStructure) |
| NOTE_COMPLETION | (none - uses notesStructure) |

---

## **Section-Level Optional Fields**

| Field | Used By | Format |
|-------|---------|--------|
| optionsList | FEATURE_MATCHING, HEADING_MATCHING, SENTENCE_COMPLETION | Array of strings |
| tableStructure | TABLE_COMPLETION | {headers: [], rows: []} |
| notesStructure | NOTE_COMPLETION | [{period: string, points: []}] |
| summaryTitle | SUMMARY_COMPLETION | String |

---

## **Standardization Rules**

### ✅ DO:
- Use **optionsList** for all matching types
- Use **statement** for True/False/Yes/No questions
- Use **information** for PARAGRAPH_MATCHING
- Use **question** for MULTIPLE_CHOICE
- Use **context** for SUMMARY_COMPLETION with `_____` placeholders
- Use **sentenceStart** for SENTENCE_COMPLETION
- Use **paragraph** for HEADING_MATCHING
- Use `X_____` format in TABLE_COMPLETION/NOTE_COMPLETION comments

### ❌ DON'T:
- ❌ Use peopleList, researchersList, companiesList, etc.
- ❌ Mix field names (don't use both "statement" and "information")
- ❌ Use context for HEADING_MATCHING questions
- ❌ Use different answer formats

---

## **Example of Perfect Structure**

```json
{
  "test": {
    "title": "Cambridge IELTS 20 Reading Test 1",
    "type": "IELTS_READING",
    "totalTime": 60,
    "totalQuestions": 40,
    "passages": [
      {
        "id": "passage_1",
        "title": "The kākāpō",
        "passageNumber": 1,
        "recommendedTime": 20,
        "contentUrl": "Passage text here...",
        "questionSections": [
          {
            "sectionId": "section_1_1",
            "instructions": "Do the following statements...",
            "questionType": "TRUE_FALSE_NOT_GIVEN",
            "questions": [
              {
                "questionNumber": 1,
                "questionId": "q1",
                "statement": "Statement here",
                "correctAnswer": "TRUE"
              }
            ]
          },
          {
            "sectionId": "section_1_2",
            "instructions": "Complete the notes...",
            "questionType": "NOTE_COMPLETION",
            "notesTitle": "Title",
            "notesStructure": [
              {
                "period": "Section",
                "points": ["Text with 7_____"]
              }
            ],
            "questions": [
              {
                "questionNumber": 7,
                "questionId": "q7",
                "correctAnswer": "answer"
              }
            ]
          }
        ]
      }
    ]
  }
}
```

---

## **Status**
✅ Schema Complete
Next Step: Standardize all 32 JSON files to match this schema