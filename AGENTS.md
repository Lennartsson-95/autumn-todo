<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules

- The autumn foliage frame is drawn as two separate side strips (left/right) whose parchment is keyed out to transparency, layered under the content (`z-0` strips, `relative z-10` content). A single full-page cover background cannot keep foliage at the sides across viewport sizes and leaves a visible seam.
- Persistence is localStorage only; no backend is connected. Ask before introducing one.
