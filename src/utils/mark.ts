import MarkdownIt from "markdown-it"
import mdi_emoji from "markdown-it-emoji"
import mdi_mark from "markdown-it-mark"

export const mdIt = new MarkdownIt({ breaks: true, linkify: true })
  .use(mdi_emoji as any) // eslint-disable-line @typescript-eslint/no-explicit-any
  .use(mdi_mark as any) // eslint-disable-line @typescript-eslint/no-explicit-any
