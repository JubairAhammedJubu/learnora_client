"use client";

import {useState, useEffect} from "react";
import {motion, AnimatePresence} from "framer-motion";
import Link from "next/link";
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  Loader2,
  AlertTriangle,
  X,
  Save,
  Heart,
  Bookmark,
} from "lucide-react";
import toast from "react-hot-toast";
import {authClient} from "@/lib/auth-client";

const VISIBILITY_CONFIG = {
  public: {label: "Public", color: "text-emerald-500"},
  private: {label: "Private", color: "text-gray-500"},
};

const ACCESS_CONFIG = {
  free: {label: "Free", color: "text-blue-500"},
  premium: {label: "Premium", color: "text-amber-500"},
};

/* ---------------- DELETE MODAL ---------------- */

function DeleteModal({lesson, onConfirm, onCancel, isLoading}) {
  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />

      <motion.div className="relative z-10 w-full max-w-sm bg-white dark:bg-[#1a1d24] rounded-2xl p-6">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 mx-auto mb-4">
          <AlertTriangle className="w-6 h-6 text-red-500" />
        </div>

        <h3 className="text-center font-bold mb-2">Delete Lesson?</h3>

        <p className="text-sm text-center mb-6">
          Delete <b>{lesson?.title}</b>? This cannot be undone.
        </p>

        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2 border rounded-xl">
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-2 bg-red-500 text-white rounded-xl"
          >
            {isLoading ? (
              <Loader2 className="animate-spin w-4 h-4 mx-auto" />
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ---------------- EDIT MODAL ---------------- */

function EditModal({lesson, onSave, onCancel, isLoading, isUserPremium}) {
  const [form, setForm] = useState({
    title: lesson?.title || "",
    visibility: lesson?.visibility || "public",
    accessLevel: lesson?.accessLevel || "free",
  });

  const handleChange = (e) => {
    setForm((prev) => ({...prev, [e.target.name]: e.target.value}));
  };

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />

      <motion.div className="relative z-10 w-full max-w-lg bg-white dark:bg-[#1a1d24] rounded-2xl p-6">
        <div className="flex justify-between mb-4">
          <h3 className="font-bold">Update Lesson</h3>
          <button onClick={onCancel}>
            <X />
          </button>
        </div>

        {/* TITLE */}
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          className="w-full p-2 border rounded-xl mb-3"
          placeholder="Lesson title"
        />

        {/* VISIBILITY */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <select
            name="visibility"
            value={form.visibility}
            onChange={handleChange}
            className="p-2 border rounded-xl"
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>

          {/* ACCESS LEVEL (LOCKED LOGIC) */}
          <select
            name="accessLevel"
            value={form.accessLevel}
            onChange={(e) => {
              const value = e.target.value;

              if (value === "premium" && !isUserPremium) {
                toast.error("Upgrade to Premium to set paid lesson");
                return;
              }

              handleChange(e);
            }}
            className="p-2 border rounded-xl"
          >
            <option value="free">Free</option>

            <option value="premium" disabled={!isUserPremium}>
              Premium
            </option>
          </select>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-3 mt-4">
          <button onClick={onCancel} className="flex-1 border rounded-xl py-2">
            Cancel
          </button>

          <button
            onClick={() => onSave(form)}
            disabled={isLoading}
            className="flex-1 bg-emerald-500 text-white rounded-xl py-2 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="animate-spin w-4 h-4" />
            ) : (
              <>
                <Save className="w-4 h-4" /> Save
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ---------------- MAIN COMPONENT ---------------- */

export default function MyLessonsClient({user}) {
  const [lessons, setLessons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const isUserPremium = user?.isPremium === true;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchLessons();
  }, []);

  /* ---------------- FETCH ---------------- */

  const fetchLessons = async () => {
    setIsLoading(true);

    try {
      const session = await authClient.getSession();
      const token = session?.data?.session?.token;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/lessons/user`,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();
      setLessons(Array.isArray(data.lessons) ? data.lessons : []);
    } catch {
      toast.error("Failed to load lessons");
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------------- DELETE ---------------- */

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      const session = await authClient.getSession();
      const token = session?.data?.session?.token;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/lessons/${deleteTarget._id}`,
        {
          method: "DELETE",
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.ok) {
        toast.success("Lesson deleted");
        setLessons((prev) => prev.filter((l) => l._id !== deleteTarget._id));
        setDeleteTarget(null);
      }
    } catch {
      toast.error("Error deleting lesson");
    } finally {
      setIsDeleting(false);
    }
  };

  /* ---------------- EDIT (SECURE) ---------------- */

  const handleEdit = async (formData) => {
    if (!editTarget) return;
    setIsEditing(true);

    try {
      const session = await authClient.getSession();
      const token = session?.data?.session?.token;

      const payload = {
        ...formData,
        accessLevel:
          formData.accessLevel === "premium" && !isUserPremium
            ? "free"
            : formData.accessLevel,
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/lessons/${editTarget._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      if (res.ok) {
        toast.success("Lesson updated");

        setLessons((prev) =>
          prev.map((l) => (l._id === editTarget._id ? {...l, ...payload} : l)),
        );

        setEditTarget(null);
      }
    } catch {
      toast.error("Update failed");
    } finally {
      setIsEditing(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">My Lessons</h1>
          <p className="text-sm text-gray-500">Manage your created lessons</p>
        </div>

        <Link
          href="/dashboard/user/add-lesson"
          className="px-4 py-2 bg-emerald-600 text-white rounded-xl flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Lesson
        </Link>
      </div>

      {/* TABLE */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin w-8 h-8" />
        </div>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-[#1a1d24] rounded-2xl border">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr className="text-left">
                <th className="p-3">Lesson</th>
                <th>Visibility</th>
                <th>Access</th>
                <th>Stats</th>
                <th>Created</th>
                <th className="text-right p-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {lessons.map((lesson) => (
                <tr key={lesson._id} className="border-b">
                  <td className="p-3 font-medium">{lesson.title}</td>

                  <td className={VISIBILITY_CONFIG[lesson.visibility]?.color}>
                    {lesson.visibility}
                  </td>

                  <td className={ACCESS_CONFIG[lesson.accessLevel]?.color}>
                    {lesson.accessLevel}
                  </td>

                  <td className="flex gap-3 items-center">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" /> {lesson.reactions || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Bookmark className="w-3 h-3" /> {lesson.saves || 0}
                    </span>
                  </td>

                  <td>{new Date(lesson.createdAt).toLocaleDateString()}</td>

                  <td className="text-right p-3 flex gap-2 justify-end">
                    <Link href={`/lessons/${lesson._id}`}>
                      <Eye className="w-4 h-4" />
                    </Link>

                    <button onClick={() => setEditTarget(lesson)}>
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button onClick={() => setDeleteTarget(lesson)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODALS */}
      <AnimatePresence>
        {deleteTarget && (
          <DeleteModal
            lesson={deleteTarget}
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
            isLoading={isDeleting}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editTarget && (
          <EditModal
            lesson={editTarget}
            onSave={handleEdit}
            onCancel={() => setEditTarget(null)}
            isLoading={isEditing}
            isUserPremium={isUserPremium}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
