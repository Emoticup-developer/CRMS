import { useLocation, useNavigate } from "react-router-dom";
import vendorConfig from "../../config/vendorConfig";
import { useEffect, useRef, useState } from "react";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import { FiPlus, FiSave, FiSearch, FiUsers } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchVenderQuotations,
  fetchQuotationTypes,
  fetchUsers,
  fetchCompanies,
  createVenderQuotation,
} from "../../store/slices/vendors/vendorsQuotationsSlice";
import { FaTimes } from "react-icons/fa";
import dayjs from "dayjs";
import VendorSidebar from "../../components/VendorSidebar";

const VendorQuotations = () => {
  const dispatch = useDispatch();

  const { quotationTypes = [], vendorQuotations = [] } = useSelector(
    (state) => state.vendorsQuotations || {},
  );

  // ✅ LOGGED IN VENDOR
  const loggedInVendorId = useSelector((state) => state.auth?.user?.vendor_id);

  const location = useLocation();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 4;

  const [showQuotationTypeScreen, setShowQuotationTypeScreen] = useState(true);
  const [quotationType, setQuotationType] = useState("");

  const [rows, setRows] = useState([
    {
      quotation_number: "",
      quotation: null,
      date_of_quotation: "",
      quantity: "",
      lead_time_days: "",
    },
  ]);

  const [message, setMessage] = useState({ text: "", type: "" });

  const showTemporaryMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  useEffect(() => {
    dispatch(fetchVenderQuotations());
    dispatch(fetchQuotationTypes());
    dispatch(fetchUsers());
    dispatch(fetchCompanies());
  }, [dispatch]);

  // ---------------- ADD ROW ----------------
  const handleAddRow = () => {
    setRows((prev) => [
      ...prev,
      {
        quotation_number: "",
        quotation: null,
        date_of_quotation: "",
        quantity: "",
        lead_time_days: "",
      },
    ]);
  };

  // ---------------- CONTINUE ----------------
  const handleContinue = () => {
    if (!quotationType) {
      showTemporaryMessage("Please select quotation type", "error");
      return;
    }
    setShowQuotationTypeScreen(false);
  };

  // ---------------- ROW CHANGE ----------------
  const handleRowChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;
    setRows(updatedRows);
  };

  // ---------------- SAVE ROW ----------------
  const handleSaveRow = async (row, index) => {
    try {
      const formData = new FormData();

      // ✅ AUTO VENDOR
      formData.append("vendor", loggedInVendorId);

      // ✅ REQUIRED FIELD
      formData.append("quotation_type", quotationType);

      formData.append("quotation_number", row.quotation_number);
      formData.append("date_of_quotation", row.date_of_quotation);
      formData.append("quantity", row.quantity);
      formData.append("lead_time_days", row.lead_time_days);

      if (row.quotation) {
        formData.append("quotation", row.quotation);
      }

      const res = await dispatch(createVenderQuotation(formData)).unwrap();

      if (res.status === 200 || res.status === 201) {
        showTemporaryMessage("Quotation added successfully");

        setRows((prev) => prev.filter((_, i) => i !== index));
      }
    } catch (error) {
      console.log("Update Error:", error);

      let errorMessages = [];

      if (error?.data) {
        const data = error.data;

        Object.keys(data).forEach((key) => {
          const value = data[key];

          if (Array.isArray(value)) {
            value.forEach((msg) => errorMessages.push(msg));
          } else if (typeof value === "string") {
            errorMessages.push(value);
          }
        });
      }

      if (errorMessages.length > 0) {
        errorMessages.forEach((msg, i) => {
          setTimeout(() => {
            showTemporaryMessage(msg, "error");
          }, i * 600);
        });
      } else {
        showTemporaryMessage("Failed to save vendor quotation!", "error");
      }
    }
  };

  // ---------------- FILTER ----------------
  const filteredVendorQuotations = (vendorQuotations || []).filter((v) => {
    const search = searchTerm.toLowerCase();
    return (
      v?.quotation_number?.toLowerCase().includes(search) ||
      v?.vendor?.vendor_name?.toLowerCase().includes(search)
    );
  });

  // ---------------- PAGINATION ----------------
  const totalPages = Math.ceil(filteredVendorQuotations.length / rowsPerPage);

  const paginatedVendorQuotations = filteredVendorQuotations.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  return (
    <div className="flex h-screen">
      <div className="hidden lg:block fixed top-0 left-0 h-full w-[325px] z-40">
        <VendorSidebar />
      </div>

      <main className="flex-1 ml-0 lg:ml-[325px] mt-[69.5px] p-3 overflow-y-auto bg-white backdrop-blur-sm shadow-inner [&::-webkit-scrollbar]:hidden scrollbar-none">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700">
            Partner Quotations
          </h2>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search..."
              className="border px-2 py-1 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <button
              onClick={handleAddRow}
              className="bg-amber-400 px-3 py-1 rounded"
            >
              <FiPlus />
            </button>
          </div>
        </div>

        {/* TABLE */}
        <table className="min-w-full text-sm border">
          <thead>
            <tr>
              <th>Quotation No</th>
              <th>File</th>
              <th>Date</th>
              <th>Qty</th>
              <th>Lead Time</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                <td>
                  <input
                    value={row.quotation_number}
                    onChange={(e) =>
                      handleRowChange(index, "quotation_number", e.target.value)
                    }
                  />
                </td>

                <td>
                  <input
                    type="file"
                    onChange={(e) =>
                      handleRowChange(index, "quotation", e.target.files[0])
                    }
                  />
                </td>

                <td>
                  <input
                    type="date"
                    value={row.date_of_quotation}
                    onChange={(e) =>
                      handleRowChange(
                        index,
                        "date_of_quotation",
                        e.target.value,
                      )
                    }
                  />
                </td>

                <td>
                  <input
                    value={row.quantity}
                    onChange={(e) =>
                      handleRowChange(index, "quantity", e.target.value)
                    }
                  />
                </td>

                <td>
                  <input
                    value={row.lead_time_days}
                    onChange={(e) =>
                      handleRowChange(index, "lead_time_days", e.target.value)
                    }
                  />
                </td>

                <td>
                  <button onClick={() => handleSaveRow(row, index)}>
                    <FiSave />
                  </button>
                </td>
              </tr>
            ))}

            {paginatedVendorQuotations.map((v) => (
              <tr key={v.id}>
                <td>{v.quotation_number}</td>
                <td>{v.quotation}</td>
                <td>
                  {v.date_of_quotation
                    ? dayjs(v.date_of_quotation).format("DD-MM-YYYY")
                    : "--"}
                </td>
                <td>{v.quantity}</td>
                <td>{v.lead_time_days}</td>
                <td>--</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* POPUP */}
        {showQuotationTypeScreen && (
          <div className="fixed inset-0 backdrop-blur-[1px] flex justify-center items-center z-50">
            <div className="bg-white pt-0 pb-6 pl-6 pr-6 rounded-md w-11/12 max-w-xs border border-gray-300">
              <div className="flex justify-between items-center border-b-2 pb-2 mt-4 mb-4 border-gray-300">
                <div className="flex items-center gap-2">
                  <FiUsers className="text-amber-500 text-lg" />
                  <h2 className="text-lg font-semibold text-gray-700">
                    Select Quotation Type
                  </h2>
                </div>
              </div>

              <div className="flex items-end gap-2">
                <div className="flex flex-col w-full">
                  <label className="form-label">
                    Quotation Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={quotationType}
                    onChange={(e) => setQuotationType(e.target.value)}
                    className="w-full form-input h-8"
                  >
                    <option value="">Select</option>
                    {quotationTypes.map((qt) => (
                      <option key={qt.id} value={qt.id}>
                        {qt.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleContinue}
                  className="flex items-center gap-1 px-3 py-1.5 h-8 text-sm cursor-pointer rounded bg-amber-400 text-black"
                >
                  <FiSave /> Continue
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default VendorQuotations;
