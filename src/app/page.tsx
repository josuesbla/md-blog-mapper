"use client";

import { useState, useMemo } from "react";
import { marked, Marked } from "marked";
import Quote from "@/components/quote";

interface Testimonial {
    quote: string;
    author: string;
    authorLink?: string;
}

interface ContentBlock {
    type: "markdown" | "testimonial";
    content: string;
    html?: string;
    testimonial?: Testimonial;
}

export default function Home() {
    const [markdownContent, setMarkdownContent] = useState("");
    const [blogTitle, setBlogTitle] = useState("");
    const [subtitle, setSubtitle] = useState("");
    const [breadcrumb, setBreadcrumb] = useState("");
    const [readTime, setReadTime] = useState("");
    const [datePosted, setDatePosted] = useState("");
    const [author, setAuthor] = useState("");
    const [authorLink, setAuthorLink] = useState("");
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        const mdFile = files.find(
            (file) =>
                file.name.endsWith(".md") || file.name.endsWith(".markdown")
        );

        if (mdFile) {
            const text = await mdFile.text();
            setMarkdownContent(text);
        } else {
            alert("Please drop a Markdown file (.md or .markdown)");
        }
    };

    const contentBlocks = useMemo(() => {
        if (!markdownContent) return [];

        try {
            const blocks: ContentBlock[] = [];
            const testimonialRegex = /:::testimonial\s+([\s\S]*?):::/g;

            let lastIndex = 0;
            let match;

            while ((match = testimonialRegex.exec(markdownContent)) !== null) {
                // Agregar el contenido markdown antes del testimonial
                if (match.index > lastIndex) {
                    const markdownText = markdownContent.slice(
                        lastIndex,
                        match.index
                    );
                    if (markdownText.trim()) {
                        blocks.push({
                            type: "markdown",
                            content: markdownText,
                        });
                    }
                }

                // Parsear el testimonial
                const content = match[1];
                const lines = content.split(/\r?\n/);
                let author = "";
                let authorLink = "";
                let quote = "";

                for (const line of lines) {
                    const trimmedLine = line.trim();
                    if (trimmedLine.startsWith("author:")) {
                        author = trimmedLine.substring(7).trim();
                    } else if (trimmedLine.startsWith("author_link:")) {
                        authorLink = trimmedLine.substring(12).trim();
                    } else if (trimmedLine.startsWith("quote:")) {
                        quote = trimmedLine
                            .substring(6)
                            .trim()
                            .replace(/^[""]|[""]$/g, "");
                    }
                }

                blocks.push({
                    type: "testimonial",
                    content: "",
                    testimonial: {
                        quote,
                        author,
                        authorLink: authorLink || undefined,
                    },
                });

                lastIndex = match.index + match[0].length;
            }

            // Agregar el contenido markdown después del último testimonial
            if (lastIndex < markdownContent.length) {
                const markdownText = markdownContent.slice(lastIndex);
                if (markdownText.trim()) {
                    blocks.push({
                        type: "markdown",
                        content: markdownText,
                    });
                }
            }

            // Si no hay testimoniales, agregar todo el contenido como markdown
            if (blocks.length === 0 && markdownContent.trim()) {
                blocks.push({
                    type: "markdown",
                    content: markdownContent,
                });
            }

            // Extraer todas las referencias de imagen del markdown completo
            // Formato: [nombre]: url "título opcional"
            const imageReferencesRegex =
                /^\[([^\]]+)\]:\s*(.+?)(?:\s+"(.+)")?\s*$/gm;
            const imageReferences: string[] = [];
            let refMatch;

            while (
                (refMatch = imageReferencesRegex.exec(markdownContent)) !== null
            ) {
                imageReferences.push(refMatch[0]); // Guardar la línea completa de referencia
            }

            // Configurar marked para soporte de GFM y custom renderer para imágenes
            const markedInstance = new Marked({
                gfm: true,
                breaks: true,
            });

            markedInstance.use({
                renderer: {
                    image(token) {
                        const href = token.href || "";
                        const title = token.title || null;
                        const text = token.text || "";
                        const titleAttr = title ? ` title="${title}"` : "";
                        return `<img src="${href}" alt="${text}"${titleAttr} class="markdown-image" style="max-width: 100%; height: auto; display: block;" />`;
                    },
                },
            });

            // Parsear el HTML de los bloques markdown
            blocks.forEach((block) => {
                if (block.type === "markdown") {
                    // Añadir las referencias de imagen al final del bloque
                    const contentWithRefs =
                        block.content + "\n\n" + imageReferences.join("\n");
                    block.html = markedInstance.parse(
                        contentWithRefs
                    ) as string;
                }
            });

            return blocks;
        } catch (error) {
            console.error("Error parsing markdown:", error);
            return [];
        }
    }, [markdownContent]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="flex h-screen">
                {/* Panel Izquierdo - Editor Markdown */}
                <div className="flex w-1/2 flex-col border-r border-gray-300 dark:border-gray-700">
                    <div className="border-b border-gray-300 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Blog Editor (How the fields would look in Contento
                            Editor)
                        </h2>
                    </div>
                    <div className="flex-1 overflow-auto p-8">
                        {/* Formulario de metadatos */}
                        <div className="mb-6 space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Blog Title
                                </label>
                                <input
                                    type="text"
                                    value={blogTitle}
                                    onChange={(e) =>
                                        setBlogTitle(e.target.value)
                                    }
                                    placeholder="Enter blog title..."
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Subtitle
                                </label>
                                <input
                                    type="text"
                                    value={subtitle}
                                    onChange={(e) =>
                                        setSubtitle(e.target.value)
                                    }
                                    placeholder="Enter subtitle..."
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Breadcrumb
                                </label>
                                <input
                                    type="text"
                                    value={breadcrumb}
                                    onChange={(e) =>
                                        setBreadcrumb(e.target.value)
                                    }
                                    placeholder="e.g., Getting Started"
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                />
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    Will display as: Home &gt; Blog &gt; [your
                                    text]
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Read Time
                                    </label>
                                    <input
                                        type="text"
                                        value={readTime}
                                        onChange={(e) =>
                                            setReadTime(e.target.value)
                                        }
                                        placeholder="e.g., 5 min"
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Date Posted
                                    </label>
                                    <input
                                        type="text"
                                        value={datePosted}
                                        onChange={(e) =>
                                            setDatePosted(e.target.value)
                                        }
                                        placeholder="e.g., Jan 15, 2024"
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Author
                                </label>
                                <input
                                    type="text"
                                    value={author}
                                    onChange={(e) => setAuthor(e.target.value)}
                                    placeholder="Enter author name..."
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Author Link
                                </label>
                                <input
                                    type="text"
                                    value={authorLink}
                                    onChange={(e) =>
                                        setAuthorLink(e.target.value)
                                    }
                                    placeholder="https://..."
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                />
                            </div>
                        </div>

                        {/* Editor de Markdown */}
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`relative ${isDragging ? "ring-2 ring-blue-500 ring-offset-2" : ""}`}
                        >
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Markdown Content
                            </label>
                            <textarea
                                value={markdownContent}
                                onChange={(e) =>
                                    setMarkdownContent(e.target.value)
                                }
                                placeholder="Paste your Markdown content here or drag & drop a .md file..."
                                className="h-96 w-full resize-none rounded-lg border border-gray-300 bg-white p-4 font-mono text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                            />
                            {isDragging && (
                                <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg bg-blue-50/90 dark:bg-blue-900/90">
                                    <div className="text-center">
                                        <p className="text-lg font-semibold text-blue-600 dark:text-blue-300">
                                            📄 Drop your Markdown file here
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Panel Derecho - Preview HTML */}
                <div className="flex w-1/2 flex-col">
                    <div className="border-b border-gray-300 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Preview
                        </h2>
                    </div>
                    <div className="flex-1 overflow-auto bg-white dark:bg-gray-800">
                        {/* Hero Banner */}
                        {(blogTitle ||
                            subtitle ||
                            author ||
                            readTime ||
                            datePosted) && (
                            <div
                                className="border-b border-gray-200 px-12 py-16 dark:border-gray-700"
                                style={{
                                    background:
                                        "linear-gradient(102deg,#131457 39.45%,#b02cce 108.24%)",
                                }}
                            >
                                <div className="mx-auto max-w-4xl">
                                    {breadcrumb && (
                                        <div className="mb-4 flex items-center gap-2 text-sm text-white/80">
                                            <span>Home</span>
                                            <span>&gt;</span>
                                            <span>Blog</span>
                                            <span>&gt;</span>
                                            <span className="text-white">
                                                {breadcrumb}
                                            </span>
                                        </div>
                                    )}
                                    {blogTitle && (
                                        <h1 className="mb-4 text-[3rem] font-bold text-white">
                                            {blogTitle}
                                        </h1>
                                    )}
                                    {subtitle && (
                                        <p className="mb-6 text-xl text-white">
                                            {subtitle}
                                        </p>
                                    )}
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-white">
                                        {author && (
                                            <div className="flex items-center">
                                                <span className="font-medium">
                                                    By{" "}
                                                    {authorLink ? (
                                                        <a
                                                            href={authorLink}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-white underline hover:text-gray-200"
                                                        >
                                                            {author}
                                                        </a>
                                                    ) : (
                                                        author
                                                    )}
                                                </span>
                                            </div>
                                        )}
                                        {datePosted && (
                                            <div className="flex items-center">
                                                <span>📅 {datePosted}</span>
                                            </div>
                                        )}
                                        {readTime && (
                                            <div className="flex items-center">
                                                <span>⏱️ {readTime}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="prose dark:prose-invert mx-auto max-w-[48rem] p-8">
                            {contentBlocks.length > 0 ||
                            blogTitle ||
                            subtitle ||
                            author ? (
                                <div className="markdown-content">
                                    {contentBlocks.map((block, index) => {
                                        if (block.type === "testimonial") {
                                            return (
                                                <Quote
                                                    key={index}
                                                    quote={
                                                        block.testimonial!.quote
                                                    }
                                                    author={
                                                        block.testimonial!
                                                            .author
                                                    }
                                                    authorLink={
                                                        block.testimonial!
                                                            .authorLink
                                                    }
                                                />
                                            );
                                        } else {
                                            return (
                                                <div
                                                    key={index}
                                                    dangerouslySetInnerHTML={{
                                                        __html:
                                                            block.html || "",
                                                    }}
                                                />
                                            );
                                        }
                                    })}
                                </div>
                            ) : (
                                <p className="text-gray-400 dark:text-gray-500">
                                    Fill in the blog details to see the preview
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
