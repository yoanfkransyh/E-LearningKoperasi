import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

const AdminTables = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTable, setActiveTable] = useState("courses");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState(""); 
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  // notification state (toast)
  const [notifVisible, setNotifVisible] = useState(false);
  const [notifMessage, setNotifMessage] = useState("");
  const [notifType, setNotifType] = useState("success"); // success | error | info
  const [notifProgress, setNotifProgress] = useState(100);
  const notifTimer = useRef(null);
  const progressTimer = useRef(null);

  const tables = {
    courses: {
      name: "Courses",
      fields: ["id", "title", "slug", "description", "created_at"],
    },
    profiles: {
      name: "Profiles",
      // removed "email" field because it's no longer present in public.profiles
      fields: ["id", "full_name", "role", "created_at"],
    },
    questions: {
      name: "Questions",
      fields: ["id", "question", "course_id", "user_id", "created_at"],
    },
    answers: {
      name: "Answers",
      fields: ["id", "answer", "question_id", "user_id", "created_at"],
    },
  };

  useEffect(() => {
    if (!authLoading && !isAdmin()) {
      navigate("/");
    }
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeTable,
    currentPage,
    itemsPerPage,
    sortField,
    sortDirection,
    searchTerm,
  ]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let query = supabase.from(activeTable).select("*", { count: "exact" });

      if (searchTerm) {
        const searchFields = tables[activeTable].fields.filter(
          (field) => field !== "id" && field !== "created_at"
        );
        const orConditions = searchFields
          .map((field) => `${field}.ilike.%${searchTerm}%`)
          .join(",");
        
        if (orConditions) {
          query = query.or(orConditions);
        }
      }

      if (sortField) {
        query = query.order(sortField, { ascending: sortDirection === "asc" });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);

      const { data: result, error, count } = await query;

      if (error) throw error;

      setData(result || []);
      setTotalItems(count || 0);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  const exportToExcel = async () => {
    try {
      const { data: allData, error } = await supabase
        .from(activeTable)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const ws = XLSX.utils.json_to_sheet(allData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, tables[activeTable].name);
      XLSX.writeFile(
        wb,
        `${tables[activeTable].name}_${
          new Date().toISOString().split("T")[0]
        }.xlsx`
      );
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("Error exporting data: " + error.message);
    }
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setEditFormData(item);
    setShowEditModal(true);
  };

  const handleDelete = (item) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const clearNotifTimers = () => {
    if (notifTimer.current) clearTimeout(notifTimer.current);
    if (progressTimer.current) clearInterval(progressTimer.current);
  };

  const showNotification = (message, type = "success", duration = 3500) => {
    clearNotifTimers();
    setNotifMessage(message);
    setNotifType(type);
    setNotifProgress(100);
    setNotifVisible(true);

    const stepMs = 50;
    const step = (stepMs / duration) * 100;
    progressTimer.current = setInterval(() => {
      setNotifProgress((p) => {
        const next = p - step;
        if (next <= 0) {
          clearNotifTimers();
          setNotifVisible(false);
          return 0;
        }
        return next;
      });
    }, stepMs);

    notifTimer.current = setTimeout(() => {
      clearNotifTimers();
      setNotifVisible(false);
    }, duration);
  };

  useEffect(() => {
    return () => clearNotifTimers();
  }, []);

  const confirmDelete = async () => {
    try {
      const { error } = await supabase
        .from(activeTable)
        .delete()
        .eq("id", selectedItem.id);

      if (error) throw error;

      setShowDeleteModal(false);
      setSelectedItem(null);
      fetchData();
      showNotification("Data berhasil dihapus.", "success");
    } catch (error) {
      console.error("Error deleting data:", error);
      showNotification(error.message || "Gagal menghapus data", "error");
    }
  };

  const handleSaveEdit = async () => {
    try {
      const { error } = await supabase
        .from(activeTable)
        .update(editFormData)
        .eq("id", selectedItem.id);

      if (error) throw error;

      setShowEditModal(false);
      setSelectedItem(null);
      setEditFormData({});
      fetchData();
      showNotification("Data berhasil diperbarui.", "success");
    } catch (error) {
      console.error("Error updating data:", error);
      showNotification(error.message || "Gagal memperbarui data", "error");
    }
  };

  const handleEditInputChange = (field, value) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSearch = () => {
    setSearchTerm(searchInput);
    setCurrentPage(1);
  };
  
  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="grow bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  Data Tables
                </h1>
                <p className="text-gray-600">Kelola data database</p>
              </div>
              <button
                onClick={() => navigate("/admin")}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                ← Kembali ke Dashboard
              </button>
            </div>
          </div>

          {/* Table Selector */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex flex-wrap gap-2">
              {Object.entries(tables).map(([key, table]) => (
                <button
                  key={key}
                  onClick={() => {
                    setActiveTable(key);
                    setCurrentPage(1);
                    setSearchTerm("");
                    setSearchInput(""); 
                    setSortField("");
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    activeTable === key
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {table.name}
                </button>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="relative flex gap-2">
                  <input
                    type="text"
                    placeholder={`Search ${tables[activeTable].name}...`}
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleSearch}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Search
                  </button>
                </div>

                {/* Items per page */}
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={5}>5 per page</option>
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                </select>
              </div>

              {/* Export */}
              <button
                onClick={exportToExcel}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium"
              >
                Export to Excel
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {tables[activeTable].fields.map((field) => (
                      <th
                        key={field}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort(field)}
                      >
                        <div className="flex items-center space-x-1">
                          <span>{field.replace("_", " ")}</span>
                          {sortField === field && (
                            <span className="text-blue-600">
                              {sortDirection === "asc" ? "↑" : "↓"}
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.map((item, index) => (
                    <tr key={item.id || index} className="hover:bg-gray-50">
                      {tables[activeTable].fields.map((field) => (
                        <td
                          key={field}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                        >
                          {field === "created_at"
                            ? new Date(item[field]).toLocaleString("id-ID")
                            : field === "description" ||
                              field === "question" ||
                              field === "answer"
                            ? item[field]?.length > 50
                              ? item[field].substring(0, 50) + "..."
                              : item[field] || "-"
                            : item[field] || "-"}
                        </td>
                      ))}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded-md transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-3 py-1 rounded-md transition"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                    {Math.min(currentPage * itemsPerPage, totalItems)} of{" "}
                    {totalItems} results
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      First
                    </button>
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    {getPageNumbers().map((pageNum, index) => (
                      <button
                        key={index}
                        onClick={() =>
                          typeof pageNum === "number" && setCurrentPage(pageNum)
                        }
                        disabled={pageNum === "..."}
                        className={`px-3 py-1 text-sm border rounded-md ${
                          pageNum === currentPage
                            ? "bg-blue-600 text-white border-blue-600"
                            : pageNum === "..."
                            ? "bg-white border-gray-300 cursor-default"
                            : "bg-white border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}

                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Last
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Edit */}
      {showEditModal && selectedItem && (
        <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Edit {tables[activeTable].name}
              </h2>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tables[activeTable].fields
                  .filter((field) => field !== "id" && field !== "created_at")
                  .map((field) => (
                    <div
                      key={field}
                      className={
                        field === "description" ||
                        field === "question" ||
                        field === "answer"
                          ? "md:col-span-2"
                          : ""
                      }
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {field.replace("_", " ").toUpperCase()}
                      </label>
                      {field === "description" ||
                      field === "question" ||
                      field === "answer" ? (
                        <textarea
                          value={editFormData[field] || ""}
                          onChange={(e) =>
                            handleEditInputChange(field, e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={4}
                        />
                      ) : field === "role" ? (
                        <select
                          value={editFormData[field] || ""}
                          onChange={(e) =>
                            handleEditInputChange(field, e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={editFormData[field] || ""}
                          onChange={(e) =>
                            handleEditInputChange(field, e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      )}
                    </div>
                  ))}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete */}
      {showDeleteModal && selectedItem && (
        <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Konfirmasi Hapus Data
              </h2>
            </div>

            <div className="p-6">
              <p className="text-gray-600">
                Yakin ingin menghapus ini? {activeTable.slice(0, -1)}?
                Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Centered Toast Notification */}
      <div
        aria-hidden={!notifVisible}
        className={`fixed top-24 left-1/2 z-50 transform -translate-x-1/2 transition-all duration-300 pointer-events-none ${
          notifVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-6"
        }`}
      >
        <div className="pointer-events-auto w-[360px] md:w-[520px]">
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
            <div className="p-4 flex items-start gap-4">
              <div className={`flex items-center justify-center w-12 h-12 rounded-full shrink-0 ${
                notifType === "success" ? "bg-green-100 text-green-700" :
                notifType === "error" ? "bg-red-100 text-red-700" :
                "bg-sky-100 text-sky-700"
              }`}>
                {notifType === "success" ? (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                ) : notifType === "error" ? (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                ) : (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01"/></svg>
                )}
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-gray-900">{notifType === "success" ? "Berhasil" : notifType === "error" ? "Gagal" : "Info"}</div>
                <div className="text-xs md:text-sm text-slate-700/90 mt-1">{notifMessage}</div>
              </div>
              <div className="self-start">
                <button onClick={() => { clearNotifTimers(); setNotifVisible(false); }} aria-label="Tutup notifikasi" className="text-slate-400 hover:text-slate-600">✕</button>
              </div>
            </div>
            <div className="h-1 bg-slate-100">
              <div className={`h-full ${notifType === "success" ? "bg-green-500" : notifType === "error" ? "bg-red-500" : "bg-sky-500"} transition-all`} style={{ width: `${notifProgress}%` }} />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AdminTables;
