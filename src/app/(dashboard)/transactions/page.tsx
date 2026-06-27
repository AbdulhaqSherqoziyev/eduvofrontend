import { TransactionSummary } from './_components/transaction-summary';
import { TransactionTable } from './_components/transaction-table';

/** Transactions ledger — income/expense summary strip + searchable table. */
export default function TransactionsPage() {
  return (
    <section className="flex flex-col gap-5">
      <TransactionSummary />
      <TransactionTable />
    </section>
  );
}
