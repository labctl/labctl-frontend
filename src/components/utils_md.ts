import { marked } from "marked";
import DOMPurify from "dompurify";

export function md_2_html(md_text: string, default_text = "---"): string {
  // Convert MD to html
  try {
    return DOMPurify.sanitize(
      marked(md_text || default_text, { smartLists: true })
    );
  } catch (error) {
    /* eslint-disable-next-line no-console */
    console.error({ msg: "marked/DOMPurify issue", md_text, error });
    return md_text;
  }
}
