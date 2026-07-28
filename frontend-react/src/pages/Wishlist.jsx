import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { wishlistApi, errorMessage } from "../services/api";
import PropertyCard from "../components/PropertyCard";
import PageLoader from "../components/PageLoader";
import EmptyState from "../components/EmptyState";
export default function Wishlist() {
  const [items, setItems] = useState([]),
    [loading, setLoading] = useState(true);
  const load = async () => {
    try {
      setItems((await wishlistApi.list()).data);
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);
  const remove = async (id) => {
    try {
      await wishlistApi.remove(id);
      toast.success("Removed from wishlist");
      load();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };
  if (loading) return <PageLoader />;
  return (
    <section className="portal-page">
      <div className="container">
        <div className="page-heading">
          <span className="section-label">Saved</span>
          <h1>My wishlist</h1>
        </div>
        {!items.length ? (
          <EmptyState
            title="Wishlist is empty"
            text="Save properties you like and compare them later."
          />
        ) : (
          <div className="row g-4">
            {items.map((p) => (
              <div className="col-md-6 col-xl-4" key={p.id}>
                <PropertyCard property={p} />
                <button
                  className="btn btn-outline-danger w-100 mt-2"
                  onClick={() => remove(p.id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
