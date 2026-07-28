export default function PageLoader({ text = "Loading..." }) {
  return (
    <div className="page-loader">
      <div className="spinner-border" role="status" />
      <p>{text}</p>
    </div>
  );
}
