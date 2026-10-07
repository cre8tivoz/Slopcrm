# CONTEXT — Slopcrm domain glossary

The words this codebase uses, and what they mean. A glossary, not a spec — no
implementation details. When a term's meaning changes, change it here first.

| Term                 | Meaning                                                                                                                                                            |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Company**          | An organisation we sell to. The core record. "Account" in UI copy means the same thing; code says Company.                                                         |
| **Owner**            | The salesperson responsible for a Company. Every Company has exactly one.                                                                                          |
| **Segment**          | What kind of customer a Company is: Enterprise, Mid-Market, SMB, Strategic.                                                                                        |
| **Stage**            | Where the relationship sits in the sales motion: New Logo, Upsell, Expansion, Renewal, Pilot, Co-Sell, Land & Expand.                                              |
| **Tag**              | Segment or Stage label on a Company. A Company's tags mix both kinds.                                                                                              |
| **Primary stage**    | The first Stage among a Company's tags, in the Company's own order. Each Company counts in exactly one primary stage. A Company with no Stage tag is **Unstaged**. |
| **Pipeline value**   | Total value of a Company's open business, in dollars.                                                                                                              |
| **Win probability**  | Chance (0–100%) the open business closes.                                                                                                                          |
| **Weighted value**   | Pipeline value × win probability, rounded per Company. Weighted forecast = sum of weighted values.                                                                 |
| **Open deals**       | How many open deals a Company has. A count only — there is no separate Deal record. The Deals Board is a board of Companies by primary stage.                      |
| **Interaction**      | One logged touch with a Company: a type (Demo, Pricing, QBR Call…), a channel (email, meeting, call, internal note), a date and the Owner.                         |
| **Last interaction** | A Company's most recent Interaction. Shown in every view.                                                                                                          |
| **Activity window**  | "Last activity" filter: Companies whose last interaction is within N days.                                                                                         |
| **Demo today**       | The fixed date the demo treats as today. All seed dates are counted back from it.                                                                                  |

## Open questions

- Should **Deal** become its own record (value, stage, close date per deal)? Today it is only a count on Company. Changing that is a product decision, not a refactor.
