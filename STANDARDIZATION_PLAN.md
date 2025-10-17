# 🔧 Phase 2: JSON Standardization Action Plan

## **Goal:** Standardize all 32 JSON files to universal schema

---

## **Priority 1: Critical Fixes (8 files)**

### **Fix SENTENCE_COMPLETION Missing `endingsList`**
Files to fix:
- reading13_t4.json
- reading14_t2.json
- reading16_t3.json
- reading17_t2.json
- reading17_t3.json
- reading18_t1.json
- reading19_t2.json
- reading19_t3.json
- reading20_t3.json
- reading20_t4.json

**Action:** 
For each SENTENCE_COMPLETION section, move the endings options from questions to section level as `optionsList`

**Before:**
```json
{
  "questionType": "SENTENCE_COMPLETION",
  "questions": [
    {
      "questionNumber": 31,
      "sentenceStart": "...",
      "options": ["A - ending 1", "B - ending 2"]
    }
  ]
}
```

**After:**
```json
{
  "questionType": "SENTENCE_COMPLETION",
  "optionsList": ["A - ending 1", "B - ending 2"],
  "questions": [
    {
      "questionNumber": 31,
      "questionId": "q31",
      "sentenceStart": "...",
      "correctAnswer": "A"
    }
  ]
}
```

---

### **Fix NOTE_COMPLETION Missing `notesStructure`**
Files to fix (10):
- reading16_t1.json
- reading17_t3.json
- reading18_t2.json
- reading19_t1.json
- reading19_t2.json
- reading19_t3.json
- reading19_t4.json
- reading20_t2.json
- reading20_t3.json
- reading20_t4.json

**Action:**
Restructure questions with context field to use `notesStructure` with periods and points

**Before:**
```json
{
  "questionType": "NOTE_COMPLETION",
  "questions": [
    {
      "questionNumber": 7,
      "context": "First point with 7_____ here"
    }
  ]
}
```

**After:**
```json
{
  "questionType": "NOTE_COMPLETION",
  "notesTitle": "Title",
  "notesStructure": [
    {
      "period": "Section Name",
      "points": ["First point with 7_____ here"]
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

### **Fix TABLE_COMPLETION Missing `tableStructure`**
Files to fix (3):
- reading16_t1.json
- reading17_t4.json
- reading18_t1.json

**Action:**
Convert questions with context to use `tableStructure`

**Before:**
```json
{
  "questionType": "TABLE_COMPLETION",
  "questions": [
    {
      "questionNumber": 1,
      "context": "Row Label here with 1_____ and 2_____"
    }
  ]
}
```

**After:**
```json
{
  "questionType": "TABLE_COMPLETION",
  "tableStructure": {
    "headers": ["Header 1", "Header 2"],
    "rows": [
      {
        "section": "Row Label",
        "comments": ["Text with 1_____", "More text with 2_____"]
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

## **Priority 2: Medium Fixes (Question-Level Issues)**

### **Fix PARAGRAPH_MATCHING: Add `information` Field**
Affects: ~25 files with 24 questions missing `information`

**Action:**
Ensure each PARAGRAPH_MATCHING question has `information` field

**Before:**
```json
{
  "questionNumber": 14,
  "statement": "Some text"
}
```

**After:**
```json
{
  "questionNumber": 14,
  "questionId": "q14",
  "information": "Some text",
  "correctAnswer": "C"
}
```

---

### **Fix HEADING_MATCHING: Add `paragraph` Field**
Affects: 6 questions across 6 files

**Action:**
Ensure each HEADING_MATCHING question has `paragraph` field

**Before:**
```json
{
  "questionNumber": 14,
  "options": ["i - heading 1"]
}
```

**After:**
```json
{
  "questionNumber": 14,
  "questionId": "q14",
  "paragraph": "A",
  "correctAnswer": "i"
}
```

---

### **Fix MULTIPLE_CHOICE: Add `question` Field**
Affects: ~30 questions across 22 files

**Action:**
Ensure each MULTIPLE_CHOICE question has `question` field

**Before:**
```json
{
  "questionNumber": 27,
  "options": ["A - option 1"]
}
```

**After:**
```json
{
  "questionNumber": 27,
  "questionId": "q27",
  "question": "What is the question text?",
  "options": ["A - option 1", "B - option 2"],
  "correctAnswer": "A"
}
```

---

## **Execution Strategy**

### **Option A: Manual File-by-File (Detailed & Safe)**
- Open each file in editor
- Apply fixes for each question type
- Validate JSON syntax
- Test in browser

**Time:** ~5 hours

### **Option B: Automated Script (Fast)**
- Create PowerShell script to auto-fix common patterns
- Handle SENTENCE_COMPLETION, NOTE_COMPLETION, TABLE_COMPLETION
- Manual verification of results

**Time:** ~30 minutes + verification

### **Option C: Hybrid (Recommended)**
- Use script for Priority 1 (critical fixes)
- Manual verification and fixes
- Fix Priority 2 (medium issues) manually or with assistance

**Time:** ~1-2 hours

---

## **Verification Checklist**

After fixes, verify each file has:

- [ ] All sections have `questionType`
- [ ] FEATURE_MATCHING uses `optionsList`
- [ ] HEADING_MATCHING uses `optionsList` and questions have `paragraph`
- [ ] PARAGRAPH_MATCHING questions have `information`
- [ ] SENTENCE_COMPLETION has `optionsList` at section level
- [ ] SUMMARY_COMPLETION questions have `context` with `_____`
- [ ] TABLE_COMPLETION has `tableStructure`
- [ ] NOTE_COMPLETION has `notesStructure`
- [ ] MULTIPLE_CHOICE questions have `question` and `options`
- [ ] All questions have `questionNumber`, `questionId`, `correctAnswer`
- [ ] TRUE_FALSE_NOT_GIVEN questions have `statement`
- [ ] YES_NO_NOT_GIVEN questions have `statement`
- [ ] Valid JSON syntax (no errors)

---

## **Next Steps**

**Choose your approach:**
1. Manual (safest, tedious)
2. Automated (fastest, needs verification)
3. Hybrid (balanced, recommended)

Then I will proceed with the fixes.

---

**Recommendation:** Let me fix all files automatically with the scripted approach. Takes ~30 mins, very efficient.
**Want me to proceed?** Answer: YES/NO