import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Session } from "../types";

interface SessionModalProps {
  session: Session | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

export const SessionModal = ({
  session,
  isOpen,
  onClose,
  onSave,
}: SessionModalProps) => {
  const [formData, setFormData] = useState({
    date: "",
    hallName: "",
    facultyType: "",
    facultyName: "",
    email: "",
    mobile: "",
    startTime: "",
    endTime: "",
    sessionName: "",
    topicName: "",
  });

  // Helper function to convert time string to 12-hour format
  const convertTo12HourFormat = (timeString: string): string => {
    if (!timeString) return "";

    // If it's already in 12-hour format like "1:00 PM", return as is
    if (timeString.match(/\d{1,2}:\d{2}\s*(AM|PM)/i)) {
      return timeString.toUpperCase();
    }

    // If it's in datetime-local or ISO format
    if (timeString.includes("T")) {
      try {
        const date = new Date(timeString);
        if (!isNaN(date.getTime())) {
          return date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          });
        }
      } catch {
        return "";
      }
    }

    // If it's in 24-hour format like "13:00"
    if (timeString.match(/^\d{1,2}:\d{2}$/)) {
      const [hours, minutes] = timeString.split(":");
      const hourNum = parseInt(hours);
      const period = hourNum >= 12 ? "PM" : "AM";
      const hour12 = hourNum % 12 || 12;
      return `${hour12}:${minutes} ${period}`;
    }

    return "";
  };

  // Helper function to convert 12-hour format to 24-hour string for backend
  const convert12HourTo24Hour = (time12h: string): string => {
    if (!time12h) return "";

    const time = time12h.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!time) return time12h; // Return original if not in expected format

    let hours = parseInt(time[1]);
    const minutes = time[2];
    const period = time[3].toUpperCase();

    if (period === "PM" && hours < 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    return `${hours.toString().padStart(2, "0")}:${minutes}`;
  };

  // Generate time options for dropdown
  const generateTimeOptions = () => {
    const times = [];

    // Add times for AM
    for (let hour = 1; hour <= 11; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour}:${minute.toString().padStart(2, "0")} AM`;
        times.push(timeString);
      }
    }

    // Add 12:00 PM to 11:30 PM
    for (let hour = 12; hour <= 11; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const displayHour = hour === 0 ? 12 : hour;
        const timeString = `${displayHour}:${minute
          .toString()
          .padStart(2, "0")} PM`;
        times.push(timeString);
      }
    }

    // Add 12:00 PM separately
    times.push("12:00 PM");
    times.push("12:30 PM");

    // Add PM times from 1:00 PM to 11:30 PM
    for (let hour = 1; hour <= 11; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour}:${minute.toString().padStart(2, "0")} PM`;
        times.push(timeString);
      }
    }

    return times;
  };

  const timeOptions = generateTimeOptions();

  useEffect(() => {
    if (session) {
      setFormData({
        date: session.date
          ? new Date(session.date).toISOString().split("T")[0]
          : "",
        hallName: session.hallName || "",
        facultyType: session.facultyType || "",
        facultyName: session.facultyName || "",
        email: session.email || "",
        mobile: session.mobile || "",
        startTime: convertTo12HourFormat(session.startTime),
        endTime: convertTo12HourFormat(session.endTime),
        sessionName: session.sessionName || "",
        topicName: session.topicName || "",
      });
    } else {
      setFormData({
        date: "",
        hallName: "",
        facultyType: "",
        facultyName: "",
        email: "",
        mobile: "",
        startTime: "",
        endTime: "",
        sessionName: "",
        topicName: "",
      });
    }
  }, [session]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = {
      ...formData,
      date: formData.date ? new Date(formData.date).toISOString() : null,
      // Convert times to simple string format for backend
      startTime: formData.startTime,
      endTime: formData.endTime,
    };

    onSave(submitData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {session ? "Edit Session" : "Add New Session"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Session Name *
              </label>
              <input
                type="text"
                value={formData.sessionName}
                onChange={(e) =>
                  setFormData({ ...formData, sessionName: e.target.value })
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Enter session name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Topic Name *
              </label>
              <input
                type="text"
                value={formData.topicName}
                onChange={(e) =>
                  setFormData({ ...formData, topicName: e.target.value })
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Enter topic name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hall Name *
              </label>
              <input
                type="text"
                value={formData.hallName}
                onChange={(e) =>
                  setFormData({ ...formData, hallName: e.target.value })
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Enter hall name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time *
              </label>
              <select
                value={formData.startTime}
                onChange={(e) =>
                  setFormData({ ...formData, startTime: e.target.value })
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="">Select start time</option>
                {timeOptions.map((time) => (
                  <option key={`start-${time}`} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time *
              </label>
              <select
                value={formData.endTime}
                onChange={(e) =>
                  setFormData({ ...formData, endTime: e.target.value })
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="">Select end time</option>
                {timeOptions.map((time) => (
                  <option key={`end-${time}`} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Faculty Name *
              </label>
              <input
                type="text"
                value={formData.facultyName}
                onChange={(e) =>
                  setFormData({ ...formData, facultyName: e.target.value })
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Enter faculty name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Faculty Type *
              </label>
              <select
                value={formData.facultyType}
                onChange={(e) =>
                  setFormData({ ...formData, facultyType: e.target.value })
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="">Select faculty type</option>
                <option value="Guest">Guest</option>
                <option value="Internal">Internal</option>
                <option value="Keynote">Keynote Speaker</option>
                <option value="Panelist">Panelist</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="faculty@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile *
              </label>
              <input
                type="tel"
                value={formData.mobile}
                onChange={(e) =>
                  setFormData({ ...formData, mobile: e.target.value })
                }
                required
                pattern="[0-9]{10}"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="9876543210"
                minLength={10}
                maxLength={10}
              />
              <p className="text-xs text-gray-500 mt-1">
                10-digit mobile number
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              {session ? "Update Session" : "Create Session"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
