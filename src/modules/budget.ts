    import { getWeeklyJournal, setWeeklyBudget, getWeeklyBudget } from "../services/database";

    export async function handleBudgetCommand(msg: any) {
        try {
            const journal = await getWeeklyJournal();
            const totalExpenditure = journal.reduce((acc, entry) => acc + entry.total, 0);
            const weeklyBudget = await getWeeklyBudget();
            if (weeklyBudget === null) {
                msg.reply("Budget mingguan belum diatur.");
                return;
            }
            const remainingBudget = weeklyBudget - totalExpenditure;

            const formatRupiah = (number: number) => {
                return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number);
            };

            const formattedJournal = journal
                .map(
                (entry: { type: string; total: number; desc: string; created_at: string }) =>
                    `${entry.type}, ${formatRupiah(entry.total)}, ${entry.desc} (${entry.created_at})`
                )
                .join("\n");

            msg.reply(
                `Data budget minggu ini:\n\n${formattedJournal}\n\nTotal pengeluaran: ${formatRupiah(totalExpenditure)}\nBudget Mingguan: ${formatRupiah(weeklyBudget)}\nSisa Budget: ${formatRupiah(remainingBudget)}`
            );
        } catch (error) {
            console.error("Error fetching budget data:", error);
            msg.reply("Terjadi kesalahan saat memproses data budget.");
        }
    }

    export async function handleSetBudgetCommand(msg: any) {
        const [, nominal] = msg.body.split(" ");
        if (!nominal || isNaN(Number(nominal))) {
            msg.reply("Format salah. Gunakan: !setBudget <nominal>");
            return;
        }

        try {
            await setWeeklyBudget(Number(nominal));
            msg.reply(`Budget mingguan telah diatur menjadi ${nominal}.`);
        } catch (error) {
            console.error("Error setting weekly budget:", error);
            msg.reply("Terjadi kesalahan saat mengatur budget mingguan.");
        }
    }
