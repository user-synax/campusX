export default function RankedTable({ title, columns = [], rows = [] }) {
    const isEmpty = !rows.length

    return (
        <div className="rounded-xl border border-border bg-card p-4">
            <span className="text-sm font-semibold block mb-3">{title}</span>

            {isEmpty ? (
                <div className="flex items-center justify-center text-muted-foreground text-sm py-6">
                    No data for this period
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left text-xs text-muted-foreground font-medium pb-2 pr-3 w-8">
                                    #
                                </th>
                                {columns.map(col => (
                                    <th
                                        key={col.key}
                                        className="text-left text-xs text-muted-foreground font-medium pb-2 pr-3 last:pr-0"
                                    >
                                        {col.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, i) => (
                                <tr key={i} className="border-b border-border/50 last:border-0">
                                    <td className="py-2 pr-3 text-muted-foreground text-xs tabular-nums">
                                        {i + 1}
                                    </td>
                                    {columns.map(col => (
                                        <td key={col.key} className="py-2 pr-3 last:pr-0">
                                            {col.numeric ? (
                                                <span className="font-medium tabular-nums">
                                                    {typeof row[col.key] === 'number'
                                                        ? row[col.key].toLocaleString()
                                                        : row[col.key] ?? '—'}
                                                </span>
                                            ) : (
                                                <span className="truncate block max-w-[180px]">
                                                    {row[col.key] ?? '—'}
                                                </span>
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
