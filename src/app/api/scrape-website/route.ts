import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Add protocol if missing
    let targetUrl = url.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = "https://" + targetUrl;
    }

    try {
      new URL(targetUrl);
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
    }

    // Fetch the URL
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache"
      },
      next: { revalidate: 0 } // disable Next.js caching
    });

    if (!response.ok) {
      return NextResponse.json({
        error: `Failed to fetch website (HTTP Status ${response.status})`
      }, { status: 400 });
    }

    const html = await response.text();

    // Extract metadata
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : "";

    const getMeta = (nameOrProperty: string) => {
      const regex = new RegExp(
        `<meta[^>]+(?:name|property)=["']${nameOrProperty}["'][^>]+content=["']([^"']+)["']`,
        "i"
      );
      const match = html.match(regex);
      if (match) return match[1];

      // Try reverse order
      const reverseRegex = new RegExp(
        `<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']${nameOrProperty}["']`,
        "i"
      );
      const reverseMatch = html.match(reverseRegex);
      return reverseMatch ? reverseMatch[1] : "";
    };

    const description = getMeta("description") || getMeta("og:description") || "";
    let ogImage = getMeta("og:image") || getMeta("twitter:image") || "";

    // Resolve relative ogImage URL if necessary
    if (ogImage && !/^https?:\/\//i.test(ogImage)) {
      try {
        const base = new URL(targetUrl);
        ogImage = new URL(ogImage, base.origin).toString();
      } catch {
        // keep original if resolution fails
      }
    }

    // Clean HTML Body Content
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    let bodyContent = bodyMatch ? bodyMatch[1] : html;

    // 1. Remove comments
    bodyContent = bodyContent.replace(/<!--[\s\S]*?-->/g, "");

    // 2. Remove script, style, head, noscript, iframe, canvas, etc.
    bodyContent = bodyContent.replace(/<(script|style|head|noscript|iframe|canvas|svg|map|area|embed|object|video|audio)[\s\S]*?<\/\1>/gi, "");

    // 3. Remove inline SVGs specifically if any are left
    bodyContent = bodyContent.replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, "");

    // 4. Remove all attributes except href, src, alt
    bodyContent = bodyContent.replace(/<(\w+)([^>]*)>/g, (match, tag, attrs) => {
      const isSelfClosing = attrs.trim().endsWith("/");
      const allowedAttrs: string[] = [];
      
      const hrefMatch = attrs.match(/href=["']([^"']*)["']/i);
      if (hrefMatch && !hrefMatch[1].startsWith("javascript:")) {
        let hrefVal = hrefMatch[1];
        if (!/^https?:\/\//i.test(hrefVal) && !hrefVal.startsWith("#") && !hrefVal.startsWith("mailto:") && !hrefVal.startsWith("tel:")) {
          try {
            hrefVal = new URL(hrefVal, new URL(targetUrl).origin).toString();
          } catch {}
        }
        allowedAttrs.push(`href="${hrefVal}"`);
      }
      
      const srcMatch = attrs.match(/src=["']([^"']*)["']/i);
      if (srcMatch) {
        let srcVal = srcMatch[1];
        if (!/^https?:\/\//i.test(srcVal) && !srcVal.startsWith("data:")) {
          try {
            srcVal = new URL(srcVal, new URL(targetUrl).origin).toString();
          } catch {}
        }
        allowedAttrs.push(`src="${srcVal}"`);
      }
      
      const altMatch = attrs.match(/alt=["']([^"']*)["']/i);
      if (altMatch) {
        allowedAttrs.push(`alt="${altMatch[1]}"`);
      }

      const attrsStr = allowedAttrs.join(" ");
      return `<${tag}${attrsStr ? " " + attrsStr : ""}${isSelfClosing ? " /" : ""}>`;
    });

    // 5. Compress multiple spaces and newlines
    bodyContent = bodyContent.replace(/\s+/g, " ");

    // Truncate to avoid blowing up LLM context (e.g. 20,000 characters is plenty for a layout clone)
    const originalLength = bodyContent.length;
    if (bodyContent.length > 20000) {
      bodyContent = bodyContent.slice(0, 20000) + "... (truncated)";
    }

    // Extract text content of the page for high-level understanding
    let textContent = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] || html;
    textContent = textContent.replace(/<(script|style|head|noscript|iframe|canvas|svg)[\s\S]*?<\/\1>/gi, "");
    textContent = textContent.replace(/<[^>]*>/g, " ");
    textContent = textContent.replace(/\s+/g, " ").trim();
    if (textContent.length > 8000) {
      textContent = textContent.slice(0, 8000) + "... (truncated)";
    }

    return NextResponse.json({
      title,
      description,
      ogImage,
      cleanHtml: bodyContent.trim(),
      text: textContent,
      originalLength,
      truncated: originalLength > 20000
    });

  } catch (error: any) {
    console.error("Scraping error:", error);
    return NextResponse.json({
      error: error.message || "Failed to scrape the website. Please check the URL and try again."
    }, { status: 500 });
  }
}
