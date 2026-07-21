export const getAnonymousId = (): string => {
    if (typeof window === "undefined") {
        return "";
    }

    let anonymousId = localStorage.getItem("anonymousId");

    if (!anonymousId) {
        anonymousId = crypto.randomUUID();
        localStorage.setItem("anonymousId", anonymousId);
    }

    return anonymousId;
};