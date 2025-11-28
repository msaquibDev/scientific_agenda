import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../utils/api";
import { Session } from "../types";
import { SessionModal } from "../components/SessionModal";
import { DeleteConfirmModal } from "../components/DeleteConfirmModal";
import { LogOut, Plus, Edit2, Trash2, Mail, Send, Search } from "lucide-react";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    session: Session | null;
  }>({
    isOpen: false,
    session: null,
  });
  const [emailLoading, setEmailLoading] = useState<string | null>(null);
  const [allEmailsLoading, setAllEmailsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    filterSessions();
  }, [sessions, searchTerm]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await api.getSessions();
      const sessionsData = response.data || response || [];
      setSessions(sessionsData);
      setFilteredSessions(sessionsData);
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
      setSessions([]);
      setFilteredSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const filterSessions = () => {
    if (!searchTerm.trim()) {
      setFilteredSessions(sessions);
      return;
    }

    const lowercasedSearch = searchTerm.toLowerCase();
    const filtered = sessions.filter((session) => {
      return (
        session.sessionName?.toLowerCase().includes(lowercasedSearch) ||
        session.topicName?.toLowerCase().includes(lowercasedSearch) ||
        session.email?.toLowerCase().includes(lowercasedSearch) ||
        session.mobile?.includes(searchTerm) || // Keep as string for partial number matching
        session.facultyName?.toLowerCase().includes(lowercasedSearch)
      );
    });
    setFilteredSessions(filtered);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleAddSession = () => {
    setSelectedSession(null);
    setIsModalOpen(true);
  };

  const handleEditSession = (session: Session) => {
    setSelectedSession(session);
    setIsModalOpen(true);
  };

  const handleSaveSession = async (data: any) => {
    try {
      if (selectedSession) {
        await api.updateSession(selectedSession._id, data);
      } else {
        await api.createSession(data);
      }
      setIsModalOpen(false);
      fetchSessions();
    } catch (error) {
      console.error("Failed to save session:", error);
      alert("Failed to save session. Please try again.");
    }
  };

  const handleDeleteClick = (session: Session) => {
    setDeleteModal({ isOpen: true, session });
  };

  const handleDeleteConfirm = async () => {
    if (deleteModal.session) {
      try {
        await api.deleteSession(deleteModal.session._id);
        setDeleteModal({ isOpen: false, session: null });
        fetchSessions();
      } catch (error) {
        console.error("Failed to delete session:", error);
        alert("Failed to delete session. Please try again.");
      }
    }
  };

  const handleSendEmail = async (session: Session) => {
    try {
      setEmailLoading(session._id);
      await api.sendEmail(session._id);
      alert(`Email sent successfully to ${session.facultyName}`);
    } catch (error) {
      console.error("Failed to send email:", error);
      alert("Failed to send email. Please try again.");
    } finally {
      setEmailLoading(null);
    }
  };

  const handleSendAllEmails = async () => {
    try {
      setAllEmailsLoading(true);
      await api.sendAllEmails();
      alert(
        `Emails sent successfully to all ${filteredSessions.length} faculties`
      );
    } catch (error) {
      console.error("Failed to send all emails:", error);
      alert("Failed to send emails. Please try again.");
    } finally {
      setAllEmailsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatMobile = (mobile: string) => {
    if (!mobile) return "N/A";
    // Format mobile number for better readability
    return mobile.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Scientific Sessions
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Welcome, {user?.name}
              </p>
            </div>
            <button
              onClick={logout}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900">
              All Sessions
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {filteredSessions.length} of {sessions.length} sessions
              {searchTerm && ` matching "${searchTerm}"`}
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search by session, topic, email, mobile, faculty..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>

          <div className="flex space-x-3">
            {filteredSessions.length > 0 && (
              <button
                onClick={handleSendAllEmails}
                disabled={allEmailsLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 transition"
              >
                {allEmailsLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Send className="w-5 h-5" />
                )}
                <span>
                  {allEmailsLoading ? "Sending..." : "Send All Emails"}
                </span>
              </button>
            )}
            <button
              onClick={handleAddSession}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-5 h-5" />
              <span>Add Session</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading sessions...</p>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm ? "No matching sessions found" : "No sessions yet"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? "Try adjusting your search terms"
                : "Get started by creating your first session"}
            </p>
            <button
              onClick={handleAddSession}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-5 h-5" />
              <span>Add First Session</span>
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredSessions.map((session) => (
              <div
                key={session._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {session.sessionName || "Untitled Session"}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Topic:</span>
                        <p className="text-gray-900 font-medium">
                          {session.topicName || "N/A"}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Date:</span>
                        <p className="text-gray-900 font-medium">
                          {formatDate(session.date)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Hall:</span>
                        <p className="text-gray-900 font-medium">
                          {session.hallName || "N/A"}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Faculty:</span>
                        <p className="text-gray-900 font-medium">
                          {session.facultyName || "N/A"}{" "}
                          {session.facultyType && `(${session.facultyType})`}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Time:</span>
                        <p className="text-gray-900 font-medium">
                          {formatTime(session.startTime)} -{" "}
                          {formatTime(session.endTime)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Email:</span>
                        <p className="text-gray-900 font-medium">
                          {session.email || "N/A"}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Mobile:</span>
                        <p className="text-gray-900 font-medium">
                          {formatMobile(session.mobile)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Created:</span>
                        <p className="text-gray-900 font-medium">
                          {formatDate(session.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleSendEmail(session)}
                      disabled={emailLoading === session._id}
                      className="p-2 text-green-600 hover:bg-green-50 disabled:opacity-50 rounded-lg transition"
                      title="Send Email"
                    >
                      {emailLoading === session._id ? (
                        <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Mail className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleEditSession(session)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Edit Session"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(session)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete Session"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <SessionModal
        session={selectedSession}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSession}
      />

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, session: null })}
        onConfirm={handleDeleteConfirm}
        sessionName={deleteModal.session?.sessionName || ""}
      />
    </div>
  );
};

export default Dashboard;
