# 📋 IELTS Reading Tests - JSON Structure Audit Report
**Generated:** 2025-10-17  
**Files Scanned:** 32 JSON test files  
**Total Issues Found:** 50+

---

## 🚨 Critical Issues

### 1. SENTENCE_COMPLETION Missing `endingsList` (8 files)
**Severity:** HIGH  
**Impact:** Sentence completion questions will not display the list of ending options

| File | Issue |
|------|-------|
| reading13_t4.json | SENTENCE_COMPLETION missing `endingsList` |
| reading14_t2.json | SENTENCE_COMPLETION missing `endingsList` |
| reading16_t3.json | SENTENCE_COMPLETION missing `endingsList` |
| reading17_t2.json | SENTENCE_COMPLETION missing `endingsList` |
| reading17_t3.json | SENTENCE_COMPLETION missing `endingsList` |
| reading18_t1.json | SENTENCE_COMPLETION missing `endingsList` (2 sections) |
| reading19_t2.json | SENTENCE_COMPLETION missing `endingsList` |
| reading19_t3.json | SENTENCE_COMPLETION missing `endingsList` |
| reading20_t3.json | SENTENCE_COMPLETION missing `endingsList` |
| reading20_t4.json | SENTENCE_COMPLETION missing `endingsList` |

**Fix:** Add `endingsList` array with options to section level (not question level)

---

### 2. NOTE_COMPLETION Missing `notesStructure` (10 files)
**Severity:** HIGH  
**Impact:** Note completion questions will not display properly with organized periods/sections

| File | Issue |
|------|-------|
| reading16_t1.json | NOTE_COMPLETION missing `notesStructure` |
| reading17_t3.json | NOTE_COMPLETION missing `notesStructure` |
| reading18_t2.json | NOTE_COMPLETION missing `notesStructure` |
| reading19_t1.json | NOTE_COMPLETION missing `notesStructure` |
| reading19_t2.json | NOTE_COMPLETION missing `notesStructure` |
| reading19_t3.json | NOTE_COMPLETION missing `notesStructure` |
| reading19_t4.json | NOTE_COMPLETION missing `notesStructure` |
| reading20_t2.json | NOTE_COMPLETION missing `notesStructure` |
| reading20_t3.json | NOTE_COMPLETION missing `notesStructure` |
| reading20_t4.json | NOTE_COMPLETION missing `notesStructure` |

**Fix:** Restructure questions to use `notesStructure` with periods and points (like reading20_t1.json)

---

### 3. TABLE_COMPLETION Missing `tableStructure` (3 files)
**Severity:** HIGH  
**Impact:** Table completion questions will not render as tables

| File | Issue |
|------|-------|
| reading16_t1.json | TABLE_COMPLETION missing `tableStructure` |
| reading17_t4.json | TABLE_COMPLETION missing `tableStructure` |
| reading18_t1.json | TABLE_COMPLETION missing `tableStructure` |

**Fix:** Add `tableStructure` object with `headers` and `rows` arrays

---

## ⚠️ Medium Priority Issues

### 4. PARAGRAPH_MATCHING Questions Missing `information` Field (24 questions across 25 files)
**Severity:** MEDIUM  
**Impact:** Paragraph matching questions will display blank text or error

**Affected Files:**
- reading13_t2.json (1)
- reading13_t3.json (2)
- reading13_t4.json (1)
- reading14_t1.json (1)
- reading14_t2.json (1)
- reading14_t3.json (2)
- reading14_t4.json (1)
- reading15_t1.json (1)
- reading15_t2.json (2)
- reading16_t3.json (2)
- reading17_t1.json (1)
- reading17_t2.json (1)
- reading17_t3.json (1)
- reading17_t4.json (2)
- reading18_t1.json (2)
- reading18_t3.json (1)
- reading18_t4.json (1)
- reading19_t1.json (1)
- reading19_t2.json (1)
- reading19_t3.json (1)
- reading19_t4.json (1)
- reading20_t1.json (1)
- reading20_t2.json (1)
- reading20_t4.json (2)

