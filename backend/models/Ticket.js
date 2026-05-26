import mongoose from 'mongoose';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ticketSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    customerEmail: {
      type: String,
      required: [true, 'Customer email is required'],
      trim: true,
      lowercase: true,
      match: [emailRegex, 'Please provide a valid email address'],
    },
    priority: {
      type: String,
      required: [true, 'Priority is required'],
      enum: {
        values: ['low', 'medium', 'high', 'urgent'],
        message: '{VALUE} is not a valid priority',
      },
    },
    status: {
      type: String,
      enum: {
        values: ['open', 'in_progress', 'resolved', 'closed'],
        message: '{VALUE} is not a valid status',
      },
      default: 'open',
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for ageMinutes
ticketSchema.virtual('ageMinutes').get(function () {
  const endTime = this.resolvedAt ? new Date(this.resolvedAt) : new Date();
  const diffMs = endTime - new Date(this.createdAt);
  return Math.max(0, Math.floor(diffMs / 60000));
});

// Virtual for slaBreached
ticketSchema.virtual('slaBreached').get(function () {
  const endTime = this.resolvedAt ? new Date(this.resolvedAt) : new Date();
  const diffMs = endTime - new Date(this.createdAt);

  const slaTargetsMs = {
    urgent: 1 * 60 * 60 * 1000,     // 1 hour
    high: 4 * 60 * 60 * 1000,       // 4 hours
    medium: 24 * 60 * 60 * 1000,    // 24 hours
    low: 72 * 60 * 60 * 1000,       // 72 hours
  };

  const limitMs = slaTargetsMs[this.priority] || slaTargetsMs.low;
  return diffMs > limitMs;
});

const Ticket = mongoose.model('Ticket', ticketSchema);

export default Ticket;
