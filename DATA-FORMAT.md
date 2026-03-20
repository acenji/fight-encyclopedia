# Data Format

## Technique JSON Schema

Each technique in Fight Encyclopedia is stored as a JSON file with up to **43 fields**. Below is the schema — field names and types only.

```json
{
  // Identity (5 fields)
  "entityName": "string",
  "englishName": "string",
  "japaneseName": "string (kanji/katakana)",
  "englishJapaneseName": "string (romanized)",
  "translation": "string",

  // Name Origin & Aliases (2 fields)
  "nameOrigin": "traditional | gairaigo | hybrid",
  "aliases": "string (pipe-delimited with ||)",

  // Description (1 field)
  "description": "string (2-4 sentences with [citation] markers)",

  // Technical Details (8 fields)
  "biomechanicalMechanism": "string (pipe-delimited labels with ||)",
  "positionEntryExamples": "string (pipe-delimited positions with ||)",
  "martialArtsUsedIn": "string (pipe-delimited arts)",
  "dangerRating": "string (X/10 | description)",
  "legalityInCompetition": "string (per-organization rules)",
  "variants": "string (pipe-delimited with || and em-dash descriptions)",
  "trainingNotes": "string (long-form, 300-800 words)",
  "commonMistakes": "string (pipe-delimited errors with ||)",

  // Historical (3 fields)
  "historyOrigin": "string (2-3 sentences with citations)",
  "effectiveness": "string",
  "relatedTechniques": "string (pipe-delimited with descriptions)",

  // Metadata (2 fields)
  "tags": "string (comma-separated keywords)",
  "notes": "string",

  // References (4 fields)
  "references": "string (pipe-delimited sources with ||)",
  "referenceUrls": "string (pipe-delimited URLs)",
  "referencePages": "string",
  "referenceNotes": "string (citation mapping)",

  // Academic Credibility (6 fields)
  "primarySource": "string",
  "lineage": "string",
  "competitionRecord": "string",
  "peerReview": "string",
  "lastVerified": "string (YYYY-MM-DD)",
  "mediaEvidence": "string",

  // Fighter Data (5 fields)
  "difficulty": "Beginner | Intermediate | Advanced",
  "physicalAttributes": "string (Requires/Favours/Key muscles format)",
  "counterTechniques": "string (pipe-delimited with descriptions)",
  "setupChain": "string (pipe-delimited steps with ||)",
  "percentageInCompetition": "string",

  // Taxonomy (7 fields)
  "class": "string",
  "group": "string",
  "family": "string",
  "subFamily": "string",
  "genus": "string",
  "species": "string",
  "variety": "string",

  // Flags (1 field)
  "_isPlaceholder": "boolean"
}
```

## Pipe-Delimited Format

Many fields use pipe delimiters for structured sub-data:

- Single pipe `|` starts a new category/label
- Double pipe `||` separates sub-items

Example:
```
"biomechanicalMechanism": "Primary Action | description || Joints Involved | description || Force Vector | description"
```

## Folder Structure

Techniques are organized in the filesystem matching the taxonomy:

```
class/
  [Class Name] [Class]/
    [Group Name] [Group]/
      [Family Name] [Family]/
        [SubFamily Name] [SubFamily]/
          [Genus Name] [Genus]/
            [genus__slug][species__slug][variety__slug].json
```