**Fix:** Ensure each question has `information` field (not `statement` or other names)

---

### 5. HEADING_MATCHING Questions Missing `paragraph` Field (6 questions across 6 files)
**Severity:** MEDIUM  
**Impact:** Heading matching questions will display blank paragraph text

| File | Count |
|------|-------|
| reading13_t1.json | 1 |
| reading14_t2.json | 1 |
| reading16_t1.json | 1 |
| reading16_t4.json | 1 |
| reading18_t3.json | 1 |
| reading20_t3.json | 1 |

**Fix:** Ensure each question has `paragraph` field with the paragraph letter/identifier

---

### 6. MULTIPLE_CHOICE Questions Missing `question` Field (30+ questions across 22 files)
**Severity:** MEDIUM  
**Impact:** Multiple choice questions will display blank question text

**Affected Files:**
- reading13_t1.json (1)
- reading13_t4.json (1)
- reading15_t1.json (1)
- reading15_t2.json (1)
- reading15_t3.json (1)
- reading15_t4.json (2)
- reading16_t1.json (1)
- reading16_t2.json (2)
- reading16_t4.json (2)
- reading17_t1.json (1)
- reading17_t2.json (1)
- reading17_t3.json (1)
- reading18_t2.json (1)
- reading18_t3.json (2)
- reading18_t4.json (2)
- reading19_t1.json (1)
- reading19_t2.json (1)
- reading19_t3.json (1)
- reading19_t4.json (1)
- reading20_t1.json (1)
- reading20_t2.json (1)
- reading20_t3.json (1)

**Fix:** Ensure each question has `question` field with the question text

---

## ✅ Verified Working
- ✅ FEATURE_MATCHING - All standardized to `optionsList`
- ✅ TRUE_FALSE_NOT_GIVEN - Consistent structure
- ✅ YES_NO_NOT_GIVEN - Consistent structure
- ✅ SUMMARY_COMPLETION - Consistent with `context` field containing blanks

---

## 📊 Summary Statistics

| Issue Type | Count | Files Affected | Severity |
|-----------|-------|---------------|---------:
| Missing `endingsList` | 10 | 8 | HIGH |
| Missing `notesStructure` | 10 | 10 | HIGH |
| Missing `tableStructure` | 3 | 3 | HIGH |
| Missing `information` | 24 | 25 | MEDIUM |
| Missing `paragraph` | 6 | 6 | MEDIUM |
| Missing `question` | 30+ | 22 | MEDIUM |
| **TOTAL** | **~73 issues** | **All 32 files** | - |

---

## 🔧 Recommended Actions (Priority Order)

1. **HIGH PRIORITY - Fix Section-Level Issues:**
   - [ ] Add `endingsList` to SENTENCE_COMPLETION sections (8 files)
   - [ ] Add `notesStructure` to NOTE_COMPLETION sections (10 files)
   - [ ] Add `tableStructure` to TABLE_COMPLETION sections (3 files)

2. **MEDIUM PRIORITY - Fix Question-Level Fields:**
   - [ ] Add `information` field to PARAGRAPH_MATCHING questions (24 questions)
   - [ ] Add `paragraph` field to HEADING_MATCHING questions (6 questions)
   - [ ] Add `question` field to MULTIPLE_CHOICE questions (30+ questions)

3. **VERIFICATION:**
   - [ ] Re-audit after fixes
   - [ ] Test all question types in browser
   - [ ] Verify all 32 tests render correctly

---

## 📝 Notes
- All files use consistent `questionNumber`, `questionId`, and `correctAnswer` fields ✓
- `optionsList` standardization for FEATURE_MATCHING is complete ✓
- Renderer code supports all question types but JSON structure is incomplete

---

**Status:** 🔴 REQUIRES IMMEDIATE ATTENTION  
**Last Updated:** 2025-10-17 15:30 UTC