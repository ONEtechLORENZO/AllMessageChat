function getCsrfToken() {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") ?? "";
}

function parseNonStreamError(text) {
    if (!text) {
        return "The server returned an unexpected empty response.";
    }

    try {
        const parsed = JSON.parse(text);
        return parsed.message || parsed.error || parsed.reply || text;
    } catch {
        return text;
    }
}

export async function streamAgentResponse({ url, body, onDelta, onError, onDone, onMeta }) {
    const headers = {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        "X-Requested-With": "XMLHttpRequest",
    };

    const csrfToken = getCsrfToken();

    if (csrfToken) {
        headers["X-CSRF-TOKEN"] = csrfToken;
    }

    const response = await fetch(url, {
        method: "POST",
        credentials: "same-origin",
        headers,
        body: JSON.stringify(body),
    });

    const contentType = response.headers.get("content-type") || "";

    if (!response.body) {
        throw new Error("Streaming is not supported in this browser.");
    }

    if (!contentType.includes("text/event-stream")) {
        const text = await response.text();
        throw new Error(parseNonStreamError(text));
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let doneSeen = false;

    const dispatchEvent = (rawEvent) => {
        const lines = rawEvent.split(/\r?\n/);
        const dataLines = [];

        for (const line of lines) {
            if (line.startsWith("data:")) {
                dataLines.push(line.slice(5).trimStart());
            }
        }

        if (!dataLines.length) {
            return;
        }

        let payload;

        try {
            payload = JSON.parse(dataLines.join("\n"));
        } catch {
            return;
        }

        if (payload.type === "delta") {
            if (typeof payload.text === "string" && payload.text.length > 0) {
                onDelta?.(payload.text);
            }

            return;
        }

        if (payload.type === "meta") {
            onMeta?.(payload);
            return;
        }

        if (payload.type === "error") {
            onError?.(payload.message || "Unknown error.");
            return;
        }

        if (payload.type === "done" && !doneSeen) {
            doneSeen = true;
            onDone?.();
        }
    };

    while (true) {
        const { value, done } = await reader.read();

        buffer += decoder.decode(value || new Uint8Array(), { stream: !done });

        let boundaryIndex = buffer.indexOf("\n\n");

        while (boundaryIndex !== -1) {
            const rawEvent = buffer.slice(0, boundaryIndex).trim();
            buffer = buffer.slice(boundaryIndex + 2);

            if (rawEvent) {
                dispatchEvent(rawEvent);
            }

            boundaryIndex = buffer.indexOf("\n\n");
        }

        if (done) {
            break;
        }
    }

    if (buffer.trim()) {
        dispatchEvent(buffer.trim());
    }

    if (!doneSeen) {
        onDone?.();
    }
}
