export function capitalize(value: string): string {
    const firstLetter = value.charAt(0).toUpperCase();
    const rest = value.slice(1).toLowerCase();

    return `${firstLetter}${rest}`;
}
