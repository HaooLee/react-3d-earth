export async function Ul(t="") {
    const e = await fetch(t, {
        method: "GET",
        mode: "cors",
        headers: {
            "Content-Type": "application/json"
        }
    });
    if (200 !== e.status)
        throw new Error(`WebGL Globe: Failed to load data.json (status: ${e.status})`);
    return e.json()
}

export function Il() {
    this.array = null
}
