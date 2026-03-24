import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import AdminSidebar from "../../../components/AdminSidebar";
import { useEffect, useState } from "react";
import api from "../../../utils/api";
import { FiArrowLeft } from "react-icons/fi";

const VendorProfile = () => {
  const { id } = useParams();
  const { vendors } = useSelector((state) => state.vendors);
  const navigate = useNavigate();

  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        setLoading(true);
        if (vendors && vendors.length > 0) {
          const foundVendor = vendors.find((v) => String(v.id) === String(id));
          if (foundVendor) {
            setVendor(foundVendor);
            setLoading(false);
            return;
          }
        }
        const res = await api.get(`/vendor/vendor/${id}`);
        if (res.data && res.data.length > 0) {
          setVendor(res.data[0]);
        } else {
          setVendor(null);
        }
      } catch (error) {
        console.error("Error fetching vendor:", error);
        setVendor(null);
      } finally {
        setLoading(false);
      }
    };

    fetchVendor();
  }, [id, vendors]);

  return (
    <div className="flex h-screen">
      <div className="hidden lg:block fixed top-0 left-0 h-full w-[325px] z-40">
        <AdminSidebar />
      </div>

      <main className="flex-1 ml-0 lg:ml-[325px] mt-[148px] p-3 overflow-y-auto bg-white backdrop-blur-sm shadow-inner [&::-webkit-scrollbar]:hidden scrollbar-none">
        {loading ? (
          <div className="fixed inset-0 backdrop-blur-[1px] flex justify-center items-center z-50">
            <div className="w-6 h-6 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : !vendor ? (
          <div className="text-center text-gray-500">Vendor not found!</div>
        ) : (
          <div className="bg-white">
            <div className="flex items-center gap-2 bg-gray-50 p-2 border border-gray-300 rounded">
              <button onClick={() => navigate("/admin/vendor-master")}>
                <FiArrowLeft size={16} className="cursor-pointer" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <p>
                  <strong>Name:</strong> {vendor.vendor_name}
                </p>
                <p>
                  <strong>Code:</strong> {vendor.vendor_code}
                </p>
                <p>
                  <strong>Short Name:</strong> {vendor.short_name}
                </p>
                <p>
                  <strong>Email:</strong> {vendor.email}
                </p>
                <p>
                  <strong>Phone:</strong> {vendor.phone}
                </p>
                <p>
                  <strong>Mobile:</strong> {vendor.mobile}
                </p>
                <p>
                  <strong>Website:</strong> {vendor.website}
                </p>
              </div>

              <div>
                <p>
                  <strong>Company:</strong> {vendor.company?.company_name}
                </p>
                <p>
                  <strong>Creator:</strong> {vendor.creator?.username}
                </p>
                <p>
                  <strong>Country:</strong> {vendor.country?.country_name}
                </p>
                <p>
                  <strong>State:</strong> {vendor.state?.state_name}
                </p>
                <p>
                  <strong>City:</strong> {vendor.city?.city_name}
                </p>
                <p>
                  <strong>Currency:</strong> {vendor.currency?.currency_code}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={
                      vendor.is_active ? "text-green-600" : "text-red-500"
                    }
                  >
                    {vendor.is_active ? "Active" : "Inactive"}
                  </span>
                </p>
              </div>
            </div>

            <div className="mt-6">
              <p>
                <strong>Billing Address:</strong> {vendor.billing_address}
              </p>
              <p>
                <strong>Shipping Address:</strong> {vendor.shipping_address}
              </p>
              <p>
                <strong>Remarks:</strong> {vendor.remarks}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default VendorProfile;
