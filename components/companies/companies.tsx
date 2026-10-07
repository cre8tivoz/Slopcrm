import CompaniesToolbar from "./toolbar/toolbar";
import CompaniesTable from "./table/companies-table";

export default function Companies() {
  return (
    <section id="companies" className="flex min-h-0 min-w-0 flex-1 flex-col">
      <CompaniesToolbar />
      <CompaniesTable />
    </section>
  );
}
