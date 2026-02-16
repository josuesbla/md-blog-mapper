import QuoteIcon from "./quote-icon";
import { marked } from "marked";
import { useMemo } from "react";

interface QuoteProps {
    quote: string;
    author: string;
    authorLink?: string;
}

export default function Quote({ quote, author, authorLink }: QuoteProps) {
    const quoteHtml = useMemo(() => {
        return marked.parseInline(quote) as string;
    }, [quote]);

    return (
        <div className="mt-6 mb-6 flex flex-row items-start gap-4">
            <div className="flex-shrink-0">
                <QuoteIcon />
            </div>
            <div>
                <div className="mb-4 flex items-start gap-3">
                    <div
                        className="text-lg text-gray-800 dark:text-gray-200"
                        dangerouslySetInnerHTML={{ __html: quoteHtml }}
                    />
                </div>
                {author && (
                    <div className="text-lg text-gray-600 italic dark:text-gray-400">
                        <span className="mr-2">—</span>
                        {authorLink ? (
                            <a
                                href={authorLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-red-600 hover:text-red-700"
                            >
                                {author}
                            </a>
                        ) : (
                            author
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
