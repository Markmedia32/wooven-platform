import { Construction, Plus } from "lucide-react";

export default function AdminPlaceholderPage({
  title,
  description,
  action,
}) {
  return (
    <>
      <div className="admin-page-heading">
        <div>
          <p>WOOVEN OPERATIONS</p>
          <h1>{title}</h1>
          <span>{description}</span>
        </div>

        {action && (
          <button className="admin-primary-action">
            <Plus size={17} />
            {action}
          </button>
        )}
      </div>

      <section className="admin-placeholder">
        <Construction size={30} />

        <h2>{title} workspace</h2>

        <p>
          This workspace is ready for its live data, actions, and operational
          workflows.
        </p>
      </section>
    </>
  );
}