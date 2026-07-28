export default function EmptyState({
  title = "No data found",
  text = "There is nothing to display yet.",
}) {
  return (
    <div className="empty-state">
      <h4>{title}</h4>
      <p>{text}</p>
    </div>
  );
}
