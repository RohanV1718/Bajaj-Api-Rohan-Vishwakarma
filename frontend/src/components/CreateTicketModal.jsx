import { useState } from 'react';
import { FiX, FiMail, FiFileText, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import client from '../api/client';

const CreateTicketModal = ({ isOpen, onClose, onTicketCreated }) => {
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    customerEmail: '',
    priority: 'medium',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = 'Customer email is required';
    } else if (!emailRegex.test(formData.customerEmail)) {
      newErrors.customerEmail = 'Please enter a valid email address';
    }
    if (!formData.priority) {
      newErrors.priority = 'Priority is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field-specific error as user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const response = await client.post('/tickets', formData);
      if (response.data.success) {
        toast.success('Ticket created successfully!');
        onTicketCreated(response.data.data);
        onClose();
        // Reset form
        setFormData({
          subject: '',
          description: '',
          customerEmail: '',
          priority: 'medium',
        });
      } else {
        toast.error(response.data.message || 'Failed to create ticket');
      }
    } catch (error) {
      console.error(error);
      const serverMessage = error.response?.data?.message || 'Server error occurred';
      toast.error(serverMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div 
        className="glass-panel w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-slate-900/50">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <FiFileText className="text-brand-500" /> Create Support Ticket
          </h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Customer Email */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Customer Email
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <FiMail size={16} />
              </span>
              <input
                type="text"
                name="customerEmail"
                value={formData.customerEmail}
                onChange={handleChange}
                placeholder="customer@example.com"
                className={`w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-900/60 border ${
                  errors.customerEmail ? 'border-red-500/50 focus:ring-red-500/20' : 'border-white/10 focus:ring-brand-500/20'
                } focus:outline-none focus:ring-4 focus:border-brand-500 text-slate-200 placeholder-slate-500 transition-all`}
              />
            </div>
            {errors.customerEmail && (
              <p className="text-xs text-red-400 mt-1 flex items-center gap-1 font-medium">
                <FiAlertCircle size={12} /> {errors.customerEmail}
              </p>
            )}
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Subject
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Brief description of the problem"
              className={`w-full px-4 py-2.5 rounded-lg bg-slate-900/60 border ${
                errors.subject ? 'border-red-500/50 focus:ring-red-500/20' : 'border-white/10 focus:ring-brand-500/20'
              } focus:outline-none focus:ring-4 focus:border-brand-500 text-slate-200 placeholder-slate-500 transition-all`}
            />
            {errors.subject && (
              <p className="text-xs text-red-400 mt-1 flex items-center gap-1 font-medium">
                <FiAlertCircle size={12} /> {errors.subject}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Detailed Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Please provide steps to reproduce or details of the issue..."
              rows={4}
              className={`w-full px-4 py-2.5 rounded-lg bg-slate-900/60 border ${
                errors.description ? 'border-red-500/50 focus:ring-red-500/20' : 'border-white/10 focus:ring-brand-500/20'
              } focus:outline-none focus:ring-4 focus:border-brand-500 text-slate-200 placeholder-slate-500 transition-all resize-none`}
            />
            {errors.description && (
              <p className="text-xs text-red-400 mt-1 flex items-center gap-1 font-medium">
                <FiAlertCircle size={12} /> {errors.description}
              </p>
            )}
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Priority
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['low', 'medium', 'high', 'urgent'].map((p) => {
                const isSelected = formData.priority === p;
                const borderColors = {
                  low: 'border-slate-500/30 text-slate-300 hover:border-slate-500',
                  medium: 'border-amber-500/30 text-amber-400 hover:border-amber-500',
                  high: 'border-orange-500/30 text-orange-400 hover:border-orange-500',
                  urgent: 'border-red-500/30 text-red-400 hover:border-red-500',
                };
                const activeColors = {
                  low: 'bg-slate-500/10 border-slate-500 text-slate-200 ring-2 ring-slate-500/20',
                  medium: 'bg-amber-500/10 border-amber-500 text-amber-300 ring-2 ring-amber-500/20',
                  high: 'bg-orange-500/10 border-orange-500 text-orange-300 ring-2 ring-orange-500/20',
                  urgent: 'bg-red-500/10 border-red-500 text-red-300 ring-2 ring-red-500/20',
                };

                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handleChange({ target: { name: 'priority', value: p } })}
                    className={`py-2 px-1 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all ${
                      isSelected ? activeColors[p] : borderColors[p]
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
            {errors.priority && (
              <p className="text-xs text-red-400 mt-1 flex items-center gap-1 font-medium">
                <FiAlertCircle size={12} /> {errors.priority}
              </p>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold rounded-lg text-slate-300 hover:text-slate-100 hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-semibold rounded-lg bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? 'Creating...' : 'Create Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTicketModal;
