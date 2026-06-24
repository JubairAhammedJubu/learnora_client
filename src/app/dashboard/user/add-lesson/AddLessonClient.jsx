"use client";

import {useState} from "react";
import {motion} from "framer-motion";
import {
  BookOpen,
  Eye,
  EyeOff,
  Sparkles,
  Award,
  Tag,
  Upload,
  Loader2,
  CheckCircle,
  X,
  Link as LinkIcon,
  Heart,
  FileText,
  HelpCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import {authClient} from "@/lib/auth-client";
import {useRouter} from "next/navigation";

const CATEGORIES = [
  "Personal Growth",
  "Career",
  "Relationships",
  "Mindset",
  "Mistakes Learned",
];

const EMOTIONAL_TONES = [
  {value: "motivational", label: "Motivational"},
  {value: "sad", label: "Sad"},
  {value: "realization", label: "Realization"},
  {value: "gratitude", label: "Gratitude"},
];

export default function AddLessonClient({user}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadLoading, setIsUploadLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageTab, setImageTab] = useState("upload");
  const [imageUrl, setImageUrl] = useState("");
  const [pendingImage, setPendingImage] = useState(null);

  // Check user premium tier status from passed prop fallback safely to false
  const isUserPremium = user?.isPremium === true;

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    emotionalTone: "",
    visibility: "public",
    accessLevel: "free",
    image: "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({...prev, [e.target.name]: e.target.value}));
  };

  const handleSelectField = (name, value) => {
    // Structural guard for the Access Level field requirement rule matching
    if (name === "accessLevel" && value === "premium" && !isUserPremium) {
      toast.error("Upgrade to Premium to create paid lessons.");
      return;
    }
    setForm((prev) => ({...prev, [name]: value}));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    setIsUploadLoading(true);
    try {
      toast.loading("Uploading image...", {id: "img"});
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch(
        `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_KEY}`,
        {method: "POST", body: formData},
      );
      const data = await res.json();
      const url = data.data.url;
      setPendingImage(url);
      setImagePreview(url);
      toast.success("Image ready! Click Save to apply.", {id: "img"});
    } catch {
      toast.error("Image upload failed", {id: "img"});
    } finally {
      setIsUploadLoading(false);
    }
  };

  const handleLinkPreview = () => {
    if (!imageUrl.trim()) {
      toast.error("Please enter an image URL");
      return;
    }
    setPendingImage(imageUrl.trim());
    setImagePreview(imageUrl.trim());
    toast.success("Image preview ready!");
  };

  const handleSaveImage = () => {
    if (!pendingImage) {
      toast.error("Please upload or preview an image first");
      return;
    }
    setForm((prev) => ({...prev, image: pendingImage}));
    toast.success("Image saved!");
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setPendingImage(null);
    setImageUrl("");
    setForm((prev) => ({...prev, image: ""}));
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) return toast.error("Lesson title is required");
    if (!form.description.trim())
      return toast.error("Description/Story insight is required");
    if (!form.category) return toast.error("Please select a lesson category");
    if (!form.emotionalTone)
      return toast.error("Please choose an emotional tone");

    setIsLoading(true);
    try {
      const session = await authClient.getSession();
      const token = session?.data?.session?.token;

      // Final sanitization rule check before parsing dispatch to server side api
      const finalAccessLevel = isUserPremium ? form.accessLevel : "free";

      const lessonData = {
        ...form,
        accessLevel: finalAccessLevel,
        creatorName: user?.name,
        creatorEmail: user?.email,
        creatorPhoto: user?.image,
        createdAt: new Date().toISOString(),
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/lessons`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(lessonData),
        },
      );

      if (res.ok) {
        toast.success("Life lesson preserved successfully!");
        router.push("/dashboard/my-lessons");
      } else {
        const err = await res.json();
        toast.error(err.message || "Failed to save lesson");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 pt-8 max-w-3xl mx-auto space-y-6 mt-4">
      <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-emerald-500" /> Document a Life
          Lesson
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Share your personal growth, wisdom, or mistakes learned to map your
          mindfulness journey.
        </p>
      </motion.div>

      <motion.div
        initial={{opacity: 0, y: 20}}
        animate={{opacity: 1, y: 0}}
        transition={{delay: 0.1}}
        className="bg-white dark:bg-[#1a1d24] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 space-y-6"
      >
        {/* Lesson Title */}
        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
            Lesson Title
          </label>
          <div className="relative">
            <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g., Embracing failure as a redirection tool"
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400 transition-all"
            />
          </div>
        </div>

        {/* Full Description / Story */}
        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
            Full Description / Story / Insight
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <textarea
              name="description"
              rows={5}
              value={form.description}
              onChange={handleChange}
              placeholder="Write the contextual story, lessons learned, and deep takeaways..."
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400 transition-all resize-none"
            />
          </div>
        </div>

        {/* Visibility & Access Level Configuration Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
              Visibility Configuration
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSelectField("visibility", "public")}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  form.visibility === "public"
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                    : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-emerald-300"
                }`}
              >
                <Eye className="w-4 h-4" /> Public
              </button>
              <button
                type="button"
                onClick={() => handleSelectField("visibility", "private")}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  form.visibility === "private"
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                    : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-emerald-300"
                }`}
              >
                <EyeOff className="w-4 h-4" /> Private
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block flex items-center gap-1">
              Access Level
              {!isUserPremium && (
                <div className="group relative inline-block cursor-pointer">
                  <HelpCircle className="w-3.5 h-3.5 text-gray-400 hover:text-amber-500" />
                  <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-48 -translate-x-1/2 rounded-md bg-gray-900 p-2 text-[10px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 shadow-xl leading-normal text-center">
                    Upgrade to Premium to create paid lessons.
                  </span>
                </div>
              )}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSelectField("accessLevel", "free")}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  form.accessLevel === "free"
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                    : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-emerald-300"
                }`}
              >
                Free
              </button>
              <button
                type="button"
                onClick={() => handleSelectField("accessLevel", "premium")}
                disabled={!isUserPremium}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all relative ${
                  form.accessLevel === "premium"
                    ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
                    : !isUserPremium
                      ? "border-gray-100 dark:border-gray-800/50 text-gray-300 dark:text-gray-600 bg-gray-50/50 dark:bg-gray-800/20 cursor-not-allowed"
                      : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-amber-300"
                }`}
                title={
                  !isUserPremium
                    ? "Upgrade to Premium to create paid lessons."
                    : ""
                }
              >
                <Award
                  className={`w-4 h-4 ${!isUserPremium ? "text-gray-300 dark:text-gray-600" : "text-amber-500"}`}
                />{" "}
                Premium
              </button>
            </div>
          </div>
        </div>

        {/* Category Pick Dropdown/Selection Group */}
        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
            Category
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const isSelected = form.category === cat;
              return (
                <button
                  type="button"
                  key={cat}
                  onClick={() => handleSelectField("category", cat)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 shadow-sm"
                      : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-emerald-300"
                  }`}
                >
                  {isSelected ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : (
                    <Tag className="w-3 h-3" />
                  )}
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Emotional Tone Selection Group */}
        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
            Emotional Tone
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {EMOTIONAL_TONES.map(({value, label}) => {
              const isSelected = form.emotionalTone === value;
              return (
                <button
                  type="button"
                  key={value}
                  onClick={() => handleSelectField("emotionalTone", value)}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all text-center ${
                    isSelected
                      ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 font-semibold"
                      : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-teal-300"
                  }`}
                >
                  <Heart
                    className={`w-3.5 h-3.5 mb-1 ${isSelected ? "fill-teal-500" : ""}`}
                  />
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Optional Media Image Attachment */}
        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
            Image (Optional)
          </label>

          {imagePreview && (
            <div className="mb-3 flex flex-col items-center gap-2">
              <div className="relative w-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              {!form.image && (
                <div className="flex items-center gap-2 w-full">
                  <span className="text-xs text-amber-500 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-lg border border-amber-100 dark:border-amber-800 flex-1 text-center">
                    Preview only — click Save Image to apply
                  </span>
                  <button
                    type="button"
                    onClick={handleSaveImage}
                    className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-xs font-semibold whitespace-nowrap"
                  >
                    Save Image
                  </button>
                </div>
              )}
              {form.image && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg border border-emerald-100 dark:border-emerald-800 w-full text-center">
                  ✓ Image saved successfully
                </span>
              )}
            </div>
          )}

          {!imagePreview && (
            <>
              <div className="flex gap-2 mb-3 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setImageTab("upload")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                    imageTab === "upload"
                      ? "bg-white dark:bg-[#1a1d24] text-emerald-600 dark:text-emerald-400 shadow-sm"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  <Upload className="w-4 h-4" /> Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setImageTab("link")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                    imageTab === "link"
                      ? "bg-white dark:bg-[#1a1d24] text-emerald-600 dark:text-emerald-400 shadow-sm"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  <LinkIcon className="w-4 h-4" /> Image Link
                </button>
              </div>

              {imageTab === "upload" ? (
                <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-emerald-400 dark:hover:border-emerald-600 rounded-xl p-6 cursor-pointer transition-all group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  {isUploadLoading ? (
                    <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                  ) : (
                    <Upload className="w-8 h-8 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                  )}
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-emerald-600 transition-colors">
                      {isUploadLoading
                        ? "Processing upload..."
                        : "Click to upload image"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      PNG, JPG, WEBP formats up to 5MB
                    </p>
                  </div>
                </label>
              ) : (
                <div className="space-y-3">
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400 transition-all"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleLinkPreview}
                    className="w-full py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-sm font-medium hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                  >
                    Preview Image
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Creator Info Footer Logs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100 dark:border-gray-800">
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
              Author Name
            </label>
            <input
              type="text"
              value={user?.name || ""}
              readOnly
              className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-500 dark:text-gray-400 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
              Author Email
            </label>
            <input
              type="text"
              value={user?.email || ""}
              readOnly
              className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-500 dark:text-gray-400 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Submit action button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading || isUploadLoading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-semibold text-sm shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Preserving Wisdom...
            </>
          ) : (
            <>
              <BookOpen className="w-4 h-4" />
              Add Lesson
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
}
