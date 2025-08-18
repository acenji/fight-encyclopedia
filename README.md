# Fight Encyclopedia

Currently, there is no single, well-organized place to find precise information about fighting techniques or to search by exact technique or group. 

For most of history, techniques were taught and recorded in isolated schools, much like how plants, animals, and minerals went unclassified until Carl Linnaeus introduced his universal taxonomy in 1735. 

While modern martial arts organizations and combat sports federations focus primarily on competition rules within their own style—such as BJJ, Judo, wrestling, or MMA—there has never been a central system that organizes techniques across disciplines in a consistent, hierarchical way.

The goal of this project is to create a unified classification system for fighting techniques—similar to how minerals, animals, and flowers are scientifically categorized. Instead of Latin, we adopt Japanese terminology, as it has been the most comprehensive and widely accepted language for martial arts over the past centuries.

This encyclopedia organizes techniques in a multi-level hierarchy, from broad categories down to specific variations, and links them to multimedia examples for practical reference.

Visit our official website at [fightencyclopedia.com](https://fightencyclopedia.com)

---
## Data Hierarchy Example

All fight techniques, rules, and related info are organized in **7 levels** of hierarchy.  
This helps users navigate from broad fighting styles to the most detailed variation of a move.

**Example Path:**  
```
Class: Submission    (Level1)
└── Group: Joint Lock   (Level2)
    └── Family: Wrist Lock   (Level3)
        └── SubFamily: Flexion   (Level4)
            └── Genus: Gooseneck   (Level5)
                └── Species: Gooseneck from Top Side Control   (Level6)
                    └── Variety: [e.g., Gooseneck with elbow adjustment, Gooseneck from half guard]   (Level7)
                        └── Leaf-level Multimedia Examples: videos, images, tutorials

⚠️ Contributors working under the MIT License are not required to add multimedia examples directly to the taxonomy or metadata hierarchy. Multimedia is linked to the taxonomy at the variety level for reference only.
```
---
## Example Technique Metadata Table

Below is an example of how a technique is represented in the Fight Encyclopedia dataset, using the classification labels and formatted content.

| Label | Content |
|-------|---------|
| **Entity Name** | Arm Triangle Choke (From Guard – Collar Grip) |
| **English Name** | Head-and-Arm Choke (From Guard – Collar Grip) |
| **Japanese Name** | 肩固め（ガードから・襟取り） |
| **English-Japanese Name** | Kata Gatame (From Guard – Collar Grip) |
| **Translation** | Shoulder Hold / Arm-and-Head Lock (From Guard – Collar Grip) |
| **Aliases** | Collar Grip Arm Triangle from Guard \| Collar Grip Guard Kata Gatame \| Collar Grip Head-and-Arm Choke from Guard |
| **Description** | A collar-grip variation of the arm triangle choke applied from the guard position. The attacker uses one hand to grip the opponent’s collar (gi) while trapping the head and arm, anchoring the choke and increasing shoulder pressure. The hips are pivoted and angled to the side, with the collar grip used to pull the opponent’s posture down while compressing the carotid arteries. |
| **Biomechanical Mechanism** | Action \| Lateral compression of neck and arm with anchored gi grip \|\| Joints Affected \| Neck (carotid arteries), shoulder, upper arm \|\| Torque Direction \| Side pressure from hip angle combined with collar anchor and shoulder drive |
| **Position / Entry Examples** | From closed guard with gi \| Secure deep collar grip with one hand, trap opponent’s arm, pivot hips, and lock head-and-arm position while pulling with collar grip |
| **Martial Arts Used In** | BJJ \| Judo \| Submission Grappling (gi) |
| **Danger Rating** | Danger: 9/10 \| Can render unconscious quickly; requires careful training and fast tap awareness. |
| **Legality in Competition** | IBJJF: Legal (with caution) \| Judo: Legal \| MMA: Not applicable (requires gi) \| Submission Grappling (gi): Legal |
| **Variants** | Collar grip from guard \|\| Standard from closed guard \|\| From failed triangle \|\| From failed armbar \|\| High guard arm triangle |
| **Training Notes** | Use the collar grip to break posture and maintain head control; avoid over-reliance on pulling—combine with proper hip angle and shoulder drive. |
| **History / Origin** | Developed in gi-based grappling arts such as Judo and Brazilian Jiu-Jitsu to enhance control from guard when applying the arm triangle. |
| **Common Mistakes** | Shallow collar grip \|\| Failing to secure opponent’s arm \|\| Insufficient hip angle \|\| Over-pulling instead of compressing laterally |
| **Effectiveness** | Highly effective in gi grappling, especially against strong posture and frame defenses. |
| **Related Techniques** | Gi Ezekiel choke \|\| Collar choke from guard \|\| Triangle choke \|\| Armbar from guard |
| **Tags** | collar grip arm triangle from guard \| gi kata gatame from guard \| head-and-arm choke collar grip \| BJJ \| Judo \| gi submission \| guard submission |
| **Notes** | Often chained after failed collar choke or as a transition from lapel control in guard. |
| **Class** | Submissions |
| **Group** | Chokes and Strangles |
| **Family** | Arm Triangles |
| **SubFamily** | Head-and-Arm Chokes |
| **Genus** | Kata Gatame |
| **Species** | From Guard |
| **Variety** | Collar Grip |

---
## Disciplines Covered

The Fight Encyclopedia is designed to be **style-agnostic** yet precise, allowing techniques to be categorized consistently across martial arts, combat sports, and professional applications.  

Currently, the encyclopedia covers techniques, rules, and metadata from the following disciplines:

- **Brazilian Jiu-Jitsu (BJJ)**
- **Judo**
- **Sambo**
- **Submission Grappling (Gi & No-Gi)**
- **Freestyle Wrestling**
- **Greco-Roman Wrestling**
- **Catch Wrestling**
- **Mixed Martial Arts (MMA)**
- **Boxing**
- **Muay Thai**
- **Kickboxing**
- **Karate**
- **Taekwondo**
- **Aikido**
- **Police / Military Combatives**
- **Self-Defense Systems**

💡 Don’t see your discipline listed? **Join us and contribute!**  
We welcome new martial arts, combat sports, and tactical systems to expand the encyclopedia. Contributions help make the classification system richer and more complete.

---


## Repository Structure

- **Level-1-Top-Categories/**: Contains folders for main categories like Striking, Submissions, Clinch, etc.  
- Each category folder contains subfolders and data files (Excel, CSV, text, Google Sheets, Mac Numbers etc.) representing techniques and their details.  
- **templates/**: Placeholder for data templates such as the technique Excel/CSV template files.  
- **LICENSE**: MIT License for content data files and hierarchy.  
- **LICENSE-ACENJI.txt**: Proprietary license for the Acenji platform, combined datasets, and APIs.

---

### Metadata Hierarchical Subcategory Formatting and Parsing

Note: This section is not the formal classification hierarchy (Class → Variety). It explains how to list multiple categories or sub-items in a single metadata cell in your data files.

To represent hierarchical categories inside a **single metadata cell**, use the following delimiters:

- A **single pipe `|`** always introduces a **new top-level category**  (for that cell).
- A **double pipe `||`** separates sub-items that belong to the top-level category.  

---

#### How to parse the example cell value:
```
Action | action1 || action2 | Affected | affected1 || affected2
```

Breakdown:  
- Start reading left to right in the cell.  
- **`Action`** is a top-level category.  
- Everything after `Action` until the next single pipe `|` (i.e., `action1 || action2`) are sub-items under `Action`. The `||` separates those sub-items.  
- At the next single pipe, **`Affected`** begins a new top-level category.  
- The sub-items after `Affected` until the next single pipe or end (i.e., `affected1 || affected2`) belong to `Affected`.

---

#### Visual grouping:

[Action | action1 || action2] | [Affected | affected1 || affected2]


This means:

- Top-level category: **Action**  
  - Sub-items: `action1`, `action2`  
- Top-level category: **Affected**  
  - Sub-items: `affected1`, `affected2`

---

### Notes:

- The order and placement of the pipes are essential for correct parsing.  
- Do **not** place sub-items separated by `||` before the first top-level category.  
- Additional deeper levels (Level 3+) can be added later with a different delimiter if needed.

Please follow this format consistently when filling hierarchical metadata fields.

## Folder Completion Status

To help track which folders have completed and verified data files, we use a simple marker file system:

- When a folder's data is finalized and ready, create a file named `DONE.txt` inside that folder.  
- The `DONE.txt` file can be empty or contain notes such as completion date, version, or contributor info.  
- Scripts and contributors can check for the presence of `DONE.txt` to know the folder is complete and does not require immediate changes.  

**Example:**  
```
Submissions/
Joint Locks/
Wrist Locks/
DONE.txt
Flexion/
Extension/
```

- This helps avoid duplicated work and clarifies the project's progress at a glance.

Please create or update the `DONE.txt` file when you finish working on a folder's contents.
 

📌 **Contributor Tips:**  
- Use clear and descriptive folder and file names.  
- Each folder contains only relevant files (CSV, TXT, Excel, Google Sheets links, Mac Numbers, etc.).  
- Consider adding a `readme.txt` inside folders to describe contents and guidelines.

---

## Supported Data File Types

- Excel (`.xlsx`)  
- CSV (`.csv`)  
- Plain text (`.txt`)  
- Google Sheets exports or links
- Mac Numbers

---

## Contribution Guide

We welcome contributions to the content data files under the MIT License.  
Please follow the established folder structure and naming conventions.  
Ensure data accuracy and provide sources or references where possible.

---

## Licensing

This repository is dual-licensed:

- [MIT License](./LICENSE) covers the folder hierarchy and individual data files (Excel, CSV, Google Sheets exports, text files, Numbers, etc.).  
- [Acenji Proprietary License](./LICENSE-ACENJI.txt) covers the combined dataset generated by the Acenji platform, the platform software itself, APIs, and related services.

Please review both licenses before contributing or using the data.

---

## Contact

For licensing inquiries or commercial use of the Acenji platform and API, please contact:  
info@acenji.com

---

Thank you for helping build the Fight Encyclopedia!
