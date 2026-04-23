import { useState } from "react";

export default function InputForm({ onSubmit }) {
  const [form, setForm] = useState({
    patientName: "",
    disease: "",
    location: "",
  });
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit() {
    if (!form.disease) return;
    await onSubmit(form);
    setSubmitted(true);
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-gray-400 uppercase tracking-wider">
        Patient Context
      </p>
      <input
        name="patientName"
        placeholder="Patient name (optional)"
        value={form.patientName}
        onChange={handleChange}
        className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
      />
      <input
        name="disease"
        placeholder="Disease of interest *"
        value={form.disease}
        onChange={handleChange}
        className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
      />
      <input
        name="location"
        placeholder="Location (optional)"
        value={form.location}
        onChange={handleChange}
        className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
      />
      <button
        onClick={handleSubmit}
        className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-2 rounded-lg transition-colors"
      >
        {submitted ? "Update Context" : "Start Research Session"}
      </button>
    </div>
  );
}
