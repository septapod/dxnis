# Ideation: how to deliver the Tools and Methods take-aways

**Date:** 2026-06-03
**Focus:** How should the Tools and Methods section deliver each method (starting with AI evals) as a usable take-away, given the jobs-to-be-done / channel / modality analysis from the working session.
**Repo surface:** `~/dev/dxnis/tools/` (index.html, evals.html, tools.css, tools.js, README.md)

## Grounding (from the working session, not re-derived by agents)

- **Audience:** credit union and community bank executives, non-technical. Warm (arrive via newsletter, referral, LinkedIn).
- **Jobs to be done:** (1) get a little sharper each week — newsletter; (2) when a method finally applies, understand it enough to act — web; (3) USE it in the real moment — a vendor call, board session, team debrief, offline and usually with other people; (4) share it with the team; (5) find it again when the moment comes.
- **Conclusion reached in session:** the website's job is narrow — teach the method and hand off something to carry into the room. The interactive in-page widget was over-built ("friction dressed as a feature"). Evals is qualitative judgment (notes + a 3-way read), so a spreadsheet is the wrong fit; the take-away wants to be a worksheet you write on.

## Candidates (by frame)

- **A. Print-the-page worksheet** (pain/friction). The print stylesheet turns the page into a clean one-page worksheet: questions + good/dodge reminders + space to mark and note. No separate file. *Basis: direct — the take-away must be writable and brought to a meeting; print is the lowest-friction path.*
- **B. Copyable Google Doc per method** (reframe: take-away is a document). "Make a copy," type notes, share with the team. *Basis: reasoned — covers the type-and-share path paper can't.*
- **C. Repeatable method template / field kit** (leverage/compounding). Standardize the output shape (teach page + a take-away whose form fits the method) and a cheap "add a method" path. *Basis: direct — the library grows weekly from the newsletter; the win is making each addition cheap.*
- **D. Strip on-page interactivity; page is read-only + hands off** (inversion/removal). *Basis: direct — the session concluded the widget is friction.* (Folds into A.)
- **E. Recipe-card analogy** (cross-domain). Cookbook teaches the dish; a printable recipe card goes to the counter. *Basis: reasoned analogy.* (Validates A; folds in.)
- **F. "No website" constraint flip** (constraint-flip). If the method lived only in the newsletter + a linked printable, the web page becomes the permanent, findable mirror the newsletter points to. *Basis: reasoned.* (Folds into the journey idea.)
- **G. Organize the library by the job, not the method name** (reframe findability). "Judge a vendor," "align your team," "size a decision." *Basis: direct — people return when a moment hits.*
- **H. Don't standardize the take-away format across methods** (assumption-breaking). Worksheet for evals, calculator for a numbers method, discussion guide for a board method. *Basis: direct — modality follows the method.*
- **I. Deliver the take-away in the channel they're in** (pain/friction). Each "Try This" ends with a one-click link to the printable on dxn.is. *Basis: reasoned.* (Folds into the journey idea.)

## Rejected (with reasons)

- **Designed fillable PDF per method** — redundant once the page prints clean (A) and a Doc covers typing (B); adds a per-method artifact to maintain.
- **Notion / Coda hosted tool** — off dxn.is, platform dependency, breaks "feels like part of my site."
- **Keep/improve the web widget** (autosave, multi-vendor, export) — wrong modality; the session already retired it.
- **E, F, I as standalone builds** — they are framings/tactics that fold into the survivors below, not distinct approaches.

## Survivors (ranked)

1. **Print-the-page worksheet (A + D + E).** Strip the widget; the page teaches and prints to a clean one-page worksheet. Lowest complexity, fully owned, works offline, matches "bring it to the meeting." Directly fixes evals.
2. **Repeatable method pattern (C + H).** Build evals as instance #1 of a reusable shape: teach page + a take-away whose form fits the method; make future methods cheap. The compounding play.
3. **Copyable Google Doc companion (B).** Adds the digital type-and-share path for teams. Secondary; one Doc + a sharing step per method.
4. **Journey + findability (F + G + I).** Library organized by job, each "Try This" links to the take-away. Cross-channel structural work.

## Recommendation

Zero in on **#2 (the repeatable pattern), with #1 as its first concrete output.** Doing evals as the print-the-page worksheet *and* setting the template in the same pass fixes evals now and makes every future method cheap. #3 and #4 follow.

## Next

`ce-brainstorm` on the chosen option to define requirements, then `ce-plan`, then execute.
