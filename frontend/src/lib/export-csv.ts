export const exportToCSV = (data: any[], filename: string) => {
    if (!data || !data.length) {
        return;
    }

    // Get headers from first object
    const headers = Object.keys(data[0]);

    // Create CSV content
    const csvContent = [
        // Headers row
        headers.join(","),
        // Data rows
        ...data.map((row) =>
            headers
                .map((header) => {
                    const value = row[header];
                    // Handle strings with commas by wrapping in quotes
                    if (typeof value === "string" && value.includes(",")) {
                        return `"${value}"`;
                    }
                    return value;
                })
                .join(",")
        ),
    ].join("\n");

    // Create blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};